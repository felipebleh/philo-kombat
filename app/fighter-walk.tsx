"use client";

import { useEffect, useRef } from "react";
import { felipeWalkVertex } from "./felipe-walk-mesh";
import { augustineWalkVertex } from "./augustine-walk-mesh";
import { darwinWalkVertex } from "./darwin-walk-mesh";
import { olympeWalkVertex } from "./olympe-walk-mesh";
import { kierkegaardWalkVertex } from "./kierkegaard-walk-mesh";
import { beauvoirWalkVertex } from "./beauvoir-walk-mesh";
import { foucaultWalkVertex } from "./foucault-walk-mesh";
import { arendtWalkVertex } from "./arendt-walk-mesh";
import { wittgensteinWalkVertex } from "./wittgenstein-walk-mesh";
import { angelaDavisWalkVertex } from "./angela-davis-walk-mesh";
import { pauloFreireWalkVertex } from "./paulo-freire-walk-mesh";
import { fanonWalkVertex } from "./fanon-walk-mesh";
import { krenakWalkVertex } from "./krenak-walk-mesh";
import { turingWalkVertex } from "./turing-walk-mesh";
import { deleuzeWalkVertex } from "./deleuze-walk-mesh";
import { superintelligenceWalkVertex } from "./superintelligence-walk-mesh";

const WALK_ART = {
  agostinho: { src: "/game/agostinho-fullbody-hq.webp", deform: augustineWalkVertex },
  felipe: { src: "/game/felipe-idle.webp", deform: felipeWalkVertex },
  darwin: { src: "/game/darwin-fullbody-clean-hq.webp?v=5.3.1", deform: darwinWalkVertex },
  olympe: { src: "/game/olympe-fullbody-hq.webp?v=3.9", deform: olympeWalkVertex },
  kierkegaard: { src: "/game/kierkegaard-guard-frame.webp?v=4.0", deform: kierkegaardWalkVertex },
  beauvoir: { src: "/game/beauvoir-guard-frame-clean-v2.webp", deform: beauvoirWalkVertex },
  foucault: { src: "/game/foucault-guard-frame.webp?v=4.2", deform: foucaultWalkVertex },
  arendt: { src: "/game/arendt-guard-frame.webp?v=4.3", deform: arendtWalkVertex },
  wittgenstein: { src: "/game/wittgenstein-fullbody-hq.webp?v=4.4", deform: wittgensteinWalkVertex },
  "angela-davis": { src: "/game/angela-davis-fullbody-hq.webp?v=4.5", deform: angelaDavisWalkVertex },
  "paulo-freire": { src: "/game/paulo-freire-fullbody-hq.webp?v=4.6", deform: pauloFreireWalkVertex },
  fanon: { src: "/game/fanon-fullbody-hq.webp?v=4.7", deform: fanonWalkVertex },
  krenak: { src: "/game/krenak-fullbody-clean-hq.webp?v=4.9", deform: krenakWalkVertex },
  turing: { src: "/game/turing-fullbody-hq.webp?v=4.11", deform: turingWalkVertex },
  deleuze: { src: "/game/deleuze-fullbody-hq.webp?v=4.12", deform: deleuzeWalkVertex },
  superintelligence: { src: "/game/superintelligence-fullbody-hq.webp?v=5.1", deform: superintelligenceWalkVertex },
};
const COLUMNS = 32;
const ROWS = 48;

