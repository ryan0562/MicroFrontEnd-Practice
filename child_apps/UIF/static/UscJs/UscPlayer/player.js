//Decoder states.
const decoderStateIdle = 0;
const decoderStateInitializing = 1;
const decoderStateReady = 2;
const decoderStateFinished = 3;

//Player states.
const playerStateIdle = 0;
const playerStatePlaying = 1;
const playerStatePausing = 2;
const playerStateClosing = 3;

//Constant.
const maxVideoFrameQueueSize = 16;
const downloadSpeedByteRateCoef = 1.5;

//WS state
const wsConnected = 0;
const wsTryingClose = 1;
const wsClosed = 2;

function FileInfo(url) {
  this.url = url;
  this.size = 0;
  this.offset = 0;
  //    this.chunkSize = 65536;
  this.chunkSize = 8388608; //8M.
}

function Player() {
  this.fileInfo = null;
  this.pcmPlayer = null;
  this.canvas = null;
  this.webglPlayer = null;
  this.callback = null;
  this.waitHeaderLength = 65536; //4M bytes, about 4s.  to 0.5M
  this.progress_bar = 0;
  //   this.waitHeaderLength   = 8;   //8 frames, by Shaohua, not data length. 
  this.codec_id = 0;
  this.duration = 0;
  this.pixFmt = 0;
  this.videoWidth = 0;
  this.videoHeight = 0;
  this.yLength = 0;
  this.uvLength = 0;
  this.audioTimeOffset = 0;
  this.decoderState = decoderStateIdle;
  this.playerState = playerStateIdle;
  this.decoding = false;
  this.displaying = false;
  //    this.decodeInterval     = 5;
  this.decodeInterval = 20; //Change longer ...
  this.audioQueue = [];
  this.videoQueue = [];
  this.videoRendererTimer = null;
  this.downloadTimer = null;
  this.chunkInterval = 200;
  this.timeLabel = null;
  this.timeTrack = null;
  this.trackTimer = null;
  this.trackTimerInterval = 500;
  this.displayDuration = "00:00:00";
  this.wsState = wsClosed;
  this.appref = null;
  this.startTryTimes = 0;
  this.userTryTimes = 0;
  this.playTryTimer = null;
  this.port = 1936;
  this.logger = new Logger("Player");
  this.alreadyReportError = 0;
  this.is_preview = 0;
  this.initDownloadWorker();
  this.initDecodeWorker();
}

Player.prototype.initDownloadWorker = function () {
  var self = this;
  this.downloadWorker = new Worker("static/UscJs/UscPlayer/downloader.js");
  this.downloadWorker.onmessage = function (evt) {
    var objData = evt.data;
    switch (objData.t) {
      case kGetFileInfoRsp:
        self.onGetFileInfo(objData.i);
        break;
      case kFileData:
        self.onFileData(objData.d);
        break;
      case kWsClosed:
        self.onWsClosed();
        break;
    }
  }
};

Player.prototype.initDecodeWorker = function () {
  var self = this;
  this.decodeWorker = new Worker("static/UscJs/UscPlayer/decoder.js");
  this.decodeWorker.onmessage = function (evt) {
    var objData = evt.data;
    switch (objData.t) {
      case kInitDecoderRsp:
        self.onInitDecoder(objData);
        break;
      case kOpenDecoderRsp:
        self.onOpenDecoder(objData);
        break;
      case kVideoFrame:
        self.onVideoFrame(objData);
        break;
      case kAudioFrame:
        self.onAudioFrame(objData);
        break;
      case kDecodeFinishedEvt:
        self.onDecodeFinished(objData);
        break;
      case kVideoParaEvt:
        self.onVideoParaEvent(objData);
        break;
      case kConStatusEvt:
        self.onStatusEvent(objData);
        break;
      case kCloseDecoderRsp:
        self.onDecodeClosed(objData);
        break;
      case kDecoderRelRsp:
        self.onDecodeReleased(objData);
        break;
      case kRcvDataLengh:
        self.onFileDataReceived(objData);
        break;
    }
  }
};

