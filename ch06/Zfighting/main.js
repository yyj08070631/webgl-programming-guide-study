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
        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        const n = initVertexBuffers(gl, a_Position, a_Color)
        if (n < 0) {
            console.log('Failed to set the positions of the vertices')
            return
        }

        const u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
        const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix')
        const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
        const viewMatrix = new Matrix4()
        const projMatrix = new Matrix4().setPerspective(30, canvas.width / canvas.clientHeight, 1, 100)
        const modelMatrix = new Matrix4()
        let g_eyeX = 0, g_eyeY = 0, g_eyeZ = 10

        document.onkeydown = function (e) { keydown(e, gl, n, u_ViewMatrix, viewMatrix, u_ModelMatrix, modelMatrix) }

        gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements)
        draw(gl, n, u_ViewMatrix, viewMatrix, u_ModelMatrix, modelMatrix)
        
        function keydown (e, gl, n, u_ViewMatrix, viewMatrix, u_ModelMatrix, modelMatrix) {
            const map = {
                39: () => { g_eyeX += 0.1 }, // 方向键右
                37: () => { g_eyeX -= 0.1 }, // 方向键左
                38: () => { g_eyeY += 0.1 }, // 方向键上
                40: () => { g_eyeY -= 0.1 }, // 方向键下
            }
            const fn = map[e.keyCode] || (() => { console.log(`Key ${e.keyCode} not found.`) })
            fn()
            draw(gl, n, u_ViewMatrix, viewMatrix, u_ModelMatrix, modelMatrix)
        }
    
        function draw (gl, n, u_ViewMatrix, viewMatrix, u_ModelMatrix, modelMatrix) {
            viewMatrix.setLookAt(
                g_eyeX, g_eyeY, g_eyeZ, // 视点
                0, 0, -2, // 观察目标点
                0, 1, 0, // 上方向
            )
            gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)
            modelMatrix.setTranslate(0.75, 0, 0)
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            gl.disable(gl.POLYGON_OFFSET_FILL)
            gl.drawArrays(gl.TRIANGLES, 0, n / 2)

            modelMatrix.setTranslate(-0.75, 0, 0)
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
            gl.enable(gl.POLYGON_OFFSET_FILL)
            gl.polygonOffset(1.0, 1.0)
            gl.drawArrays(gl.TRIANGLES, n / 2, n / 2)
        }
    }

    function initVertexBuffers (gl, a_Position, a_Color) {
        const verticesAndSizes = new Float32Array([
            // Vertex coordinates and color
             0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
            -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
             2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 
        
             0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
            -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
             3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 
        ])
        const FSIZE = verticesAndSizes.BYTES_PER_ELEMENT
        const n = 6

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