/** A textured mesh keeps the approved native-resolution art in every frame. */
export function FighterWalk({ active, retreat, fighter, paused = false }: {
  paused?: boolean;
  active: boolean;
  retreat: boolean;
  fighter: keyof typeof WALK_ART;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const { src, deform } = WALK_ART[fighter];
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
    });
    // The CSS original remains visible if WebGL or image loading is unavailable.
    if (!gl) return;

    let disposed = false;
    let animationFrame = 0;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 texCoord;
      void main() {
        texCoord = uv;
        gl_Position = vec4(position.x * 2.0 - 1.0, 1.0 - position.y * 2.0, 0.0, 1.0);
      }
    `);
    const fragment = compile(gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform sampler2D art;
      varying vec2 texCoord;
      void main() {
        vec4 pixel = texture2D(art, texCoord);
        ${fighter === "felipe" ? `
          float excess = min(pixel.r, pixel.b) - pixel.g;
          float alpha = 1.0 - clamp((excess - 0.13725) / 0.25490, 0.0, 1.0);
          pixel.r -= max(0.0, excess) * (1.0 - alpha);
          pixel.b -= max(0.0, excess) * (1.0 - alpha);
          pixel *= alpha;
        ` : ""}
        gl_FragColor = pixel;
      }
    `);
    const program = gl.createProgram();
    const positions = gl.createBuffer();
    const coordinates = gl.createBuffer();
    const elements = gl.createBuffer();
    const texture = gl.createTexture();
    const release = () => {
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      gl.deleteBuffer(positions);
      gl.deleteBuffer(coordinates);
      gl.deleteBuffer(elements);
      gl.deleteTexture(texture);
    };
    if (!vertex || !fragment || !program || !positions || !coordinates || !elements || !texture) {
      release();
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      release();
      return;
    }
    gl.useProgram(program);

    const source = new Float32Array((COLUMNS + 1) * (ROWS + 1) * 2);
    const deformed = new Float32Array(source.length);
    for (let row = 0; row <= ROWS; row++) {
      for (let column = 0; column <= COLUMNS; column++) {
        const index = (row * (COLUMNS + 1) + column) * 2;
        source[index] = column / COLUMNS;
        source[index + 1] = row / ROWS;
      }
    }
    const indices = new Uint16Array(COLUMNS * ROWS * 6);
    let cursor = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let column = 0; column < COLUMNS; column++) {
        const a = row * (COLUMNS + 1) + column;
        const b = a + 1;
        const c = a + COLUMNS + 1;
        indices.set([a, c, b, b, c, c + 1], cursor);
        cursor += 6;
      }
    }
    const bindAttribute = (buffer: WebGLBuffer, name: string, data: Float32Array, usage: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    };
    bindAttribute(coordinates, "uv", source, gl.STATIC_DRAW);
    bindAttribute(positions, "position", source, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const art = new Image();
    art.onload = () => {
      if (disposed || gl.isContextLost()) return;
      // No low-resolution intermediate frames or upscaled sprite-sheet cells.
      const box = canvas.getBoundingClientRect();
      const density = Math.min(4, Math.max(2, window.devicePixelRatio || 1));
      canvas.width = art.naturalWidth;
      canvas.height = art.naturalHeight;
      if (fighter === "darwin") {
        canvas.width = Math.max(canvas.width, Math.round(box.width * density));
        canvas.height = Math.max(canvas.height, Math.round(box.height * density));
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, art);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.uniform1i(gl.getUniformLocation(program, "art"), 0);
      const started = performance.now();
      let elapsed = fighter === "olympe" ? 66 : 0, previous = started;
      const draw = (now: number) => {
        if (disposed || gl.isContextLost()) return;
        if (!pausedRef.current) elapsed += Math.min(32, now - previous);
        previous = now;
        for (let index = 0; index < source.length; index += 2) {
          const [x, y] = deform(source[index], source[index + 1], elapsed, retreat);
          deformed[index] = x;
          deformed[index + 1] = y;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, positions);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, deformed);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        canvas.dataset.ready = "true";
        animationFrame = requestAnimationFrame(draw);
      };
      draw(started);
    };
    const contextLost = () => {
      cancelAnimationFrame(animationFrame);
      delete canvas.dataset.ready;
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    art.src = src;
    return () => {
      disposed = true;
      art.onload = null;
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("webglcontextlost", contextLost);
      delete canvas.dataset.ready;
      release();
    };
  }, [active, retreat, fighter]);

  return <canvas ref={canvasRef} className={`${fighter}-walk-canvas`} aria-hidden="true" />;
}
