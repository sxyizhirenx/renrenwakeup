/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-11-5
 * Time: 下午10:46
 * To change this template use File | Settings | File Templates.
 */

var fs=require('fs');
var Login=new (require('renrenlogin').INST)();
var worker=new (require('./wakeup.js').INST)();



//从持久化的cookie信息直接登录，不需要提交密码信息（如果发现cookie已经失效了，则会重新尝试密码登录）
function loginFromFile(){
  var account=JSON.parse(fs.readFileSync('info.txt','utf8'));
  Login.setAccount(account);
  Login.onekeyLogin(function(err,info){
    if(info.logined){
      fs.writeFileSync('info.txt',JSON.stringify(info,null,4), 'utf8');
      wakeupWork(info);
    }else{
      console.log("Login Error!");
    }
  });

}


function wakeupWork(info){
  var signs=JSON.parse(fs.readFileSync('sign.txt','utf8'));
  worker.start(info,signs,function(err,newdata){
    if(!err){
      fs.writeFile('sign.txt',JSON.stringify(newdata,null,4), 'utf8',function(){console.log('Flush Data.');});
    }else{
      console.log(err);
    }
  })
}

loginFromFile();
