import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管

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
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main() {
      gl_Position = a_Position;
      v_TexCoord = a_TexCoord;
    }
    `
    const FSHADER_SOURCE = `
    precision mediump float; // 声明浮点数为中精度
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Sampler2;
    varying vec2 v_TexCoord;
    void main() {
      vec4 color1 = texture2D(u_Sampler, v_TexCoord);
      vec4 color2 = texture2D(u_Sampler2, v_TexCoord);
      gl_FragColor = color1 * color2;
    }
    `
    // this.initShader(gl, VSHADER_SOURCE, FSHADER_SOURCE)
    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    this.draw()
  }
  async draw () {
    const { gl } = this.state
    const verticesTexCoords = new Float32Array([
      -0.5,  0.5,   0.0, 1.0,
      -0.5, -0.5,   0.0, 0.0,
       0.5,  0.5,   1.0, 1.0,
       0.5, -0.5,   1.0, 0.0
    ])
    
    const POINT_COUNT = 4 // 顶点个数
    const IMAGE_URL = `${process.env.PUBLIC_URL}/sky.jpg`
    const IMAGE_URL2 = `${process.env.PUBLIC_URL}/circle.gif`
    
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
    const texture2 = gl.createTexture()

    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
    const u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2')
    
    // const image = await this.loadImage(IMAGE_URL)
    // const image2 = await this.loadImage(IMAGE_URL2)

    await this.initTexture(IMAGE_URL, texture, u_Sampler, 0) // 初始化纹理1
    await this.initTexture(IMAGE_URL2, texture2, u_Sampler2, 1)// 初始化纹理2

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, POINT_COUNT)
  }
  async initTexture (url, texture, sampler, textureUnitIndex) {
    const { gl } = this.state
    const image = await this.loadImage(url)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1) // 反转y轴

    gl.activeTexture(gl[`TEXTURE${textureUnitIndex}`]) // 激活纹理单元

    gl.bindTexture(gl.TEXTURE_2D, texture) // 绑定纹理对象

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR) // 设置纹理参数

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image) // 将纹理图像分配给纹理对象

    gl.uniform1i(sampler, textureUnitIndex) // 将纹理单元传递给片元着色器
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