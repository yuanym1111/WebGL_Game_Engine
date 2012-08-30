precision highp float;
    	
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aVertexNormal;
attribute vec3 weights;
attribute vec3 bones;

uniform mat4 uVMatrix;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 boneMat[50];
        
uniform vec3 lightPos;
        
varying vec2 vTexture;
varying vec3 vNormal;
varying vec3 vLightDir;
varying vec3 vEyeDir;
        
mat4 accumulateSkinMat() {
    mat4 result = weights.x * boneMat[int(bones.x)];
    result = result + weights.y * boneMat[int(bones.y)];
    result = result + weights.z * boneMat[int(bones.z)];
    return result;
}
        
// A "manual" rotation matrix transpose to get the normal matrix
mat3 getNormalMat(mat4 mat) {
    return mat3(mat[0][0], mat[1][0], mat[2][0], mat[0][1], mat[1][1], mat[2][1], mat[0][2], mat[1][2], mat[2][2]);
}

void main(void) {
   mat4 modelViewMat = uVMatrix * uMMatrix;
   mat4 skinMat = modelViewMat * accumulateSkinMat();
   mat3 normalMat = getNormalMat(skinMat);
        
   vec4 vPosition = skinMat * vec4(aVertexPosition, 1.0);
   gl_Position = uPMatrix * vPosition;

   vTexture = aTextureCoord;
   vNormal = normalize(aVertexNormal * normalMat);
   vLightDir = normalize(lightPos-vPosition.xyz);
   vEyeDir = normalize(-vPosition.xyz);
 }