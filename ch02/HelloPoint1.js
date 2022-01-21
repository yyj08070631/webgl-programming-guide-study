const VSHADER_SOURCE = 
    'void main() {\n' +
    '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' +
    '  gl_PointSize = 10.0;\n' +
    '}\n'
const FSHADER_SOURCE = 
    'void main() {\n' +
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n'

function main () {
    const canvas = document.getElementById('webgl')
    const gl = getWebGLContext(canvas, true)
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('failed to initialize shaders.')
        return
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, 1)
}