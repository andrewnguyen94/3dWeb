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

var posBuffer ;
var data;
var tangBuffer ;
var bitTangBuffer;
var uvs;
var index_buffer;
var num_index;
var ambient_buffer;
var diffuse_buffer;
var spec_buffer;

// var textDiffuseArr = [];
// var textNormArr = [];
var text_diffuse = [];
var text_norm = [];
var textures_resources = [];

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
var is_diffuse;

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
    return "http://vietek.com.vn/wp-content/uploads/2018/02/" + url;
}

function load_bump(){
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 255, 255]));
    var img = new Image();
    // img.onload = function(){
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // }
    // img.src = url;
    return tex;
}

function load_textures(url){
    if(url){
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
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "model_mtx");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "norm_mtx");

    shaderProgram.tex_norm = gl.getUniformLocation(shaderProgram, "tex_norm");
    shaderProgram.tex_diffuse = gl.getUniformLocation(shaderProgram, "tex_diffuse");
    shaderProgram.type = gl.getUniformLocation(shaderProgram, "type");
    shaderProgram.is_diffuse = gl.getUniformLocation(shaderProgram, "is_diffuse");
    shaderProgram.attr_amb = gl.getUniformLocation(shaderProgram, "ambient");
    gl.enableVertexAttribArray(shaderProgram.attr_amb);
    shaderProgram.attr_diff = gl.getUniformLocation(shaderProgram, "diffuse");
    gl.enableVertexAttribArray(shaderProgram.attr_diff);
    shaderProgram.attr_spec = gl.getUniformLocation(shaderProgram, "specular");
    gl.enableVertexAttribArray(shaderProgram.attr_spec);

    shaderProgram.attr_pos = gl.getAttribLocation(shaderProgram, "vert_pos");
    gl.enableVertexAttribArray(shaderProgram.attr_pos);
    shaderProgram.attr_tang = gl.getAttribLocation(shaderProgram, "vert_tang");
    gl.enableVertexAttribArray(shaderProgram.attr_tang);
    shaderProgram.attr_bitang = gl.getAttribLocation(shaderProgram, "vert_bitang");
    gl.enableVertexAttribArray(shaderProgram.attr_bitang);
    shaderProgram.attr_uv = gl.getAttribLocation(shaderProgram, "vert_uv");
    gl.enableVertexAttribArray(shaderProgram.attr_uv);

}

function setupBuffer(){
    posBuffer = gl.createBuffer();
    tangBuffer = gl.createBuffer();
    bitTangBuffer = gl.createBuffer();
    uvs = gl.createBuffer();
    ambient_buffer = gl.createBuffer();
    diffuse_buffer = gl.createBuffer();
    spec_buffer = gl.createBuffer();
    index_buffer = gl.createBuffer();
}

function initBuffers(mesh, index){
    //position
   
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    var posData = mesh.verts;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData), gl.STATIC_DRAW);
    posBuffer.numItems = posData.length / 3;
    //end position

    //tangents
    
    gl.bindBuffer(gl.ARRAY_BUFFER, tangBuffer);
    var tangData = mesh.tangent;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangData), gl.STATIC_DRAW);
    // tangBufferArr.push(tangBuffer);
    //end tangent

    //Bitangents
    
    gl.bindBuffer(gl.ARRAY_BUFFER, bitTangBuffer);
    var bitTangData = mesh.bitTangent;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitTangData), gl.STATIC_DRAW);
    // bitTangBufferArr.push(bitTangBuffer);
    //end bit

    //uvs
    
    gl.bindBuffer(gl.ARRAY_BUFFER, uvs);
    var uv_data = mesh.uvs;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv_data), gl.STATIC_DRAW);
    // uvsArr.push(uvs);
    //end uvs

    //index buffer
    var indices = mesh.indices;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    index_buffer.numItems = indices.length;
    // num_indices.push(num_index);
    //end

    // //ambient
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, ambient_buffer);
    // var amb = mesh.ambient;
    // console.log(amb);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(amb), gl.STATIC_DRAW);
    // //end

    // //diffuse
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, diffuse_buffer);
    // var diff = mesh.diffuse;
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diff), gl.STATIC_DRAW);
    // //end

    // //specular
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, spec_buffer);
    // var spec = mesh.specular;
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spec), gl.STATIC_DRAW);
    // //end
}

function initTextures(){
    for(let i = 0; i < data.length; i++){
        var mesh = data[i];
        var tex_src;
        var bump_src;
        if(mesh.textures){
            tex_src = getUrl(mesh.textures);
        }
        if(mesh.bumpMap){
            bump_src = getUrl(mesh.bumpMap);
        }
        var isBump = mesh.isBump;

        if(mesh.bumpMap){
            type = 1;
        }else{
            type = 0;
        }
        if(mesh.textures){
            is_diffuse = 1;
        }else{
            is_diffuse = 0;
        }
        text_diffuse.push(load_textures(tex_src));
        text_norm.push(load_textures(bump_src));
    }
}

