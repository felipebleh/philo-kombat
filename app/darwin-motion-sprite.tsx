"use client";
import {useEffect,useRef} from "react";
import {DARWIN_MOTION_ART,darwinMotionActive,darwinMotionPose,darwinMotionVertex} from "./darwin-motion";
const COLUMNS=40, ROWS=60;
const cache=new Map<string,Promise<HTMLImageElement>>();
function loadArt(src:string){
 let pending=cache.get(src);
 if(!pending){pending=new Promise<HTMLImageElement>((resolve,reject)=>{
  const image=new Image();image.decoding="async";image.onload=()=>resolve(image);image.onerror=()=>{cache.delete(src);reject(new Error("Darwin art unavailable"));};image.src=src;
 });cache.set(src,pending);}return pending;
}
/** Software Canvas path for browsers without WebGL; the texture stays native-size. */
function canvasMotion(canvas:HTMLCanvasElement,action:string,clock:{time:number}){
 const ctx=canvas.getContext("2d");if(!ctx)return;
 let disposed=false,frame=0,previous=-Infinity;const started=clock.time;
 canvas.dataset.renderer="canvas2d";
 Promise.all(DARWIN_MOTION_ART.map(loadArt)).then(images=>{
  const draw=(now:number)=>{
   if(disposed)return;frame=requestAnimationFrame(draw);
   if(now-previous<32)return;previous=now;
   const elapsed=Math.max(0,clock.time-started),pose=darwinMotionPose(action,elapsed),image=images[pose];
   const box=canvas.getBoundingClientRect(),density=Math.min(4,Math.max(2,window.devicePixelRatio||1));
   const w=Math.max(image.naturalWidth,Math.round(box.width*density)),h=Math.max(image.naturalHeight,Math.round(box.height*density));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
   const columns=16,rows=24,points:Array<[number,number]>=[];
   for(let r=0;r<=rows;r++)for(let c=0;c<=columns;c++){const [x,y]=darwinMotionVertex(c/columns,r/rows,elapsed,action);points.push([x*w,y*h]);}
   const triangle=(sx:number,sy:number,sw:number,sh:number,a:[number,number],b:[number,number],c:[number,number])=>{
    ctx.save();ctx.setTransform(1,0,0,1,0,0);
    const mx=(a[0]+b[0]+c[0])/3,my=(a[1]+b[1]+c[1])/3;
    // Subpixel overlap closes antialiased triangle seams without softening the art.
    ctx.beginPath();for(const [i,p]of [a,b,c].entries()){
     const len=Math.hypot(p[0]-mx,p[1]-my)||1,x=p[0]+(p[0]-mx)/len*.45,y=p[1]+(p[1]-my)/len*.45;
     if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }ctx.closePath();ctx.clip();
    const aa=(b[0]-a[0])/sw,bb=(b[1]-a[1])/sw,cc=(c[0]-a[0])/sh,dd=(c[1]-a[1])/sh;
    ctx.setTransform(aa,bb,cc,dd,a[0]-aa*sx-cc*sy,a[1]-bb*sx-dd*sy);
    ctx.drawImage(image,0,0);ctx.restore();
   };
   const sw=image.naturalWidth/columns,sh=image.naturalHeight/rows;
   for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
    const i=r*(columns+1)+c,a=points[i],b=points[i+1],d=points[i+columns+1],e=points[i+columns+2];
    triangle(c*sw,r*sh,sw,sh,a,b,d);triangle((c+1)*sw,(r+1)*sh,-sw,-sh,e,d,b);
   }
   canvas.dataset.ready="true";canvas.dataset.pose=String(pose);
  };draw(performance.now());
 }).catch(error=>{canvas.dataset.error=String(error);delete canvas.dataset.ready;});
 return()=>{disposed=true;cancelAnimationFrame(frame);delete canvas.dataset.ready;};
}
/** Independent arms, cane, torso and knees; the existing walking renderer is untouched. */
export function DarwinMotionSprite({action,clock,sequence}:{action:string;clock:{time:number};sequence:number}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const active=darwinMotionActive(action);
 useEffect(()=>{
  const canvas=canvasRef.current;
  if(!canvas||!active)return;
  const started=clock.time;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
    });
    // The CSS original remains visible if WebGL or image loading is unavailable.
    canvas.dataset.renderer = gl ? "webgl" : "unavailable";
    if (!gl) return canvasMotion(canvas,action,clock);

    let disposed = false;
    let animationFrame = 0;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { canvas.dataset.error = gl.getShaderInfoLog(shader) ?? "shader"; return null; }
      return shader;
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


    Promise.all(DARWIN_MOTION_ART.map(loadArt)).then(images=>{
      if(disposed||gl.isContextLost())return;
      let uploaded=-1;
      const draw=()=>{
        if(disposed||gl.isContextLost())return;
        const elapsed=Math.max(0,clock.time-started),pose=darwinMotionPose(action,elapsed);
        const box=canvas.getBoundingClientRect(),density=Math.min(4,Math.max(2,window.devicePixelRatio||1));
        const w=Math.max(images[pose].naturalWidth,Math.round(box.width*density));
        const h=Math.max(images[pose].naturalHeight,Math.round(box.height*density));
        if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
        if(uploaded!==pose){
          gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
          gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[pose]);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
          gl.uniform1i(gl.getUniformLocation(program,"art"),0);uploaded=pose;
        }
        for(let i=0;i<source.length;i+=2){
          const [x,y]=darwinMotionVertex(source[i],source[i+1],elapsed,action);
          deformed[i]=x;deformed[i+1]=y;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.bufferSubData(gl.ARRAY_BUFFER,0,deformed);
        gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
        canvas.dataset.ready="true";canvas.dataset.pose=String(pose);
        animationFrame=requestAnimationFrame(draw);
      };draw();
    }).catch((error)=>{delete canvas.dataset.ready;canvas.dataset.error=String(error);});
    const contextLost=()=>{cancelAnimationFrame(animationFrame);delete canvas.dataset.ready;};
    canvas.addEventListener("webglcontextlost",contextLost);
    return()=>{disposed=true;cancelAnimationFrame(animationFrame);canvas.removeEventListener("webglcontextlost",contextLost);delete canvas.dataset.ready;release();};
 },[action,active,clock,sequence]);
 return active?<canvas ref={canvasRef} className="darwin-motion-canvas" aria-hidden="true"/>:null;
}
