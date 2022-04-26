attribute vec4 a_Position;
attribute vec4 a_Color;
attribute float a_Normal;
attribute float a_Face;
uniform mat4 u_NormalMatrix;
uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform int u_PickedFace;
varying vec4 v_Color;
varying vec3 v_Position;
varying vec3 v_Normal;
void main () {
    gl_Position = u_MvpMatrix * a_Position;
    v_Position = vec3(u_ModelMatrix * a_Position);
    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));

    int face = int(a_Face);
    vec3 color = (face == u_PickedFace) ? vec3(1.0) : a_Color.rgb;
    if (u_PickedFace == 0) {
        v_Color = vec4(color, a_Face/255.0);
    } else {
        v_Color = vec4(color, a_Color.a);
    }
}