attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform mat4 u_NormalMatrix;
uniform mat4 u_MvpMatrix;
uniform mat4 u_ModelMatrix;
uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
varying vec4 v_Color;
void main(){
    gl_Position = u_MvpMatrix * a_Position;
    vec4 vertexPosition = u_ModelMatrix * a_Position;
    vec3 u_LightDirection = normalize(u_LightPosition - vec3(vertexPosition));
    vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));
    float nDotL = max(dot(normal, u_LightDirection), 0.0);
    vec3 diffuse = u_LightColor * vec3(a_Color) * nDotL;
    vec3 ambient = u_AmbientLight * a_Color.rgb;
    v_Color = vec4(diffuse + ambient, a_Color.a);
}