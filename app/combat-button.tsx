import { type PointerEvent, type ReactNode, useRef } from "react";

type CombatButtonProps = {
  shortcut: string;
  label: string;
  touchLabel: string;
  className?: string;
  disabled: boolean;
  onActivate: () => void;
  onTouchPress: (event: PointerEvent<HTMLButtonElement>) => void;
  onTouchRelease?: (event: PointerEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
};

export function CombatButton({
  shortcut, label, touchLabel, className, disabled, onActivate,
  onTouchPress, onTouchRelease, children,
}: CombatButtonProps) {
  const activatedOnPointerDown = useRef(false);

  return (
    <button
      type="button"
      className={className}
      disabled={disabled}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      onPointerDown={(event) => {
        activatedOnPointerDown.current = event.pointerType !== "mouse" && event.button === 0;
        if (!activatedOnPointerDown.current) return;
        event.preventDefault();
        if (onTouchRelease) event.currentTarget.setPointerCapture(event.pointerId);
        onTouchPress(event);
      }}
      onPointerUp={onTouchRelease}
      onPointerCancel={onTouchRelease}
      onLostPointerCapture={onTouchRelease}
      onClick={(event) => {
        // Touch and pen activate immediately. Keep native mouse, keyboard and AT clicks.
        if (event.detail === 0 || !activatedOnPointerDown.current) onActivate();
      }}
    >
      <kbd>{shortcut}</kbd>
      <span>{label}</span>
      <span className="combat-touch-label" aria-hidden="true">{touchLabel}</span>
      {children}
    </button>
  );
}
