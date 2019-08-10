import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管

class MultiAttributeSize extends Component {
  glReady = async (gl) => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
      gl_Position = a_Position;
      v_TexCoord = a_TexCoord;
    }
    `
    const FSHADER_SOURCE = `
    precision mediump float;
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;
    void main() {
      gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
    `
    // this.initShader(gl, VSHADER_SOURCE, FSHADER_SOURCE)
    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
    
    const verticesTexCoords = new Float32Array([ // 顶点和纹理坐标
      -0.5,  0.5,   0.0, 1.0,
      -0.5, -0.5,   0.0, 0.0,
       0.5,  0.5,   1.0, 1.0,
       0.5, -0.5,   1.0, 0.0
    ])
    
    const POINT_COUNT = 4 // 顶点个数
    const IMAGE_URL = `${process.env.PUBLIC_URL}/sky.jpg`
    
    const vertexTexCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW)
    
    const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT
    
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
    gl.enableVertexAttribArray(a_Position)
    
    const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
    gl.enableVertexAttribArray(a_TexCoord)
    
    const texture = gl.createTexture()
    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
    
    const image = await this.loadImage(IMAGE_URL)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // 反转y轴

    gl.activeTexture(gl.TEXTURE0) // 激活纹理单元

    gl.bindTexture(gl.TEXTURE_2D, texture) // 绑定纹理对象

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) // 设置纹理参数

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image) // 将纹理图像分配给纹理对象

    gl.uniform1i(u_Sampler, 0) // 将纹理单元传递给片元着色器

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, POINT_COUNT)
  }
  loadImage (url) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = function () {
        resolve(image)
      }
      image.src = url
    })
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