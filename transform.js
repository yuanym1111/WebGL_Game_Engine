///////////////////////////////////////////////////////////////////////////////
// Transformation helper functions
//
// Extended Matrix class in glUtils.js
//
// @author: Alex
///////////////////////////////////////////////////////////////////////////////

function identity()
{
  return Matrix.I(4);
}

function translate(v)
{
  return Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
}

function scale(v)
{
  return Matrix.Scale($V([v[0], v[1], v[2]])).ensure4x4();
}

function rotate(deg, v) {
  var rad = deg * Math.PI / 180.0;
  return Matrix.Rotation(rad, $V([v[0], v[1], v[2]])).ensure4x4();
}

function rotateEulerXZY(v) {
  var mx = Matrix.Rotation(v[0], $V([1,0,0])).ensure4x4();
  var my = Matrix.Rotation(v[1], $V([0,1,0])).ensure4x4();
  var mz = Matrix.Rotation(v[2], $V([0,0,1])).ensure4x4();
  return my.x(mz.x(mx));
}

