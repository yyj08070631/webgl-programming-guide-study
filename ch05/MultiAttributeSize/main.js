let VSHADER_SOURCE = null
let FSHADER_SOURCE = null

function main () {
    const canvas = document.getElementById('webgl')
    const gl = getWebGLContext(canvas, true)
    loadShaderFile(gl, 'vert.vert', gl.VERTEX_SHADER)
    loadShaderFile(gl, 'frag.frag', gl.FRAGMENT_SHADER)

    function start () {
        if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
            console.log('failed to initialize shaders.')
            return
        }
        const a_Position = gl.getAttribLocation(gl.program, 'a_Position')
        const a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize')
        const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const n = initVertexBuffers(gl, a_Position, a_PointSize, u_FragColor)
        if (n < 0) {
            console.log('Failed to set the positions of the vertices')
            return
        }
        gl.drawArrays(gl.POINTS, 0, n)
    }

    function initVertexBuffers (gl, a_Position, a_PointSize, u_FragColor) {
        const vertices = new Float32Array([0.0, 0.5, 0.0, 0.0, -0.5, 0.0, 0.5, 0.0, 0.0])
        const sizes = new Float32Array([10.0, 20.0, 30.0])
        const n = 3

        const vertexBuffer = gl.createBuffer()
        const sizeBuffer = gl.createBuffer()
        if (!vertexBuffer || !sizeBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        gl.vertexAttribPointer(a_Position, n, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(a_Position)

        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW)
        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(a_PointSize)

        gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0)
        return n
    }

    function loadShaderFile (gl, fileName, shader) {
        const request = new XMLHttpRequest()
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status !== 404) {
                onLoadShader(gl, request.responseText, shader)
            }
        }
        request.open('GET', fileName, true)
        request.send()
    }
    
    function onLoadShader (gl, fileString, type) {
        if (type === gl.VERTEX_SHADER) {
            VSHADER_SOURCE = fileString
        } else if (type === gl.FRAGMENT_SHADER) {
            FSHADER_SOURCE = fileString
        }
        if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl)
    }
}