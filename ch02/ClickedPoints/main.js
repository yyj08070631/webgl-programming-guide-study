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
        canvas.onmouseup = function (e) { click(e, gl, canvas, a_Position) }
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
    }

    const g_points = []
    function click (e, gl, canvas, a_Position) {
        let x = e.clientX
        let y = e.clientY
        const rect = e.target.getBoundingClientRect()

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2)
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)
        g_points.push(x)
        g_points.push(y)
        gl.clear(gl.COLOR_BUFFER_BIT)
        for (let i = 0, len = g_points.length; i < len; i += 2) {
            gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0)
            gl.drawArrays(gl.POINTS, 0, 1)
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