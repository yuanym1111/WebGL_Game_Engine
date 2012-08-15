///////////////////////////////////////////////////////////////////////////////
// CompileShader
///////////////////////////////////////////////////////////////////////////////

function CompileShader(gl, str, type)
{
  var shader;

  if (type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw Error("Shader compilation error\n" + gl.getShaderInfoLog(shader));
  }

  completeProgressElement();  

  return shader;
}

///////////////////////////////////////////////////////////////////////////////
// GetShaderFromElement
///////////////////////////////////////////////////////////////////////////////

function GetShaderFromElement(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  return CompileShader(gl, str, shaderScript.type);
}

///////////////////////////////////////////////////////////////////////////////
// GetShaderFromFile
///////////////////////////////////////////////////////////////////////////////

function GetShaderFromFile(gl, filename, type)
{
  addProgressElement();  

  req = new XMLHttpRequest;
  req.open("get", filename, false);
  req.send(null);

//  if (debugMode) { alert(req.responseText); }

  return CompileShader(gl, req.responseText, type);
}

///////////////////////////////////////////////////////////////////////////////
// SetupShaderProgram
///////////////////////////////////////////////////////////////////////////////

function SetupShaderProgram(vs, fs)
{
  if (!vs) throw Error("null vertex shader passed");
  if (!fs) throw Error("null fragment shader passed");

  addProgressElement();  

  var shaderProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vs);
  gl.attachShader(shaderProgram, fs);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw Error("Shader program link error\n" + gl.getProgramInfoLog(shaderProgram));
  }

  if (debugMode)
  {
    info = gl.getProgramInfoLog(shaderProgram);
    if (info.length>0) alert(info);
  }

  gl.useProgram(this.shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  shaderProgram.textureCoord3Attribute = gl.getAttribLocation(shaderProgram, "aTextureCoord3");

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
  shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.mvMatrixInvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrixInv");
  shaderProgram.vMatrixInvUniform = gl.getUniformLocation(shaderProgram, "uVMatrixInv");
  shaderProgram.samplerUniform1 = gl.getUniformLocation(shaderProgram, "uSampler");
  shaderProgram.samplerUniform2 = gl.getUniformLocation(shaderProgram, "uSampler2");
  shaderProgram.samplerUniform3 = gl.getUniformLocation(shaderProgram, "uSampler3");
  shaderProgram.samplerUniform4 = gl.getUniformLocation(shaderProgram, "uSampler4");
  shaderProgram.samplerUniform5 = gl.getUniformLocation(shaderProgram, "uSampler5");
  shaderProgram.samplerCubeUniform1 = gl.getUniformLocation(shaderProgram, "uCubeSampler");
  shaderProgram.samplerCubeUniform2 = gl.getUniformLocation(shaderProgram, "uCubeSampler2");
  shaderProgram.timeUniform = gl.getUniformLocation(shaderProgram, "uTime");
 //Additional parameters added here
  shaderProgram.lightPos = gl.getUniformLocation(shaderProgram, 'lightPos' );

  completeProgressElement();  
  return shaderProgram;
}

///////////////////////////////////////////////////////////////////////////////
// ShaderProgramFromElement
///////////////////////////////////////////////////////////////////////////////

function ShaderProgramFromElement(fsname, vsname)
{
  var vs = GetShaderFromElement(gl, vsname);
  var fs = GetShaderFromElement(gl, fsname);

  return SetupShaderProgram(vs, fs);
}

///////////////////////////////////////////////////////////////////////////////
// ShaderProgramFromFile
///////////////////////////////////////////////////////////////////////////////

function ShaderProgramFromFile(fsname, vsname)
{
  try
  {
    vsname = rootPath + vsname;
    fsname = rootPath + fsname;
    var vs = GetShaderFromFile(gl, vsname, "x-shader/x-vertex");
    var fs = GetShaderFromFile(gl, fsname, "x-shader/x-fragment");

    return SetupShaderProgram(vs, fs);
  }
  catch (e)
  {
    alert(e);
    return null;
  }
}