Player.prototype.playLu = function (url, port, canvas, callback, codec, preview, appref) {

  this.startTryTimes = 0;
  this.userTryTimes++;
  this.callback = callback;
  this.appref = appref;
  //	this.fileInfo = new FileInfo(url);
  //	this.canvas = canvas;
  //	this.codec_id = codec; 
  //	this.port = port; 
  this.is_preview = preview;

  this.logger.logInfo("PlayLu " + url + ".");

  var ret = {
    e: 0,
    m: "Success"
  };

  do {
    if (!url) {
      ret = {
        e: -3,
        m: "Invalid url"
      };
      this.logger.logError("[ER] playVideo error, url empty.");
      break;
    }

    if (!canvas) {
      ret = {
        e: -4,
        m: "Canvas not set"
      };
      this.logger.logError("[ER] playVideo error, canvas empty for " + url);
      break;
    }

    if (!this.downloadWorker) {
      ret = {
        e: -5,
        m: "Downloader not initialized"
      };
      this.logger.logError("[ER] Downloader not initialized for " + url);
      break;
    }

    if (!this.decodeWorker) {
      ret = {
        e: -6,
        m: "Decoder not initialized"
      };
      this.logger.logError("[ER] Decoder not initialized for " + url);
      break;
    }

    if (this.playerState == playerStatePlaying) {
      var ret = {
        e: -1,
        m: "Stop current firstly!"
      };
      break;
    }

    if (this.wsState == wsConnected) {
      this.logger.logInfo("Play new " + url + " before old WS not closed. ");

      var ret = {
        e: -1,
        m: "Stop current firstly!"
      };
      break;
    } else if (this.wsState == wsTryingClose) {
      this.logger.logInfo("Try play after 1s ");
      this.playTryTimer = setTimeout(() => {
        this.play(url, port, canvas, codec);
      }, 1000); //1s try again. 
      break;
    }

    this.play(url, port, canvas, codec);

  } while (false);

  return ret;
};



Player.prototype.play = function (url, port, canvas, codec) {
  this.logger.logInfo("Play " + url + ".");

  do {
    if (this.wsState == wsTryingClose) {
      this.logger.logInfo("Play new url before but the old WS is not stoped. " + this.wsState + ", this.startTryTimes = " + this.startTryTimes);

      if (this.startTryTimes < 5) //Max trying times. 
      {
        this.startTryTimes++;
        this.playTryTimer = setTimeout(() => {
          this.play(url, port, canvas, codec);
        }, 1000); //1s try again. 
      } else {
        this.wsState = wsClosed;
        this.playerState = playerStateIdle;
      }
      this.logger.logInfo("Play new url, now wsState is: " + this.wsState);

      break;
    }

    if (this.playerState == playerStateClosing) {
      this.logger.logInfo("Play new url before old url is not stoped. ");

      if (this.startTryTimes < 5) //Max trying times. 
      {
        this.startTryTimes++;
        this.playTryTimer = setTimeout(() => {
          this.play(url, port, canvas, codec);
        }, 1000); //1s try again. 
      } else {
        this.playerState = playerStateIdle;
        this.wsState = wsClosed;
      }
      break;
    }
    this.playTryTimer = null;

    this.fileInfo = new FileInfo(url);
    this.canvas = canvas;
    this.codec_id = codec;
    this.port = port;
    this.waitHeaderLength = this.waitHeaderLength;
    this.playerState = playerStatePlaying;
    this.startTrackTimer();
    this.userTryTimes = 0;
    //var playCanvasContext = playCanvas.getContext("2d"); //If get 2d, webgl will be disabled.
    if (this.webglPlayer == null) {
      this.webglPlayer = new WebGLPlayer(this.canvas, {
        preserveDrawingBuffer: false
      });
    }
    var req = {
      t: kGetFileInfoReq,
      u: this.fileInfo.url,
      p: this.port,
      w: window.location.protocol.toLowerCase().startsWith("https") ? "wss" : "ws"
    };
    this.downloadWorker.postMessage(req);
  } while (false);

  if (this.userTryTimes > 5) {
    this.logger.logInfo("Play new url, now wsState is: " + this.wsState);
    this.reportPlayError(-3, 0, "try again later!!");
  }
};


Player.prototype.pause = function () {
  this.logger.logInfo("Pause.");

  //Do not stop downloader for background buffering.
  var ret = {
    e: 0,
    m: "Success"
  };

  return ret;
};

Player.prototype.resume = function () {
  this.logger.logInfo("Resume.");

  var ret = {
    e: 0,
    m: "Success"
  };
  return ret;
};

