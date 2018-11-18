/*****  
 * 
 * CREATE A LIB FOR SAVE ,DELETE,UPDATE DATA TO A FILE
 */

 //require core deps
 var fs = require("fs");
 var path = require("path");

 //create the lib
 var lib = {};

// file base dir
var base = path.join(__dirname,"/../data/");

 lib.create = lib.saveAs = function(dir,file,data,callback){
    fs.open(base+dir+"/"+file+".json","wx",function(err,descriptor){
        if(!err && descriptor){
            var dat = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(descriptor,dat,function(err){
                if(!err){
                    //if there is no err, then close the file
                    fs.close(descriptor,function(err){
                        if(!err){
                            callback(false,"write done!");
                        }else{  
                            callback("close new file failed");
                        }
                    });
                }else{
                    callback("try to write data to file failed!");
                }
            });

        }else{
            callback("the file with the samename already exitsts!");
        }
    });
 }


 lib.read = function(dir,file,callback){
    fs.readFile(base+dir+"/"+file+".json","utf8",function(err,data){
        callback(err,data);
    });
 }
 
//如果这个文件存在，更新这个文件
 lib.update = function(dir,file,data,callback){
    fs.open(base+dir+"/"+file+".json","r+",function(err,descriptior){
        if(!err && descriptior){
            var dat = JSON.stringify(data);

            fs.truncate(descriptior,function(err){
                if(!err){
                    fs.writeFile(descriptior,dat,function(err){
                        if(!err){
                            fs.close(descriptior,function(err){
                                if(!err){
                                    callback(false);
                                }else{  
                                    callback("close file error " + err);
                                }
                            });
                        }else{
                            callback("update file failed " + err);
                        }
                    });
                }else{
                    callback("truncate file error " + err);
                }
            });

        }else{
            callback("the err is "+err);
        }
    });
 }

 lib.delete = function(dir,file,callback){
    fs.unlink(base+dir+"/"+file+".json",function(err){
        if(!err){
            callback(false);
        }else{
            console.log("remove file failed " + err);
        }
    });
 }



 module.exports = lib;