
/**
 *      webgl image loader
 *      @author: Alex
 */
 
var TexFilter = {NEAREST: 1, LINEAR: 2, MIPMAP: 3}; 
 
var image = function()
{

};

image.load2D = function(file, initialColor, texFilter)
{
	     if (!texFilter) texFilter = TexFilter.MIPMAP;
	
        var tex = gl.createTexture();
        
        var img = new Image();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        var pixel = new Uint8Array(initialColor);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,  gl.UNSIGNED_BYTE,pixel);
        gl.bindTexture(gl.TEXTURE_2D, null);

        img.onload = function ()
        {
                gl.bindTexture(gl.TEXTURE_2D, tex);
                // Change the setting for Y FLIP HERE
//                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
                
                
                switch (texFilter)
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

        }
        img.src = file;

        return tex;
}

image.loadCube = function(files, initialColor)
{
        var cubeTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        for (var i = 0; i < 6; ++i) image.LoadCubeId(i, cubeTexture, files, initialColor);

        return cubeTexture;
}


image.LoadCubeId = function(index, cubeTexture, files, initialColor)
{
        var cubeImage = new Image();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
        var pixel = new Uint8Array(initialColor);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        cubeImage.onload = function ()
        {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + index, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cubeImage);
                
 /*               
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
 */
  
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
        }
        cubeImage.src = files[index];
}