Player.prototype.muteAudio = function () {
  this.logger.logInfo("muteAudio.");

  var req = {
    t: kMuteAudioReq,
    i: 1
  };
  this.decodeWorker.postMessage(req);


  var ret = {
    e: 0,
    m: "Success"
  };
  return ret;
};

Player.prototype.playAudio = function () {
  this.logger.logInfo("PlayAudio.");

  var req = {
    t: kMuteAudioReq,
    i: 0
  };

  this.decodeWorker.postMessage(req);

  var ret = {
    e: 0,
    m: "Success"
  };
  return ret;
};

// sean
Player.prototype.destory = function () {    
  this.stop();    
  this.downloadWorker.terminate();   
  this.decodeWorker.terminate();
}

Player.prototype.stop = function () {
  this.userWantClose = 1;
  if (this.fileInfo != null)
    this.logger.logInfo("Stop url " + this.fileInfo.url + ", this.playerState: " + this.playerState + ", this.wsState" + this.wsState);
  else
    this.logger.logInfo("Stop");

  if ((this.playerState == playerStateIdle) && (this.wsState == wsClosed)) {
    var ret = {
      e: -1,
      m: "Not playing"
    };

    return ret;
  }
  this.logger.logInfo("trying to stop 1...");

  if (this.playTryTimer != null) {
    clearTimeout(this.playTryTimer);
  }

  this.logger.logInfo("trying to stop 2. this.playerState: " + this.playerState + ", this.wsState" + this.wsState);

  if ((this.wsState == wsTryingClose) && (this.playerState == playerStateClosing)) {
    var ret = {
      e: -1,
      m: "Last one are not closing, just return!"
    };

    return ret;
  }

  this.logger.logInfo("trying to stop the play...");

  if (this.wsState == wsConnected)
    this.wsState = wsTryingClose;

  if (this.playerState == playerStatePlaying)
    this.playerState = playerStateClosing;

  if (this.videoRendererTimer != null) {
    clearTimeout(this.videoRendererTimer);
    this.videoRendererTimer = null;
    this.logger.logInfo("Video renderer timer stopped.");
  }

  var req = {
    t: kCloseDownloaderReq
  };
  this.downloadWorker.postMessage(req);

  if (this.pcmPlayer) {
    this.pcmPlayer.destroy();
    this.pcmPlayer = null;
    this.logger.logInfo("Pcm player released.");
  }

  this.logger.logInfo("Closing decoder.");

  this.decodeWorker.postMessage({
    t: kCloseDecoderReq
  });

  /*
      this.logger.logInfo("Uniniting decoder.");
      this.decodeWorker.postMessage({
          t: kUninitDecoderReq
      });
  */
  //	  this.stopDownloadTimer();
  this.stopTrackTimer();

  this.fileInfo = null;
  //	this.canvas 			= null;
  this.webglPlayer = null;
  //	this.callback			= null;
  this.duration = 0;
  this.pixFmt = 0;
  this.videoWidth = 0;
  this.videoHeight = 0;
  this.yLength = 0;
  this.uvLength = 0;
  this.audioTimeOffset = 0;
  this.decoding = false;
  this.displaying = false;
  this.audioQueue = [];
  this.videoQueue = [];
  this.decoderState = decoderStateIdle;
  this.progress_bar = 0;
  this.alreadyReportError = 0;

  //Wait for lower C lib stop finished, then change the state. 	
  //	this.playerState		= playerStateIdle;

  return ret;
};

Player.prototype.fullscreen = function () {
  if (this.webglPlayer) {
    this.webglPlayer.fullscreen();
  }
};

Player.prototype.getState = function () {
  return this.playerState;
}

Player.prototype.setTrack = function (timeTrack, timeLabel) {
  this.timeTrack = timeTrack;
  this.timeLabel = timeLabel;

  if (this.timeTrack) {
    var self = this;
    this.timeTrack.onchange = function () {
      self.logger.logInfo("track " + self.timeTrack.value);
    }
  }
}

