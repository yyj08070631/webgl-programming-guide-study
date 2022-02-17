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
        const u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix')
        const u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor')

        // 设置画布背景色
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        // 常量
        const ANGLE_STEP = 45
        // 初始化
        const modelMatrix = new Matrix4()
        const vertices = new Float32Array([
            0.0, 0.3, 0.0,
            +0.3, -0.3, 0.0,
            -0.3, -0.3, 0.0,
        ])
        let currAngle = 0.0 // 当前旋转角度
        // 创建缓冲区对象
        const vertexBuffer = gl.createBuffer()
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object')
            return -1
        }
        // 将缓冲区对象绑定到全局的缓冲区信息中
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        // 向缓冲区对象中写入数据
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        // 将缓冲区对象分配给 a_Position 变量
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0)
        // 连接 a_Position 变量与分配给它的缓冲区对象
        gl.enableVertexAttribArray(a_Position)
        // 写颜色
        gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0)
        // 基于时间校正 raf 执行频率
        const next = (() => {
            let start = Date.now()
            return angle => {
                const now = Date.now()
                const res = angle + (now - start) / 1000 * ANGLE_STEP
                start = now
                return res
            }
        })()
        // 绘制函数
        const draw = () => {
            // 绘制
            modelMatrix.setRotate(currAngle, 0, 0, 1).translate(0.3, 0, 0)
            // 传入转换矩阵
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements)
            // 绘制前先清空画布
            gl.clear(gl.COLOR_BUFFER_BIT)
            // 绘制
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3)
        }
        // 递归调用
        const tick = () => {
            currAngle = next(currAngle)
            draw()
            requestAnimationFrame(tick)
        }
        tick()
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