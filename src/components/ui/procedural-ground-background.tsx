"use client";

import React, { useEffect, useRef } from 'react';
import { useTheme } from "next-themes";

/**
 * ProceduralGroundBackground
 * A WebGL 2D background featuring topographic neon lines and sand-ripple movement.
 * Optimized for performance using fragment shaders.
 */
const ProceduralGroundBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const lightTheme = useRef(false);

  useEffect(() => {
    lightTheme.current = resolvedTheme ? resolvedTheme === "light" : !document.documentElement.classList.contains("dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.visibility = "hidden";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lowMemory = "deviceMemory" in navigator ? navigator.deviceMemory : undefined;
    if (window.innerWidth < 640 || (typeof lowMemory === "number" && lowMemory <= 2)) {
      return;
    }

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
    if (!gl) {
      console.warn("Procedural background: WebGL is unavailable; using the static background.");
      return;
    }

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_light;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Ground Perspective Simulation
        float depth = 1.0 / (uv.y + 1.15);
        vec2 gridUv = vec2(uv.x * depth, depth + u_time * 0.15);
        
        // Layered Procedural Noise for Terrain
        float n = noise(gridUv * 3.5);
        float ripples = sin(gridUv.y * 18.0 + n * 8.0 + u_time * 0.5);
        
        // Neon Topographic Lines
        float topoLine = smoothstep(0.03, 0.0, abs(ripples));
        
        // Color Palette
        vec3 baseColor = vec3(0.045, 0.03, 0.075);
        vec3 accentColor = vec3(0.12, 0.09, 0.22);
        vec3 neonColor = vec3(0.3, 0.55, 0.44);
        
        // Composite
        vec3 finalColor = mix(baseColor, accentColor, n * 0.6);
        finalColor += topoLine * neonColor * depth * 0.4;
        
        // Horizon Fog / Fade
        float fade = smoothstep(0.1, -1.0, uv.y);
        finalColor *= (1.0 - length(uv) * 0.45) * (1.0 - fade);
        vec3 lightColor = mix(vec3(0.98, 0.973, 0.988), vec3(0.65, 0.57, 0.75), clamp(length(finalColor) * 0.8, 0.0, 0.3));
        finalColor = mix(finalColor, lightColor, u_light);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) {
        console.error("Procedural background: could not allocate a shader.");
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Procedural background shader compilation failed:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }
    const program = gl.createProgram();
    if (!program) {
      console.error("Procedural background: could not allocate a program.");
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Procedural background program linking failed:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    if (!buffer) {
      console.error("Procedural background: could not allocate the vertex buffer.");
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const lightLoc = gl.getUniformLocation(program, "u_light");

    let animationFrameId: number | null = null;
    let timerId: number | null = null;
    let hasRendered = false;
    const canAnimate = () => !document.hidden && !reducedMotion.matches && window.innerWidth >= 640 && !gl.isContextLost();
    const resize = () => {
      canvas.style.visibility = "hidden";
      hasRendered = false;
      // The softly filtered background does not need a full-resolution 4K buffer.
      const scale = Math.min(1, Math.sqrt(1280 * 720 / (window.innerWidth * window.innerHeight)));
      canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
      canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const render = (time: number) => {
      animationFrameId = null;
      if (!canAnimate()) return;

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(lightLoc, lightTheme.current ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!hasRendered) {
        canvas.style.visibility = "visible";
        hasRendered = true;
      }
      timerId = window.setTimeout(() => {
        timerId = null;
        animationFrameId = requestAnimationFrame(render);
      }, Math.max(0, 1000 / 30 - (performance.now() - time)));
    };

    const stop = () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (timerId !== null) window.clearTimeout(timerId);
      animationFrameId = null;
      timerId = null;
    };
    const update = () => {
      stop();
      if (canAnimate()) animationFrameId = requestAnimationFrame(render);
    };
    const handleResize = () => {
      resize();
      update();
    };

    resize();
    update();
    document.addEventListener("visibilitychange", update);
    reducedMotion.addEventListener("change", update);
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      stop();
      canvas.style.visibility = "hidden";
      document.removeEventListener("visibilitychange", update);
      reducedMotion.removeEventListener("change", update);
      window.removeEventListener("resize", handleResize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-background -z-10 pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full hidden motion-safe:sm:block pointer-events-none dark:contrast-110 dark:brightness-90"
        aria-hidden="true"
      />
    </div>
  );
};

export default ProceduralGroundBackground;
