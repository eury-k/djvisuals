"use client";

import { useEffect, useRef } from "react";

// ReactBits Iridescence background
// Source: https://reactbits.dev/backgrounds/iridescence

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  style?: React.CSSProperties;
  className?: string;
}

const VERT = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAG = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  uniform float u_amplitude;

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.4;

    float r = 0.5 + 0.5 * sin(uv.x * 3.0 + t + 0.0) * u_amplitude;
    float g = 0.5 + 0.5 * sin(uv.x * 3.0 + t + 2.094) * u_amplitude;
    float b = 0.5 + 0.5 * sin(uv.x * 3.0 + t + 4.188) * u_amplitude;

    float wave = sin(uv.y * 6.0 + uv.x * 4.0 + t * 1.5) * 0.15;
    r += wave * u_color.r;
    g += wave * u_color.g;
    b += wave * u_color.b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

export default function Iridescence({
  color = [1, 1, 1],
  speed = 1,
  amplitude = 1,
  style,
  className,
}: IridescenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const compileShader = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uColor = gl.getUniformLocation(program, "u_color");
    const uAmp = gl.getUniformLocation(program, "u_amplitude");

    let raf: number;
    let start = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      const elapsed = ((performance.now() - start) / 1000) * speed;
      resize();
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform3fv(uColor, color);
      gl.uniform1f(uAmp, amplitude);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [color, speed, amplitude]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
