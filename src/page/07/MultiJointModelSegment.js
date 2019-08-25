import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
import { generateKeyPair } from 'crypto';
const { Matrix4 } = utils

class MultiAttributeSize extends Component {
  constructor () {
    super()
    this.state = {
      gl: null,
      viewMatrix: null,
      modelMatrix: new Matrix4(),
      vertexCount: null, // 要绘制的点的数量
      arm1Angle: 90.0, // 第一节手臂角度
      jointAngle1: 45.0, // 第一节手臂角度
      jointAngle2: 0.0, // 第二节手臂角度
      jointAngle3: 0.0, // 第三节手臂角度
      ANGLE_STEP: 3.0, // 一次转的角度
      a_Position: null,
      u_MvpMatrix: null,
      u_ModelMatrix: null,
      u_NormalMatrix: null,
      g_baseBuffer: null, // 各个部件缓冲对象
      g_arm1Buffer: null,
      g_arm2Buffer: null,
      g_palmBuffer: null,
      g_fingerBuffer: null,
      g_matrixStack: [] // 存放临时matrix
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
    attribute vec4 a_Normal;// 法向量
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
    const vertexCount = await this.initVertexBuffers()
    this.initLightInfo() // 初始化光源信息
    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    const viewMatrix = new Matrix4()

    viewMatrix.setPerspective(50.0, 1, 1, 100) // 设置视图矩阵
    viewMatrix.lookAt(20.0, 10.0, 30.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)

    await this.setStateSync({
      viewMatrix,
      vertexCount,
      a_Position
    })
    await this.draw()
    document.addEventListener('keydown', async e => { // 绑定键盘事件
      const {
        arm1Angle, // 第一节手臂角度
        jointAngle1, // 手关节角度
        jointAngle2, // 手关节角度
        jointAngle3, // 手关节角度
        ANGLE_STEP // 一次转的角度
      } = this.state
      const keyCode = e.keyCode
      const stateObj = {}
      switch (keyCode) {
        case 37:
          stateObj.arm1Angle = (arm1Angle - ANGLE_STEP) % 360
          break
        case 38:
          if (jointAngle1 < 135) {
            stateObj.jointAngle1 = (jointAngle1 - ANGLE_STEP) % 360
          }
          break
        case 39:
          stateObj.arm1Angle = (arm1Angle + ANGLE_STEP) % 360
          break
        case 40:
          if (jointAngle1 > -135) {
            stateObj.jointAngle1 = (jointAngle1 + ANGLE_STEP) % 360
          }
          break
        case 90: // z:第二节关节
          stateObj.jointAngle2 = (jointAngle2 + ANGLE_STEP) % 360
          break
        case 88: // x:第二节关节
          stateObj.jointAngle2 = (jointAngle2 - ANGLE_STEP) % 360
          break
        case 86: // v:第三节关节
          if (jointAngle3 < 60) {
            stateObj.jointAngle3 = (jointAngle3 + ANGLE_STEP) % 360
          }
          break
        case 67: // c:第三节关节
          if (jointAngle3 > -60) {
            stateObj.jointAngle3 = (jointAngle3 - ANGLE_STEP) % 360
          }
          break
        default:
      }
      await this.setStateSync({ ...stateObj })
      await this.draw()
    })
  }
  draw = async () => {
    let {
      gl,
      modelMatrix,
      g_baseBuffer,
      g_arm1Buffer,
      g_arm2Buffer,
      g_palmBuffer,
      g_fingerBuffer,
      arm1Angle, // 第一节手臂角度
      jointAngle1, // 手关节角度
      jointAngle2, // 手关节角度
      jointAngle3, // 手关节角度
    } = this.state
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // 底座
    const baseHeight = 2.0
    modelMatrix.setTranslate(0.0, -12.0, 0.0);
    await this.drawSegment(modelMatrix, g_baseBuffer)

    // 第一节手臂
    const arm1Length = 10.0 // 手臂长度
    this.state.modelMatrix.translate(0.0, baseHeight, 0.0)
    this.state.modelMatrix.rotate(arm1Angle, 0.0, 1.0, 0.0)
    await this.drawSegment(this.state.modelMatrix, g_arm1Buffer)
    // 第二节手臂
    const arm2Length = 10.0
    this.state.modelMatrix.translate(0.0, arm1Length, 0.0) // arm2
    this.state.modelMatrix.rotate(jointAngle1, 0.0, 0.0, 1.0)
    await this.drawSegment(this.state.modelMatrix, g_arm2Buffer)

    // 手掌
    const palmLength = 2.0
    this.state.modelMatrix.translate(0.0, arm2Length, 0.0) // arm2
    this.state.modelMatrix.rotate(jointAngle2, 0.0, 1.0, 0.0)
    await this.drawSegment(this.state.modelMatrix, g_palmBuffer)
    
    this.state.modelMatrix.translate(0.0, palmLength, 0.0)

    // 手指1
    this.pushMatrix(this.state.modelMatrix)
    this.state.modelMatrix.translate(0.0, 0.0, 2.0)
    this.state.modelMatrix.rotate(jointAngle3, 1.0, 0.0, 0.0)
    await this.drawSegment(this.state.modelMatrix, g_fingerBuffer)
    await this.setStateSync({
      modelMatrix: this.popMatrix()
    })
    this.state.modelMatrix.translate(0.0, 0.0, -2.0)
    this.state.modelMatrix.rotate(-jointAngle3, 1.0, 0.0, 0.0)
    await this.drawSegment(this.state.modelMatrix, g_fingerBuffer)
  }
  // 绘制部件
  drawSegment = async (modelMatrix, buffer) => {
    let {
      gl,
      vertexCount,
      viewMatrix,
      u_MvpMatrix, 
      u_ModelMatrix,
      u_NormalMatrix,
      a_Position
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
    // 将要绘制的部件对应缓冲区分配给变量
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.vertexAttribPointer(a_Position, buffer.num, buffer.type, false, 0, 0)
    gl.enableVertexAttribArray(a_Position)

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
  // 初始化光线信息
  initLightInfo = () => {
    const { gl } = this.state
    const u_PointPosition = gl.getUniformLocation(gl.program, 'u_PointPosition')
    const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
    const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')

    gl.uniform3f(u_PointPosition, 0.0, -12.0, 10.0) // 点光源位置, 正前方脚下
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0) // 光线颜色
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2) // 环境光颜色
  }
  // 初始化点坐标
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
    // Vertex coordinate (prepare coordinates of cuboids for all segments)
    const vertices_base = new Float32Array([ // Base(10x2x10)
      5.0, 2.0, 5.0, -5.0, 2.0, 5.0, -5.0, 0.0, 5.0,  5.0, 0.0, 5.0, // v0-v1-v2-v3 front
      5.0, 2.0, 5.0,  5.0, 0.0, 5.0,  5.0, 0.0,-5.0,  5.0, 2.0,-5.0, // v0-v3-v4-v5 right
      5.0, 2.0, 5.0,  5.0, 2.0,-5.0, -5.0, 2.0,-5.0, -5.0, 2.0, 5.0, // v0-v5-v6-v1 up
      -5.0, 2.0, 5.0, -5.0, 2.0,-5.0, -5.0, 0.0,-5.0, -5.0, 0.0, 5.0, // v1-v6-v7-v2 left
      -5.0, 0.0,-5.0,  5.0, 0.0,-5.0,  5.0, 0.0, 5.0, -5.0, 0.0, 5.0, // v7-v4-v3-v2 down
      5.0, 0.0,-5.0, -5.0, 0.0,-5.0, -5.0, 2.0,-5.0,  5.0, 2.0,-5.0  // v4-v7-v6-v5 back
    ])

    const vertices_arm1 = new Float32Array([  // Arm1(3x10x3)
      1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
      1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
      1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
     -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
     -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
      1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
    ])

    const vertices_arm2 = new Float32Array([  // Arm2(4x10x4)
      2.0, 10.0, 2.0, -2.0, 10.0, 2.0, -2.0,  0.0, 2.0,  2.0,  0.0, 2.0, // v0-v1-v2-v3 front
      2.0, 10.0, 2.0,  2.0,  0.0, 2.0,  2.0,  0.0,-2.0,  2.0, 10.0,-2.0, // v0-v3-v4-v5 right
      2.0, 10.0, 2.0,  2.0, 10.0,-2.0, -2.0, 10.0,-2.0, -2.0, 10.0, 2.0, // v0-v5-v6-v1 up
     -2.0, 10.0, 2.0, -2.0, 10.0,-2.0, -2.0,  0.0,-2.0, -2.0,  0.0, 2.0, // v1-v6-v7-v2 left
     -2.0,  0.0,-2.0,  2.0,  0.0,-2.0,  2.0,  0.0, 2.0, -2.0,  0.0, 2.0, // v7-v4-v3-v2 down
      2.0,  0.0,-2.0, -2.0,  0.0,-2.0, -2.0, 10.0,-2.0,  2.0, 10.0,-2.0  // v4-v7-v6-v5 back
    ])

    const vertices_palm = new Float32Array([  // Palm(2x2x6)
      1.0, 2.0, 3.0, -1.0, 2.0, 3.0, -1.0, 0.0, 3.0,  1.0, 0.0, 3.0, // v0-v1-v2-v3 front
      1.0, 2.0, 3.0,  1.0, 0.0, 3.0,  1.0, 0.0,-3.0,  1.0, 2.0,-3.0, // v0-v3-v4-v5 right
      1.0, 2.0, 3.0,  1.0, 2.0,-3.0, -1.0, 2.0,-3.0, -1.0, 2.0, 3.0, // v0-v5-v6-v1 up
     -1.0, 2.0, 3.0, -1.0, 2.0,-3.0, -1.0, 0.0,-3.0, -1.0, 0.0, 3.0, // v1-v6-v7-v2 left
     -1.0, 0.0,-3.0,  1.0, 0.0,-3.0,  1.0, 0.0, 3.0, -1.0, 0.0, 3.0, // v7-v4-v3-v2 down
      1.0, 0.0,-3.0, -1.0, 0.0,-3.0, -1.0, 2.0,-3.0,  1.0, 2.0,-3.0  // v4-v7-v6-v5 back
    ]);

    const vertices_finger = new Float32Array([  // Fingers(1x2x1)
      0.5, 2.0, 0.5, -0.5, 2.0, 0.5, -0.5, 0.0, 0.5,  0.5, 0.0, 0.5, // v0-v1-v2-v3 front
      0.5, 2.0, 0.5,  0.5, 0.0, 0.5,  0.5, 0.0,-0.5,  0.5, 2.0,-0.5, // v0-v3-v4-v5 right
      0.5, 2.0, 0.5,  0.5, 2.0,-0.5, -0.5, 2.0,-0.5, -0.5, 2.0, 0.5, // v0-v5-v6-v1 up
     -0.5, 2.0, 0.5, -0.5, 2.0,-0.5, -0.5, 0.0,-0.5, -0.5, 0.0, 0.5, // v1-v6-v7-v2 left
     -0.5, 0.0,-0.5,  0.5, 0.0,-0.5,  0.5, 0.0, 0.5, -0.5, 0.0, 0.5, // v7-v4-v3-v2 down
      0.5, 0.0,-0.5, -0.5, 0.0,-0.5, -0.5, 2.0,-0.5,  0.5, 2.0,-0.5  // v4-v7-v6-v5 back
    ])

    // Normal
    const normals = new Float32Array([
      0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
      1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
      0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
     -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
      0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
      0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
    ])

    // Indices of the vertices
    const indices = new Uint8Array([
      0, 1, 2,   0, 2, 3,    // front
      4, 5, 6,   4, 6, 7,    // right
      8, 9,10,   8,10,11,    // up
     12,13,14,  12,14,15,    // left
     16,17,18,  16,18,19,    // down
     20,21,22,  20,22,23     // back
    ])
    // this.initArrayBuffer(vertices, 3, gl.FLOAT, 'a_Position')
    const g_baseBuffer = this.initArrayBufferForLaterUse(vertices_base, 3, gl.FLOAT)
    const g_arm1Buffer = this.initArrayBufferForLaterUse(vertices_arm1, 3, gl.FLOAT)
    const g_arm2Buffer = this.initArrayBufferForLaterUse(vertices_arm2, 3, gl.FLOAT)
    const g_palmBuffer = this.initArrayBufferForLaterUse(vertices_palm, 3, gl.FLOAT)
    const g_fingerBuffer = this.initArrayBufferForLaterUse(vertices_finger, 3, gl.FLOAT)

    await this.setStateSync({
      g_baseBuffer,
      g_arm1Buffer,
      g_arm2Buffer,
      g_palmBuffer,
      g_fingerBuffer
    })

    this.initArrayBuffer(normals, 3, gl.FLOAT, 'a_Normal')

    const indexBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    return indices.length
  }
  // 将坐标值写入缓冲区对象，但不分配给attribute
  initArrayBufferForLaterUse = (data, num, type) => {
    const { gl } = this.state

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    buffer.num = num
    buffer.type = type
    return buffer
  }
  // 写入缓冲区并分配给对应变量
  initArrayBuffer = (data, num, type, attribute) => {
    const { gl } = this.state
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

    const a_attribute = gl.getAttribLocation(gl.program, attribute)
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0)
    gl.enableVertexAttribArray(a_attribute)
  }
  pushMatrix = (m) => { // Store the specified matrix to the array
    const { g_matrixStack } = this.state
    var m2 = new Matrix4(m)
    g_matrixStack.push(m2)
  }
  
  popMatrix = () => { // Retrieve the matrix from the array
    const { g_matrixStack } = this.state
    return g_matrixStack.pop()
  }
  render() {
    return (
      <div>
        <Canvas set={this.glReady}></Canvas>
        <p>←→: 以y轴为中心转动， ↑↓: 以z轴为中心转动小臂</p>
        <p>zx: 手掌转动</p>
        <p>cv: 手指转动</p>
      </div>
    )
  }
}

export default MultiAttributeSize