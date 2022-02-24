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
        const a_Normal = gl.getAttribLocation(gl.program, 'a_Normal')
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        const n = initVertexBuffers(gl, a_Position, a_Color, a_Normal)
        if (n < 0) {
            console.log('Failed to set the positions of the vertices')
            return
        }

        const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
        const u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix')
        const u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor')
        const u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition')
        const u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
        
        const vpMatrix = new Matrix4()
            .setPerspective(30, 1, 1, 100)
            .lookAt(
                10, 40, 40, // 视点
                0, 0, 0, // 观察目标点
                0, 1, 0, // 上方向
            )
        gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0)
        gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2)
        gl.uniform3f(u_LightPosition, 8.0, 8.0, 15.0)

        const ANGLE_STEP = 3.0
        let g_arm1Angle = 90.0, g_joint1Angle = 0.0
        const g_modelMatrix = new Matrix4(), g_mvpMatrix = new Matrix4()

        draw()
        document.onkeydown = e => {
            const map = {
                // 方向键右
                39: () => { g_arm1Angle = (g_arm1Angle + ANGLE_STEP) % 360 },
                // 方向键左
                37: () => { g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360 },
                // 方向键上
                38: () => { if (g_joint1Angle < 135.0) g_joint1Angle += ANGLE_STEP },
                // 方向键下
                40: () => { if (g_joint1Angle > -135.0) g_joint1Angle -= ANGLE_STEP },
            }
            const fn = map[e.keyCode] || (() => { console.log(`Key ${e.keyCode} not found.`) })
            fn()
            draw()
        }
        function draw () {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            // arm1
            g_modelMatrix.setTranslate(0.0, -10.0, 0.0).rotate(g_arm1Angle, 0, 1, 0).scale(1, 1, 1)
            drawBox()
            // arm2
            g_modelMatrix.translate(0.0, 10.0, 0.0).rotate(g_joint1Angle, 0, 0, 1).scale(1, 1, 1)
            drawBox()
        }
        function drawBox () {
            const g_normalMatrix = new Matrix4()

            g_mvpMatrix.set(vpMatrix).multiply(g_modelMatrix)
            gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements)

            g_normalMatrix.setInverseOf(g_modelMatrix).transpose()
            gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements)

            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
        }
    }

    function initVertexBuffers (gl, a_Position, a_Color, a_Normal) {
        // Vertex coordinates锛坅 cuboid 3.0 in width, 10.0 in height, and 3.0 in length with its origin at the center of its bottom)
        const vertices = new Float32Array([
          1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
          1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
          1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
         -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
         -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
          1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
        ]);
      
        const colors = new Float32Array([    // Colors
            1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v0-v1-v2-v3 front
            1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v0-v3-v4-v5 right
            1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v0-v5-v6-v1 up
            1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v1-v6-v7-v2 left
            1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v7-v4-v3-v2 down
            1, 1, 0,   1, 1, 0,   1, 1, 0,  1, 1, 0,     // v4-v7-v6-v5 back
         ]);
      
        // Normal
        const normals = new Float32Array([
          0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0, // v0-v1-v2-v3 front
          1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0, // v0-v3-v4-v5 right
          0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0, // v0-v5-v6-v1 up
         -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
          0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0,  0.0,-1.0, 0.0, // v7-v4-v3-v2 down
          0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0,  0.0, 0.0,-1.0  // v4-v7-v6-v5 back
        ]);
      
        // Indices of the vertices
        const indices = new Uint8Array([
           0, 1, 2,   0, 2, 3,    // front
           4, 5, 6,   4, 6, 7,    // right
           8, 9,10,   8,10,11,    // up
          12,13,14,  12,14,15,    // left
          16,17,18,  16,18,19,    // down
          20,21,22,  20,22,23     // back
        ]);

        if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, a_Position)) {
            console.log('啊 position')
            return -1
        }
        if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, a_Color)) {
            console.log('啊 color')
            return -1
        }
        if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, a_Normal)) {
            console.log('啊 normal')
            return -1
        }

        const indexBuffer = gl.createBuffer()
        if (!indexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

        return indices.length
    }

    function initArrayBuffer (gl, data, num, type, attribute) {
        const buffer = gl.createBuffer()
        if (!buffer) {
            console.log('Failed to create the buffer object')
            return -1
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
        gl.vertexAttribPointer(attribute, num, type, false, 0, 0)
        gl.enableVertexAttribArray(attribute)
        return true
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