var MAX_BONES_PER_MESH = 50;

var ModelVertexFormat = {
        Position: 0x0001,
        UV: 0x0002,
        UV2: 0x0004,
        Normal: 0x0008,
        Tangent: 0x0010,
        Color: 0x0020,
        BoneWeights: 0x0040
    };
    
function GetLumpId(id) {
        var str = "";
        str += String.fromCharCode(id & 0xff);
        str += String.fromCharCode((id >> 8) & 0xff);
        str += String.fromCharCode((id >> 16) & 0xff);
        str += String.fromCharCode((id >> 24) & 0xff);
        return str;
};
 
 
var Model = function () {
        this.vertexFormat = 0;
        //vertexStride stores all geo information including position, texture, normal and so one
        this.vertexStride = 0;
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.effect = null;
        
        //Removed later, test it
        this.program = null;
        
        this.meshes = null;
        this.complete = false;
        
        this.worldMat =  Matrix.I(4);   
        this.acc = new Float32Array(16);
        
};  


Model.prototype.loadmodel = function (url,vsname,fsname,callback){
	      var self = this,
        vertComplete = false,
        modelComplete = false;

        // Load the binary portion of the model
        var vertXhr = new XMLHttpRequest();
        vertXhr.open('GET', url + ".wglvert", true);
        vertXhr.responseType = "arraybuffer";
        vertXhr.onload = function() {
            var arrays = self._parseBinary(this.response);
            self._compileBuffers(gl, arrays);
            vertComplete = true;
            
            if (modelComplete) {
                self.complete = true;
                if (callback) { callback(self); }
            }
        };
        vertXhr.send(null);

        // Load the json portion of the model
        var jsonXhr = new XMLHttpRequest();
        jsonXhr.open('GET', url + ".wglmodel", true);
        jsonXhr.onload = function() {
            // TODO: Error Catch!
            var model = JSON.parse(this.responseText);
            self._parseModel(model);
            self._compileMaterials(self.meshes);
            modelComplete = true;

            if (vertComplete) {
                self.complete = true;
                if (callback) { callback(self); }
            }
        };
        jsonXhr.send(null);

	
	
};


Model.prototype._parseBinary = function (buffer) {
        var output = {
            vertexArray: null,
            indexArray: null
        };

        var header = new Uint32Array(buffer, 0, 3);
        if(GetLumpId(header[0]) !== "wglv") {
            throw new Error("Binary file magic number does not match expected value.");
        }
        if(header[1] > 1) {
            throw new Error("Binary file version is not supported.");
        }
        var lumpCount = header[2];

        header = new Uint32Array(buffer, 12, lumpCount * 3);

        var i, lumpId, offset, length;
        for(i = 0; i < lumpCount; ++i) {
            lumpId = GetLumpId(header[i * 3]);
            offset = header[(i * 3) + 1];
            length = header[(i * 3) + 2];

            switch(lumpId) {
                case "vert":
                    output.vertexArray = this._parseVert(buffer, offset, length);
                    break;

                case "indx":
                    output.indexArray = this._parseIndex(buffer, offset, length);
                    break;
            }
        }

        return output;
};


Model.prototype._parseVert = function(buffer, offset, length) {
        var vertHeader = new Uint32Array(buffer, offset, 2);
        this.vertexFormat = vertHeader[0];
        this.vertexStride = vertHeader[1];

        if(this.vertexFormat & ModelVertexFormat.BoneWeights) {
            this.boneMatrices = new Float32Array(16 * MAX_BONES_PER_MESH);
        }

        return new Uint8Array(buffer, offset + 8, length - 8);
};

Model.prototype._parseIndex = function(buffer, offset, length) {
        return new Uint16Array(buffer, offset, length / 2);
};

Model.prototype._compileBuffers = function (gl, arrays) {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, arrays.vertexArray, gl.STATIC_DRAW);
        this.vertexBuffer.vertexItemSize = 3;
        this.vertexBuffer.normalItemSize = 3;
        this.vertexBuffer.textureItemSize = 2;

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indexArray, gl.STATIC_DRAW);
};

Model.prototype._parseModel = function (model) {
        this.meshes = model.meshes;
};

Model.prototype._compileMaterials = function (meshes) {
   var i, mesh;
   for (i in meshes) {
        mesh = meshes[i];
        mesh.diffuse = image.load2D(mesh.defaultTexture,[0, 200, 250, 255],TexFilter.MIPMAP);
   }
};

//This function should sit in renderable module

Model.prototype.render = function ( viewMat, projectionMat) {
    if (!this.complete) { return; }

    var i, j, k,
        mesh, submesh,
        indexOffset, indexCount;
    gl.useProgram(this.program);

    // Bind the appropriate buffers, all attributes are stored in vertexBuffer according to certain vertex stride
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniform3f(this.program.lightPos, 16, -32, 32);
    viewMat.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.program.vMatrixUniform, false, this.acc);
    this.worldMat.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.program.mMatrixUniform, false, this.acc);
    projectionMat.flattenInto(this.acc);
    gl.uniformMatrix4fv(this.program.pMatrixUniform, false, this.acc);

    gl.enableVertexAttribArray(this.program.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.program.textureCoordAttribute);
    gl.enableVertexAttribArray(this.program.vertexNormalAttribute);
    //gl.enableVertexAttribArray(shader.attribute.tangent);

    // Setup the vertex layout
    gl.vertexAttribPointer(this.program.vertexPositionAttribute, 3, gl.FLOAT, false, this.vertexStride, 0);
    gl.vertexAttribPointer(this.program.textureCoordAttribute, 2, gl.FLOAT, false, this.vertexStride, 12);
    gl.vertexAttribPointer(this.program.vertexNormalAttribute, 3, gl.FLOAT, true, this.vertexStride, 20);
    //gl.vertexAttribPointer(shader.attribute.tangent, 4, gl.FLOAT, false, this.vertexStride, 32);

    var boneSet;
    for (i in this.meshes) {
        mesh = this.meshes[i];
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mesh.diffuse);
        gl.uniform1i(this.program.samplerUniform1, 0);
        
        for (j in mesh.submeshes) {
            submesh = mesh.submeshes[j];
            gl.drawElements(gl.TRIANGLES, submesh.indexCount, gl.UNSIGNED_SHORT, submesh.indexOffset*2);
        }
    }
};