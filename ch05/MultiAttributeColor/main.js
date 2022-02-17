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
        const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const n = initVertexBuffers(gl, a_Position, a_PointSize, a_Color)
        if (n < 0) {
            console.log('Failed to set the positions of the vertices')
            return
        }
        gl.drawArrays(gl.TRIANGLES, 0, n)
    }

    function initVertexBuffers (gl, a_Position, a_PointSize, a_Color) {
        const verticesAndSizes = new Float32Array([
            0.0, 0.5, 0.0, 10.0, 0.0, 1.0, 1.0, 1.0,
            0.0, -0.5, 0.0, 20.0, 1.0, 0.0, 1.0, 1.0,
            0.5, 0.0, 0.0, 30.0, 1.0, 1.0, 0.0, 1.0,
        ])
        const FSIZE = verticesAndSizes.BYTES_PER_ELEMENT
        const n = 3

        const vertexBuffer = gl.createBuffer()
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, verticesAndSizes, gl.STATIC_DRAW)

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0)
        gl.enableVertexAttribArray(a_Position)

        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE * 8, FSIZE * 3)
        gl.enableVertexAttribArray(a_PointSize)

        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, FSIZE * 8, FSIZE * 4)
        gl.enableVertexAttribArray(a_Color)

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