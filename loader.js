
function loadMeshJSON(name, mesh)
{
  var request = new XMLHttpRequest();
  request.open("GET", name);
  request.onreadystatechange = function()
  {
    if (request.readyState == 4)
    {
      handleLoadedMeshJSON(JSON.parse(request.responseText), mesh);
    }
  }
  request.send();
}

function handleLoadedMeshJSON(data, mesh)
{
  vertices = new Float32Array(data.vertices.length);
  normals = new Float32Array(data.normals.length);
  indices = new Uint16Array(data.indices.length);
  texCoords = new Float32Array(data.vertices.length * 2 / 3);
  colors = new Float32Array(data.vertices.length * 4 / 3);

  for (i=0; i<vertices.length; i++)
  {
    vertices[i] = data.vertices[i];
  }

  for (i=0; i<normals.length; i++)
  {
    normals[i] = data.normals[i];
  }

  for (i=0; i<indices.length; i++)
  {
    indices[i] = data.indices[i];
  }

  for (i=0; i<texCoords.length; i++)
  {
    texCoords[i] = data.texCoords[i];
  }

  for (i=0; i<colors.length; i++)
  {
    colors[i] = 1.0;
  }
  
  mesh.createVertexBuffer(vertices,vertices.length / 3);
  mesh.createNormalBuffer(normals,normals.length / 3);
  mesh.createIndexBuffer(indices,indices.length);
  mesh.createTexCoordBuffer(texCoords,texCoords.length / 2);
  mesh.createColorBuffer(colors,colors.length / 4);
}


