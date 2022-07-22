// 打开视频
function playVideo(domId,timeout){
  var divId = domId;
  var param = new Object();
	param.divId = divId;
	param.url = $("#"+divId).attr("url");
	var width = $("#"+divId).css("width").replace("px","");
	var height = $("#"+divId).css("height").replace("px","");
	
	if(width/height >= 16/9){
		width = height*(16/9);
	}else{
		height = width*(9/16);
	}
	
	param.width = width+"px";
	param.height = height+"px";
	param.callback = function(e){
		if(e.status==100 || e.status==-100){
			SHDialog.showGloableMsg(divId.replace("scr","")+"无视频");
		}
		//待获取视频帧再显示画面
		if(e.error == 1 || e.status==8){
      console.log("点播成功["+param.url+"]");
		}
	}
	creartPlayerV(param, 1, timeout);
}

// 关闭视频
function closeVideo(domId){
	uscStop(domId);
}