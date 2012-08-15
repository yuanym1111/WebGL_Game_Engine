
function Camera()
{
  this.eye = $V([0, 0, 1]);
  this.center = $V([0, 0, 0]);
  this.up = $V([0, 1, 0]);

  //Orientation vectors
  this.mLookW = $V([0.0,0.0,1.0]);
  this.mRightW = $V([1.0,0.0,0.0]);
  this.mUpW = $V([0.0,1.0,0.0]);
  
  this.fov = Math.PI / 4.0; // 45 degrees
  this.isTargetCamera = true;
  this.isPerspective = true;
  this.nearClip = 1;
  this.farClip = 1000.0;

  this.orientationMatrix = Matrix.I(4);
}

Camera.prototype.setEye = function(x,y,z)
{
  delete this.eye;
  this.eye = $V([x,y,z]);
}

Camera.prototype.view = function()
{
  if (this.isTargetCamera)
    return this.lookAt();
  else
    return this.lookAtFree();
}

Camera.prototype.lookAt = function()
{
  var z = this.eye.subtract(this.center).toUnitVector(); // camera space z axis is -(center-eye) unit vector
  this.mLookW = z;
  var x = this.up.cross(z).toUnitVector(); // camera space x axis = up cross z unit vector
  this.mRightW = x;
  var y = z.cross(x).toUnitVector(); // camera space y axis = z cross x unit vector
  this.mUpW = y;

  var m = $M([[x.e(1), x.e(2), x.e(3), 0],
              [y.e(1), y.e(2), y.e(3), 0],
              [z.e(1), z.e(2), z.e(3), 0],
              [0, 0, 0, 1]]);

  var t = $M([[1, 0, 0, -(this.eye.e(1))],
              [0, 1, 0, -(this.eye.e(2))],
              [0, 0, 1, -(this.eye.e(3))],
              [0, 0, 0, 1]]);

  return m.x(t);
}

Camera.prototype.lookAtFree = function()
{

  var t = $M([[1, 0, 0, -(this.eye.e(1))],
              [0, 1, 0, -(this.eye.e(2))],
              [0, 0, 1, -(this.eye.e(3))],
              [0, 0, 0, 1]]);

  return this.orientationMatrix.x(t);
}

Camera.prototype.inverseOrientation = function()
{
  var z = this.center.subtract(this.eye).toUnitVector();
  var x = z.cross(this.up).toUnitVector();
  var y = x.cross(z).toUnitVector();

  var m = $M([[x.e(1), x.e(2), x.e(3), 0],
              [y.e(1), y.e(2), y.e(3), 0],
              [-z.e(1), -z.e(2), -z.e(3), 0],
              [0, 0, 0, 1]]);

  return m.inverse();
}

Camera.prototype.projection = function()
{
  return makePerspective(this.fov / Math.PI * 180.0 / 2, gl.viewportWidth / gl.viewportHeight, this.nearClip, this.farClip);
}

Camera.prototype.parse = function(data)
{
  if ((data.fov) && (data.eye.length==3))
  {
    this.fov = data.fov;
  }

  if ((data.eye) && (data.eye.length==3))
  {
    this.eye = $V([data.eye[0], data.eye[1], data.eye[2]]);
  }

  if ((data.orientationMatrix) && (data.orientationMatrix.length==16))
  {
    for (var j=0; j<4; j++)
      for (var i=0; i<4; i++)
        this.orientationMatrix.elements[i][j] = data.orientationMatrix[4*i + j];
  }
  this.isTargetCamera = false;

  if (data.animationData)
  {
    this.animation = new Animation();
    this.animation.parse(data.animationData);
  }
}

Camera.prototype.update = function(time)
{
  if (this.animation)
  {
    this.eye = $V(this.animation.getLocation(time));

    var m = rotate(90, [1,0,0]);
    var n = this.animation.getRotationMatrix(time);
    this.orientationMatrix = m.x(n.transpose());
//    this.orientationMatrix = m.x(n);
  }
}

Camera.prototype.updateOrientation = function(keycode, pitch, yAngle, time, offsetHeight){
	
}


