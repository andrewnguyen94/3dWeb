// import {Material, MaterialLibrary} from './material';

// WebGL context
var gl = {};
// the canvas element
var canvas = null;
// main shader program
var shaderProgram = null;
// main app object
var app = {};
app.meshes = {};
app.models = {};
app.mvMatrix = mat4.create();
app.mvMatrixStack = [];
app.pMatrix = mat4.create();
app.camera = mat4.create();
var texCoordBuffer = null;

var reader = new FileReader();
var objString = "";
var obj = document.getElementById('my_cube.obj');
var text_obj, text_mtl;
var options = {};
var isUp = true;
var isDown = false;
var isRight = false;
var isLeft = false;
var isMiddle = false;

var lastMouseX = null;
var lastMouseY = null;

var widthView = null;
var heightView = null;

var count = 0;

window.requestAnimFrame = (function (){
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function FrameRequestCallback */ callback, /* DOMElement Element */ element){
            return window.setTimeout(callback, 1000 / 60);
        };
})();

function initWebGL(canvas){
    try{
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch (e){
    }
    if (!gl){
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    return gl;
}

function getShader(gl, id){
    var shaderScript = document.getElementById(id);
    if (!shaderScript){
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k){
        if (k.nodeType == 3){
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment"){
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex"){
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else{
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShaders(){
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        alert("Could not initialise shaders");
    }
    gl.useProgram(shaderProgram);

    const attrs = {
        'aVertexPosition': OBJ.Layout.POSITION.key,
        'aVertexNormal': OBJ.Layout.NORMAL.key,
        'aTextureCoord': OBJ.Layout.UV.key,
        'aDiffuse': OBJ.Layout.DIFFUSE.key,
        'aSpecular': OBJ.Layout.SPECULAR.key,
        'aSpecularExponent': OBJ.Layout.SPECULAR_EXPONENT.key,
    };

    shaderProgram.attrIndices = {};
    for (const attrName in attrs) {
        if (!attrs.hasOwnProperty(attrName)) {
            continue;
        }
        shaderProgram.attrIndices[attrName] = gl.getAttribLocation(shaderProgram, attrName);
        if (shaderProgram.attrIndices[attrName] != -1) {
            gl.enableVertexAttribArray(shaderProgram.attrIndices[attrName]);
        } else {
            console.warn('Shader attribute "' + attrName + '" not found in shader. Is it undeclared or unused in the shader code?');
        }
    }

    shaderProgram.texcoordLocation = gl.getAttribLocation(shaderProgram, "a_texcoord");
    console.log(shaderProgram.texcoordLocation);
    if(shaderProgram.texcoordLocation != -1){
        gl.enableVertexAttribArray(shaderProgram.texcoordLocation);
    }else{
        console.warn('Shader attribute atexcoord not found in shader. Is it undeclared or unused in the shader code?');
    }
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.reverseLightDirectionLocation = gl.getUniformLocation(shaderProgram, "u_reverseLightDirection");
    shaderProgram.textureLocation = gl.getUniformLocation(shaderProgram, "u_texture");

    shaderProgram.applyAttributePointers = function(model) {
        const layout = model.mesh.vertexBuffer.layout;
        for (const attrName in attrs) {
            if (!attrs.hasOwnProperty(attrName) || shaderProgram.attrIndices[attrName] == -1) {
                continue;
            }
            const layoutKey = attrs[attrName];
            if (shaderProgram.attrIndices[attrName] != -1) {
                const attr = layout[layoutKey];
                gl.vertexAttribPointer(
                    shaderProgram.attrIndices[attrName],
                    attr.size,
                    gl[attr.type],
                    attr.normalized,
                    attr.stride,
                    attr.offset);
            }
        }

    };
}

function drawObject(model){
    /*
     Takes in a model that points to a mesh and draws the object on the scene.
     Assumes that the setMatrixUniforms function exists
     as well as the shaderProgram has a uniform attribute called "samplerUniform"
     */
//    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.vertexBuffer);
    shaderProgram.applyAttributePointers(model);

//  texture
    // gl.enableVertexAttribArray(shaderProgram.texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(shaderProgram.texcoordLocation, size, type, normalize, stride, offset);
//end texture

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.mesh.indexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, model.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function mvPushMatrix(){
    var copy = mat4.create();
    mat4.copy(copy, app.mvMatrix);
    app.mvMatrixStack.push(copy);
}

function mvPopMatrix(){
    if (app.mvMatrixStack.length === 0){
        throw "Invalid popMatrix!";
    }
    app.mvMatrix = app.mvMatrixStack.pop();
}

function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, app.pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, app.mvMatrix);
    gl.uniform3fv(shaderProgram.reverseLightDirectionLocation, normalize([0,0,-5]));
    gl.uniform1i(shaderProgram.textureLocation, 0);

    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, app.mvMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


function setTextCoord(gl, textures){
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(textures),
        gl.STATIC_DRAW);
}

function initBuffers(){
    var layout = new OBJ.Layout(
        OBJ.Layout.POSITION,
        OBJ.Layout.NORMAL,
        OBJ.Layout.DIFFUSE,
        OBJ.Layout.UV,
        OBJ.Layout.SPECULAR,
        OBJ.Layout.SPECULAR_EXPONENT);

    // initialize the mesh's buffers
    for (var mesh in app.meshes){
        var test = new Float32Array(app.meshes[mesh].textures);
        console.log(test);
        // console.log(app.meshes[mesh].textures);
        // Create the vertex buffer for this mesh
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var vertexData = app.meshes[mesh].makeBufferData(layout);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        vertexBuffer.numItems = vertexData.numItems;
        vertexBuffer.layout = layout;
        app.meshes[mesh].vertexBuffer = vertexBuffer;

        // Create the index buffer for this mesh
        var indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        var indexData = app.meshes[mesh].makeIndexBufferData();
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
        indexBuffer.numItems = indexData.numItems;
        app.meshes[mesh].indexBuffer = indexBuffer;

        // provide texture coordinates for the rectangle.
        texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        // set text coords
        setTextCoord(gl, app.meshes[mesh].textures);

        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
        var image = new Image();
        image.addEventListener('load', function(){
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
            if(isPowerOf2(image.width) && isPowerOf2(image.height)){
                gl.generateMipmap(gl.TEXTURE_2D);
            }else{
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        });
        image.src = "http://123.cnviet.net/wp-content/uploads/2018/01/" + app.meshes[mesh].materialsByIndex[0].mapDiffuse.filename;

        // var materialsindex = gl.createBuffer();

        // this loops through the mesh names and creates new
        // model objects and setting their mesh to the current mesh
        app.models[mesh] = {};
        app.models[mesh].mesh = app.meshes[mesh];
    }
}

function animate(){
    app.timeNow = new Date().getTime();
    app.elapsed = app.timeNow - app.lastTime;
    if (!app.time) {
        app.time = 0.0;
    }
    app.time += app.elapsed / 1000.0;
    if (app.lastTime !== 0){
        // do animations
    }
    app.lastTime = app.timeNow;
}


var m4 = {
    perspective: function(fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return [
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (near + far) * rangeInv, -1,
          0, 0, near * far * rangeInv * 2, 0
        ];
    },

    projection: function(width, height, depth) {
    // Note: This matrix flips the Y axis so 0 is at the top.
        return [
           2 / width, 0, 0, 0,
           0, -2 / height, 0, 0,
           0, 0, 2 / depth, 0,
          -1, 1, 0, 1,
        ];
    },

    translation: function(tx, ty, tz) {
        return [
           1,  0,  0,  0,
           0,  1,  0,  0,
           0,  0,  1,  0,
           tx, ty, tz, 1,
        ];
    },

    xRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
          1, 0, 0, 0,
          0, c, s, 0,
          0, -s, c, 0,
          0, 0, 0, 1,
        ];
    },

    yRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
          c, 0, -s, 0,
          0, 1, 0, 0,
          s, 0, c, 0,
          0, 0, 0, 1,
        ];
    },

    zRotation: function(angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
           c, s, 0, 0,
          -s, c, 0, 0,
           0, 0, 1, 0,
           0, 0, 0, 1,
        ];
    },

    scaling: function(sx, sy, sz) {
        return [
          sx, 0,  0,  0,
          0, sy,  0,  0,
          0,  0, sz,  0,
          0,  0,  0,  1,
        ];
    },

    translate: function(m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function(m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },
    inverse: function(m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0  = m22 * m33;
        var tmp_1  = m32 * m23;
        var tmp_2  = m12 * m33;
        var tmp_3  = m32 * m13;
        var tmp_4  = m12 * m23;
        var tmp_5  = m22 * m13;
        var tmp_6  = m02 * m33;
        var tmp_7  = m32 * m03;
        var tmp_8  = m02 * m23;
        var tmp_9  = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return [
          d * t0,
          d * t1,
          d * t2,
          d * t3,
          d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
          d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
          d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
          d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
          d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
          d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
          d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
          d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
          d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
          d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
          d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
          d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    },
}

function degToRad(d) {
    return d * Math.PI / 180;
}

var fov = 45;
var cam_x = 0;
var cam_y = 0;
var cam_z = -2;
var cameraAngleRadians_x = 0;
var cameraAngleRadian_y = 0;
var isRotateX = false;
var isRotateY = false;
var isRotateZ = false;
// var test = $.extend({}, app);
var tmp_cam = null;

function setup(){
    mat4.identity(app.camera);
}

function normalize(v) {
  var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}

function vec4(v){
    var count_tmp = 0;
    var count_tmp_1 = 0;
    for(const p in v){
        if(count_tmp % 3 == 2){
            v.splice(count_tmp + 1 + count_tmp_1, 0, 1);
            count_tmp_1 ++;
        }
        count_tmp++;
    }
    return v;
}

function drawScene(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.identity(app.camera);
    if(tmp_cam != null){
        app.camera = {...tmp_cam};
    }
    if(isRotateX){
        mat4.rotate(app.camera, app.camera, degToRad(cameraAngleRadians_x), [1,0,0]);
        tmp_cam ={...app.camera};
    }
    if(isRotateY){
        mat4.rotate(app.camera, app.camera, degToRad(cameraAngleRadians_y), [0,1,0]);
        tmp_cam ={...app.camera};
    }
    mat4.translate(app.camera, app.camera, [0,0,2]);
    mat4.perspective(app.pMatrix, fov * Math.PI / 180.0, gl.viewportWidth / gl.viewportHeight, 0.01, 1000.0);
    app.mvMatrix = m4.inverse(app.camera);
    // gl.uniform3fv(shaderProgram.reverseLightDirectionLocation, normalize([0,0,-5]));
    mvPushMatrix();
        drawObject(app.models.die);
    mvPopMatrix();
}

function tick(){
    requestAnimFrame(tick);
    drawScene();
    animate();
}

var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}


function handleMouseDown(event){
    isDown = true;
    isUp = false;

    switch (event.which){
        case 1:
            isLeft = true;
            isRight = false;
            isMiddle = false;
            break;
        case 2:
            isRight = true;
            isLeft = false;
            isMiddle = false;
            break;
        case 3:
            isMiddle = true;
            isLeft = false;
            isRight = false;
    }

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

}

function handleMouseUp(event){
    isUp = true;
    isDown = false;
    isRotateX = false;
    isRotateY = false;
    isRotateZ = false;
}

function handleMouseMove(event){
    var newX = event.clientX;
    var newY = event.clientY;

    if(isDown && isLeft){
        var deltaX = newX - lastMouseX;
        var deltaY = newY - lastMouseY;

        if(deltaX > 0){
            isRotateY = true;
            cameraAngleRadians_y = deltaX / widthView / 50 * 360;
        }
        if(deltaY > 0){
            isRotateX = true;
            cameraAngleRadians_x = deltaY / heightView / 50 * 360;
        }
        if(deltaX < 0){
            isRotateY = true;
            cameraAngleRadians_y = deltaX / widthView / 50 * 360;
        }
        if(deltaY < 0){
            isRotateX = true;
            cameraAngleRadians_x = deltaY / heightView / 50 * 360;
        }
    }else if(isDown && isRight){
        // console.log("down right");
    }else if(isDown && isMiddle){
        // console.log("down middle");
    }
}
var scroll_state = 0;

function handleOnWheel(event){
    if(event.wheelDelta < 0 ){
        if(fov < 175){
            fov += 5;
        }
    }else if(event.wheelDelta > 0){
        if(fov > 5){
            fov -= 5;
        }
    }
}

function handleMouseMoveDocument(event){

}

function webGLStart(meshes){
    app.meshes = meshes;
    canvas = document.getElementById('mycanvas');
    widthView = canvas.width;
    heightView = canvas.height;
    gl = initWebGL(canvas);
    initShaders();
    initBuffers();
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;
    document.onmousemove = handleMouseMoveDocument;
    // canvas.addEventListener("scroll", handleOnWheel);
    canvas.addEventListener('wheel', handleOnWheel);

    tick();


//    drawScene();
}

// window.onload = function (){
//     // OBJ.downloadMeshes({
//     //     'suzanne': '/development/models/suzanne.obj'
//     // }, webGLStart);
//     var models = {};
    
//     let p = OBJ.downloadModels([
//         {
//             name: 'die',
//             obj: 'http://123.cnviet.net/wp-content/uploads/2018/01/zimCreateArchive_aaa.obj',
//             mtl: 'http://123.cnviet.net/wp-content/uploads/2018/01/zimCreateArchive_aaa.mtl',
//         }// ,
//         // {
//             // obj: '/development/models/suzanne.obj'
//         // }
//     ]);
    

//     p.then((models) => {
//         for ([name, mesh] of Object.entries(models)) {
//             console.log('Name:', name);
//             console.log('Mesh:', mesh);
//         }
//         webGLStart(models);
//     });
// };
var openFile = function(event) {
    var input = event.target;

    var reader = new FileReader();
    var models = {};
    reader.onload = function(){
        console.log(reader);
        if(count == 0){
            text_obj = reader.result;
        }else if(count == 1){
            text_mtl = reader.result;

        }
        // obj.innerText = text;
        // console.log(text);
        // objString = obj.innerHTML;
        // console.log(objString);
        if(count == 1){
            let p = loadModels([
                {
                    name : 'die',
                    obj : text_obj,
                    mtl : text_mtl,
                }
            ]);

            p.then((models) => {
                for([name, mesh] of Object.entries(models)){
                    // console.log("111");
                }
                webGLStart(models);
            })
        }
        count ++;
        
    };
    reader.readAsText(input.files[0]);
};

function loadModels(model){
  const finished = [];
  const parsed = [];
  options.enableWTextureCoord = true;
  let name = model[0].name;
  parsed.push(Promise.resolve(name));

  parsed.push(new OBJ.Mesh(model[0].obj,options));

  let material = new OBJ.MaterialLibrary(model[0].mtl);

  parsed.push(Promise.resolve(material));

  finished.push(Promise.all(parsed));  

  return Promise.all(finished)
  .then((ms) => {
      const models = {};

      for (const model of ms) {
        const [name, mesh, mtl] = model;
        mesh.name = name;
        if (mtl) {
          mesh.addMaterialLibrary(mtl);
        }
        models[name] = mesh;
      }

      return models;

  });
}

