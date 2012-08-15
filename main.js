
for (var i in includes)
{
  include(includes[i]);
}

var gl;
var maxVertexAttribs;
var debugMode;

function demo()
{
  debugMode = getUrlParam("debug");
  if (debugMode != 1) { debugMode = false; } else { debugMode = true; } 

  if (wglInit("webgl-canvas", debugMode))
  {
    $$("webgl-content").style.display = "table";
    $$("webgl-diagnostics").style.display = "table";
    $$("webgl-init").style.display = "none";
  }
  else
  {
    $$("webgl-error").style.display = "block";
    $$("webgl-init").style.display = "none";
    return;
  }

  try
  {
    factory();
  } 
  catch(e)
  {
    alert(e + "\n\n" + stackTrace(e));
    return;
  }
}

