/**
 * 创建视频
 */
var players = new Object();
var fullPlayer = new Player();

function createVideo(config, playeV) {
  config = config || {};
  var divId = config.divId;
  if (divId == null || divId == "" || divId == undefined) {
    SHDialog.showGloableMsg("请指定参数divId");
    return;
  }
  if (divId.indexOf("video_scr") > -1) {
    divId = divId.replace("video_", "");
  }
  if (divId.indexOf("jindu") > -1) {
    SHDialog.showGloableMsg("操作过于频繁，请稍候再试");
    if (undefined !== config.loadIndex && config.loadIndex !== null) {
      // top.layer.close(config.loadIndex);
    }
    return;
  }
  var videoId = config.videoId || "video_" + divId;
  var url = config.url;
  var width = config.width || $("#" + divId).width();
  var height = config.height || $("#" + divId).height();
  $("#" + divId + " div").hide();

  if ($("#" + videoId + "jindu").length > 0) {
    $("#" + videoId + "jindu").remove();
  }
  var x2 = document.createElement("CANVAS");
  x2.setAttribute("id", videoId + "jindu");
  x2.setAttribute("width", width);
  x2.setAttribute("height", height);
  x2.setAttribute("class", "ccb loading");
  document.getElementById(divId).appendChild(x2);
  var canvas2 = document.getElementById(videoId + "jindu");
  //转圈
  var ctx = canvas2.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = canvas2.height / 30;
  ctx.strokeStyle = '#3af';
  ctx.arc(canvas2.width / 2, canvas2.height / 2, canvas2.height / 6, 0, 1.2 * Math.PI);
  ctx.stroke();
  $("#" + videoId).hide();

  var canvas = document.getElementById(videoId);
  $("#" + videoId).width(width);
  $("#" + videoId).height(height);

  if (url != null && url != "") {
    var flaship = "";
    var path = "";
    var isPreview = 0;
    if (undefined != config.isPreview) {
      isPreview = config.isPreview; //预览
      console.log("-----Preview ");
    }
    flaship = url.substring(0, url.lastIndexOf("/"));
    path = url.substr(url.lastIndexOf("/") + 1)

    var player = getUSCPlayer(videoId, playeV);
    console.log(" playVideo >>elem: isFull:" + playeV.isFull + " " + path + " " + videoId + " url:" + config.url + " canvas width:" + $("#" + videoId).width() + " height:" + $("#" + videoId).height());
    var data = {
      config: config,
      ctx: ctx,
      canvas2: canvas2,
      videoId: videoId,
      divId: divId
    };
    var ret = player.playLu(path, flaship, canvas, playCallback, 0, isPreview, data);
    if (ret.e < 0) {
      console.log("play[elem:" + videoId + " url:" + config.url + "] fail e:" + ret.e + " m:" + ret.m);
      uscStop(videoId); //video_scr0
      //如果有等待条，关闭等待条
      if ((config.loadindex != "") && (config.loadindex != undefined)) {
        // top.layer.close(config.loadindex);
      }
      // top.layer.alert("操作频繁，请稍后再试！");
    } else {
      $("#" + divId).attr("url", config.url); //scr0
    }
    console.log(" playVideo end >>elem:" + path + " " + videoId + " url:" + config.url);
  }
  return;
}

