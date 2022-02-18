let VSHADER_SOURCE = null
let FSHADER_SOURCE = null
let flag = 0

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
        const a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord')
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const n = initVertexBuffers(gl, a_Position, a_TexCoord)
        if (n < 0) {
            console.log('Failed to set the positions of the vertices')
            return
        }
        // Set texture
        if (!initTextures(gl, n)) {
            console.log('Failed to intialize the texture.');
            return;
        }
    }

    function initVertexBuffers (gl, a_Position, a_TexCoord) {
        const vertexTexCoordBuffer = new Float32Array([
            -0.5, 0.5, 0.0, 1.0,
            -0.5, -0.5, 0.0, 0.0,
            0.5, 0.5, 1.0, 1.0,
            0.5, -0.5, 1.0, 0.0,
        ])
        const FSIZE = vertexTexCoordBuffer.BYTES_PER_ELEMENT
        const n = 4

        const vertexBuffer = gl.createBuffer()
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertexTexCoordBuffer, gl.STATIC_DRAW)

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0)
        gl.enableVertexAttribArray(a_Position)

        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2)
        gl.enableVertexAttribArray(a_TexCoord)

        return n
    }

    function initTextures (gl, n) {
        const texture0 = gl.createTexture()
        const texture1 = gl.createTexture()
        const u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0')
        const u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1')
        const image0 = new Image()
        const image1 = new Image()

        image0.onload = () => { loadTexture(gl, n, texture0, u_Sampler0, image0, 0) }
        image1.onload = () => { loadTexture(gl, n, texture1, u_Sampler1, image1, 1) }
        image0.src = './sky.jpg',
        image1.src = './circle.gif'

        return true
    }
    

    function loadTexture (gl, n, texture, u_Sampler, image, texUnit) {
        flag++
        // 对纹理图像进行y轴反转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
        // 开启texUnit号纹理单元
        gl.activeTexture(gl[`TEXTURE${texUnit}`])
        // 向target绑定纹理对象
        gl.bindTexture(gl.TEXTURE_2D, texture)

        // 配置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        // 配置纹理图像
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)

        // 将texUnit号纹理传递给着色器
        gl.uniform1i(u_Sampler, texUnit)

        if (flag === 2) {
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
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