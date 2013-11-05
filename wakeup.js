var GossipThief=require('./gossipSource.js').INST;
var assert=require('assert');
var Poster=require('./poster.js').INST;


var Worker=function(){
  var iSigns={};
  var iCallback=null;
  var iInfo={};
  var iThief=null;
  var iStatePoster=null;

  var iToday=0;

  /**
   * 创建@的文字，发表出去后就是@的效果
   * @param name
   * @param id
   * @return {String}
   */
  var buildAtString=function(name , id){
    return '@' + name +'('+id+') ';//末尾有个空格的
  }

  var getNowTimeString=function(){
    var dt=new Date();
    var dtstr='';
    dtstr += dt.getFullYear()+'-';
    dtstr += (dt.getMonth()+1)+'-';
    dtstr += dt.getDate() +'_';
    dtstr += dt.getHours()+':';
    dtstr += dt.getMinutes()+':';
    dtstr += dt.getSeconds();
    return dtstr;
  }

  var getNowDate=function(){
    var dt=new Date();
    var dtVal=0;
    dtVal += 10000*dt.getFullYear();
    dtVal += 100*(dt.getMonth()+1);
    dtVal += dt.getDate();
    return dtVal;
  }

  var caseFirstValidSign=function(gossip){
    assert(typeof gossip == 'object');
    iSigns[gossip.cid].curSignTime=getNowTimeString();
    iSigns[gossip.cid].totalSign=(iSigns[gossip.cid].totalSign || 0) +1;
    iSigns[gossip.cid].curSignDate=getNowDate();

    if(iSigns[gossip.cid].curSignDate != iToday){
      //第二天到了
      iToday=iSigns[gossip.cid].curSignDate;
      iSigns.serial=0;
    }
    iSigns.serial =(iSigns.serial || 0) + 1;

    var statemsg='';
    statemsg += '[NO.'+iSigns.serial+']';
    statemsg += buildAtString(gossip.name,gossip.cid)+' ';
    statemsg += '签到:['+ iSigns[gossip.cid].curSignTime +']';
    if(iSigns[gossip.cid].lastSignTime){
      statemsg += '上次签到:['+iSigns[gossip.cid].lastSignTime+']';
    }
    statemsg += '累计签到次数:'+iSigns[gossip.cid].totalSign;
    iSigns[gossip.cid].lastSignTime = iSigns[gossip.cid].curSignTime;
    iStatePoster.addPost(statemsg);

  }

  var gossipCallback=function(pageid,gsList){
    if(gsList && gsList.length > 0){
      var gossip=gsList[0];
      var newID=parseInt(gossip.replyid);
      var oldID=iSigns.lastReplyID || 0;
      if(newID > oldID){
        iSigns.lastReplyID = newID;
        console.log(gsList);
        if(!iSigns[gossip.cid]){
          iSigns[gossip.cid]={};
        }

        if(iSigns[gossip.cid].curSignDate != getNowDate()){
          caseFirstValidSign(gossip);
        }else{
          var statemsg=buildAtString(gossip.name,gossip.cid)+' 重复签到!';
          console.log(statemsg);
        }

        iCallback(null,iSigns);
      }
    }
    setTimeout(getOneGossip , 5000);
  }

  var getOneGossip=function(){
    iThief.getGossipList(iInfo.uid,iInfo.Cookie,1,gossipCallback);
  }

  this.start=function(logininfo,signs,callback){
    assert(typeof logininfo === 'object');
    assert(typeof signs === 'object');
    assert(typeof callback === 'function');
    iSigns=signs;
    iCallback=callback;
    iInfo=logininfo;
    iThief=new GossipThief();
    iStatePoster=new Poster(logininfo);
    iToday=getNowDate();
    console.log('Start Working!');
    getOneGossip();
  }
}











exports.INST=Worker;


