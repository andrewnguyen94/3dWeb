const UNIFORM = /^uniform\s/;
const SAMP = /^sampler2D\s/;
const WHITESPACE_RE = /\s+/;
const VARYING = /^varying\s/;
const VEC4 = /^vec4\s/;
const ENDMAIN = /^}\s/;
var count = 0;
var count1 = 0;
var count2 = 0;
var nobt = 4;

var c = document.getElementById("shader-fs");
var cc = c.text;
var ccc = cc.split("\n");
var p = [];
for(let i =0; i < ccc.length ; i++){
  p.push(ccc[i]);
}
for(let i = 0; i < ccc.length; i++){
  var cccc = ccc[i].trim();
  let t = ccc[i].search(/\S/);
  const elements = cccc.split(WHITESPACE_RE);
  elements.shift();
  if(VARYING.test(cccc)){
    if(elements[0] == "vec2" && elements[1] == "vTextureCoord0;"){
      for(let iii = 0; iii < nobt; iii++){
        if(nobt == 1){
            break;
        }else{
          count ++;
          let apps = "";
          for(let ii = 0; ii < t; ii++){
            apps += " ";
          }
          if(iii == 0) continue;
          let d = "varying vec2 vTextureCoord" + iii + ";";
          apps += d;
          p.splice(i + iii, 0, apps);
        }
      }
    }
  }
  if(UNIFORM.test(cccc)){
    if(elements[0] == "sampler2D"){
      for(let iii = 0; iii < nobt; iii++){
        if(nobt == 1){
            break;
        }else{
            count1++;
            let apps = "";
            for(let ii =0; ii < t; ii++){
              apps += " ";
            }
            if(iii == 0) continue;
            let d = "uniform sampler2D u_texture" + iii + ";";
            apps += d;
            p.splice(i+iii +count -1, 0 ,apps);
        }
      }
    }
  }
  if(VEC4.test(cccc)){
    if(elements[0] == "color0"){
      for(let iii = 0; iii < nobt; iii++){
        if(nobt == 1) break;
        else{
          count2++;
          let apps = "";
          for(let ii = 0; ii < t; ii++){
            apps += " ";
          }
          if(iii == 0) continue;
          let d = "vec4 color" + iii + " = texture2D(u_texture" + iii + ", vTextureCoord" + iii + ");"  
          apps += d;
          p.splice(i + iii + count + count1 - 2, 0, apps);
        }
      }
    }
  }
  if(cccc[0] == "}"){
    let t1 = ccc[i - 1].search(/\S/);
    let apps = "";
    for(let ii = 0; ii < t1; ii++){
      apps += " ";
    }
    apps += "gl_FragColor = ";
    for(let iii = 0; iii < nobt; iii++){
      if(iii < nobt - 1) apps += "color" + iii + "*";
      else apps += "color" + iii + ";";
    }
    p.splice(i + count + count1 + count2 - 3, 0, apps);
  }
}
var test = "";
for(let i = 0; i < p.length; i++){
  if(i < p.length -1){
    test += p[i] + "\n";  
  }else{
    test += p[i];
  }
}
c.text = test;
console.log(c)