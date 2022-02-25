#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 u_LightColor;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
varying vec4 v_Color;
varying vec3 v_Position;
varying vec3 v_Normal;
void main () {
    vec3 normal = normalize(v_Normal);
    vec3 u_LightDirection = normalize(u_LightPosition - vec3(v_Position));
    float nDotL = max(dot(normal, u_LightDirection), 0.0);
    vec3 diffuse = u_LightColor * vec3(v_Color) * nDotL;
    vec3 ambient = u_AmbientLight * v_Color.rgb;
    gl_FragColor = vec4(diffuse + ambient, v_Color.a);
}