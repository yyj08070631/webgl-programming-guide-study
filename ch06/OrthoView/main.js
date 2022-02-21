let VSHADER_SOURCE = null
let FSHADER_SOURCE = null

function main () {
    const canvas = document.getElementById('webgl')
    const nf = document.getElementById('nearFar')
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

        const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
        const projMatrix = new Matrix4()
        let g_near = 0.0, g_far = 0.5
        document.onkeydown = function (e) { keydown(e, gl, n, u_ProjMatrix, projMatrix) }
        draw(gl, n, u_ProjMatrix, projMatrix)
        
        function keydown (e, gl, n, u_ProjMatrix, projMatrix) {
            const map = {
                39: () => { g_near += 0.1 }, // 方向键右
                37: () => { g_near -= 0.1 }, // 方向键左
                38: () => { g_far += 0.1 }, // 方向键上
                40: () => { g_far -= 0.1 }, // 方向键下
            }
            const fn = map[e.keyCode] || (() => { console.log(`Key ${e.keyCode} not found.`) })
            fn()
            draw(gl, n, u_ProjMatrix, projMatrix)
        }
    
        function draw (gl, n, u_ProjMatrix, projMatrix) {
            projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far)
            gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements)
            gl.clear(gl.COLOR_BUFFER_BIT)
            nf.innerHTML = `near: ${Math.round(g_near * 100) / 100}, far: ${Math.round(g_far * 100) / 100};`
            gl.drawArrays(gl.TRIANGLES, 0, n)
        }
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