function playCallback(e) {
  var config = e.ref.config;
  var videoId = e.ref.videoId;
  var divId = e.ref.divId;
  var canvas2 = e.ref.canvas2;
  var ctx = e.ref.ctx;

  var streamId = e.ref.config.url.substr(e.ref.config.url.lastIndexOf("/") + 1)

  if ($("#" + videoId + "jindu").length > 0) { //有返回或报错时，结束转圈
    if ($("#" + videoId + "jindu").attr("class").indexOf("ccb") > -1) {
      $("#" + videoId + "jindu").removeClass("ccb");
      ctx.clearRect(0, 0, canvas2.width, canvas2.height);
    }
  }
  if (e.error == 1) { //返回进度上报时，加载进度条
    if (e.status == 8) { //返回8个buffer后(8帧)，开始播放，删除进度条
      $("#" + videoId + "jindu").remove();
      console.log("playVideo callback >>elem:" + videoId + " url:" + config.url);
      if (config.callback) {
        config.callback(e);
      }
      $("#" + videoId).show();
    } else {
      var arr = [];
      for (var i = 0; i < 8; i++) {
        if (i < e.status) {
          ctx.fillStyle = "green";
        } else {
          ctx.fillStyle = "bisque";
        }
        ctx.fillRect(canvas2.width / 2 - 110 + 30 * i, canvas2.height / 2, 20, 8);
      }
    }
  } else if (e.error === 2) { //获取到1帧画面
    if (config.callback) {
      config.callback(e);
    }
  } else {
    console.log("streamId:" + streamId + " " + videoId + " 错误error:" + e.error + " status:" + e.status);
    if (e.error < 0) {
      var desc = "";
      if ("" != config.name && undefined != config.name) {
        desc = "【" + config.name + "】";
      }
      if ((e.error == -2) && (e.status == -12)) {
        console.log("Re-create player because old player crash !!!!!!!!!!");
        createPlayerRePlay(config);
      } else {
        // top.layer.confirm(desc + "视频连接中断，返回错误码[" + e.error + "]状态码[" + e.status + "]", {
        //   btn: ['确定']
        // }, function () {
        //   // top.layer.close(top.layer.index);
        //   console.log("用户确认关闭视频" + videoId);
        //   if ((undefined != parent) && (undefined != parent.menuId) && (1 == parent.menuId)) {
        //     //视频监控
        //     if (typeof (stopVideo) == 'function') {
        //       stopVideo(videoId);
        //     }
        //   }
        //   if (top.menuid == "99.04") {
        //     //调度
        //     if (typeof (stopVideo) == 'function') {
        //       stopVideo(videoId.replace("video_scr", ""));
        //     }
        //   }
        // });
      }
      //截图预览失败触发回调
      if (undefined !== e.ref.config.isPreview && e.ref.config.isPreview === 1) {
        config.callback(e);
      }
    }
  }
  /*else if(e.error == -99){
		console.log("错误error:"+e.error+" status:"+e.status);
		SHDialog.showGloableMsg("超时，无流超时,请检查源后重新连接");
		rePlay(config, 1500);
	}else if(e.error == -1){
		console.log("错误error:"+e.error+" status:"+e.status);
		var url = config.url;
		if(isPlaying[url] == 1){//触发重连机制后，重连连不上的情况，继续重连
            console.log("WS连接服务器失败，"+reTishi+"分钟后重连");
			top.layer.open({
				  content: '<div class="topGloableTipMsg">WS连接服务器失败，'+reTishi+'分钟后重连</div>'
				  ,title:false
				  ,closeBtn:false
				  ,shade:false
				  ,time:3000
				  ,anim:5
				  ,btn:''
				});
			rePlay(config, 1500);
		}else{//第一次播放没连上，不重连
			top.layer.alert("WS连接服务器失败");
		}
	}else{
		console.log("错误error:"+e.error+" status:"+e.status);
		if(e.error == -2){
			if(e.status == -100){
				if(config.callback){
					config.callback(e);
				}
				rePlay(config, 1500);
				return false;
			}else if(e.status == -102){
				if(config.callback){
					config.callback(e);
				}
				rePlay(config);
				return false;
			}else if(e.status == -10 ||e.status == -11 || e.status == -12){
				console.log("网络错误，视频连接失败，错误码:"+e.status);
				if(config.callback){
					config.callback(e);
				}
				//rePlay(config);
				//自动刷新点播页面，规避错误
				if((undefined != parent) && (undefined != parent.menuId) && (1 == parent.menuId)){							
					top.location.href=top.location.href;
				}
				return false;
			}else{				
				top.layer.alert("网络错误，视频连接失败，错误码:"+e.status);
				//console.log("-----------playCallback: drawTextTip:"+videoId);
				//drawTextTip(videoId, "网络错误，视频连接失败，错误码:"+e.status);
			}
			
		}else if(e.error == 0){
			top.layer.alert("WS连接断开，播放完成");
		}else if(e.error == -10){
			top.layer.alert("初始化解码器失败");
		}else if(e.error == -11){
			top.layer.alert("打开解码器失败");
		}else if(e.error == -3){
			console.log("网络错误，视频连接失败，错误码:"+e.error);
			if(config.callback){
				config.callback(e);
			}
			rePlay(config);
			return false;
		}
		videoStop(videoId);
		$("#"+videoId).width("0");
		$("#"+divId+" div").show();
		$("#"+videoId+"jindu").remove();//删除canvas2
	}*/
}
/*
function rePlay(config, time){
	
	var videoId = config.videoId || "video_" + config.divId ;
	var url = config.url ;
	var divId = config.divId ;
	//重现获取高宽，比如监控切换分屏
	config.width = $("#"+divId).width();
	config.height = $("#"+divId).height();
	
	console.log("rePlay >>>elem:"+videoId+" url:"+config.url);
	videoStop(videoId);
	$("#"+videoId).width("0");
	$("#"+divId+" div").show();
	$("#"+videoId+"jindu").remove();//删除canvas2
	
	if(undefined == time ||  null == time){
		creartPlayerV(config, 0);
	}else{			
		creartPlayerV(config, 1, time);
	}
}*/
function createPlayerRePlay(config, time) {
  var videoId = config.videoId || "video_" + config.divId;
  var url = config.url;
  var divId = config.divId;
  //重现获取高宽，比如监控切换分屏
  config.width = $("#" + divId).width();
  config.height = $("#" + divId).height();

  console.log("rePlay >>>elem:" + videoId + " url:" + config.url);

  var player = getVideoPlayer(videoId);
  player.stop();
  //清除player，重新创建
  if (1 == players[videoId].isFull) {
    fullPlayer = null;
  } else {
    players[videoId].player = null;
  }

  $("#" + videoId).width("0");
  $("#" + divId + " div").show();
  $("#" + videoId + "jindu").remove(); //删除canvas2	
  creartPlayerV(config, 0);
}

