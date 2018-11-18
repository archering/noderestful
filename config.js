/*****
 * 
 * create a environment config file for split different env
 * 
 */


 const DEFAULT_MODE = "DEVELOPMENT";

 var environment = {};

 environment.DEVELOPMENT = {
    port:9091,
    httpsport:9092,
    mode:"development",
    key:"thisisasecret"
 };

 environment.PRODUCTION = {
    port:9080,
    httpsport:9081,
    mode:"production",
    key:"thisisalsoasecret"
 };

 //NODE_ENV=production node index_3_router.js   地址栏设置的参数 NODE_ENV的值决定 使用哪种模式
 var upcase_env = process.env.NODE_ENV? process.env.NODE_ENV.toUpperCase():"undefined";

 var mode = environment[upcase_env]||environment.DEVELOPMENT;

 module.exports = mode;