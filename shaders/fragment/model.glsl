        #ifdef GL_ES
        precision highp float;
        #endif
 
        uniform sampler2D uSampler;

        varying vec2 vTexture;
        varying vec3 vNormal;
        varying vec3 vLightDir;
        varying vec3 vEyeDir;

        void main(void) {
        float shininess = 8.0;
        vec3 specularColor = vec3(1.0, 1.0, 1.0);
        vec3 lightColor = vec3(1.0, 1.0, 1.0);
        vec3 ambientLight = vec3(0.15, 0.15, 0.15);

        vec4 color = texture2D(uSampler, vTexture);
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(vLightDir);
        vec3 eyeDir = normalize(vEyeDir);
        vec3 reflectDir = reflect(-lightDir, normal);

        float specularLevel = color.a;
        float specularFactor = pow(clamp(dot(reflectDir, eyeDir), 0.0, 1.0), shininess) * specularLevel;
        float lightFactor = max(dot(lightDir, normal), 0.0);
        vec3 lightValue = ambientLight + (lightColor * lightFactor) + (specularColor * specularFactor);
        gl_FragColor = vec4(color.rgb * lightValue, 1.0);
        }	