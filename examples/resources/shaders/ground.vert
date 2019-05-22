varying vec3 worldPos; 
varying vec2 vUv; 
void main() {
    vUv = uv;
    worldPos = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
