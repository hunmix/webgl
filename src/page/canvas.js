import React, { useRef,useEffect, useState } from 'react'

function Canvas ({ set }) {
  const canvas = useRef(null)
  useEffect(() => {
    const canvasDom = canvas.current
    const gl = canvasDom.getContext('webgl')
    set(gl)
  }, [canvas])
  return (
    <canvas ref={canvas}></canvas>
  )
}

export default Canvas
