// augment Sylvester some
Matrix.Translation = function (v)
{
  if (v.elements.length == 2) {
    var r = Matrix.I(3);
    r.elements[2][0] = v.elements[0];
    r.elements[2][1] = v.elements[1];
    return r;
  }

  if (v.elements.length == 3) {
    var r = Matrix.I(4);
    r.elements[0][3] = v.elements[0];
    r.elements[1][3] = v.elements[1];
    r.elements[2][3] = v.elements[2];
    return r;
  }

  throw "Invalid length for Translation";
}

Matrix.Scale = function (v)
{
  if (v.elements.length == 2) {
    var r = Matrix.I(3);
    r.elements[0][0] = v.elements[0];
    r.elements[1][1] = v.elements[1];
    return r;
  }

  if (v.elements.length == 3) {
    var r = Matrix.I(4);
    r.elements[0][0] = v.elements[0];
    r.elements[1][1] = v.elements[1];
    r.elements[2][2] = v.elements[2];
    return r;
  }

  throw "Invalid length for Scale";
};

Matrix.createFromArray = function(arr){	
	   var matrixarr = [];
	   if(arr.length == 16){
	     for(var j = 0; j<arr.length/4; j++){
			matrixarr[j] = [];
			matrixarr[j].push(arr[4*j]);
			matrixarr[j].push(arr[4*j+1]);
			matrixarr[j].push(arr[4*j+2]);
			matrixarr[j].push(arr[4*j+3]);
		  }
	   }else{
		   return Matrix.I(4);
	   }
		
		return Matrix.create(matrixarr);
};

Matrix.prototype.flatten = function ()
{
    var result = [];
    if (this.elements.length == 0)
        return [];


    for (var j = 0; j < this.elements[0].length; j++)
        for (var i = 0; i < this.elements.length; i++)
            result.push(this.elements[i][j]);
    return result;
}

Matrix.prototype.flattenInto = function (arr)
{
//    var result = [];
  var z=0;
    if (this.elements.length == 0)
        return;
//        return [];


    for (var j = 0; j < this.elements[0].length; j++)
        for (var i = 0; i < this.elements.length; i++)
            arr[z++] = this.elements[i][j];
//            result.push(this.elements[i][j]);
//    return result;
}

Matrix.prototype.ensure4x4 = function()
{
    if (this.elements.length == 4 &&
        this.elements[0].length == 4)
        return this;

    if (this.elements.length > 4 ||
        this.elements[0].length > 4)
        return null;

    for (var i = 0; i < this.elements.length; i++) {
        for (var j = this.elements[i].length; j < 4; j++) {
            if (i == j)
                this.elements[i].push(1);
            else
                this.elements[i].push(0);
        }
    }

    for (var i = this.elements.length; i < 4; i++) {
        if (i == 0)
            this.elements.push([1, 0, 0, 0]);
        else if (i == 1)
            this.elements.push([0, 1, 0, 0]);
        else if (i == 2)
            this.elements.push([0, 0, 1, 0]);
        else if (i == 3)
            this.elements.push([0, 0, 0, 1]);
    }

    return this;
};


Matrix.prototype.make3x3 = function()
{
    if (this.elements.length != 4 ||
        this.elements[0].length != 4)
        return null;

    return Matrix.create([[this.elements[0][0], this.elements[0][1], this.elements[0][2]],
                          [this.elements[1][0], this.elements[1][1], this.elements[1][2]],
                          [this.elements[2][0], this.elements[2][1], this.elements[2][2]]]);
};

Vector.prototype.flatten = function ()
{
    return this.elements;
};

//Somefunction to deal with quatation rotation
function quat4MultiplyVecor(quat,vector){
	var qx = quat.elements[0], qy = quat.elements[1], qz = quat.elements[2], qw = quat.elements[3],
	    x = vector.elements[0], y = vector.elements[1], z = vector.elements[2];
	
	//----------------formular: p¡¯ = qpq(-1)-----------------------
	// calculate quat * vector
    ix = qw * x + qy * z - qz * y,
    iy = qw * y + qz * x - qx * z,
    iz = qw * z + qx * y - qy * x,
    iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    var dest = [];
    dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

return Vector.create(dest);
};

