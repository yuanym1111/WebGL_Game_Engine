uniform mat4 uPMatrix;
uniform mat4 uVMatrix;
uniform int width, height;
uniform float terrainHeight;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

attribute vec3 aVertexPosition;

varying vec3 normal;
varying vec3 vPos;


void main(void) {
	
	          vec2 heightmapCoord = vec2(aVertexPosition.x+float(width/2),-aVertexPosition.z+float(height/2)) / vec2(float(width - 1), float(height - 1));
	          
	          vec3 normalColor = texture2D(uSampler2, heightmapCoord).rgb;
              normal = normalize(normalColor * 2.0 - vec3(1.0));
             
	          vec4 color = texture2D(uSampler,heightmapCoord);
	          
	          vPos = vec3(aVertexPosition.x, color.x * terrainHeight, aVertexPosition.z);
              gl_Position = uPMatrix * uVMatrix * vec4(aVertexPosition.x,color.x * terrainHeight, aVertexPosition.z, 1.0);
}