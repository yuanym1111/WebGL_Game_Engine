///////////////////////////////////////////////////////////////////////////////
// FCurveKey
///////////////////////////////////////////////////////////////////////////////

function FCurveKey(data)
{
  this.init(data);
}

FCurveKey.keyType = { bezier: 0, linear: 1, constant: 2 }

FCurveKey.prototype.init = function(data)
{
  if (data.length<7) throw Error("Invalid input data for FCurveKey");

  switch (data[0])
  {
    case "BEZIER":
      this.type = FCurveKey.keyType.bezier;
      break;
    case "LINEAR":
      this.type = FCurveKey.keyType.linear;
      break;
    case "CONSTANT":
      this.type = FCurveKey.keyType.constant;
      break;
    default:
      throw Error("Invalid FCurveKey type");
  }
  this.co = new Float32Array(2);
  this.co[0] = data[1];
  this.co[1] = data[2];
  this.left = new Float32Array(2);
  this.left[0] = data[3];
  this.left[1] = data[4];
  this.right = new Float32Array(2);
  this.right[0] = data[5];
  this.right[1] = data[6];
}

///////////////////////////////////////////////////////////////////////////////
// FCurve
///////////////////////////////////////////////////////////////////////////////

function FCurve(data)
{
  this.keys = new Array();
  for (var i=0; i<data.length; i++)
  {
    this.keys.push(new FCurveKey(data[i]));
  }
}

FCurve.prototype.value = function(time)
{
  if (time < this.keys[0].co[0]) return this.keys[0].co[1];

  if (this.keys.length > 1)
  {
    for (var i = 1; i < this.keys.length; i++)
    {
      if (time < this.keys[i].co[0])
      {
        return (this.keys[i-1].co[1] + (time - this.keys[i-1].co[0]) / (this.keys[i].co[0] - this.keys[i-1].co[0]) * (this.keys[i].co[1] - this.keys[i-1].co[1]));
      }
    }
  }

  return this.keys[this.keys.length-1].co[1];
}

///////////////////////////////////////////////////////////////////////////////
// Animation
///////////////////////////////////////////////////////////////////////////////

function Animation() 
{
  this.location = new Array(3);
  this.rotation = new Array(3);
  this.scale = new Array(3);
}

Animation.prototype.parse = function(data)
{
  for (memberName in data)
  {
    var dataPath = memberName.substring(0, memberName.length-2);
    var index = parseInt(memberName[memberName.length-1]);
    var obj = data[memberName];

    switch (dataPath)
    {
      case 'location':
        this.location[index] = new FCurve(obj);
        break;
      case 'rotation_euler':
        this.rotation[index] = new FCurve(obj);
        break;
      case 'scale':
        this.scale[index] = new FCurve(obj);
        break;
      default:
	throw new Error("Unsupported FCurve type in animation data");
    }
  }
}

Animation.prototype.value = function(fcurve, time)
{
  return fcurve.value(time);
}

Animation.prototype.getLocation = function(time)
{
  return [this.location[0].value(time),this.location[2].value(time),-this.location[1].value(time)];
}

Animation.prototype.getLocationMatrix = function(time)
{
  var v = this.getLocation(time);
  return translate(v);
}

Animation.prototype.getRotationEuler = function(time)
{
  return [this.rotation[0].value(time),this.rotation[2].value(time),-this.rotation[1].value(time)];
}

Animation.prototype.getRotationMatrix = function(time)
{
  var v = this.getRotationEuler(time);
  return rotateEulerXZY(v);
}

Animation.prototype.getScale = function(time)
{
  return [this.scale[0].value(time),this.scale[2].value(time),this.scale[1].value(time)];
}

Animation.prototype.getScaleMatrix = function(time)
{
  var v = this.getScale(time);
  return scale(v);
}

