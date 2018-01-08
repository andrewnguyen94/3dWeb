const UNIFORM = /^uniform\s/;
const SAMP = /^sampler2D\s/;
const WHITESPACE_RE = /\s+/;
var count = 0;

var c = document.getElementById("shader-fs");
var cc = c.text;
var ccc = cc.split("\n");
for(let i = 0; i < ccc.length; i++){
  var cccc = ccc[i].trim();
  if(UNIFORM.test(cccc)){
    let t = ccc[i].search(/\S/);
    const elements = cccc.split(WHITESPACE_RE);
    elements.shift();
    console.log(elements);
    if(elements[0] == "sampler2D"){
      count = i;
      let apps = "";
      for(let ii =0; ii < t; ii++){
        apps += " ";
      }
      apps += "test";
      ccc.splice(i + 1, 0, apps);
    }
  }
}
var test = "";
for(let i = 0; i < ccc.length; i++){
  if(i < ccc.length -1){
    test += ccc[i] + "\n";  
  }else{
    test += ccc[i];
  }
}
c.text = test;
console.log(c)