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
        const u_Width = gl.getUniformLocation(gl.program, 'u_Width')
        const u_Height = gl.getUniformLocation(gl.program, 'u_Height')
        canvas.onmouseup = function (e) { click(e, gl, canvas, a_Position, u_Width, u_Height) }
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    const g_points = []
    function click (e, gl, canvas, a_Position, u_Width, u_Height) {
        let x = e.clientX
        let y = e.clientY
        const c = [Math.random(), Math.random(), Math.random(), 1.0]
        const rect = e.target.getBoundingClientRect()
        const n = 3

        const vertexBuffer = gl.createBuffer()
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.vertexAttribPointer(a_Position, n, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(a_Position)

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2)
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)
        g_points.push({ x, y, c })
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (let i = 0, len = g_points.length; i < len; i++) {
            const { x: currX, y: currY } = g_points[i]
            const vertices = new Float32Array([currX, currY + 0.1, 0.0, currX + 0.1, currY, 0.0, currX, currY, 0.0])
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
            console.log(gl.drawingBufferWidth, gl.drawingBufferHeight)
            gl.uniform1f(u_Width, gl.drawingBufferWidth)
            gl.uniform1f(u_Height, gl.drawingBufferHeight)
            gl.drawArrays(gl.TRIANGLES, 0, n) // 实心三角形
            // gl.drawArrays(gl.LINES, 0, n) // 线段
            // gl.drawArrays(gl.LINE_STRIP, 0, n) // 连接所有点，不闭合，生成缺一条闭合边的空心三角形
            // gl.drawArrays(gl.LINE_LOOP, 0, n) // 连接所有点，闭合，这里会生成空心三角形
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