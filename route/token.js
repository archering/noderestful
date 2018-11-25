//deps
var StringDecoder = require("string_decoder").StringDecoder;

//local deps
var file = require("../lib/data");
var helper = require("../lib/helper");

var handler = {name:"token"};

var acceptMethods = ["post","get","put","delete"];
handler.handle = function(req,res){

    var method = req.method.toLowerCase();
    if(acceptMethods.indexOf(method)!=-1){
        this[method](req,res);
    }else{
        res.writeHead(405);
        res.end("method not allowed, only supports : "+ acceptMethods.join(","));
    }

}

/***
 * 
 * @TODO read user info from server according user phone numbere
 */
handler.get = function(req,res){
    //read token from header
    var tid = req.headers["token"];
    if(tid){
        file.read("token",tid,function(err,dat){
            if(err){
                res.end("the token you asked is not exists!");
            }else{
                res.setHeader("Content-Type","text/json");
                res.end(dat);
            }
        });
    }else{
        res.setHeader("Content-Type","text/json");
        res.end(JSON.stringify({error:"token id is missing"}));
    }
}

/***
 * 
 * 
 * @TODO save user info to a perminate place 
 */
handler.post = function(req,res){
    var decoder = new StringDecoder();
    var buffer = "";
    req.on("data",function(dat){
        buffer += decoder.write(dat);
    });

    req.on("end",function(){
        buffer += decoder.end();
        res.setHeader("Content-Type","text/json"); //浏览器解析为json对象
        var reqtype = req.headers["content-type"];
        var payload = reqtype=="application/json"?JSON.parse(buffer):buffer;
        file.read("users",payload.phone,function(err,dat){
            if(!err && dat){
                var udata = helper.parse2JSON(dat);
                if(udata.pwd == helper.hash(payload.password)){

                    var tid = helper.generateToken(20);
                    var info = {
                        phone: payload.phone,
                        id:tid,
                        expired:(Date.now() + 1000 * 60 * 60)
                    }
                    file.create("token",tid,info,function(err,desc){
                        res.writeHead(200);
                        if(err){
                            res.end(JSON.stringify({"error":err}));
                        }else{
                            res.end(JSON.stringify(info));
                        }
                    });
                }else{
                    res.writeHead(500);
                    res.end("pwd is wrong");
                }
            }else{
                res.writeHead(500);
                res.end(JSON.stringify({status:"falied",error:"file already exists"}));
            }
        });
    });
}
/***
 * 
 * 
 *@TODO update user info 
 * only allow the phone's host update it's own info   
 */
handler.put = function(req,res){
    var decoder = new StringDecoder();
    var buffer = "";
    req.on("data",function(dat){
        buffer += decoder.write(dat);
    });

    req.on("end",function(){
        buffer += decoder.end();
        res.setHeader("Content-Type","text/json"); //浏览器解析为json对象
        var reqtype = req.headers["content-type"];
        var payload = reqtype=="application/json"?helper.parse2JSON(buffer):buffer;
        var tid = req.headers["token"];
        if(tid){
            file.read("token",tid,function(err,dat){
                
                if(!err){
                    var datObj = helper.parse2JSON(dat);
                    if(datObj.expired>=Date.now){// tid 存在 and 没有过期
                        datObj.expired = Date.now() + 1000 * 60 * 60; //续期

                        file.update("token",tid,datObj,function(err,desc){
                            res.writeHead(200);
                            if(err){
                                res.end(JSON.stringify({"error":err}));
                            }else{
                                res.end(JSON.stringify({"status":"success",desc:desc}));
                            }
                        });
                    }else{
                        res.writeHead(405);
                        res.end("you do not have permission to update");
                    }
                }else{
                    res.writeHead(500);
                    res.end(JSON.stringify({status:"falied",error:"file with phone you asked is not exists"}));
                }
            });
        }else{
            res.writeHead(400);
            res.end("there is something required missing");
        }
    });
}

handler.delete = function(req,res){
    var tid = req.headers["token"]
    if(tid){
        helper.verifyToken("token",tid,function(err,errMSG){
            if(!err){
                file.read("token",tid,function(err,dat){
                    var obj = helper.parse2JSON(dat);
                    if(!err){
                        if(obj && obj.name == username && obj.phone == phone){
                            file.delete("token",tid,function(err){
                                if(err){
                                    res.writeHead(500);
                                    res.end("delete user failed",err);
                                }else{
                                    res.writeHead(200);
                                    res.end("delete user with token"+tid + " succeed");
                                }
                            });
                        }else{
                            res.writeHead(405);
                            res.end("do not have permission to delete user ");
                        }
                    }else{
                        res.writeHead(400);
                        res.end("user not exists");                
                    }
                });
            }else{
                res.writeHead(403);
                res.end("token is empty");
            }
        });

    }else{
        res.writeHead(500);
        res.end("required field is missing");
    }
}



module.exports = handler;