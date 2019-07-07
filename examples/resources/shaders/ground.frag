uniform sampler2D grass; 
uniform sampler2D snow; 
varying vec3 worldPos; 
varying vec2 vUv; 
void main() {
    vec4 colorSnow = texture2D(snow, vUv);
    vec4 colorGrass = texture2D(grass, vUv);
    float a = 1.0 / (1.0 + exp(-(worldPos.y - 8.0)));
    gl_FragColor = mix(colorGrass, colorSnow, a);
}
