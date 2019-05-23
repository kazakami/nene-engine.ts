uniform sampler2D grass; 
uniform sampler2D kusa; 
uniform sampler2D snow; 
uniform float raise; 
varying vec3 worldPos; 
varying vec2 vUv; 
void main() {
    vec4 colorSnow = texture2D(snow, vUv);
    vec4 colorGrass = texture2D(grass, vUv);
    float a = 1.0 / (1.0 + exp(-(worldPos.y - 8.0)));
    vec4 k = texture2D(kusa, vUv);
    if (k.r > (1.0 - raise / 20.0)) {
        discard;
    }
    gl_FragColor = mix(mix(colorGrass, colorSnow, a), vec4(1, 1, 1, 1), raise / 30.0);
}
