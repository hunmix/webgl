import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4 } = utils

class MultiAttributeSize extends Component {
  constructor () {
    super()
    this.state = {
      gl: null,
      vertices: [],
      modelViewMatrix: null
    }
  }
  setStateSync = (state) => {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve)
    })
  }
  glReady = async (gl) => {
    // await this.setStateSync({
    //   gl
    // })

    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      attribute vec4 a_Color;
      uniform mat4 u_ViewMatrix;
      varying vec4 v_Color;
      void main () {
        gl_Position = u_ViewMatrix * a_Position;
        v_Color = a_Color; 
      }
    `
    const FSHADER_SOURCE = `
      precision mediump float; 
      varying vec4 v_Color;
      void main () {
        gl_FragColor = v_Color;
      }
    `

    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
    
    const vertices = new Float32Array([
      0.0, 0.5, -0.4,  0.4, 1.0, 0.4,
     -0.5,-0.5, -0.4,  0.4, 1.0, 0.4,
      0.5,-0.5, -0.4,  1.0, 0.4, 0.4,

      0.5, 0.4, -0.2,  1.0, 0.4, 0.4,
     -0.5, 0.4, -0.2,  1.0, 1.0, 0.4,
      0.0,-0.6, -0.2,  1.0, 1.0, 0.4,

      0.0, 0.5,  0.0,  0.4, 0.4, 1.4,
     -0.5,-0.5,  0.0,  0.4, 0.4, 1.0,
      0.5,-0.5,  0.0,  1.0, 0.4, 0.4
    ])

    await this.setStateSync({
      gl,
      vertices
    })
    this.init()

    document.addEventListener('keydown', this.handleKeyDown)
  }
  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown)
  }
  async init () { // 初始化
    const { gl, vertices } = this.state
    const eyeX = 0.25 // 视点
    const eyeY = 0.25 // 视点
    const eyeZ = 0.25 // 视点

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const FSIZE = vertices.BYTES_PER_ELEMENT

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
    gl.enableVertexAttribArray(a_Position)
    const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    gl.enableVertexAttribArray(a_Color)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 9)

    await this.setStateSync({
      eyeX,
      eyeY,
      eyeZ
    })
    this.draw()
  }
  handleKeyDown = async (e) => {
    let { eyeX, eyeY } = this.state

    switch(e.keyCode) { // 根据方向设置矩阵值
      case 37:
        eyeX -= .01
        break
      case 38:
        eyeY += .01
        break
      case 39:
        eyeX += .01
        break
      case 40:
        eyeY -= .01
        break
      default:
        break
    }
    await this.setStateSync({
      eyeX,
      eyeY
    })
    this.draw()
  }
  draw = () => { // 设置矩阵并传值
    const { gl,eyeX, eyeY, eyeZ } = this.state

    const matrix = new Matrix4()
    const viewMatrix = matrix.setLookAt(eyeX, eyeY, eyeZ, 0.0, 0.0, 0.0, 0, 1, 0)

    const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 9)
  }
  render() {
    return (
      <div>
        <Canvas set={this.glReady}></Canvas>
        <p>按方向键调整方向</p>
      </div>
    )
  }
}

export default MultiAttributeSize;