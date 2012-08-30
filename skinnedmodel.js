var MAX_BONES_PER_MESH = 50;

SkinnedModel.prototype = new Model();

SkinnedModel.prototype.constructor = SkinnedModel;

function SkinnedModel(){
	
	  this.vertexFormat = 0;
    this.vertexStride = 0;
    this.vertexBuffer = null;
    this.indexBuffer = null;
    this.effect = null;
    this.meshes = null;
    
    this.complete = false;
	  this.bones = null;
    this.boneMatrices = null;
    this._dirtyBones = true;
    
    this.skinnedEffect = null;
    this.skinnedprogram = null;
  
    this.worldMat = Matrix.I(4);
    this.acc =  new Float32Array(16);
	
};

SkinnedModel.prototype.loadmodel = function(url,callback){
	Model.prototype.loadmodel.call(this,url,callback);
  	
}

SkinnedModel.prototype._parseBinary = function (buffer) {
        var arrays = Model.prototype._parseBinary.call(this, buffer);

        if(this.vertexFormat & ModelVertexFormat.BoneWeights) {
            this.boneMatrices = new Float32Array(16 * MAX_BONES_PER_MESH);
        }
        
        return arrays;
};


 SkinnedModel.prototype._parseModel = function(doc) {
        var i, bone;

        Model.prototype._parseModel.call(this, doc);

        this.bones = doc.bones ? doc.bones : [];

        var tempMat = Matrix.I(4);
        // Force all bones to use efficient data structures
        for (i in this.bones) {
            bone = this.bones[i];
/*
            bone.pos = Vector.create(bone.pos);
            //Quat parameter for rot, it is the parameter of (w,x,y,z)
            bone.rot = Vector.create(bone.rot);
            bone.bindPoseMat = Matrix.createFromArray(bone.bindPoseMat);
            bone.boneMat = Matrix.Zero(4,4);
            if (bone.parent == -1) {
                bone.worldPos = bone.pos;
                bone.worldRot = bone.rot;
            } else {
                bone.worldPos = Vector.create([0,0,0]);
                bone.worldRot = Vector.create([0,0,0,0]);
            }
            */
            
            /* Still use the gl-matrix lib for debug purpose  */
            bone.pos = vec3.create(bone.pos);
            bone.rot = quat4.create(bone.rot);
            bone.bindPoseMat = mat4.create(bone.bindPoseMat);
            bone.boneMat = mat4.create();
            if (bone.parent == -1) {
                bone.worldPos = bone.pos;
                bone.worldRot = bone.rot;
            } else {
                bone.worldPos = vec3.create();
                bone.worldRot = quat4.create();
            }
        }
};

SkinnedModel.prototype.initSkinnedShader = function(vsfile,fsfile){
	 this.skinnedEffect = new program();
   this.skinnedEffect.loadFromID(vsfile);
   this.skinnedEffect.loadFromID(fsfile);
   this.skinnedEffect.link();

   this.skinnedEffect.position = gl.getAttribLocation(this.skinnedEffect.program, "position");
   this.skinnedEffect.texture  = gl.getAttribLocation(this.skinnedEffect.program, 'texture' );
   this.skinnedEffect.normal  = gl.getAttribLocation(this.skinnedEffect.program, 'normal' );
   this.skinnedEffect.weights  = gl.getAttribLocation(this.skinnedEffect.program, 'weights' );
   this.skinnedEffect.bones  = gl.getAttribLocation(this.skinnedEffect.program, 'bones' );

   this.skinnedEffect.viewMat  = gl.getUniformLocation(this.skinnedEffect.program, 'viewMat' );
   this.skinnedEffect.modelMat  = gl.getUniformLocation(this.skinnedEffect.program, 'modelMat' );
   this.skinnedEffect.projectionMat  = gl.getUniformLocation(this.skinnedEffect.program, 'projectionMat' );
   this.skinnedEffect.boneMat  = gl.getUniformLocation(this.skinnedEffect.program, 'boneMat' );
   this.skinnedEffect.lightPos  = gl.getUniformLocation(this.skinnedEffect.program, 'lightPos' );
        
   this.skinnedEffect.sampler = gl.getUniformLocation(this.skinnedEffect.program, 'diffuse');
	
};


SkinnedModel.prototype.render = function (viewMat, projectionMat) {
        if (!this.complete) { return; }

        var i, j,
            mesh, submesh, boneSet,
            indexOffset, indexCount;

        gl.useProgram(this.skinnedprogram);
        // Bind the appropriate buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniform3f(this.skinnedprogram.lightPos, 16, -32, 32);

        viewMat.flattenInto(this.acc);
        gl.uniformMatrix4fv(this.skinnedprogram.vMatrixUniform, false, this.acc);
//        gl.uniformMatrix4fv(this.skinnedEffect.modelMat, false, this.worldMat);
        this.worldMat.flattenInto(this.acc);
        gl.uniformMatrix4fv(this.skinnedprogram.mMatrixUniform, false, this.acc);
        projectionMat.flattenInto(this.acc);
        gl.uniformMatrix4fv(this.skinnedprogram.pMatrixUniform, false, this.acc);

        gl.enableVertexAttribArray(this.skinnedprogram.vertexPositionAttribute);
        gl.enableVertexAttribArray(this.skinnedprogram.textureCoordAttribute);
        gl.enableVertexAttribArray(this.skinnedprogram.vertexNormalAttribute);
        //gl.enableVertexAttribArray(shader.attribute.tangent);
        gl.enableVertexAttribArray(this.skinnedprogram.weights);
        gl.enableVertexAttribArray(this.skinnedprogram.bones);

        // Setup the vertex layout
        gl.vertexAttribPointer(this.skinnedprogram.vertexPositionAttribute, 3, gl.FLOAT, false, this.vertexStride, 0);
        gl.vertexAttribPointer(this.skinnedprogram.textureCoordAttribute, 2, gl.FLOAT, false, this.vertexStride, 12);
        gl.vertexAttribPointer(this.skinnedprogram.vertexNormalAttribute, 3, gl.FLOAT, false, this.vertexStride, 20);
        //gl.vertexAttribPointer(this.skinnedEffect.tangent, 4, gl.FLOAT, false, this.vertexStride, 32);
        gl.vertexAttribPointer(this.skinnedprogram.weights, 3, gl.FLOAT, false, this.vertexStride, 48);
        gl.vertexAttribPointer(this.skinnedprogram.bones, 3, gl.FLOAT, false, this.vertexStride, 60);

        if(this._dirtyBones) {
            for(i = 0; i < this.bones.length; ++i) {
                var bone = this.bones[i];
                this.boneMatrices.set(bone.boneMat, i * 16);
     //           bone.boneMat.flattenInto(this.acc);
     //           this.boneMatrices.set(this.acc, i * 16);
            }
        }

        for (i in this.meshes) {
            mesh = this.meshes[i];
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, mesh.diffuse);
            gl.uniform1i(this.skinnedprogram.samplerUniform1, 0);
            
            for (j in mesh.submeshes) {
                submesh = mesh.submeshes[j];
                
                boneSet = this.boneMatrices.subarray(submesh.boneOffset * 16, (submesh.boneOffset + submesh.boneCount) * 16);
                gl.uniformMatrix4fv(this.skinnedprogram.boneMat, false, boneSet);
                
                gl.drawElements(gl.TRIANGLES, submesh.indexCount, gl.UNSIGNED_SHORT, submesh.indexOffset*2);
            }
        }
};