varying vec3 worldPos; 
varying vec2 vUv; 
uniform float raise;
void main() {
    vUv = uv;
    worldPos = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0) + vec4(0, raise / 8.0, 0, 1);
}
