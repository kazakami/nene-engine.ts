uniform float hoge;
uniform float time;
void main() {
    gl_FragColor = vec4(0.5 + 0.5 * sin(time / 20.0), 0.3 + 0.3 * sin(gl_FragCoord.x / 15.0), 0.3 + 0.3 * sin(gl_FragCoord.y / 10.0), 1.0);
}
