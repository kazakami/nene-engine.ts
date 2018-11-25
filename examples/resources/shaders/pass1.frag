uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
    vec4 color = texture2D( tDiffuse, vUv );
    color *= 1.0 - 3.0 * ((vUv.x - 0.5) * (vUv.x - 0.5) + (vUv.y - 0.5) * (vUv.y - 0.5));
    gl_FragColor = vec4(color.rgb, 1.0);
}