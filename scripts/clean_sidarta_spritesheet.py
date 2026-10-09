#!/usr/bin/env python3
"""Rebuild Sidarta's 6 × 6 sprite sheet with one complete pose per cell.

The source art contains 36 connected fighter bodies.  In the lower animation
rows, however, the top of the head was generated as one or more detached
components above the cell boundary.  Keeping only the largest silhouettes
removed those pieces; keeping the source unchanged exposed them in the previous
frame.

This pass keeps every fighter body, associates the detached head pieces with
the body immediately below, reconnects them, and moves the complete pose into a
safe top margin.  Unrelated fragments remain transparent.
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/game/sidarta-spritesheet.webp"
OUTPUT = ROOT / "public/game/sidarta-spritesheet-clean.webp"

ALPHA_THRESHOLD = 8
MIN_FIGHTER_AREA = 10_000
EXPECTED_FRAMES = 36
EDGE_HALO = 4
CELL_SIZE = 418
GRID_SIZE = 6
SAFE_TOP = 19
MIN_HEAD_AREA = 150
MIN_HEAD_GAP = 25
MAX_HEAD_GAP = 50
HEAD_X_TOLERANCE = 35


def component_bounds(component_slice: tuple[slice, slice]) -> tuple[int, int, int, int]:
    y_slice, x_slice = component_slice
    return x_slice.start, y_slice.start, x_slice.stop, y_slice.stop


def paste_component(
    output: np.ndarray,
    source: np.ndarray,
    labels: np.ndarray,
    label: int,
    destination_x: int,
    destination_y: int,
) -> None:
    """Paste one labeled component, retaining its antialiased edge halo."""
    component = labels == label
    protected = ndimage.binary_dilation(component, iterations=EDGE_HALO)
    y_indices, x_indices = np.nonzero(protected)
    if not len(x_indices):
        return

    x0, x1 = x_indices.min(), x_indices.max() + 1
    y0, y1 = y_indices.min(), y_indices.max() + 1
    patch = source[y0:y1, x0:x1].copy()
    patch[~protected[y0:y1, x0:x1]] = 0

    target_x0 = destination_x + x0
    target_y0 = destination_y + y0
    target_x1 = target_x0 + patch.shape[1]
    target_y1 = target_y0 + patch.shape[0]

    source_x0 = max(0, -target_x0)
    source_y0 = max(0, -target_y0)
    source_x1 = patch.shape[1] - max(0, target_x1 - output.shape[1])
    source_y1 = patch.shape[0] - max(0, target_y1 - output.shape[0])

    if source_x0 >= source_x1 or source_y0 >= source_y1:
        return

    target_x0 = max(0, target_x0)
    target_y0 = max(0, target_y0)
    target_x1 = target_x0 + (source_x1 - source_x0)
    target_y1 = target_y0 + (source_y1 - source_y0)

    patch = patch[source_y0:source_y1, source_x0:source_x1]
    destination = output[target_y0:target_y1, target_x0:target_x1]
    visible = patch[..., 3] > 0
    destination[visible] = patch[visible]


def main() -> None:
    rgba = np.asarray(Image.open(SOURCE).convert("RGBA")).copy()
    alpha = rgba[..., 3]

    labels, _ = ndimage.label(
        alpha > ALPHA_THRESHOLD,
        structure=np.ones((3, 3), dtype=np.uint8),
    )
    areas = np.bincount(labels.ravel())
    fighter_labels = np.flatnonzero(areas >= MIN_FIGHTER_AREA)
    fighter_labels = fighter_labels[fighter_labels != 0]

    if len(fighter_labels) != EXPECTED_FRAMES:
        raise RuntimeError(
            f"Expected {EXPECTED_FRAMES} complete frames, "
            f"found {len(fighter_labels)}."
        )

    component_slices = ndimage.find_objects(labels)
    centers = ndimage.center_of_mass(
        alpha > ALPHA_THRESHOLD,
        labels,
        fighter_labels,
    )
    fighters_by_cell: dict[tuple[int, int], int] = {}
    for label, (center_y, center_x) in zip(fighter_labels, centers):
        row = int(center_y // CELL_SIZE)
        column = int(center_x // CELL_SIZE)
        fighters_by_cell[(row, column)] = int(label)

    if len(fighters_by_cell) != EXPECTED_FRAMES:
        raise RuntimeError("Could not assign exactly one fighter body to every cell.")

    output = np.zeros_like(rgba)
    fighter_label_set = set(int(label) for label in fighter_labels)

    for row in range(GRID_SIZE):
        for column in range(GRID_SIZE):
            fighter_label = fighters_by_cell[(row, column)]
            fighter_slice = component_slices[fighter_label - 1]
            fighter_x0, fighter_y0, fighter_x1, _ = component_bounds(fighter_slice)
            cell_y = row * CELL_SIZE

            head_labels: list[int] = []
            head_adjustments: dict[int, int] = {}
            if row >= 3:
                for candidate_label in range(1, len(component_slices) + 1):
                    if (
                        candidate_label in fighter_label_set
                        or areas[candidate_label] < MIN_HEAD_AREA
                    ):
                        continue
                    candidate_slice = component_slices[candidate_label - 1]
                    if candidate_slice is None:
                        continue
                    candidate_x0, candidate_y0, candidate_x1, candidate_y1 = (
                        component_bounds(candidate_slice)
                    )
                    gap = fighter_y0 - candidate_y1
                    horizontal_overlap = max(
                        0,
                        min(fighter_x1 + HEAD_X_TOLERANCE, candidate_x1)
                        - max(fighter_x0 - HEAD_X_TOLERANCE, candidate_x0),
                    )
                    if (
                        MIN_HEAD_GAP <= gap <= MAX_HEAD_GAP
                        and horizontal_overlap > 0
                        and candidate_y1 <= fighter_y0
                    ):
                        head_labels.append(candidate_label)
                        head_adjustments[candidate_label] = gap

            group_top = fighter_y0 - cell_y
            for head_label in head_labels:
                _, head_y0, _, _ = component_bounds(
                    component_slices[head_label - 1]
                )
                group_top = min(
                    group_top,
                    head_y0
                    + head_adjustments[head_label]
                    - cell_y,
                )
            vertical_shift = max(0, SAFE_TOP - group_top)

            paste_component(
                output,
                rgba,
                labels,
                fighter_label,
                destination_x=0,
                destination_y=vertical_shift,
            )
            for head_label in head_labels:
                paste_component(
                    output,
                    rgba,
                    labels,
                    head_label,
                    destination_x=0,
                    destination_y=vertical_shift + head_adjustments[head_label],
                )

    Image.fromarray(output, "RGBA").save(OUTPUT, optimize=True)
    print(
        f"Saved {OUTPUT} with {len(fighter_labels)} isolated, head-safe frames."
    )


if __name__ == "__main__":
    main()