//获取播放器
function getVideoPlayer(videoId) {
  var player = null;
  if (1 == players[videoId].isFull) {
    player = fullPlayer;
  } else {
    player = players[videoId].player;
  }
  return player;
}

function PlayerV(player, timeId) {
  this.player = player;
  this.timeId = timeId;
  this.isFull = 0;
}

function playerVtoString() {
  var arr = Object.keys(players);
  var str = "";
  for (i in arr) {
    var key = arr[i];
    var player = players[key].player;
    var url = "";
    if (null != player) {
      url = (player.fileInfo == null) ? "" : player.fileInfo.url;
    }
    str += "[" + key + "," + url + "," + players[key].timeId + "]";
  }
  return str;
}
/**
 * 获取播放器
 */
function getUSCPlayer(videoId, playeV) {
  if (1 == playeV.isFull) {
    console.log(" getUSCPlayer >> get fullPlayer");
    if (fullPlayer == null) {
      fullPlayer = new Player();
    }
    return fullPlayer; //全屏放大用单独的播放器
  } else {
    if (null != playeV && playeV.player) {
      console.log(" getUSCPlayer >>elem:" + videoId + " has player object");
    } else {
      var player = new Player();
      playeV.player = player;
      console.log(" getUSCPlayer >>elem:" + videoId + " create player object");
    }
    return playeV.player;
  }
}

/*
 * isTimeOut:是否延时播放，0-不延时   1-延时; timeout：超时时间；  isFull:是否全屏播放，0-不全屏  1-全屏
 * */
function creartPlayerV(config, isTimeout, timeout, isFull) {
  config = config || {};
  var divId = config.divId;
  if (divId == null || divId == "" || divId == undefined) {
    console.log("creartPlayerV 请指定参数divId");
    return;
  }
  if (divId.indexOf("video_scr") > -1) {
    divId = divId.replace("video_", "");
  }
  var videoId = config.videoId || "video_" + divId;
  var playerV = null;
  if (null == players[videoId]) {
    players[videoId] = new PlayerV(null, null);
  }
  playerV = players[videoId];
  if (1 == isFull) {
    playerV.isFull = isFull;
  }
  if (1 == isTimeout) {
    var time = 1500;
    if (undefined != timeout && null != timeout) {
      time = timeout;
    }
    var timeId = setTimeout(function () {
      console.log(" creartPlayerV >>elem:" + videoId + " timeId=" + timeId + ", players count[" + Object.keys(players).length + "] " + playerVtoString());
      if (1 == isFull) {
        console.log(divId + " player fullscreen..");
        //$("#"+divId).show();
        $("#pingFull").show();
        var fullarea = document.getElementById("" + divId);
        toScreenFull(fullarea);
        config.width = window.screen.width;
        config.height = window.screen.height;
      }
      createVideo(config, playerV);

    }, time);
    playerV.timeId = timeId;
  } else {
    console.log(" creartPlayerV >>elem:" + videoId + ", players count[" + Object.keys(players).length + "] " + playerVtoString());
    if (1 == isFull) {
      console.log(divId + " player fullscreen..");
      //$("#"+divId).show();
      $("#pingFull").show();
      var fullarea = document.getElementById("" + divId);
      toScreenFull(fullarea);
      config.width = window.screen.width;
      config.height = window.screen.height;
    }
    createVideo(config, playerV);
  }
}