Player.prototype.onGetFileInfo = function (info) {
  if (this.playerState == playerStateIdle) {
    return;
  }

  this.logger.logInfo("Got file size rsp:" + info.st + "ws state: " + this.wsState);

  if (info.st == 1) {
    this.fileInfo.size = info.sz;
    this.logger.logInfo("Initializing decoder for " + this.fileInfo.url);
    this.wsState = wsConnected;
    var req = {
      t: kInitDecoderReq,
      s: this.codec_id,
      c: this.fileInfo.chunkSize,
      u: this.fileInfo.url
    };

    this.decodeWorker.postMessage(req);

    if (this.is_preview == 1) {
      var req = {
        t: KSetPreviewFlag,
        i: 1
      };

      this.decodeWorker.postMessage(req);
    }

    //Actually, this is send play request out. 
    var req = {
      t: kDownloadFileReq,
      u: this.fileInfo.url,
    };
    this.downloadWorker.postMessage(req);
  } else if (this.wsState != wsTryingClose) {
    if (this.playerState == playerStatePlaying)
      this.reportPlayError(-1, info.st);
    //return; 
  }
};

Player.prototype.onFileData = function (data) {

  if (this.wsState == wsTryingClose)
    return;

  if (this.fileInfo == null) {
    this.logger.logInfo(" Got packet in error state, discard it.");
    return;
  }
  //  this.logger.logInfo("Got data bytes, post to decoder. ");
  if (this.playerState == playerStateIdle) {
    return;
  }

  var objData = {
    t: kFeedDataReq,
    d: data
  };
  //	this.fileInfo.offset += data.length;  can't get the length.
  //	this.logger.logInfo(" recive file length: " + this.fileInfo.offset + ", data length" + data.length );

  this.decodeWorker.postMessage(objData, [objData.d]);

  switch (this.decoderState) {
    case decoderStateIdle:
      this.onFileDataUnderDecoderIdle();
      break;
    case decoderStateInitializing:
      this.onFileDataUnderDecoderInitializing();
      break;
    case decoderStateReady:
      this.onFileDataUnderDecoderReady();
      break;
  }
};

Player.prototype.onWsClosed = function () {
  this.logger.logInfo(" ws closed resp received.");
  this.wsState = wsClosed;

  if (this.playerState == playerStatePlaying) {
    this.reportPlayError(-99, 0, "stream breakout"); //Infor upper close the player. 
  }
};

Player.prototype.onFileDataUnderDecoderIdle = function () {

  if (this.fileInfo.offset >= this.waitHeaderLength) {

    this.logger.logInfo("Opening decoder for url " + this.fileInfo.url);
    this.decoderState = decoderStateInitializing;
    var req = {
      t: kOpenDecoderReq
    };
    this.decodeWorker.postMessage(req);
    this.reportPlayError(1, 8, "Start decoding...");
  } else {
    if (this.progress_bar == 0) {
      if (this.fileInfo.offset > this.waitHeaderLength / 8) {
        this.progress_bar = 1;
        this.reportPlayError(1, 1, "Bufferring...");
      }
    } else if (this.progress_bar == 1) {
      if (this.fileInfo.offset > this.waitHeaderLength / 4) {
        this.progress_bar = 2;
        this.reportPlayError(1, 2, "Bufferring...");
      }
    } else if (this.progress_bar == 2) {
      if (this.fileInfo.offset > this.waitHeaderLength * 3 / 8) {
        this.progress_bar = 3;
        this.reportPlayError(1, 3, "Bufferring...");
      }
    } else if (this.progress_bar == 3) {
      if (this.fileInfo.offset > this.waitHeaderLength / 2) {
        this.progress_bar = 4;
        this.reportPlayError(1, 4, "Bufferring...");
      }
    } else if (this.progress_bar == 4) {
      if (this.fileInfo.offset > this.waitHeaderLength * 5 / 8) {
        this.progress_bar = 5;
        this.reportPlayError(1, 5, "Bufferring...");
      }
    } else if (this.progress_bar == 5) {
      if (this.fileInfo.offset > this.waitHeaderLength * 3 / 4) {
        this.progress_bar = 6;
        this.reportPlayError(1, 6, "Bufferring...");
      }
    } else if (this.progress_bar == 6) {
      if (this.fileInfo.offset > this.waitHeaderLength * 7 / 8) {
        this.progress_bar = 7;
        this.reportPlayError(1, 7, "Bufferring...");
      }
    }
  }

  this.downloadOneChunk();
};

Player.prototype.onFileDataUnderDecoderInitializing = function () {
  this.downloadOneChunk();
};

Player.prototype.onFileDataUnderDecoderReady = function () {
  this.downloadOneChunk();
};

