
#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vPos;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main(void) {
  vec3 pos = normalize(vPos);
  vec3 nor = normalize(vNormal); 
    
  nor = reflect(pos,nor);

  float m = 2.0 * sqrt(nor.x * nor.x + nor.y * nor.y + (nor.z+1.0)*(nor.z+1.0));

  nor = (nor / m + 0.5 );

  gl_FragColor = vColor * texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)) * texture2D(uSampler2, vec2(nor.x, nor.y)) * 1.0;
}

