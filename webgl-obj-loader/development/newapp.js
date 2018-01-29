// import {Material, MaterialLibrary} from './material';

// WebGL context
var gl = {};
// the canvas element
var canvas = null;
// main shader program
var shaderProgram = null;
// var shaderProgramArr = [];
// main app object
var app = {};
app.meshes = {};
app.models = {};
app.mvMatrix = mat4.create();
app.mvMatrixStack = [];
app.pMatrix = mat4.create();
app.camera = mat4.create();
// var texCoordBuffer = [];
// var posBufferArr = [];
// var tangBufferArr = [];
// var bitTangBufferArr = [];
// var uvsArr = [];
// var indexBufferArr = [];

var posBuffer = null;
var tangBuffer = null;
var bitTangBuffer = null;
var uvs = null;
var index_buffer = null;
var num_index = 0;

// var textDiffuseArr = [];
// var textNormArr = [];
var text_diffuse = null;
var text_norm = null;

// num_indices = [];


var reader = new FileReader();
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
var nobt = 0;
var offsetArray = []; 

var url_images = [];

var images = [];
var type = 0;

const USE_MATERIAL_RE = /^usemtl/;
const TEXTURE_RE = /^vt\s/;
const FACE_RE = /^f\s/;
const WHITESPACE_RE = /\s+/;
const NEW_MTL = /^newmtl/;
const MAP_KD = /^map_Kd/;
const MAP_BUMP = /^map_bump/;
const UNIFORM = /^uniform\s/;
const SAMP = /^sampler2D\s/;
const VARYING = /^varying\s/;
const VEC4 = /^vec4\s/;
const GLFRAG = /^gl_FragColor\s/;
const ATTR = /^attribute\s/;
const VTEX0 = /^vTextureCoord0\s/;

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

function mtx_transpose(a) {
    var b = mtx_zero();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            b[i + j*4] = a[j + i*4];
        }
    }
    return b;
}

function mtx_zero() {
    return [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];
}

function mtx_inverse(m) {
    var inv = mtx_zero();
    inv[0]  =  m[5] * m[10] * m[15] - m[5]  * m[11] * m[14] - m[9]  * m[6] * m[15] + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
    inv[4]  = -m[4] * m[10] * m[15] + m[4]  * m[11] * m[14] + m[8]  * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
    inv[8]  =  m[4] * m[9]  * m[15] - m[4]  * m[11] * m[13] - m[8]  * m[5] * m[15] + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
    inv[12] = -m[4] * m[9]  * m[14] + m[4]  * m[10] * m[13] + m[8]  * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
    inv[1]  = -m[1] * m[10] * m[15] + m[1]  * m[11] * m[14] + m[9]  * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
    inv[5]  =  m[0] * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2] * m[15] + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
    inv[9]  = -m[0] * m[9]  * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1] * m[15] - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
    inv[13] =  m[0] * m[9]  * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1] * m[14] + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
    inv[2]  =  m[1] * m[6]  * m[15] - m[1]  * m[7]  * m[14] - m[5]  * m[2] * m[15] + m[5] * m[3] * m[14] + m[13] * m[2] * m[7]  - m[13] * m[3] * m[6];
    inv[6]  = -m[0] * m[6]  * m[15] + m[0]  * m[7]  * m[14] + m[4]  * m[2] * m[15] - m[4] * m[3] * m[14] - m[12] * m[2] * m[7]  + m[12] * m[3] * m[6];
    inv[10] =  m[0] * m[5]  * m[15] - m[0]  * m[7]  * m[13] - m[4]  * m[1] * m[15] + m[4] * m[3] * m[13] + m[12] * m[1] * m[7]  - m[12] * m[3] * m[5];
    inv[14] = -m[0] * m[5]  * m[14] + m[0]  * m[6]  * m[13] + m[4]  * m[1] * m[14] - m[4] * m[2] * m[13] - m[12] * m[1] * m[6]  + m[12] * m[2] * m[5];
    inv[3]  = -m[1] * m[6]  * m[11] + m[1]  * m[7]  * m[10] + m[5]  * m[2] * m[11] - m[5] * m[3] * m[10] - m[9]  * m[2] * m[7]  + m[9]  * m[3] * m[6];
    inv[7]  =  m[0] * m[6]  * m[11] - m[0]  * m[7]  * m[10] - m[4]  * m[2] * m[11] + m[4] * m[3] * m[10] + m[8]  * m[2] * m[7]  - m[8]  * m[3] * m[6];
    inv[11] = -m[0] * m[5]  * m[11] + m[0]  * m[7]  * m[9]  + m[4]  * m[1] * m[11] - m[4] * m[3] * m[9]  - m[8]  * m[1] * m[7]  + m[8]  * m[3] * m[5];
    inv[15] =  m[0] * m[5]  * m[10] - m[0]  * m[6]  * m[9]  - m[4]  * m[1] * m[10] + m[4] * m[2] * m[9]  + m[8]  * m[1] * m[6]  - m[8]  * m[2] * m[5];
    det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

    if (det == 0) {
        console.log("Error: Non-invertible matrix");
        return mtx_zero();
    }

    det = 1.0 / det;
    for (var i = 0; i < 16; i++) {
        inv[i] *= det;
    }
    return inv;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function getUrl(url){
    return "http://123.cnviet.net/wp-content/uploads/2018/01/" + url;
}

