var $=require("../jquery");function camelCase(e){return"string"!==$.type(e)&&(e=""+e),0<=e.indexOf("_")?(e=e.replace(/_/g,"-"),$.camelCase(e)):e}module.exports=camelCase;