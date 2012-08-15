///////////////////////////////////////////////////////////////////////////////
// Texture
// @author: Alex
///////////////////////////////////////////////////////////////////////////////

var TexFilter = { NEAREST: 1, LINEAR: 2, MIPMAP: 3 }

function Texture(src, texFilter)
{
  if (!texFilter) texFilter = TexFilter.MIPMAP;

  addProgressElement();  
  var texture = gl.createTexture();
  texture.loaded = false;
  texture.texFilter = texFilter;
  texture.image = new Image();
  texture.image.onload = function() {
    handleLoadedTexture(texture);
  }
  texture.image.src = rootPath + src;

  return texture;
}

function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

  switch (texture.texFilter)
  {
  case TexFilter.NEAREST:
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    break;
  case TexFilter.LINEAR:
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    break;
  case TexFilter.MIPMAP:
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    break;
  }
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.loaded = true;
  completeProgressElement();  
}

///////////////////////////////////////////////////////////////////////////////
// CubeMapTexture
///////////////////////////////////////////////////////////////////////////////

function CubeMapTexture(px, nx, py, ny, pz, nz)
{
  addProgressElement();  
  var texture = gl.createTexture();

  texture.images = new Array(6);
  texture.imageNames = [px, nx, py, ny, pz, nz];
  texture.imageTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
  texture.loadedImages = 0;

  texture.loaded = false;
  
  for (var i=0; i<6; i++)
  {
    addProgressElement();  
    texture.images[i] = new Image();
    texture.images[i].index = i;
    texture.images[i].onload = function(e)
    {
      handleLoadedCubeMapTexture(texture, e.target.index);
    }
    texture.images[i].src = rootPath + texture.imageNames[i];
  }  

  completeProgressElement();  
  return texture;
}

function handleLoadedCubeMapTexture(texture, index)
{
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(texture.imageTargets[index], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.images[index]);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

  texture.loadedImages++;
  if (texture.loadedImages == 6) gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

  if (texture.loadedImages == 6) texture.loaded = true;

  completeProgressElement();  
}

