var Animation = function () {
        this.name = null;
        this.frameRate = 0;
        this.duration = 0;
        this.frameCount = 0;
        this.bonesIds = {};
        this.keyframes = [];
        this.complete = false;
        
        
};

Animation.prototype.loadAnimation = function (url,callback) {
	     
	     var self = this;

        // Load the binary portion of the model
        var animXhr = new XMLHttpRequest();
        animXhr.open('GET', url + ".wglanim", true);
        animXhr.onload = function() {
            // TODO: Error Catch!
            var anim = JSON.parse(this.responseText);
            self._parseAnim(anim);
            if (callback) { callback(self); }
        };
        animXhr.send(null);
	
};

Animation.prototype._parseAnim = function (anim) {
        var i, j, keyframe, bone;

        this.name = anim.name;
        this.frameRate = anim.frameRate;
        this.duration = anim.duration;
        this.frameCount = anim.frameCount;

        // Build a table to lookup bone id's
        for(i = 0; i < anim.bones.length; ++i) {
            this.bonesIds[anim.bones[i]] = i;
        }
        this.keyframes = anim.keyframes;

        // Force all bones to use efficient data structures
        for (i in this.keyframes) {
            keyframe = this.keyframes[i];

            for(j in keyframe) {
                bone = keyframe[j];
                bone.pos = vec3.create(bone.pos);
                bone.rot = quat4.create(bone.rot);
            }
        }
};


Animation.prototype.evaluate = function (frameId, model) {
        var i, boneId, bones, bone, frame, frameBone, parent;
        
        bones = model.bones;
        if(!bones) { return; }

        frame = this.keyframes[frameId];

        // Go in the order that the model specifies, will always process parents first
        for(i = 0; i < bones.length; ++i) {
            bone = bones[i];
            boneId = this.bonesIds[bone.name];

            if(boneId !== undefined) {
                frameBone = frame[boneId];
                bone.pos = frameBone.pos;
                bone.rot = frameBone.rot;
            }

            // No parent? No transform needed
            if(bone.parent !== -1) {
                parent = bones[bone.parent];

                // Apply the parent transform to this bone
                quat4.multiplyVec3(parent.worldRot, bone.pos, bone.worldPos);
                vec3.add(bone.worldPos, parent.worldPos);
                quat4.multiply(parent.worldRot, bone.rot, bone.worldRot);
            }

            // We only need to compute the matrices for bones that actually have vertices assigned to them
            if(bone.skinned) {
                mat4.fromRotationTranslation(bone.worldRot, bone.worldPos, bone.boneMat);
                mat4.multiply(bone.boneMat, bone.bindPoseMat);
            }
        }

        model._dirtyBones = true; // Notify the model that it needs to update it's bone matrices
};