Player.prototype.onInitDecoder = function (objData) {
  if (this.playerState == playerStateIdle) {
    return;
  }

  this.logger.logInfo("Init decoder response " + objData.e + " for url " + this.fileInfo.url);
  if (objData.e == 0) {
    this.downloadOneChunk();
  } else {
    //        this.reportPlayError(objData.e);
    this.reportPlayError(-10, 0, "Decoder init error");
  }
};

Player.prototype.onOpenDecoder = function (objData) {
  if (this.playerState == playerStateIdle) {
    return;
  }

  this.logger.logInfo("Open decoder response " + objData.e + "for url " + this.fileInfo.url);
  if (objData.e == 0) {
    this.onVideoParam(objData.v);
    this.onAudioParam(objData.a);
    this.decoderState = decoderStateReady;
    this.logger.logInfo("Decoder ready now.");
    this.startDecoding();
  } else {
    //        this.reportPlayError(objData.e);
    this.reportPlayError(-11, 0, "Open init error");
  }
};

Player.prototype.onVideoParam = function (v) {
  if (this.playerState == playerStateIdle) {
    return;
  }

  this.logger.logInfo("Video param duation:" + v.d + " pixFmt:" + v.p + " width:" + v.w + " height:" + v.h + ".");
  this.duration = v.d;
  this.pixFmt = v.p;
  //this.canvas.width = v.w;
  //this.canvas.height = v.h;
  this.videoWidth = v.w;
  this.videoHeight = v.h;
  this.yLength = this.videoWidth * this.videoHeight;
  this.uvLength = (this.videoWidth / 2) * (this.videoHeight / 2);

  /*
  //var playCanvasContext = playCanvas.getContext("2d"); //If get 2d, webgl will be disabled.
  this.webglPlayer = new WebGLPlayer(this.canvas, {
      preserveDrawingBuffer: false
  });
  */

  if (this.timeTrack) {
    this.timeTrack.min = 0;
    this.timeTrack.max = this.duration;
    this.timeTrack.value = 0;
    this.displayDuration = this.formatTime(this.duration / 1000);
  }

  var byteRate = 1000 * this.fileInfo.size / this.duration;
  var targetSpeed = downloadSpeedByteRateCoef * byteRate;
  var chunkPerSecond = targetSpeed / this.fileInfo.chunkSize;
  this.chunkInterval = 1000 / chunkPerSecond;

  //    this.startDownloadTimer();  by Shaohua.

  this.logger.logInfo("Byte rate:" + byteRate + " target speed:" + targetSpeed + " chunk interval:" + this.chunkInterval + ".");
};

Player.prototype.onAudioParam = function (a) {
  if (this.playerState == playerStateIdle) {
    return;
  }

  this.logger.logInfo("Audio param sampleFmt:" + a.f + " channels:" + a.c + " sampleRate:" + a.r + ".");

  var sampleFmt = a.f;
  var channels = a.c;
  var sampleRate = a.r;

  var encoding = "16bitInt";
  switch (sampleFmt) {
    case 0:
      encoding = "8bitInt";
      break;
    case 1:
      encoding = "16bitInt";
      break;
    case 2:
      encoding = "32bitInt";
      break;
    case 3:
      encoding = "32bitFloat";
      break;
    default:
      this.logger.logError("Unsupported audio sampleFmt " + sampleFmt + "!");
  }
  this.logger.logInfo("Audio encoding " + encoding + ".");

  this.pcmPlayer = new PCMPlayer({
    encoding: encoding,
    channels: channels,
    sampleRate: sampleRate,
    flushingTime: 5000
  });

  this.audioTimeOffset = this.pcmPlayer.getTimestamp();
};

Player.prototype.onAudioFrame = function (frame) {
  switch (this.playerState) {
    case playerStatePlaying: //Directly display audio.
      this.pcmPlayer.play(new Uint8Array(frame.d));
      break;
    case playerStatePausing: //Temp cache.
      this.audioQueue.push(new Uint8Array(frame.d));
      break;
    default:
  }
};

Player.prototype.onVideoParaEvent = function (objData) {
  this.videoWidth = objData.w;
  this.videoHeight = objData.h;
  this.resize(this.canvas, objData)
  this.yLength = this.videoWidth * this.videoHeight;
  this.uvLength = (this.videoWidth / 2) * (this.videoHeight / 2);
};

Player.prototype.onStatusEvent = function (objData) {
  var error = objData.e;
  if (error == -99)
    this.reportPlayError(-99, 0, "stream breakout");
  else
    this.reportPlayError(-2, error, "Setup connection fail");
};

