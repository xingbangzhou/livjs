import {mat4} from 'gl-matrix'
import {initGlShaderProgram} from './glFns'
import {WebGLContext} from './glTypes'

interface ProgramInfo {
  program: WebGLProgram
  attribLocations: {
    [key: string]: number
  }
  uniformLocations: {
    [key: string]: WebGLUniformLocation
  }
}

interface Buffers {
  position: WebGLBuffer
  indice: WebGLBuffer
  // color: WebGLBuffer
}

export default function test_simple01(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl')
  if (!gl) {
    console.error('Unable to initialize WebGL. Your browser or machine may not support it.')
    return
  }

  const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `

  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `

  const shaderProgram = initGlShaderProgram(gl, vsSource, fsSource)
  if (!shaderProgram) return

  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix')!,
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')!,
    },
  }

  const buffers = initBuffers(gl)!

  drawScene(gl, programInfo, buffers)
}

function initBuffers(gl: WebGLContext) {
  // positions
  const positionBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  const positions = [0.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 0.0].concat([1.0, -0.25, 0.25, -0.25, 1.0, -1.0, 0.25, -1.0])
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  // indices
  const indiceBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indiceBuffer)
  const indices = [0, 1, 2, 1, 2, 3, 4, 5, 6, 5, 6, 7]
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW)

  return {
    position: positionBuffer,
    indice: indiceBuffer,
  }
}

function drawScene(gl: WebGLContext, programInfo: ProgramInfo, buffers: Buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  const fieldOfView = (45 * Math.PI) / 180
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar)

  const modelViewMatrix = mat4.create()

  mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0])

  {
    const numComponents = 2
    const type = gl.FLOAT
    const normalize = false
    const stribe = 0
    const offset = 0
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indice)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stribe, offset)
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
  }

  gl.useProgram(programInfo.program)

  gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix)
  gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix)

  {
    gl.drawElements(gl.TRIANGLE_FAN, 12, gl.UNSIGNED_BYTE, 0)
  }
}
