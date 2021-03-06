import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4, Vector3 } = utils

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
    
    const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color; // 物体颜色
    attribute vec4 a_Normal; // 法向量
    uniform vec3 u_AmbientLight; // 环境光颜色
    uniform vec3 u_LightColor; // 光线颜色
    uniform vec3 u_LightDirection; // 归一化的世界坐标(光线方向)
    uniform mat4 u_MvpMatrix;
    uniform mat4 u_NormalMatrix;
    varying vec4 v_Color;
    void main () {
      gl_Position = u_MvpMatrix * a_Position;
      vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); // 确保法向量归一化
      float nDotL = max(dot(u_LightDirection, normal), 0.0); // cosθ值(点积的值)
      vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL; // 光线照射后的颜色
      vec3 ambient = u_AmbientLight * a_Color.rgb;
      v_Color = vec4(diffuse + ambient, a_Color.a); 
    }
    `
    const FSHADER_SOURCE = `
    precision mediump float; 
    varying vec4 v_Color;
    void main () {
      gl_FragColor = v_Color;
    }
    `

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)

    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)
    gl.enable(gl.DEPTH_TEST)
    const vertexCount = this.initVertexBuffers()

    const mvpMatrix = new Matrix4()
    const modelMatrix = new Matrix4()
    const normalMatrix = new Matrix4()
    mvpMatrix.setPerspective(30, 1, 1, 100)
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0)

    modelMatrix.setTranslate(0, 1, 0)
    modelMatrix.rotate(90, 0, 0, 1)

    const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
    const u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection')
    const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
    const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
    const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')

    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()

    mvpMatrix.multiply(modelMatrix)
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements) // 视图矩阵
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements) // 视图矩阵


    let lightDirection = new Vector3([0.5, 3.0, 4.0]) // 入射光线
    lightDirection.normalize() // 归一化
    gl.uniform3fv(u_LightDirection, lightDirection.elements)

    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0) // 光线颜色
    
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2) // 环境光颜色
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0)
  }
  initVertexBuffers = () => {
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
      // Vertex coordinates and color
      1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
      1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
     -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
     -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
      1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
    ])
    const normals = new Float32Array([    // Normal
      0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ])
    const colors = new Float32Array([
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
      1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
    ])
    const indices = new Uint8Array([ // 正方体面包括的三角形的六个点的index
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
     12,13,14,  12,14,15,    // left
     16,17,18,  16,18,19,    // down
     20,21,22,  20,22,23     // back
    ])
    this.initArrayBuffer(vertices, 3, gl.FLOAT, 'a_Position')
    this.initArrayBuffer(colors, 3, gl.FLOAT, 'a_Color')
    this.initArrayBuffer(normals, 3, gl.FLOAT, 'a_Normal')

    const indexBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    return indices.length
  }
  initArrayBuffer = (data, num, type, attribute) => {
    const { gl } = this.state
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    const a_attribute = gl.getAttribLocation(gl.program, attribute)
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
    gl.enableVertexAttribArray(a_attribute)
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