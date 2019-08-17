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
      modelViewMatrix: null,
      near: 0.0,
      far: 0.5
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
      uniform mat4 u_ProjMatrix;
      varying vec4 v_Color;
      void main () {
        gl_Position = u_ProjMatrix * a_Position;
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
      0.0,  0.6,  -0.4,  0.4,  1.0,  0.4, // The back green one
     -0.5, -0.4,  -0.4,  0.4,  1.0,  0.4,
      0.5, -0.4,  -0.4,  1.0,  0.4,  0.4, 

      0.5,  0.4,  -0.2,  1.0,  0.4,  0.4, // The middle yellow one
     -0.5,  0.4,  -0.2,  1.0,  1.0,  0.4,
      0.0, -0.6,  -0.2,  1.0,  1.0,  0.4, 

      0.0,  0.5,   0.0,  0.4,  0.4,  1.0, // The front blue one 
     -0.5, -0.5,   0.0,  0.4,  0.4,  1.0,
      0.5, -0.5,   0.0,  1.0,  0.4,  0.4 
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

    this.draw()
  }
  handleKeyDown = async (e) => {
    let { near, far } = this.state

    switch(e.keyCode) { // 根据方向设置矩阵值
      case 37:
        near -= .01
        break
      case 38:
        far += .01
        break
      case 39:
        near += .01
        break
      case 40:
        far -= .01
        break
      default:
        break
    }
    await this.setStateSync({
      near,
      far
    })
    this.draw()
  }
  draw = () => { // 设置矩阵并传值
    const { gl, near, far } = this.state

    const matrix = new Matrix4()

    const viewMatrix = matrix.setOrtho(-1, 1, -1, 1, near, far)

    const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix')

    gl.uniformMatrix4fv(u_ProjMatrix, false, viewMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 9)
  }
  render() {
    const { near, far } = this.state
    return (
      <div>
        <Canvas set={this.glReady}></Canvas>
        <p>按方向键调整可使空间</p>
        <p>naer: {Math.round(near * 100) / 100}, far: {Math.round(far * 100) / 100}</p>
      </div>
    )
  }
}

export default MultiAttributeSize;