Player.prototype.onFileDataReceived = function (objData) {
  var len = objData.l;

  if ((this.wsState == wsTryingClose) ||
    (this.wsState == wsClosed))
    return;

  if (this.fileInfo.offset < this.waitHeaderLength)
    this.fileInfo.offset += len;
};


Player.prototype.onDecodeFinished = function (objData) {
  this.pauseDecoding();
  this.decoderState = decoderStateFinished;
};

Player.prototype.onDecodeClosed = function (objData) {
  this.logger.logError("Decoder closed successfully, release decoder!");
  this.decodeWorker.postMessage({
    t: kUninitDecoderReq
  });
};

Player.prototype.onDecodeReleased = function (objData) {
  this.logger.logError("Decoder released successfully!");
  this.playerState = playerStateIdle;
};

Player.prototype.onVideoFrame = function (frame) {
  if (this.playerState == playerStateIdle) {
    return;
  }

  if (this.wsState == wsTryingClose)
    return;

  if (!this.displaying && this.playerState == playerStatePlaying) {
    this.displaying = true;
    this.displayVideoFrame(frame);
  }
  /* Not buffer anymore. 2019.12.13 by Shaohua.
  	else {
          //Queue video frames for memory controlling.
          this.videoQueue.push(frame);
          if (this.videoQueue.length >= maxVideoFrameQueueSize) {
              if (this.decoding) {
                  //this.logger.logInfo("Image queue size >= " + maxVideoFrameQueueSize + ", pause decoding.");
                  this.pauseDecoding();
              }
          }
      }
  */
};

Player.prototype.displayVideoFrame = function (frame) {
  //   var data = new Uint8Array(frame.d);	
  this.renderVideoFrame(frame.d);

  /* We will sync based on video, but not audio.  so change here by Shaohua.
      var audioTimestamp = this.pcmPlayer.getTimestamp() - this.audioTimeOffset;
      var delay = frame.s - audioTimestamp;
      var data = new Uint8Array(frame.d);

      if (audioTimestamp <= 0 || delay <= 0) {
          this.renderVideoFrame(data);
          //this.logger.logInfo("Direct render, video frame ts: " + frame.s + " audio ts:" + audioTimestamp);
      } else {
          this.delayRenderVideoFrame(data, delay * 1000);
          //this.logger.logInfo("Delay render, video frame ts: " + frame.s + " audio ts:" + audioTimestamp + " delay:" + delay * 1000);
      }
  */
};

Player.prototype.displayNextVideoFrame = function () {
  setTimeout(() => {
    if (this.playerState != playerStatePlaying) {
      return;
    }

    if (this.videoQueue.length == 0) {
      this.displaying = false;
      return;
    }

    var frame = this.videoQueue.shift();
    this.displayVideoFrame(frame);
    if (this.videoQueue.length < maxVideoFrameQueueSize / 2) {
      if (!this.decoding) {
        //this.logger.logInfo("Image queue size < " + maxVideoFrameQueueSize / 2 + ", restart decoding.");
        this.startDecoding();
      }
    }
  }, 0);
};


Player.prototype.resize = function (canvas, objData) {
  // Lookup the size the browser is displaying the canvas.
  console.log("recive data:", objData)
  if (objData !== undefined) {
    canvas.videoData = objData
  }
  //older code ,save
  let videoData = canvas.videoData
  if (videoData === undefined) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width != displayWidth ||
      canvas.height != displayHeight) {

      // Make the canvas the same size
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  } else {
    let wraper = canvas.parentNode
    wraper.style.width = "100%"
    wraper.style.display = "flex"
    wraper.style.justifyContent = "center"
    wraper.style.alignItems = "center"

    let wraperWidth = wraper.clientWidth
    let wraperHeight = wraper.clientHeight
    let wrapeRadio = wraperWidth / wraperHeight
    let contentRadio = videoData.w / videoData.h
    //resize
    if (wrapeRadio > contentRadio) { //wraper is more wider
      canvas.height = wraperHeight;
      canvas.style.height = wraperHeight + "px"
      canvas.width = wraperHeight / videoData.h * videoData.w
      canvas.style.width = wraperHeight / videoData.h * videoData.w + "px"
    } else {
      canvas.width = wraperWidth
      canvas.style.width = wraperWidth + "px"
      canvas.height = wraperWidth / videoData.w * videoData.h
      canvas.style.height = wraperWidth / videoData.w * videoData.h + "px"
    }
    //routate
    if (videoData.v !== null && videoData.v !== undefined) {
      let deg = parseInt(videoData.v.toString(2).substr(-2), 2) * 90
      let scale = 1
      if (deg !== 0 && deg !== 180) {
        scale = Math.min(wraperWidth / canvas.height, wraperHeight / canvas.width)
      }
      canvas.style.transform = `rotateZ(${deg}deg) scale(${scale})`
    }
  }
};