function drawObject(mesh,index){
    /*
     Takes in a model that points to a mesh and draws the object on the scene.
     Assumes that the setMatrixUniforms function exists
     as well as the shaderProgram has a uniform attribute called "samplerUniform"
     */
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, app.pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, app.mvMatrix);
    // gl.uniform3fv(shaderProgram.reverseLightDirectionLocation, normalize([0,0,-5]));
 
    var normalMatrix = mat3.create();
    mat3.normalFromMat4(normalMatrix, app.mvMatrix);
    // gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
    gl.uniform1i(shaderProgram.type, type);
    gl.uniform1i(shaderProgram.is_diffuse, is_diffuse);
    gl.uniform3fv(shaderProgram.ambient, mesh.ambient);
    gl.uniform3fv(shaderProgram.diffuse, mesh.diffuse);
    gl.uniform3fv(shaderProgram.specular, mesh.specular);
    //active textures
    if(text_norm[index] != undefined && text_diffuse[index] != undefined){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, text_norm[index]);
        gl.uniform1i(shaderProgram.text_norm, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, text_diffuse[index]);
        gl.uniform1i(shaderProgram.tex_diffuse, 1);
    }else if(text_norm[index] == undefined && text_diffuse[index] != undefined){
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, text_diffuse[index]);
        gl.uniform1i(shaderProgram.text_diffuse, 1);
    }else if(text_norm[index] != undefined && text_diffuse[index] == undefined){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, text_norm[index]);
        gl.uniform1i(shaderProgram.text_norm, 0);
    }
    //end

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(shaderProgram.attr_pos, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tangBuffer);
    gl.vertexAttribPointer(shaderProgram.attr_tang, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bitTangBuffer);
    gl.vertexAttribPointer(shaderProgram.attr_bitang, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvs);
    gl.vertexAttribPointer(shaderProgram.attr_uv, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

    // gl.bindBuffer(gl.ARRAY_BUFFER, ambient_buffer);
    // gl.vertexAttribPointer(shaderProgram.attr_amb, 3, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, diffuse_buffer);
    // gl.vertexAttribPointer(shaderProgram.attr_diff, 3, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, spec_buffer);
    // gl.vertexAttribPointer(shaderProgram.attr_spec, 3, gl.FLOAT, false, 0, 0);

    gl.drawElements(gl.TRIANGLES, index_buffer.numItems, gl.UNSIGNED_SHORT, 0); 
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
        if(fov < 175 && fov >= 5){
            fov += 5;
        }else if(fov < 5){
            fov += 1
        }
    }else if(event.wheelDelta > 0){
        if(fov > 5){
            fov -= 5;
        }else if(fov > 0 && fov <= 5){
            fov -= 1
        }
    }
}

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

function webGLStart(meshes){
    app.meshes = meshes;
    canvas = document.getElementById('mycanvas');
    canvas.addEventListener("webglcontextlost", function(event) {
        event.preventDefault();
    }, false);
    canvas.addEventListener("webglcontextrestored", function(){
        setupWebGLStateAndResources();
    }, false);
    widthView = canvas.width;
    heightView = canvas.height;
    gl = initWebGL(canvas);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    canvas.onmousemove = handleMouseMove;
    canvas.addEventListener('wheel', function(event){
        handleOnWheel(event);
        event.preventDefault();
    }, false);
    initShaders();
    setupBuffer();
    initTextures();
    tick();
}

function loadJSon(jsonpath){
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            data = JSON.parse(this.responseText);
            webGLStart(data);

        }
    }
    xobj.open("GET", jsonpath, true);
    xobj.send();
}

function setupWebGLStateAndResources(){
    loadJSon("http://vietek.com.vn/wp-content/uploads/2018/02/data.txt");
}

function tick(){
    requestAnimFrame(tick);
    drawScene();
    // animate();
}

function drawScene(){
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
    for(let i = 0; i < app.meshes.length; i++){
        var mesh = app.meshes[i];
        if(mesh.indices.length){
            initBuffers(mesh,i);
            gl.useProgram(shaderProgram);
            drawObject(mesh,i);
        }
    }
    // requestAnimFrame(drawScene);
    // mvPushMatrix();
    // mvPopMatrix();
}

window.onload = function (){
    loadJSon("http://vietek.com.vn/wp-content/uploads/2018/02/data.json");
};

// var openFile = function(event) {
//     var input = event.target;
//     var selectedFile = event.target.files[0];
//     var t = {};
//     t.file = selectedFile;
//     // textures_resources.push(selectedFile);

//     var reader = new FileReader();
//     var models = {};
//     var c = 0;
//     for(let i = 0; i < data.length; i++){
//         if(data[i].isBump){
//             c++;
//         }
//         if(data[i].textures){
//             c++;
//         }
//     }
//     reader.onload = function(){
//         t.src = reader.result;
//         textures_resources.push(t);
//         count ++;
//         if(count == c){
//             console.log(data);
//             webGLStart(data);
//         }
        
//     };
//     reader.readAsDataURL(selectedFile);
// };