function load_textures(url){
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 255, 255]));
    var img = new Image();
    img.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    img.src = url;
    return tex;
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

function initShaders(mesh){
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
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "model_mtx");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "norm_mtx");

    shaderProgram.tex_norm = gl.getUniformLocation(shaderProgram, "tex_norm");
    shaderProgram.tex_diffuse = gl.getUniformLocation(shaderProgram, "tex_diffuse");
    shaderProgram.type = gl.getUniformLocation(shaderProgram, "type");

    shaderProgram.attr_pos = gl.getAttribLocation(shaderProgram, "vert_pos");
    gl.enableVertexAttribArray(shaderProgram.attr_pos);
    shaderProgram.attr_tang = gl.getAttribLocation(shaderProgram, "vert_tang");
    gl.enableVertexAttribArray(shaderProgram.attr_tang);
    shaderProgram.attr_bitang = gl.getAttribLocation(shaderProgram, "vert_bitang");
    gl.enableVertexAttribArray(shaderProgram.attr_bitang);
    shaderProgram.attr_uv = gl.getAttribLocation(shaderProgram, "vert_uv");
    gl.enableVertexAttribArray(shaderProgram.attr_uv);
    console.log(shaderProgram);

}

function initBuffers(mesh){
    //position
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    var posData = mesh.verts;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData), gl.STATIC_DRAW);
    // posBufferArr.push(posBuffer);
    //end position

    //tangents
    tangBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tangBuffer);
    var tangData = mesh.tangent;
    console.log(mesh);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangData), gl.STATIC_DRAW);
    // tangBufferArr.push(tangBuffer);
    //end tangent

    //Bitangents
    bitTangBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bitTangBuffer);
    var bitTangData = mesh.bitTangent;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitTangData), gl.STATIC_DRAW);
    // bitTangBufferArr.push(bitTangBuffer);
    //end bit

    //uvs
    uvs = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvs);
    var uv_data = mesh.uvs;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv_data), gl.STATIC_DRAW);
    // uvsArr.push(uvs);
    //end uvs

    //index buffer
    var indices = mesh.indices;
    index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    num_index = indices.length;
    // num_indices.push(num_index);
    //end
}

function initTextures(mesh){
    var tex_src = getUrl(mesh.textures);
    var bump_src = getUrl(mesh.bumpMap);
    var isBump = mesh.isBump;

    if(mesh.bumpMap){
        type = 1;
    }else{
        type = 0;
    }

    text_diffuse = load_textures(tex_src);
    // textDiffuseArr.push(text_diffuse);
    text_norm = load_textures(bump_src);
    // textNormArr.push(text_norm); 
}

