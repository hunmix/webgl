import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4 } = utils

class MultiAttributeSize extends Component {
  constructor () {
    super()
    this.rotateAngle = {
      x: 0.0,
      y: 0.0
    }
    this.state = {
      gl: null,
      u_MvpMatrix: null,
      vertexCount: null,
      viewProjMatrix: null,
      canvas: null,
      rotateAngle: {
        x: 0.0,
        y: 0.0
      }
    }
  }
  setStateSync = (state) => {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve)
    })
  }
  glReady = async (gl, canvas) => {
    await this.setStateSync({
      gl
    })
    const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      attribute vec2 a_TexCoord;
      uniform mat4 u_MvpMatrix;
      varying vec2 v_TexCoord;
      void main () {
        gl_Position = u_MvpMatrix * a_Position;
        v_TexCoord = a_TexCoord;
      }
    `
    const FSHADER_SOURCE = `
      precision mediump float;
      uniform sampler2D u_Sampler;
      varying vec2 v_TexCoord;
      void main () {
        // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
      }
    `
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)

    const vertexCount = await this.initVertexBuffers()
    
    const viewProjMatrix = new Matrix4()
    viewProjMatrix.setPerspective(30.0, 1, 1.0, 100.0)
    viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
    await this.setStateSync({
      vertexCount,
      viewProjMatrix,
      canvas
    })
    this.initEventHandlers()
    this.initTexCrood()
    // this.draw()
    this.tick()
  }
  tick = async () => {
    this.draw()
    requestAnimationFrame(this.tick)
    // await this.setStateSync({
    //   animationId
    // })
  }
  draw = () => {
    const {
      gl,
      u_MvpMatrix,
      vertexCount,
      viewProjMatrix
      // rotateAngle
    } = this.state
    const mvpMatrix = new Matrix4()
    mvpMatrix.set(viewProjMatrix)
    mvpMatrix.rotate(this.rotateAngle.x, 1.0, 0.0, 0.0)
    mvpMatrix.rotate(this.rotateAngle.y, 0.0, 1.0, 0.0)

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0)
  }
  initEventHandlers = () => {
    const { canvas } = this.state
    let lastX = -1, lastY = -1, dragging = false

    canvas.onmousedown = e => {
      const x = e.clientX
      const y = e.clientY
      // const rect = e.target.getBoundingClientRect()
      lastX = x
      lastY = y
      dragging = true
    }
    canvas.onmousemove = async e => {
      const x = e.clientX
      const y = e.clientY
      if (dragging) {
        const factor = 100/canvas.height // The rotation ratio
        const dx = factor * (x - lastX)
        const dy = factor * (y - lastY)
        // Limit x-axis rotation angle to -90 to 90 degrees
        this.rotateAngle.x = Math.max(Math.min(this.rotateAngle.x + dy, 90.0), -90.0)
        this.rotateAngle.y = this.rotateAngle.y + dx
      }
      lastX = x
      lastY = y
    }
    canvas.onmouseup = () => { dragging = false }
  }
  initVertexBuffers = async () => {
    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    const { gl } = this.state

    const vertices = new Float32Array([
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
     -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
     -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
    ])
    const texCoords = new Float32Array([
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
    ])
    const indices = new Uint8Array([
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ])
    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    const indexBuffer = gl.createBuffer()

    this.initBufferArray(vertices, 3, gl.FLOAT, 'a_Position')
    this.initBufferArray(texCoords, 2, gl.FLOAT, 'a_TexCoord')
    // Unbind the buffer object
    // gl.bindBuffer(gl.ARRAY_BUFFER, null)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    await this.setStateSync({
      u_MvpMatrix
    })

    return indices.length
  }
  initBufferArray = (data, num, type, attribute) => { // 初始化顶点缓冲区
    const { gl } = this.state
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    const a_attribute = gl.getAttribLocation(gl.program, attribute)

    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)

    gl.enableVertexAttribArray(a_attribute)
  }
  initTexCrood = async () => { // 初始化纹理
    const IMAGE_URL = `${process.env.PUBLIC_URL}/sky.jpg`
    const { gl } = this.state
    const texture = gl.createTexture()

    const u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler')
    const image = await this.loadImage(IMAGE_URL)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    // Set the image to texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    // Pass the texure unit 0 to u_Sampler
    gl.uniform1i(u_Sampler, 0)
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

export default MultiAttributeSize