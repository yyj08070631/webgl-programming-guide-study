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

        const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix')
        const mvpMatrix = new Matrix4()
            .setPerspective(30, 1, 1, 100)
            .lookAt(
                3, 8, 7, // 视点
                0, 0, 0, // 观察目标点
                0, 1, 0, // 上方向
            )
        gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements)

        gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
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
        const verticesColors = new Float32Array([
          // Vertex coordinates and color
           1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
          -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
          -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
           1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
           1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
           1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
          -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
          -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
        ]);
      
        // Indices of the vertices
        const indices = new Uint8Array([
          0, 1, 2,   0, 2, 3,    // front
          0, 3, 4,   0, 4, 5,    // right
          0, 5, 6,   0, 6, 1,    // up
          1, 6, 7,   1, 7, 2,    // left
          7, 4, 3,   7, 3, 2,    // down
          4, 7, 6,   4, 6, 5     // back
       ]);
        const FSIZE = verticesColors.BYTES_PER_ELEMENT
        const n = 9

        const vertexBuffer = gl.createBuffer()
        const indexBuffer = gl.createBuffer()
        if (!vertexBuffer || !indexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0)
        gl.enableVertexAttribArray(a_Position)

        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3)
        gl.enableVertexAttribArray(a_Color)

        return indices.length
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