/*
 * 停止视频
 * */
function videoStop(videoId) {
  if (null == players[videoId]) {
    return false;
  }
  //清除定时器
  if (null != players[videoId].timeId) {
    window.clearTimeout(players[videoId].timeId);
    console.log(" stopVideo >>elem: " + videoId + " clear timerId[" + players[videoId].timeId + "]");
    players[videoId].timeId = null;
  }
  var player = getVideoPlayer(videoId);
  if (player == null)
    return false;
  var url = (player.fileInfo == null) ? "" : player.fileInfo.url;
  console.log(" stopVideo >>elem:" + videoId + " isFull:" + players[videoId].isFull + " url:[" + url + "]");
  // player.stop();
  player.destory(); // sean
  players[videoId].isFull = 0;

  //清除记录
  var divid = videoId.replace("video_", "");
  $("#" + divid).attr("url", "");
  console.log(" stopVideo end>>elem:" + videoId + " url:[" + url + "], players count[" + Object.keys(players).length + "] " + playerVtoString());
  //players[divId].player = null;
  return true;
}
/*
 * 开关伴音
 * */
function audioSwitch(videoId, flag) {
  if (null == players[videoId]) {
    return false;
  }
  var player = players[videoId].player;
  if (player == null)
    return false;
  if (flag == 0) {
    player.muteAudio();
  } else {
    player.playAudio();
  }
}
/**
 * 停止容器视频
 */
function uscStop(divId) {
  players[divId] = null; // sean
  if (divId.indexOf("video_scr") < 0) {
    divId = "video_" + divId;
  }
  var i = divId.split("video_scr")[1];
  //监控页面且不等于全屏用的播放器,40表示全屏放大专用ID
  if ((undefined != parent) && (undefined != parent.menuId) && (1 == parent.menuId) && i != 40) {
    var strUrl = top.video_sbUrl;
    if (strUrl) {
      urlObj = strUrl.split(",");
      if (0 == urlObj[i]) {
        console.log("video_scr" + i + " no play");
        return;
      }
      urlObj[i] = 0;
      top.video_sbUrl = urlObj.join(",");
      sbUrl = urlObj.join(",");
    }
  }
  var ret = videoStop(divId);
  if (true != ret) {
    return;
  }
  /*$("#"+divId).width("0");*/
  $("#" + divId).hide();
  $("#scr" + i + " div").show();
  if ($("#" + divId + "jindu").length > 0) {
    $("#" + divId + "jindu").remove();
  }
  var webgl = document.getElementById(divId);
  var gl = webgl.getContext("webgl") || webgl.getContext("experimental-webgl");
  initShader(gl); // 初始化着色器
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // 指定清空canvas的颜色
  gl.clear(gl.COLOR_BUFFER_BIT); // 清空canvas
}
/**
 * 停止容器预览
 */
function uscStopPreview(divId) {
  if (divId.indexOf("video_scr") < 0) {
    divId = "video_" + divId;
  }
  var i = divId.split("video_scr")[1];
  var ret = videoStop(divId);
  if (true != ret) {
    return;
  }
  if ($("#" + divId + "jindu").length > 0) {
    $("#" + divId + "jindu").remove();
  }
}
/**
 * 进入全屏
 */
var quanPing = new Object();

function uscShowFull(vdodivId, param) {
  /*var player = players[vdodivId].player;
  if(player == null)
  	return ;
  */
  var isFirefox = navigator.userAgent.toUpperCase().indexOf("FIREFOX") > -1 ? true : false;
  console.log("isFirefox:" + isFirefox);
  /*var index = top.layer.load(0, {
  	  shade: [0.5,'#000'], //0.1透明度的白色背景
  	  content: '进入全屏模式...'
  	});*/
  //param.loadindex = index;
  param.callback = function (e) {
    //待获取视频帧再全屏显示
    //top.layer.close(index);
    if (e.error == 1 || e.status == 8) {
      console.log("play callback..");
      //playerScreenFull(vdodivId);//浏览器有时不响应
    }
  }
  if (isFirefox) {
    creartPlayerV(param, 0, 0, 1);
  } else {
    //creartPlayerV(param, 0, 0, 1);
    creartPlayerV(param, 1, 500, 1); //谷歌可以延时执行全屏
    console.log("setTimeout creartPlayerV");
  }
}

