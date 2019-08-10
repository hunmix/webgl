export function initShader (gl, vertexShaderSource, fragmentShaderSource) { // 初始化着色器
  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vertexShader, vertexShaderSource)
  gl.compileShader(vertexShader)

  const fregmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fregmentShader, fragmentShaderSource)
  gl.compileShader(fregmentShader)

  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fregmentShader)

  gl.linkProgram(shaderProgram)
  gl.useProgram(shaderProgram)

  gl.program = shaderProgram
}
