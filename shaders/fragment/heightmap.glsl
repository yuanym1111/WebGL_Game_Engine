precision mediump float;

const vec3 fogColor = vec3(0.2, 0.3, 0.5);

uniform vec3 lightDirection;
uniform vec3 cameraPos;

uniform sampler2D uSampler3;
uniform sampler2D uSampler4;

varying vec3 normal;
varying vec3 vPos;
const float waterHeight = 5.0;
    	
void main(void) {
	   vec2 texCoord = vPos.xz / 16.0;
	   
  float grassBegin = waterHeight + 1.0;
  float blendDistance = 2.0;
  float blend = clamp((vPos.y - grassBegin) / blendDistance, 0.0, 1.0);
  vec3 sandColor = texture2D(uSampler3, texCoord).rgb;
  vec3 grassColor = texture2D(uSampler4, texCoord).rgb;
  vec3 materialColor = (1.0 - blend) * sandColor + blend * grassColor;
  float lightIntensity = max(0.0, dot(lightDirection, normalize(normal)));
  vec3 surfaceColor = materialColor * lightIntensity;

  vec3 eye = cameraPos - vPos;
  float depth = waterHeight - vPos.y;
  float fracWater = depth / eye.y;
  float fogDepth = fracWater * length(eye);
  float fog = clamp(fogDepth / waterHeight, 0.0, 1.0);
  vec3 color =  surfaceColor;
  gl_FragColor = vec4(color, 1.0);
}