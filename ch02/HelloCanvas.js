function main () {
	var canvas = document.getElementById('webgl')
	var gl = getWebGLContext(canvas, true)
	gl.clearColor(0.0, 0.0, 0.0, 1.0)
	console.log(gl.COLOR_BUFFER_BIT)
	gl.clear(gl.COLOR_BUFFER_BIT)
}