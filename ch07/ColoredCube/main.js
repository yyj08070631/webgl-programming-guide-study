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
        const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
        const viewMatrix = new Matrix4().setPerspective(30, 1, 1, 100)
        const mvpMatrix = new Matrix4()
        gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements)

        const DISTANCE = 7
        let g_eyeX = 0, g_eyeY = 0, g_eyeZ = DISTANCE, floorDeg = 0, wallDeg = 0
        document.onkeydown = function (e) { keydown(e, gl, n, mvpMatrix) }

        draw(gl, n, mvpMatrix)
        
        function keydown (e, gl, n, mvpMatrix) {
            const updateXY = deg => Math.sin(deg * Math.PI / 180) * DISTANCE
            const updateFloorZ = deg => Math.cos(deg * Math.PI / 180) * Math.sqrt(Math.pow(DISTANCE, 2) - Math.pow(g_eyeY, 2))
            const updateWallZ = deg => Math.cos(deg * Math.PI / 180) * Math.sqrt(Math.pow(DISTANCE, 2) - Math.pow(g_eyeX, 2))
            const map = {
                39: () => { floorDeg += 1; g_eyeX = updateXY(floorDeg); g_eyeZ = updateFloorZ(floorDeg) }, // 方向键右
                37: () => { floorDeg -= 1; g_eyeX = updateXY(floorDeg); g_eyeZ = updateFloorZ(floorDeg) }, // 方向键左
                38: () => { wallDeg += 1; g_eyeY = updateXY(wallDeg); g_eyeZ = updateWallZ(wallDeg) }, // 方向键上
                40: () => { wallDeg -= 1; g_eyeY = updateXY(wallDeg); g_eyeZ = updateWallZ(wallDeg) }, // 方向键下
            }
            const fn = map[e.keyCode] || (() => { console.log(`Key ${e.keyCode} not found.`) })
            fn()
            draw(gl, n, mvpMatrix)
        }

        function draw (gl, n, mvpMatrix) {
            mvpMatrix.setLookAt(
                g_eyeX, g_eyeY, g_eyeZ, // 视点
                0, 0, 0, // 观察目标点
                0, 1, 0, // 上方向
            )
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)
            // gl.enable(gl.POLYGON_OFFSET_FILL)
            // gl.polygonOffset(1.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
        }
    }

    function initVertexBuffers (gl, a_Position, a_Color) {
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
      
        const vertices = new Float32Array([   // Vertex coordinates
           1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
           1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
           1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
          -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
          -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
           1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
        ]);
      
        const colors = new Float32Array([     // Colors
          0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
          0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
          1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
          1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
          1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
          0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
        ]);
      
        const indices = new Uint8Array([       // Indices of the vertices
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