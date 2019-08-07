import React, { Component } from 'react'
import Canvas from '@page/canvas'
import utils from '@/lib/index' // 初始化着色器, 细节先不管
const { Matrix4 } = utils

class RotatedTranslatedTriangle extends Component {
  constructor (props) {
    super(props)
    this.state = {
      gl: null,
      ANGLE: 60,
      ANGLE_STEP: 45, // 旋转速度， 度/秒
      lastTime: Date.now(),
      isRotating: false,
      animationId: null
    }
  }
  setStateSync = (state) => {
    return new Promise((resolve, reject) => {
      this.setState(state, resolve)
    })
  }
  glReady = async (gl) => { // 初始化
    await this.setStateSync({ gl })

    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    const VSHADER_SOURCE = `
      attribute vec4 a_Position;
      uniform mat4 u_Matrix;
      void main () {
        gl_Position = u_Matrix * a_Position;
      }
    `
    const FSHADER_SOURCE = `
      void main () {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `
    utils.initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) // 初始化着色器
    
    const vertices = new Float32Array([
      0.0, 0.3, -0.3, -0.3, 0.3, -0.3
    ])

    const vertexBuffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0) // 将缓冲区对象分配给a_Position
    gl.enableVertexAttribArray(a_Position)
    this.draw()
  }
  draw = () => { // 渲染
    const { ANGLE, gl } = this.state

    const u_Matrix = gl.getUniformLocation(gl.program, 'u_Matrix')
    
    const matrixInstance = new Matrix4() // 实例化matrix库
    matrixInstance.setRotate(ANGLE, 0, 0, 1) // 设置旋转角
    
    gl.uniformMatrix4fv(u_Matrix, false, matrixInstance.elements)
    
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  tick = async () => {
    await this.calcAngle()
    this.draw()
    const animationId = requestAnimationFrame(this.tick)
    await this.setStateSync({
      animationId
    })
  }
  async calcAngle () { // 计算旋转角度
    const { lastTime, ANGLE, ANGLE_STEP } = this.state
    const now = Date.now()
    const elapsed = now - lastTime
    const newAngle = (ANGLE + ANGLE_STEP / 1000 * elapsed) % 360
    await this.setStateSync({
      lastTime: now,
      ANGLE: newAngle
    })
    return newAngle
  }
  startAnimation = async () => { // 开始旋转
    await this.setStateSync({
      isRotating: true,
      lastTime: Date.now()
    })
    this.tick()
  }
  cancelAnimation = async () => { // 取消旋转
    const { animationId } = this.state
    cancelAnimationFrame(animationId)
    await this.setStateSync({
      isRotating: false,
      animationId: null
    })
  }
  render() {
    const { isRotating, ANGLE_STEP } = this.state
    const STEP = 5 // 加减速步长
    return (
      <div>
        <Canvas set={this.glReady}></Canvas>
        <div>
          <button onClick={isRotating ? this.cancelAnimation : this.startAnimation}>{isRotating ? '停止旋转' : '开始旋转'}</button>
          <button onClick={async () => { await this.setStateSync({ANGLE_STEP: ANGLE_STEP + STEP}) }}>加速</button>
          <button onClick={async () => { await this.setStateSync({ANGLE_STEP: ANGLE_STEP > STEP ? ANGLE_STEP - STEP : STEP}) }}>减速</button>
        </div>
      </div>
    )
  }
}

export default RotatedTranslatedTriangle