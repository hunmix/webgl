import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管

class MultiAttributeSize extends Component {
  glReady = async (gl) => {
    // await this.setStateSync({ gl })

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      attribute float a_PointSize;
      void main () {
        gl_Position = a_Position;
        gl_PointSize = a_PointSize;
      }
    `
    const FSHADER_SOURCE = `
      void main () {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `
    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) // 初始化着色器
    
    const verticesSize = new Float32Array([
      0.0, 0.3, 10.0,
      -0.3, -0.3, 20.0,
      0.3, -0.3, 30.0
    ])

    const vertexBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verticesSize, gl.STATIC_DRAW)

    const FSIZE = verticesSize.BYTES_PER_ELEMENT

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 3, 0) // 将缓冲区对象分配给a_Position, 字节数为3, 偏移量0
    gl.enableVertexAttribArray(a_Position)
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 3, FSIZE * 2) // 将缓冲区对象分配给a_PositSize, 字节数为3, 偏移量2, 即最后一个字段
    gl.enableVertexAttribArray(a_PointSize)

    gl.drawArrays(gl.POINTS, 0, 3)
  }
  render() {
    return (
      <Canvas set={this.glReady}></Canvas>
    )
  }
}

export default MultiAttributeSize;