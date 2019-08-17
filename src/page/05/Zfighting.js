import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4 } = utils

class MultiAttributeSize extends Component {
  constructor () {
    super()
    this.state = {
      gl: null,
      isEnablePolygon: false
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
      uniform mat4 u_MvpMatrix;
      varying vec4 v_Color;
      void main () {
        gl_Position = u_MvpMatrix * a_Position;
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
      // Vertex coordinates and color
      0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
      -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
      2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 

      0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
      -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
      3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 
    ])

    const viewMatrix = new Matrix4()
    const projMatrix = new Matrix4()
    const mvpMatrix = new Matrix4()
    viewMatrix.setLookAt(3.06, 2.5, 10.0, 0, 0, -2, 0, 1, 0)// 视点, 观察目标点, 正方向(TODO:只有这个角度才能完美看见斑驳，why?)
    projMatrix.setPerspective(30, 1, 1, 100)

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

    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    mvpMatrix.set(projMatrix).multiply(viewMatrix)
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)
    
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST) // 开启隐藏面消除(离视野近的图形会遮挡后面的图形)
    gl.enable(gl.POLYGON_OFFSET_FILL)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.polygonOffset(1.0, 1.0)
    gl.drawArrays(gl.TRIANGLES, 3, 3)
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