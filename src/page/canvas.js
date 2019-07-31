import React, { useRef,useEffect } from 'react'

function Canvas ({ set, width, height }) {
  const canvas = useRef(null)
  useEffect(() => {
    const canvasDom = canvas.current
    const gl = canvasDom.getContext('webgl')
    set(gl)
  }, [canvas])
  return (
    <canvas ref={canvas} width={width || 400} height={height || 400}></canvas>
  )
}

export default Canvas
