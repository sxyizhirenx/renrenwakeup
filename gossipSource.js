var assert=require('assert');
var Spider = require('easyspider').Spider;


var GossipSource=function(){

  var spider = new Spider();

  var maxMsgLen;

  var pageId;

  var cookie;

  var callbackfn;

  var washGossip=function(err,$){
    if(err){
      console.log('err spider!');
      callbackfn(pageId,[]);
    }else{
      var msgList=[];
      $('.clearfix .commentbox').each(function(){
        var replyid=this.parent().attr('name');
        var msg=this.children('.content').text().trim();
        var cid=this.children('.header').children('.poster').attr('cid');
        var poster=this.children('.header').children('.poster').children('a').text();
        var replyidHeader = 'reply_';
        if(replyid.indexOf(replyidHeader) == 0){
          replyid = replyid.substr(replyidHeader.length);
        }

        if(replyid && msg && cid){
          var tmpObj={};
          tmpObj.replyid=replyid;
          tmpObj.msg=msg;
          tmpObj.cid=cid;
          tmpObj.name=poster;
          msgList.push(tmpObj);
        }

        if(msgList.length >= maxMsgLen){
          return false;//退出each
        }

      });
      callbackfn(pageId,msgList);
    }

  }

  this.getGossipList=function(pageid,cookiejar,maxLen,callback){
    maxMsgLen = maxLen;
    pageId=pageid;
    assert(typeof cookiejar == 'object');
    cookie=cookiejar;//实际上是一个cookie对象

    assert(typeof callback == 'function');
    callbackfn = callback;


    if(pageId && cookie){
      console.log('get Gossip['+pageId+']');
      var url='http://page.renren.com/gossip/list?pid=' + pageId;

      spider.route(url,{cookiejar:cookie},washGossip);

    }
  }

}



exports.INST=GossipSource;



