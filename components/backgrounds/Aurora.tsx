"use client";

import { useEffect, useRef } from "react";

// Magic UI Aurora background — WebGL aurora borealis effect

interface AuroraProps {
  style?: React.CSSProperties;
  className?: string;
  speed?: number;
}

const VERT = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(noise(i), noise(i + vec2(1,0)), u.x),
      mix(noise(i + vec2(0,1)), noise(i + vec2(1,1)), u.x),
      u.y
    );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.2;

    float n1 = smoothNoise(uv * 3.0 + vec2(t, 0.0));
    float n2 = smoothNoise(uv * 2.0 + vec2(0.0, t * 0.7));

    float aurora = smoothstep(0.3, 0.7, uv.y + n1 * 0.3 - 0.2);
    aurora *= smoothstep(0.9, 0.4, uv.y + n2 * 0.2);

    vec3 col1 = vec3(0.0, 0.8, 0.6); // teal
    vec3 col2 = vec3(0.4, 0.0, 0.9); // purple
    vec3 col3 = vec3(0.0, 0.3, 0.8); // blue

    vec3 color = mix(col2, col1, n1) * aurora;
    color += mix(col3, col2, n2) * aurora * 0.5;
    color += vec3(0.0, 0.0, 0.05); // dark base

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Aurora({ style, className, speed = 1 }: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const makeShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, makeShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, makeShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let raf: number;
    const start = performance.now();

    const render = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, (((performance.now() - start) / 1000) * speed));
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