//全屏放大
function playerScreenFull(videoId) {
  var divId = videoId.replace("video_", "")
  var fullarea = document.getElementById("" + divId);
  toScreenFull(fullarea);
  /*
  var streamId = getStreamId(videoId);
  if("" == streamId){
  	return false;
  }
  var player = players[streamId].player;
  if(player == null)
  	return ;
  player.fullscreen();*/
  console.log("go fullscreen");
}

//转圈 videoId的值为：video_scr0
function drawCircleJindu(videoId) {
  if ($("#" + videoId + "jindu").attr("class").indexOf("ccb") == -1) {
    return;
  }
  if ($("#" + videoId + "jindu").length > 0) {
    $("#" + videoId + "jindu").remove();
  }
  var pId = videoId.replace("video_", "");
  var x2 = document.createElement("CANVAS");
  x2.setAttribute("id", videoId + "jindu");
  x2.setAttribute("width", $("#" + pId).width());
  x2.setAttribute("height", $("#" + pId).height());
  x2.setAttribute("class", "ccb loading");
  x2.setAttribute("display", "");
  document.getElementById(pId).appendChild(x2);
  var canvas = document.getElementById(videoId + "jindu");

  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.lineWidth = canvas.height / 30;
  ctx.strokeStyle = '#3af';
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 6, 0, 1.2 * Math.PI);
  ctx.stroke();
}

//顶点着色器源码
var vertexShaderSrc = `
void main(){
 gl_Position = vec4(0.0, 0.0, 0.0, 1.0);// gl_Position 内置变量，表示点的位置，必须赋值
 gl_PointSize = 10.0;// gl_PointSize 内置变量，表示点的大小（单位像素），可以不赋值，默认为1.0，，绘制单个点时才生效
}`;

//片段着色器源码
var fragmentShaderSrc = `
void main(){
 gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);// 内存变量，表示片元颜色RGBA
}`;

// 初始化使用的shader
function initShader(gl) {
  var vertexShader = gl.createShader(gl.VERTEX_SHADER); // 创建顶点着色器
  gl.shaderSource(vertexShader, vertexShaderSrc); // 绑定顶点着色器源码
  gl.compileShader(vertexShader); // 编译定点着色器

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); // 创建片段着色器
  gl.shaderSource(fragmentShader, fragmentShaderSrc); // 绑定片段着色器源码
  gl.compileShader(fragmentShader); // 编译片段着色器

  var shaderProgram = gl.createProgram(); // 创建着色器程序
  gl.attachShader(shaderProgram, vertexShader); // 指定顶点着色器
  gl.attachShader(shaderProgram, fragmentShader); // 指定片段着色色器
  gl.linkProgram(shaderProgram); // 链接程序
  gl.useProgram(shaderProgram); //使用着色器
}

/*
 * 切屏
 */
function switchCanvas(types) {
  var showarr = [];
  let heights = "100%";
  let widths = "100%";
  $(".narmal").hide();

  if (types == 13) {
    $(".thirteen").show();
    heights = "23%";
    widths = "23%";
    showarr2 = [0, 1, 2, 3, 9, 10, 11, 12];
    for (var i in showarr2) {
      $(".narmal").eq(i).show().width(widths).height(heights);
    }
    showarr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return showarr;
  } else {
    $(".thirteen").hide();
    if (types == 1) {
      showarr = [0];
      heights = "98%";
      widths = "98%";
      showarr = [0];
    }
    if (types == 2) {
      heights = "98%";
      widths = "48%";
      showarr = [0, 1];
    }
    if (types == 4) {
      heights = "48%";
      widths = "48%";
      showarr = [0, 1, 2, 3];
    }
    if (types == 6) {
      heights = "48%";
      widths = (100 / 3 - 2) + "%";
      showarr = [0, 1, 2, 3, 9, 10];
    }
    if (types == 9) {
      heights = (100 / 3 - 2) + "%";
      widths = (100 / 3 - 2) + "%";
      showarr = [0, 1, 2, 3, 9, 10, 11, 12, 13];
    }
    /*if(types == 16){
    	heights = "25%";
    	widths = "25%";		
    }
    if(types == 25){
    	heights = "20%";
    	widths = "20%";	
    }
    if(types == 36){
    	heights = (100/6)+"%";
    	widths = (100/6)+"%";	
    }*/

    for (var i in showarr) {
      $(".narmal").eq(i).show().width(widths).height(heights);
    }
  }
  return showarr;
}