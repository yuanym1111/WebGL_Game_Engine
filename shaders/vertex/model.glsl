    	  attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;
        attribute vec3 aVertexNormal;

        uniform mat4 uVMatrix;
        uniform mat4 uMMatrix;
        uniform mat4 uPMatrix;

        uniform vec3 lightPos;

        varying vec2 vTexture;
        varying vec3 vNormal;
        varying vec3 vLightDir;
        varying vec3 vEyeDir;

        void main(void) {
        mat4 modelViewMat = uVMatrix * uMMatrix;
        // A "manual" rotation matrix transpose to get the normal matrix
        mat3 normalMat = mat3(modelViewMat[0][0], modelViewMat[1][0], modelViewMat[2][0], modelViewMat[0][1], modelViewMat[1][1], modelViewMat[2][1], modelViewMat[0][2], modelViewMat[1][2], modelViewMat[2][2]);

        vec4 vPosition = modelViewMat * vec4(aVertexPosition, 1.0);
        gl_Position = uPMatrix * vPosition;

        vTexture = aTextureCoord;
        vNormal = normalize(aVertexNormal * normalMat);
        vLightDir = normalize(lightPos-vPosition.xyz);
        vEyeDir = normalize(-vPosition.xyz);
        }