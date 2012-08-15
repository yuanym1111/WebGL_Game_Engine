///////////////////////////////////////////////////////////////////////////////
// Program Utility class including
//
// @author: Alex
///////////////////////////////////////////////////////////////////////////////

var includeQueue = new Array();
var includeQueueProcessing = false;

function processIncludeQueue()
{
  var filename = includeQueue.shift();
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.src = rootPath + filename;
  script.type = 'text/javascript';
  script.onload = scriptLoadCallback;
  head.appendChild(script);
  includeQueueProcessing = true;
}

function scriptLoadCallback()
{
  if (includeQueue.length>0)
  {
    processIncludeQueue();
  }
  else
  {
    includeQueueProcessing = false;
  }
}

function include(filename)
{
  includeQueue.push(filename);
  if (!includeQueueProcessing)
  {
    processIncludeQueue();
  }
}

///////////////////////////////////////////////////////////////////////////////
// Delegate
///////////////////////////////////////////////////////////////////////////////

function delegate(that, thatMethod)
{
  return function() { return thatMethod.call(that); }
}

function delegateParam(that, thatMethod)
{
  return function(param) { return thatMethod.call(that, param); }
}

///////////////////////////////////////////////////////////////////////////////
// WebGL debug harness utility
///////////////////////////////////////////////////////////////////////////////

include("webgl-debug.js");

function throwOnGLError(err, funcName, args)
{
  throw Error(WebGLDebugUtils.glEnumToString(err) + " in " + funcName + "(" + args + ")");
};

///////////////////////////////////////////////////////////////////////////////
// WebGL initialization
///////////////////////////////////////////////////////////////////////////////

function wglInit(canvasName, debug)
{
  try
  {
    canvas = document.getElementById(canvasName);

    var contextNames = ["webgl", "experimental-webgl"];

    for (var i=0; i<contextNames.length; i++)
    {
      try
      {
        gl = canvas.getContext(contextNames[i]);
      }
      catch (e)
      {
        gl = null;
      }

      if (gl) break;
    }

    if (debug) // debug context
    { 
      gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
    }

    if (!gl) { return false; }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    
    return true;
  } 
  catch(e)
  {
    return false;
  }
}

///////////////////////////////////////////////////////////////////////////////
// requestAnimFrame
///////////////////////////////////////////////////////////////////////////////

window.requestAnimFrame = (function()
{
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/60);
         };
})();

///////////////////////////////////////////////////////////////////////////////
// getter utilities
///////////////////////////////////////////////////////////////////////////////

function $$(x)
{
  return document.getElementById(x);
}

function getUrlParam(name)
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

///////////////////////////////////////////////////////////////////////////////
// Progress element (load status helper)
///////////////////////////////////////////////////////////////////////////////

var progressCurrent = 0;
var progressTotal = 0;

function addProgressElement()
{
  progressTotal++;
  updateProgress();
}

function completeProgressElement()
{
  progressCurrent++;
  updateProgress();
}

function updateProgress()
{
  $$("progress-current").innerHTML = progressCurrent;
  $$("progress-total").innerHTML = progressTotal;
  $$("webgl-loading").style.display = "none";
  if (progressCurrent != progressTotal)
  {
    $$("webgl-loading").style.display = "block";
  }
}

///////////////////////////////////////////////////////////////////////////////
// Stack trace
///////////////////////////////////////////////////////////////////////////////

function stackTrace(e)
{
  // Firefox/Chrome
  if (e.stack)
  { 
    return e.stack;
  }
  
  // Opera
  if (window.opera && e.message)
  {
    return e.message;
  }

  // Rest, really limited
  var stk = "";
  var currentFunction = arguments.callee.caller;

  while (currentFunction)
  {
    var fn = currentFunction.toString();
    var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('(')) || 'anonymous';
    stk += fname + "\n";
    currentFunction = currentFunction.caller;
  }
  return stk;
}

