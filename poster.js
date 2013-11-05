var Step=require('step');
var querystring=require('querystring');
var Request=require('request-5291');

function Poster(loginInfo){
  var LoginInfo=loginInfo;
  var token=LoginInfo.token;
  var postList=[];   //要post的对象
  var lock=false;       //http lock
  var dftWaitTime=1000;
  var visitPostTime=15;   //20s
  var myRequest=Request.defaults({
    jar:LoginInfo.Cookie,
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 5.1; rv:19.0) Gecko/20100101 Firefox/19.0'
    }
  });

  this.addPost=function(msginfo){
    var msgBlock=buildOneStateBlock(msginfo);
    postList.push(msgBlock);
  }


  var buildOneStateBlock=function(msg){
    var uid=LoginInfo.uid;
    var msgblock={
      submit:'http://shell.renren.com/'+uid+'/status',
      parameter:{
        'channel':'renren',
        'content':msg,
        'hostid':uid,
        '_rtk':token._rtk,
        'requestToken':token.requestToken
      },
      type:NOFYTYPE.NOFY_PUBLISHSTATUS
    };
    if(msgblock.parameter.content.length > 240){
      msgblock.parameter.content=msgblock.parameter.content.substr(0,240);
    }
    return msgblock;
  }



  /**
   * 状态列表的类型（起初只放状态，后来只要一次提交能完成的都放进去了），不通类型的提交返回的内容会不同
   * @type {Object}
   */
  var NOFYTYPE={
    NOFY_STATE:0,
    NOFY_STATE_REPLY:1,
    NOFY_GOSSIP:2,
    NOFY_PUBLISHSTATUS:3,
    NOFY_DELGOSSIP:4,
    NOFY_DESCRIPT_PICTURE:5,
    NOFY_USER_REPLY:6,
    NOFY_OTHER:100
  };

  /**
   * 不停查询，有了就进行post
   * @return {Number}
   */
  var visitPostList=function(){
    if(lock || !postList || postList.length ==0){
      return setTimeout(visitPostList,dftWaitTime);
    }
    var postBlock=postList.shift();
    posttingBlock(postBlock);
    setTimeout(visitPostList,visitPostTime*1000);
  }

  /**
   * post消息
   * @param msgblock
   */
  var posttingBlock=function(msgblock){
    lock = true;
    Step(
      function(){
        var postData=(msgblock.parameter);
        var url=msgblock.submit;
        /*
        var headers={
          'Referer':'www.renren.com'
          ,'Accept-Language': 'zh-cn'
          ,'Content-Type':'application/x-www-form-urlencoded'
          ,'Connection': 'Keep-Alive'
          ,'Cache-Control': 'no-cache'
        };

       var retType=getRetTypeByPostType(msgblock.type);
        myRequest.post(url,LoginInfo.Cookie,postData,headers,msgblock,retType,this);
        */
        myRequest.post({url:url,form:postData,json:true},this);
        console.log('【posting an reply!】');
        console.log(postData);
      },
      function(error,response,body){
        var httpSucc=(!error && response.statusCode === 200) && (typeof body == 'object' && body.code == 0) ;
        if(!httpSucc){
          onPostFail(msgblock);
        }
        lock=false;
      }
    );
  }

  /**
   * 增加重试次数加1，返回是否满最大尝试次数
   * @param obj
   * @param maxTryTime
   * @return {Boolean}
   */
  var addTryTimeAndWhetherFull=function(obj,maxTryTime){
    if(typeof obj != 'object'){
      return false;
    }
    if(typeof maxTryTime != 'number'){
      maxTryTime = 3;
    }
    if(!obj.tryTime){
      obj.tryTime = 1;
    }else{
      obj.tryTime ++;
    }
    if(obj.tryTime >= maxTryTime){
      return true;
    }
    return false;
  }

  var onPostFail=function(msgblock){
    if(!addTryTimeAndWhetherFull(msgblock)){
      //塞回队列继续尝试
      postList.unshift(msgblock);
    }else{
      //尝试3次后就放弃了
      console.log('Fail after try 3 Times.');
    }
  }


  visitPostList();

}



exports.INST=Poster;
