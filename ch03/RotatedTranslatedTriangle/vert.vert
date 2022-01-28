attribute vec4 a_Position;
uniform mat4 u_xformMatrix;
void main(){
    gl_Position = a_Position * u_xformMatrix;
}