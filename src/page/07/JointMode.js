import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4, Vector3 } = utils

class MultiAttributeSize extends Component {
  constructor () {
    super()
    this.state = {
      gl: null,
      viewMatrix: null,
      vertexCount: null, // 要绘制的点的数量
      arm1Angle: 90, // 第一节手臂角度
      jointAngle: 0.0, // 手关节角度
      ANGLE_STEP: 3.0, // 一次转的角度
      u_MvpMatrix: null,
      u_ModelMatrix: null,
      u_NormalMatrix: null
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
    attribute vec4 a_Normal; // 法向量
    uniform vec3 u_AmbientLight; // 环境光颜色
    uniform vec3 u_LightColor; // 光线颜色
    uniform mat4 u_NormalMatrix;
    uniform vec3 u_PointPosition; // 点光源世界坐标
    uniform mat4 u_ModelMatrix; // 模型矩阵
    uniform mat4 u_MvpMatrix;
    varying vec4 v_Color;
    void main () {
      vec4 color = vec4(1.0, 0.4, 0.0, 1.0); // 物体颜色
      gl_Position = u_MvpMatrix * a_Position;
      vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal)); // 计算法向量
      vec4 vertexPosition = u_ModelMatrix * a_Position; // 计算顶点坐标
      vec3 lightDirection = normalize(u_PointPosition - vec3(vertexPosition)); // 光线方向
      float nDotL = max(dot(lightDirection, normal), 0.0); // cosθ值(点积的值)
      vec3 diffuse = u_LightColor * vec3(color) * nDotL; // 光线照射后的颜色
      vec3 ambient = u_AmbientLight * color.rgb;
      v_Color = vec4(diffuse + ambient, color.a); 
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
    this.initLightInfo() // 初始化光源信息

    const viewMatrix = new Matrix4()

    viewMatrix.setPerspective(50.0, 1, 1, 100) // 设置视图矩阵
    viewMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

    await this.setStateSync({
      viewMatrix,
      vertexCount
    })
    await this.draw()
    document.addEventListener('keydown', async e => { // 绑定键盘事件
      const {
        arm1Angle, // 第一节手臂角度
        jointAngle, // 手关节角度
        ANGLE_STEP // 一次转的角度
      } = this.state
      const keyCode = e.keyCode
      switch (keyCode) {
        case 37:
          await this.setStateSync({
            arm1Angle: (arm1Angle - ANGLE_STEP) % 360
          })
          break
        case 38:
          if (jointAngle < 135) {
            await this.setStateSync({
              jointAngle: (jointAngle + ANGLE_STEP) % 360
            })
          }
          break
        case 39:
          await this.setStateSync({
            arm1Angle: (arm1Angle + ANGLE_STEP) % 360
          })
          break
        case 40:
          if (jointAngle > -135) {
            await this.setStateSync({
              jointAngle: (jointAngle - ANGLE_STEP) % 360
            })
          }
          break
        default:
      }
      await this.draw()
    })
  }
  draw = async () => {
    const {
      gl,
      arm1Angle, // 第一节手臂角度
      jointAngle // 手关节角度
    } = this.state
    const arm1Lenght = 10.0 // 手臂长度

    const modelMatrix = new Matrix4()

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    modelMatrix.setTranslate(0.0, -12.0, 0.0) // arm1
    modelMatrix.rotate(arm1Angle, 0.0, 1.0, 0.0)
    await this.drawBox(modelMatrix)

    modelMatrix.translate(0.0, arm1Lenght, 0.0) // arm2
    modelMatrix.rotate(jointAngle, 0.0, 0.0, 1.0)
    modelMatrix.scale(1.3, 1.0, 1.3)
    await this.drawBox(modelMatrix)
  }
  drawBox = async (modelMatrix) => {
    let {
      gl,
      vertexCount,
      viewMatrix,
      u_MvpMatrix, 
      u_ModelMatrix,
      u_NormalMatrix
    } = this.state

    if (!u_MvpMatrix || !u_ModelMatrix || !u_NormalMatrix) {
      u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
      u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
      u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
      await this.setStateSync({
        u_MvpMatrix,
        u_ModelMatrix,
        u_NormalMatrix
      })
    }

    const mvpMatrix = new Matrix4()
    const normalMatrix = new Matrix4()

    mvpMatrix.set(viewMatrix)
    mvpMatrix.multiply(modelMatrix)

    normalMatrix.setInverseOf(modelMatrix)
    normalMatrix.transpose()

    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements) // 视图矩阵 
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements) // 模型矩阵 for 计算顶点坐标
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements) // 法线矩阵
    
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0)
  }
  initLightInfo = () => {
    const { gl } = this.state
    const u_PointPosition = gl.getUniformLocation(gl.program, 'u_PointPosition')
    const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
    const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')

    gl.uniform3f(u_PointPosition, 0.0, -12.0, 5.0) // 点光源位置, 正前方脚下
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0) // 光线颜色
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2) // 环境光颜色
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
    var vertices = new Float32Array([
      1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
      1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
      1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
     -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
     -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
      1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
    ]);
  
    // Normal
    var normals = new Float32Array([
      0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
    ]);
  
    // Indices of the vertices
    var indices = new Uint8Array([
       0, 1, 2,   0, 2, 3,    // front
       4, 5, 6,   4, 6, 7,    // right
       8, 9,10,   8,10,11,    // up
      12,13,14,  12,14,15,    // left
      16,17,18,  16,18,19,    // down
      20,21,22,  20,22,23     // back
    ])
    this.initArrayBuffer(vertices, 3, gl.FLOAT, 'a_Position')
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
        <p>←→: 以y轴为中心转动， ↑↓: 以z轴为中心转动小臂</p>
        <p>点光源位置(0.0, -12.0, 5.0)</p>
        <p>光线颜色(1.0, 1.0, 1.0)</p>
      </div>
    )
  }
}

export default MultiAttributeSize;