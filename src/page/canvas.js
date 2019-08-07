import React, { useRef,useEffect } from 'react'

function Canvas ({ set, width, height, ...props }) {
  const canvas = useRef(null)
  useEffect(() => {
    const canvasDom = canvas.current
    const gl = canvasDom.getContext('webgl')
    set(gl)
  }, [canvas, set])
  return (
    <canvas ref={canvas} width={width || 400} height={height || 400} {...props}></canvas>
  )
}

export default Canvas