FPSCamera.prototype = new Camera();

FPSCamera.prototype.constructor = FPSCamera; 


function FPSCamera() {
	Camera.call(this);
	this.mSpeed = 2.0;
};

//Call this function first to build the mLookW, mRightW, mUpW
FPSCamera.prototype.buildRUL = function(){
	
	var z = this.eye.subtract(this.center).toUnitVector(); // camera space z axis is -(center-eye) unit vector
	this.mLookW = z;
	var x = this.up.cross(z).toUnitVector(); // camera space x axis = up cross z unit vector
	this.mRightW = x;
	var y = z.cross(x).toUnitVector(); // camera space y axis = z cross x unit vector
	this.mUpW = y;
};

FPSCamera.prototype.view = function()
{
	this.mLookW = this.mLookW.toUnitVector();
	this.mUpW = this.mLookW.cross(this.mRightW).toUnitVector();
	this.mRightW = 	this.mUpW.cross(this.mLookW).toUnitVector();
	
	
  var m = $M([[this.mRightW.e(1), this.mRightW.e(2), this.mRightW.e(3), 0],
              [this.mUpW.e(1), this.mUpW.e(2), this.mUpW.e(3), 0],
              [this.mLookW.e(1), this.mLookW.e(2), this.mLookW.e(3), 0],
              [0, 0, 0, 1]]);

  var t = $M([[1, 0, 0, -(this.eye.e(1))],
              [0, 1, 0, -(this.eye.e(2))],
              [0, 0, 1, -(this.eye.e(3))],
              [0, 0, 0, 1]]);

  return m.x(t);
};

FPSCamera.prototype.updateOrientation = function(keycode,pitch,yAngle,time){
	
	//Debug purpose
	debugyAngle = 0;
	debugPitch = 0;
	
	var dir = $V([0.0,0.0,0.0]);
	if(keycode == 1)
		dir = dir.subtract(this.mLookW);
	if(keycode == 2)
	    dir = dir.add(this.mLookW);
	if(keycode == 3)
		dir = dir.subtract(this.mRightW);
	if(keycode == 4)
		dir = dir.add(this.mRightW);
	
	//Debug purpose
	if(keycode == 5)
		debugyAngle = 0.003;
	if(keycode == 6)
		debugyAngle = -0.003;
	if(keycode == 7)
		debugPitch = 0.003;
	if(keycode == 8)
		debugPitch = -0.003;
	
	if(pitch>0.005) pitch = 0.05;
    if(pitch<-0.005) pitch = -0.05;
    if(yAngle>0.001) yAngle = 0.01;
    if(yAngle<-0.001) yAngle = -0.01;
    
    dir = dir.toUnitVector();
    var newPos = $V([0.0,0.0,0.0]);
    newPos = this.eye.add(dir.x(this.mSpeed*time));
    this.eye = newPos;
/*    
    var lineRight = Line.create(this.eye,this.mRightW);
    this.mLookW = this.mLookW.rotate(yAngle/5,lineRight).toUnitVector();
    this.mUpW = this.mUpW.rotate(yAngle/5,lineRight).toUnitVector();
    
    var lineUp = Line.create(this.eye,this.up);
    this.mRightW = this.mRightW.rotate(pitch/5,lineUp).toUnitVector();
//    this.mUpW = this.mUpW.rotate(-pitch/5,lineUp).toUnitVector();
    this.mLookW = this.mLookW.rotate(pitch/5,lineUp).toUnitVector();
    */
    
    var rightMaxtrix = Matrix.Rotation(-yAngle/5, this.mRightW);
    this.mLookW = rightMaxtrix.multiply(this.mLookW).toUnitVector();
    this.mUpW = rightMaxtrix.multiply(this.mUpW).toUnitVector();
    
    var upMatrix = Matrix.Rotation(-pitch/5, this.up);
    this.mRightW = upMatrix.multiply(this.mRightW).toUnitVector();
    this.mUpW = upMatrix.multiply(this.mUpW).toUnitVector();
    this.mLookW = upMatrix.multiply(this.mLookW).toUnitVector();
    
};
