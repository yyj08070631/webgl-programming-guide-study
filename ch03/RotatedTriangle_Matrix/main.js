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
        const u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix')
        const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')
        canvas.onmouseup = function (e) { click(e, gl, canvas, a_Position, u_xformMatrix, u_FragColor) }
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    const g_points = []
    function click (e, gl, canvas, a_Position, u_xformMatrix, u_FragColor) {
        const ROTATE_DEG = Math.PI * 180.0 / 180.0
        const Sx = 1.0, Sy = 2.0, Sz = 1.0
        let x = e.clientX
        let y = e.clientY
        const c = [Math.random(), Math.random(), Math.random(), 1.0]
        const rect = e.target.getBoundingClientRect()

        const vertexBuffer = gl.createBuffer()
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0)
        // 平移
        // const xformMatrix = new Float32Array([
        //     1.0, 0.0, 0.0, 0.1,
        //     0.0, 1.0, 0.0, 0.1,
        //     0.0, 0.0, 1.0, 0.0,
        //     0.0, 0.0, 0.0, 1.0,
        // ])
        // 旋转
        // const xformMatrix = new Float32Array([
        //     Math.cos(ROTATE_DEG), -Math.sin(ROTATE_DEG), 0.0, 0.0,
        //     Math.sin(ROTATE_DEG), Math.cos(ROTATE_DEG), 0.0, 0.0,
        //     0.0, 0.0, 1.0, 0.0,
        //     0.0, 0.0, 0.0, 1.0,
        // ])
        // 缩放
        const xformMatrix = new Float32Array([
            Sx, 0.0, 0.0, 0.0,
            0.0, Sy, 0.0, 0.0,
            0.0, 0.0, Sz, 0.0,
            0.0, 0.0, 0.0, 1.0,
        ])
        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix)
        gl.enableVertexAttribArray(a_Position)

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2)
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)
        g_points.push({ x, y, c })
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (let i = 0, len = g_points.length; i < len; i++) {
            const { x: currX, y: currY } = g_points[i]
            const vertices = new Float32Array([
                currX - 0.1, currY - 0.1, 0.0,
                currX + 0.1, currY - 0.1, 0.0,
                currX - 0.1, currY + 0.1, 0.0,
                currX + 0.1, currY + 0.1, 0.0,
            ])
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
            gl.uniform4f(u_FragColor, ...g_points[i].c)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
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