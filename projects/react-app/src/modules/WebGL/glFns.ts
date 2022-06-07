import {WebGLContext} from './glTypes'

export function loadGlShader(gl: WebGLContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) {
    console.error('An error occurred createShader: return null')
    return null
  }

  gl.shaderSource(shader, source)

  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

export function initGlShaderProgram(gl: WebGLContext, vsSource: string, fsSource: string) {
  const vertexShader = loadGlShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadGlShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if (!vertexShader || !fragmentShader) return null

  const shaderProgram = gl.createProgram()
  if (!shaderProgram) {
    console.error('An error occurred createProgram: return null')
    return null
  }

  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`)
    return null
  }

  return shaderProgram
}
