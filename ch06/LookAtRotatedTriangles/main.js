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
        const a_Color = gl.getAttribLocation(gl.program, 'a_Color')
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const n = initVertexBuffers(gl, a_Position, a_Color)
        if (n < 0) {
            console.log('Failed to set the positions of the vertices')
            return
        }

        const u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix')
        const modelViewMatrix = new Matrix4()
            .setLookAt(
                0.20, 0.25, 0.25, // 视点
                0, 0, 0, // 观察目标点
                0, 1, 0, // 上方向
            )
            .rotate(-10, 0, 0, 1)
        gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements)

        gl.drawArrays(gl.TRIANGLES, 0, n)
    }

    function initVertexBuffers (gl, a_Position, a_Color) {
        const verticesAndSizes = new Float32Array([
            // 绿色三角形在后面
            0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
            -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
            0.5, -0.5, -0.4, 1.0, 0.4, 0.4,
            // 黄色三角形在中间
            0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
            -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
            0.0, -0.6, -0.2, 1.0, 1.0, 0.4,
            // 蓝色三角形在前面
            0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
            -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
            0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
        ])
        const FSIZE = verticesAndSizes.BYTES_PER_ELEMENT
        const n = 9

        const vertexBuffer = gl.createBuffer()
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, verticesAndSizes, gl.STATIC_DRAW)

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
        gl.enableVertexAttribArray(a_Position)

        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
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