Player.prototype.renderVideoFrame = function (data) {
  if (this.wsState == wsTryingClose)
    return;
  // this.resize(this.canvas);
  this.webglPlayer.renderFrame(data, this.videoWidth, this.videoHeight, this.yLength, this.uvLength);

  if (this.is_preview == 1) {
    this.reportPlayError(2, 1, "Render video frame ...");
  }

  if (this.videoQueue.length == 0) {
    if (this.decoderState == decoderStateFinished) {
      this.reportPlayError(0, 0, "Finished");
      this.stop();
    } else {
      this.displaying = false;
    }
  } else {
    this.displayNextVideoFrame();
  }
};

Player.prototype.delayRenderVideoFrame = function (data, delay) {
  var self = this;
  this.videoRendererTimer = setTimeout(function () {
    self.renderVideoFrame(data);
    self.videoRendererTimer = null;
  }, delay);
};

Player.prototype.downloadOneChunk = function () {
  //Donothing here, Server will send data auto to client. 

};

Player.prototype.startDownloadTimer = function () {
  var self = this;
  this.downloadTimer = setInterval(function () {
    self.downloadOneChunk();
  }, this.chunkInterval);
};

Player.prototype.stopDownloadTimer = function () {
  if (this.downloadTimer != null) {
    clearInterval(this.downloadTimer);
    this.downloadTimer = null;
    this.logger.logInfo("Download timer stopped.");
  }
};

Player.prototype.startTrackTimer = function () {
  var self = this;
  this.trackTimer = setInterval(function () {
    self.updateTrackTime();
  }, this.trackTimerInterval);
};

Player.prototype.stopTrackTimer = function () {
  if (this.trackTimer != null) {
    clearInterval(this.trackTimer);
    this.trackTimer = null;
  }
};

Player.prototype.updateTrackTime = function () {
  if (this.playerState == playerStatePlaying && this.pcmPlayer) {
    var currentPlayTime = this.pcmPlayer.getTimestamp();
    if (this.timeTrack) {
      this.timeTrack.value = 1000 * currentPlayTime;
    }

    if (this.timeLabel) {
      this.timeLabel.innerHTML = this.formatTime(currentPlayTime) + "/" + this.displayDuration;
    }
  }
};

Player.prototype.startDecoding = function () {
  var req = {
    t: kStartDecodingReq,
    i: this.decodeInterval
  };
  this.decodeWorker.postMessage(req);
  this.decoding = true;
};

Player.prototype.pauseDecoding = function () {
  var req = {
    t: kPauseDecodingReq
  };
  this.decodeWorker.postMessage(req);
  this.decoding = false;
};

Player.prototype.formatTime = function (s) {
  var h = Math.floor(s / 3600) < 10 ? '0' + Math.floor(s / 3600) : Math.floor(s / 3600);
  var m = Math.floor((s / 60 % 60)) < 10 ? '0' + Math.floor((s / 60 % 60)) : Math.floor((s / 60 % 60));
  var s = Math.floor((s % 60)) < 10 ? '0' + Math.floor((s % 60)) : Math.floor((s % 60));
  return result = h + ":" + m + ":" + s;
}

Player.prototype.reportPlayError = function (error, status, message) {
  var e = {
    error: error || 0,
    status: status || 0,
    message: message,
    ref: this.appref
  };


  if (this.fileInfo == null)
    this.logger.logInfo("reportPlayError, error = " + error + ", status = " + status + "for url  NULL ");
  else
    this.logger.logInfo("reportPlayError, error = " + error + ", status = " + status + "for url " + this.fileInfo.url);

  if ((this.alreadyReportError == 0) || (status == -12)) //Just report once. 
  {
    if (this.callback) {
      this.callback(e);
    }
  }

  if (error < 0)
    this.alreadyReportError = 1;

};