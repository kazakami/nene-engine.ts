uniform float hoge;
uniform float time;
void main() {
    gl_FragColor = vec4(0.5 + 0.5 * sin(time / 100.0), hoge, hoge, 1.0);
}