function quat4MultiplyQuat4(quat,quat2){
	var qax = quat.elements[0], qay = quat.elements[1], qaz = quat.elements[2], qaw = quat.elements[3],
    qbx = quat2.elements[0], qby = quat2.elements[1], qbz = quat2.elements[2], qbw = quat2.elements[3];

	var dest = [];
    dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

return Vector.create(dest);
};


function fromRotationTranslation(quat, vec){
	 // Quaternion math
    var x = quat.elements[0], y = quat.elements[1], z = quat.elements[2], w = quat.elements[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;
    var dest = Matrix.Zero(4,4);
    dest.elements[0][0] = 1 - (yy + zz);
    dest.elements[0][1] = xy + wz;
    dest.elements[0][2] = xz - wy;
    dest.elements[0][3] = 0;
    dest.elements[1][0] = xy - wz;
    dest.elements[1][1] = 1 - (xx + zz);
    dest.elements[1][2] = yz + wx;
    dest.elements[1][3] = 0;
    dest.elements[2][0] = xz + wy;
    dest.elements[2][1] = yz - wx;
    dest.elements[2][2] = 1 - (xx + yy);
    dest.elements[2][3] = 0;
    dest.elements[3][0] = vec[0];
    dest.elements[3][1] = vec[1];
    dest.elements[3][2] = vec[2];
    dest.elements[3][3] = 1;
    
    return dest;
	
	
}


function mht(m) {
    var s = "";
    if (m.length == 16) {
        for (var i = 0; i < 4; i++) {
            s += "<span style='font-family: monospace'>[" + m[i*4+0].toFixed(4) + "," + m[i*4+1].toFixed(4) + "," + m[i*4+2].toFixed(4) + "," + m[i*4+3].toFixed(4) + "]</span><br>";
        }
    } else if (m.length == 9) {
        for (var i = 0; i < 3; i++) {
            s += "<span style='font-family: monospace'>[" + m[i*3+0].toFixed(4) + "," + m[i*3+1].toFixed(4) + "," + m[i*3+2].toFixed(4) + "]</font><br>";
        }
    } else {
        return m.toString();
    }
    return s;
}


//
// gluPerspective
//
function makePerspective(fovy, aspect, znear, zfar)
{
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}

//
// glFrustum
//
function makeFrustum(left, right,
                     bottom, top,
                     znear, zfar)
{
    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    return $M([[X, 0, A, 0],
               [0, Y, B, 0],
               [0, 0, C, D],
               [0, 0, -1, 0]]);
}

//
// glOrtho
//
function makeOrtho(left, right, bottom, top, znear, zfar)
{
    var tx = - (right + left) / (right - left);
    var ty = - (top + bottom) / (top - bottom);
    var tz = - (zfar + znear) / (zfar - znear);

    return $M([[2 / (right - left), 0, 0, tx],
           [0, 2 / (top - bottom), 0, ty],
           [0, 0, -2 / (zfar - znear), tz],
           [0, 0, 0, 1]]);
}



bindataFloat = function(uIntArray,fBigEndian)
{
  if (uIntArray == null) return;
  if (uIntArray.length != 4) return;
    var fBits = "";
    for (var i=0;i<4;i++)
    {
      var curByte = (uIntArray[i]&255).toString(2);
      var byteLen = curByte.length;
      if (byteLen<8)
      {
      for (var bit=0;bit<(8-byteLen);bit++)
        curByte = '0'+curByte;
      }
      fBits = fBigEndian ? fBits+curByte : curByte+fBits;
    }
  var fSign = parseInt(fBits[0]) ? -1 : 1;
  var fExp = parseInt(fBits.substring(1,9),2)-127;
  var fMan;
  if (fExp == -127)
    fMan = 0;
  else
  {
    fMan = 1;
    for (i=0;i<23;i++)
    {
      if (parseInt(fBits[9+i])==1)
      fMan = fMan + 1/Math.pow(2,i+1);
    }
  }
  return(parseFloat((fSign*Math.pow(2,fExp)*fMan).toFixed(3)));
}

get2dPoint = function(point3D, viewMatrix, projectMatrix, width, height){
	var mvMatrix = this.transformSource.vMatrix.x(this.mMatrix);
}
