import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4 } = utils

class RotatedTranslatedTriangle extends Component {
  constructor (props) {
    super(props)
    this.state = {
      gl: null,
      ANGLE: 60,
      Tx: 0.5
    }
  }
  setStateSync = (state) => {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve)
    })
  }
  glReady = async (gl) => {
    await this.setStateSync({ gl })
    const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      uniform mat4 u_Matrix;
      void main () {
        gl_Position = u_Matrix * a_Position;
      }
    `
    const FSHADER_SOURCE = `
      void main () {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `
    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) // 初始化着色器

    this.draw()
  }
  draw = () => {
    const { ANGLE, Tx, gl } = this.state

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const vertices = new Float32Array([
      0.0, 0.3, -0.3, -0.3, 0.3, -0.3
    ])

    const vertexBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0) // 将缓冲区对象分配给a_Position
    const u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix')

    const matrixInstance = new Matrix4() // 实例化matrix库
    matrixInstance.setRotate(ANGLE, 0, 0, 1) // 设置旋转角
    matrixInstance.translate(Tx, 0, 0) // 平移

    gl.uniformMatrix4fv(u_Matrix, false, matrixInstance.elements)
    gl.enableVertexAttribArray(a_Position)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  async click (dir) {
    let state
    const { ANGLE, Tx } = this.state
    switch(dir) {
      case 'left':
        state = { Tx: Tx - 0.1 }
        break
      case 'right':
        state = { Tx: Tx + 0.1 }
        break
      case 'rotateLeft':
        state = { ANGLE: ANGLE + 5 }
        break
      case 'rotateRight':
        state = { ANGLE: ANGLE - 5 }
        break
      default:
        state = { Tx: Tx - 0.1 }
    }
    await this.setStateSync(state)
    this.draw()
  }
  render() {
    return (
      <div>
        <Canvas set={this.glReady}></Canvas>
        <div>
          <button onClick={() => { this.click('left') }}>左</button>
          <button onClick={() => { this.click('right') }}>右</button>
          <button onClick={() => { this.click('rotateLeft') }}>左转</button>
          <button onClick={() => { this.click('rotateRight') }}>右转</button>
        </div>
      </div>
    )
  }
}

export default RotatedTranslatedTriangle