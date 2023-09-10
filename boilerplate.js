function resizeCanvasToDisplaySize(canvas) {
  // argument should be gl.canvas
  // lookup the size the browser is displaying the canvas in css pixels
  const dpr = window.devicePixelRatio
  const { width, height } = canvas.getBoundingClientRect()
  const displayWidth = Math.round(width * dpr)
  const displayHeight = Math.round(height * dpr)

  // check if the canvas is not the same size
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight
  if (needResize) {
    canvas.width = displayWidth
    canvas.height = displayHeight
  }

  gl.viewport(0, 0, canvas.width, canvas.height)

  return needResize
}

function compileShader(gl, shaderSource, shaderType) {
  const shader = gl.createShader(shaderType)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
    throw 'shader compile fail: ' + gl.getShaderInfoLog(shader)
  }
  return shader
}

function createProgram(gl, vertShader, fragShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertShader)
  gl.attachShader(program, fragShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!success) {
    throw 'program link fail: ' + gl.getProgramInfoLog(program)
  }
  return program
}

function compileAndLink(gl, vsSource, fsSource) {
  const vertShader = compileShader(gl, vsSource, gl.VERTEX_SHADER)
  const fragShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER)
  const program = createProgram(gl, vertShader, fragShader)
  return program
}
