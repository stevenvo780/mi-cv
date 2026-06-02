'use client';
import React, { useRef, useEffect } from 'react';

const MandelbrotWebGL: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl')!;

    const vertexShaderSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;

    const fragmentShaderSource = `
      precision highp float;

      uniform vec2 u_resolution;
      uniform vec2 u_offset;
      uniform float u_zoom;

      vec3 getCustomColor(int iterations, int max_iterations) {
        float t = float(iterations) / float(max_iterations);

        vec3 primaryColor = vec3(224.0 / 255.0, 168.0 / 255.0, 94.0 / 255.0);  // --gold  #e0a85e
        vec3 secondaryColor = vec3(207.0 / 255.0, 106.0 / 255.0, 60.0 / 255.0); // --orange #cf6a3c
        vec3 infoColor = vec3(67.0 / 255.0, 181.0 / 255.0, 166.0 / 255.0);      // --teal  #43b5a6
        vec3 successColor = vec3(111.0 / 255.0, 211.0 / 255.0, 196.0 / 255.0);  // --teal-ink #6fd3c4
        vec3 dangerColor = vec3(141.0 / 255.0, 124.0 / 255.0, 192.0 / 255.0);   // --violet #8d7cc0

        if (iterations == max_iterations) {
          return vec3(0.0);
        } else if (t < 0.25) {
          return mix(primaryColor, secondaryColor, t * 4.0);
        } else if (t < 0.5) {
          return mix(secondaryColor, infoColor, (t - 0.25) * 4.0);
        } else if (t < 0.75) {
          return mix(infoColor, successColor, (t - 0.5) * 4.0);
        } else {
          return mix(successColor, dangerColor, (t - 0.75) * 4.0);
        }
      }

      void main() {
        vec2 c = (gl_FragCoord.xy - u_resolution / 2.0) / u_resolution.y * u_zoom - u_offset;
        vec2 z = vec2(0.0);
        int iterations = 0;
        const int max_iterations = 1000;

        for (int i = 0; i < max_iterations; i++) {
          if (dot(z, z) > 4.0) break;
          z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
          iterations++;
        }

        vec3 color = getCustomColor(iterations, max_iterations);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const offsetLocation = gl.getUniformLocation(program, 'u_offset');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let zoom = 2.5;
    const offset = { x: 0.0, y: 0.0 };

    const render = () => {
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(zoomLocation, zoom);
      gl.uniform2f(offsetLocation, offset.x, offset.y);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    let isDragging = false;
    let lastMousePosition = { x: 0, y: 0 };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const { clientX, clientY } = event;

      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = clientX - canvasRect.left;
      const mouseY = clientY - canvasRect.top;

      const preZoomX = ((mouseX - canvas.width / 2) / canvas.height) * zoom - offset.x;
      const preZoomY = ((mouseY - canvas.height / 2) / canvas.height) * zoom - offset.y;

      const scale = event.deltaY > 0 ? 1.1 : 0.9;
      zoom *= scale;

      const postZoomX = ((mouseX - canvas.width / 2) / canvas.height) * zoom - offset.x;
      const postZoomY = ((mouseY - canvas.height / 2) / canvas.height) * zoom - offset.y;

      offset.x += preZoomX - postZoomX;
      offset.y += preZoomY - postZoomY;

      render();
    };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      lastMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const deltaX = (event.clientX - lastMousePosition.x) / canvas.height * zoom;
        const deltaY = (event.clientY - lastMousePosition.y) / canvas.height * zoom;

        offset.x += deltaX;
        offset.y -= deltaY;

        lastMousePosition = { x: event.clientX, y: event.clientY };
        render();
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    const resizeCanvas = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        render();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    render();

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        canvas {
          width: 100%;
          height: auto;
          aspect-ratio: 3 / 2; /* Mantener relación de aspecto 3:2 */
          display: block;
          max-width: 100%;
          border: 1px solid rgba(244,236,224,0.10);
        }
      `}</style>
      <canvas ref={canvasRef}></canvas>
    </>
  );
};

export default MandelbrotWebGL;
