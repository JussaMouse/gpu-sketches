const colors = [
  [0.395, 0.736, 0.437], // mint
  [0.098, 0.118, 0.202], // dark blue
  [0.05, 0.541, 0.618], // aqua
  [0.949, 0.861, 0.484], // yellow cream
];

const vsSource = `#version 300 es
layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aColor;

out vec3 vColor;

void main() {
  vColor = aColor;
  gl_Position = aPosition;
}`;

const fsSource = `#version 300 es
precision mediump float;

in vec3 vColor;

out vec4 fragColor;

void main(){
  fragColor = vec4(vColor, 1.0);
}`;

function main() {
  const canvas = document.querySelector("#glcanvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) alert("no webgl");

  const program = makeProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

  const numShapes = 4;
  const shapeSize = 0.2;
  let tipX = 0;
  let tipY = 0;
  let vertArray = [];

  for (let i = 0; i < numShapes; i++) {
    let v0 = [tipX, tipY];
    let v1 = [Math.random() * shapeSize, tipY + Math.random() * shapeSize];
    let v2 = [Math.random() * shapeSize, tipY + Math.random() * shapeSize];
    vertArray.push([v0, v1, v2]);
    tipY = Math.max(v1[1], v2[1]);
    if (v1[1] == tipY) {
      tipX = v1[0];
    } else {
      tipX = v2[0];
    }
  }

  const dataLength =
    numShapes * 3 * 2 + // x and y values
    numShapes * 3 * 3; // rgb values
  const vertFixed = new Float32Array(dataLength);
  let i = 0;
  let j = 0;
  vertArray.forEach((shape) => {
    shape.forEach((point) => {
      vertFixed[i] = point[0];
      vertFixed[i + 1] = point[1];
      vertFixed[i + 2] = colors[j][0];
      vertFixed[i + 3] = colors[j][1];
      vertFixed[i + 4] = colors[j][2];

      i += 5;
    });
    j++;
  });

  function render(time) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertFixed, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 20, 8);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);

    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 12);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

//////////////////////////////////////////////////////////////////////////
function makeProgram(gl, vsSource, fsSource) {
  const program = gl.createProgram();

  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertShader, vsSource);
  gl.compileShader(vertShader);
  gl.attachShader(program, vertShader);

  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragShader, fsSource);
  gl.compileShader(fragShader);
  gl.attachShader(program, fragShader);

  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertShader));
    console.log(gl.getShaderInfoLog(fragShader));
  }

  return program;
}

//////////////////////////////////////////////////////////////////////////
function resizeCanvasToDisplaySize(canvas) {
  // argument should be gl.canvas
  // lookup the size the browser is displaying the canvas in css pixels
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  // check if the canvas is not the same size
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;
  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

//////////////////////////////////////////////////////////////////////////
function map(val, min1, max1, min2, max2) {
  return min2 + ((val - min1) * (max2 - min2)) / (max1 - min1);
}

main();