function drawObject(mesh){
    /*
     Takes in a model that points to a mesh and draws the object on the scene.
     Assumes that the setMatrixUniforms function exists
     as well as the shaderProgram has a uniform attribute called "samplerUniform"
     */
            // console.log(i);
            // console.log(shaderProgramArr[i]);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(shaderProgram.attr_pos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tangBuffer);
    gl.vertexAttribPointer(shaderProgram.attr_tang, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bitTangBuffer);
    gl.vertexAttribPointer(shaderProgram.attr_bitang, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvs);
    gl.vertexAttribPointer(shaderProgram.attr_uv, 2, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, app.pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, app.mvMatrix);
    // gl.uniform3fv(shaderProgram.reverseLightDirectionLocation, normalize([0,0,-5]));
 
    gl.uniformMatrix4fv(shaderProgram.nMatrixUniform, false, mtx_transpose(mtx_inverse(app.mvMatrix)));
    gl.uniform1i(shaderProgram.type, type);
    //active textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, text_norm);
    gl.uniform1i(shaderProgram.text_norm, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, text_diffuse);
    gl.uniform1i(shaderProgram.tex_diffuse, 1);
    //end

    gl.drawElements(gl.TRIANGLES, num_index, gl.UNSIGNED_BYTE, 0);     
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

function drawScene(mesh){
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
        drawObject();
    mvPopMatrix();
}

function tick(mesh){
    requestAnimFrame(tick);
    drawScene(mesh);
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
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;
    document.onmousemove = handleMouseMoveDocument;
    // canvas.addEventListener("scroll", handleOnWheel);
    canvas.addEventListener('wheel', handleOnWheel);
    for(var i = 0; i < app.meshes.length; i++){
        var mesh = app.meshes[i];
        if(mesh.indices.length){
            initShaders(mesh);
            initBuffers(mesh);
            initTextures(mesh);
            tick(mesh);
        }
    }
    // initShaders();
    // initBuffers();
    // initTextures();


//    drawScene();
}

// window.onload = function (){
//     // OBJ.downloadMeshes({
//     //     'suzanne': '/development/models/suzanne.obj'
//     // }, webGLStart);
//     var models = {};

//     let t = [];
//     for (let i = 0; i < data.length; i++){
//         t.push(data[i].buff); 
//     }
//     nobt = t.length;
//     url_images = getUrls(data);
//     let p = OBJ.downloadModels([
//         {
//             name: 'die',
//             obj: 'http://123.cnviet.net/wp-content/uploads/2018/01/zimCreateArchive_hihi.obj',
//             mtl: 'http://123.cnviet.net/wp-content/uploads/2018/01/zimCreateArchive_hihi.mtl',
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
//         webGLStart(models,t);
//     });
// };

function setFragmentShader(gl, id){
    var shader = document.getElementById(id);
    var text = shader.text;
    var textArray = text.split("\n");
    var count = 0;
    var count1 = 0; 
    var count2 = 0;
    var p = [];
    for(let i = 0; i < textArray.length; i++){
        p.push(textArray[i]);
    }

    for(let i = 0; i < textArray.length; i++){
        var t = textArray[i].trim();
        let u = textArray[i].search(/\S/);
        const elements = t.split(WHITESPACE_RE);
        elements.shift();
        if(VARYING.test(t)){
            if(elements[0] == "vec2" && elements[1] == "vTextureCoord0;"){
                for(let iii = 0; iii < nobt; iii++){
                    if(nobt == 1){
                        break;
                    }else{
                        let apps = "";
                        for(let ii = 0; ii < u; ii++){
                            apps += " ";
                        }
                        count++;
                        if(iii == 0) continue;
                        let c = "varying vec2 vTextureCoord" + iii + ";";
                        apps += c;
                        p.splice(i + iii, 0, apps);
                    }
                }
            }
        }
        if(UNIFORM.test(t)){
            if(elements[0] == "sampler2D"){
                for(let iii = 0; iii < nobt; iii++){
                    if(nobt == 1){
                        break;
                    }else{
                        count1++;
                        let apps = "";
                        for(let ii = 0; ii < u; ii++){
                            apps += " ";
                        }
                        if(iii == 0) continue;
                        let c = "uniform sampler2D u_texture" + iii + ";";
                        apps += c;
                        p.splice(i+iii+count-1, 0 ,apps);
                    }
                }
            }
        }
        if(VEC4.test(t)){
            if(elements[0] == "color0"){
                for(let iii = 0; iii < nobt; iii++){
                    if(nobt == 1) break;
                    else{
                        count2++;
                        let apps = "";
                        for(let ii = 0; ii < u; ii++){
                            apps += " ";
                        }
                        if(iii == 0) continue;
                        let c = "vec4 color" + iii + " = texture2D(u_texture" + iii + ", vTextureCoord" + iii + ");"
                        apps += c;
                        p.splice(i + iii + count + count1 -2, 0, apps); 
                    }
                }
            }
        }
        if(t[0] == "}"){
            let t1 = textArray[i - 1].search(/\S/);
            let apps = "";
            for(let ii = 0; ii < t1; ii++){
              apps += " ";
            }
            apps += "gl_FragColor = ";
            for(let iii = 0; iii < nobt; iii++){
              if(iii < nobt - 1) apps += "color" + iii + "*";
              else apps += "color" + iii;
            }
            apps += "* color_0;"
            if(count + count1 + count2 > 0){
                p.splice(i + count + count1 + count2 - 3, 0, apps);
            }else{
                p.splice(i + count + count1 + count2, 0, apps);
            } 
            
        }
    }
    var q = "";
    for(let i = 0; i < p.length; i++){
        if(i < p.length -1 ){
            q += p[i] + '\n';
        }else{
            q += p[i];
        }
    }
    shader.text = q;
    console.log(shader);
}

function setVertexShader(gl, id){
    var shader = document.getElementById(id);
    var text = shader.text;
    var textArray = text.split("\n");
    var count = 0;
    var count1 = 0;
    var p = [];
    for(let i = 0; i < textArray.length; i++){
        p.push(textArray[i]);
    }
    for(let i = 0; i < textArray.length; i++){
        var t = textArray[i].trim();
        var u = textArray[i].search(/\S/);
        const elements = t.split(WHITESPACE_RE);
        elements.shift();
        if(ATTR.test(t)){
            if(elements[0] == "vec2" && elements[1] == "a_texcoord0;"){
                for(let iii = 0; iii < nobt; iii++){
                    if(nobt ==1 ) break;
                    else{
                        count++;
                        let apps = "";
                        for(let ii = 0; ii < u; ii++){
                            apps += " ";
                        }
                        if(iii == 0) continue;
                        let c = "attribute vec2 a_texcoord" + iii + ";";
                        apps += c;
                        p.splice(i + iii, 0, apps);
                    }
                }
            }
        }
        if(VARYING.test(t)){
            if(elements[0] == "vec2" && elements[1] == "vTextureCoord0;"){
                for(let iii = 0; iii < nobt; iii++){
                    if(nobt == 1) break;
                    else{
                        count1++;
                        let apps = "";
                        for(let ii = 0; ii < u; ii++){
                            apps += " ";
                        }
                        if(iii == 0) continue;
                        let c = "varying vec2 vTextureCoord" + iii + ";";
                        apps += c;
                        p.splice(i + iii + count - 1, 0, apps);
                    }
                }
            }
        }
        if(VTEX0.test(t)){
            for(let iii = 0; iii < nobt; iii++){
                if(nobt == 1) break;
                else{
                    let apps = "";
                    for(let ii = 0; ii < u; ii++){
                        apps += " ";
                    }
                    if(iii == 0) continue;
                    let c = "vTextureCoord" + iii + " = " + "a_texcoord" + iii + ";";
                    apps += c;
                    p.splice(i + iii + count + count1 -2, 0, apps);
                }
            }
        }
    }
    var q = "";
    for(let i = 0; i < p.length; i++){
        if(i < p.length -1 ){
            q += p[i] + '\n';
        }else{
            q += p[i];
        }
    }
    shader.text = q;
}

var openFile = function(event) {
    var input = event.target;

    var reader = new FileReader();
    var models = {};
    reader.onload = function(){
        if(count == 0){
            text_obj = reader.result;
        }else if(count == 1){
            text_mtl = reader.result;

        }
        if(count == 1){
            // let textures = getTexturesCoord([
            //     {
            //         name : 'die',
            //         obj : text_obj,
            //         mtl : text_mtl,
            //     }
            // ]);
            // let t = groupTextures(textures);
            let models = [];
            for(let i = 0; i < data.length; i++){
                let model = {...data[i]};
                models.push(model);
            }
            webGLStart(models);
        }
        count ++;
        
    };
    reader.readAsText(input.files[0]);
};

var test = null;

function loadModels(model){
    test = model[0].obj;
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