import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4 } = utils

class MultiAttributeSize extends Component {
  constructor () {
    super()
    this.state = {
      gl: null
    }
  }
  setStateSync = (state) => {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve)
    })
  }
  glReady = async (gl) => {
    await this.setStateSync({
      gl
    })

    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      attribute vec4 a_Color;
      uniform mat4 u_ViewMirtix;
      varying vec4 v_Color;
      void main () {
        gl_Position = u_ViewMirtix * a_Position;
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
      0.0, 0.5, 0.0, 1.0, 0.0, 0.0,
      -0.5, -0.5, 0.0, 0.0, 0.0, 0.0,
      0.5, -0.5, 0.0, 1.0, 0.0, 0.0
    ])

    const matrix = new Matrix4()
    const viewMatrix = matrix.setLookAt(0.25, 0.25, 0.25, 0.0, 0.0, 0.0, 0, 1, 0)// 视点, 观察目标点, 正方向

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
    const u_ViewMirtix = gl.getUniformLocation(gl.program, 'u_ViewMirtix')

    gl.uniformMatrix4fv(u_ViewMirtix, false, viewMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  render() {
    return (
      <div>
        <Canvas set={this.glReady}></Canvas>
      </div>
    )
  }
}

export default MultiAttributeSize;