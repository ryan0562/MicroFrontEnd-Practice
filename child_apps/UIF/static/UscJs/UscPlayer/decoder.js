self.Module = {
  onRuntimeInitialized: function () {
    onWasmLoaded();
  }
};

console.log(typeof (self));
self.importScripts("common.js");
self.importScripts("libffmpeg.js");

function Decoder() {
  this.logger = new Logger("Decoder");
  this.coreLogLevel = 0;
  this.wasmLoaded = false;
  this.tmpReqQue = [];
  this.cacheBuffer = null;
  this.decodeTimer = null;
  this.videoCallback = null;
  this.audioCallback = null;
  this.videoParaCallBack = null;
  this.statusCallBack = null;
  this.cacheLength = 8388608;
  this.muteAudioSwitch = 1;
  this.oomAlready = 0;
  this.dec_preview = 0;
  this.dec_frame = 0;
  this.url = null;
}

Decoder.prototype.initDecoder = function (codecId, chunkSize, url) {
  this.url = url;
  //    var ret = Module._initDecoder(codecId, this.coreLogLevel, url);
  var ret = Module._initDecoder(codecId, 3, url); //3 is warning. 
  //      var ret = Module._initDecoder(codecId, 5, url);   //3 is warning. 

  this.logger.logInfo("initDecoder return " + ret + "for url " + url);
  if (0 == ret) {
    this.cacheLength = chunkSize;
    this.cacheBuffer = Module._malloc(chunkSize);
  }
  var objData = {
    t: kInitDecoderRsp,
    e: ret
  };
  self.postMessage(objData);
};

Decoder.prototype.uninitDecoder = function () {
  var ret = Module._uninitDecoder();
  this.logger.logInfo("Uninit ffmpeg decoder return " + ret + " for url " + this.url);
  if (this.cacheBuffer != null) {
    Module._free(this.cacheBuffer);
    this.cacheBuffer = null;
  }
  var objData = {
    t: kDecoderRelRsp,
  };
  self.postMessage(objData);
};

Decoder.prototype.openDecoder = function () {
  var paramCount = 7,
    paramSize = 4;
  var paramByteBuffer = Module._malloc(paramCount * paramSize);
  var ret = Module._openDecoder(paramByteBuffer, paramCount, this.videoCallback, this.audioCallback, this.videoParaCallBack, this.statusCallBack);
  this.logger.logInfo("openDecoder return " + ret);

  if (ret == 0) {
    var paramIntBuff = paramByteBuffer >> 2;
    var paramArray = Module.HEAP32.subarray(paramIntBuff, paramIntBuff + paramCount);
    var duration = paramArray[0];
    var videoPixFmt = paramArray[1];
    var videoWidth = paramArray[2];
    var videoHeight = paramArray[3];
    var audioSampleFmt = paramArray[4];
    var audioChannels = paramArray[5];
    var audioSampleRate = paramArray[6];

    var objData = {
      t: kOpenDecoderRsp,
      e: ret,
      v: {
        d: duration,
        p: videoPixFmt,
        w: videoWidth,
        h: videoHeight
      },
      a: {
        f: audioSampleFmt,
        c: audioChannels,
        r: audioSampleRate
      }
    };
    self.postMessage(objData);
  } else {
    var objData = {
      t: kOpenDecoderRsp,
      e: ret
    };
    self.postMessage(objData);
  }
  this.dec_frame = 0;
  Module._free(paramByteBuffer);
};

Decoder.prototype.closeDecoder = function () {
  this.logger.logInfo("closeDecoder for url " + this.url);
  if (this.decodeTimer) {
    clearInterval(this.decodeTimer);
    this.decodeTimer = null;
    this.logger.logInfo("Decode timer stopped.");
  }

  //Delay 1s to close decoder... 
  var timeId = setTimeout(function () {
    self.decoder.logger.logInfo("Close ffmpeg decoder  for url " + this.url);
    var ret = Module._closeDecoder();

    var objData = {
      t: kCloseDecoderRsp,
      e: 0
    };
    self.postMessage(objData);
  }, 2000);
};

Decoder.prototype.startDecoding = function (interval) {
  //this.logger.logInfo("Start decoding.");
  if (this.decodeTimer) {
    clearInterval(this.decodeTimer);
  }
  this.decodeTimer = setInterval(this.decode, interval);
};

Decoder.prototype.pauseDecoding = function () {
  //this.logger.logInfo("Pause decoding.");
  if (this.decodeTimer) {
    clearInterval(this.decodeTimer);
    this.decodeTimer = null;
  }
};

Decoder.prototype.decode = function () {
  try {
    var ret = Module._decodeOnePacket();
    if (ret == 7) {
      self.decoder.logger.logInfo("Decoder finished.");
      self.decoder.pauseDecoding();
      var objData = {
        t: kDecodeFinishedEvt,
      };
      self.postMessage(objData);
    }
  } catch (e) {
    var errmsg = e.message;
    self.decoder.logger.logInfo("decode exception: " + e);
    self.decoder.logger.logInfo("decode exception message: " + errmsg);
    /*
    js���쳣e����e.message��e.lineNumber֮�⻹��һ����Ҫ������e.name

    e.name��������,

    e.message�������ϸ��Ϣ.

    Error.name������ֵ��Ӧ����Ϣ��

    1.EvalError��eval()��ʹ���붨�岻һ��

    2.RangeError����ֵԽ��

    3.ReferenceError���Ƿ�����ʶ���������ֵ

    4.SyntaxError�������﷨��������

    5.TypeError�����������ʹ���

    6.URIError��URI������ʹ�ò���
    */
    //		if((errmsg.indexOf("out") > 0)||(errmsg.indexOf("OOM") > 0))
    //		{
    if (self.decoder.oomAlready == 0) {
      var objData = {
        t: kConStatusEvt,
        e: -12,
      };
      self.postMessage(objData);
      self.decoder.oomAlready = 1; //Just report once. 
    }
    //		}
  }
};

Decoder.prototype.sendData = function (data) {
  var typedArray = new Uint8Array(data);
  var error = 0;
  var dLen = typedArray.length;

  if (dLen > 0) //Tell player the data length received. 
  {
    var objData = {
      t: kRcvDataLengh,
      l: dLen,
    };
    self.postMessage(objData);
  }

  if (dLen <= this.cacheLength) {
    try {
      Module.HEAPU8.set(typedArray, this.cacheBuffer);
      error = Module._sendData(this.cacheBuffer, dLen);

      if ((error < 0) && (error != -10)) //Report error back.  always get -10, as switch 4 window to 9 windows. 
      {
        var objData = {
          t: kConStatusEvt,
          e: error,
        };
        self.postMessage(objData);
      }
    } catch (e) {
      var errmsg = e.message; //the msg is just "undefined". 
      this.logger.logInfo("sendData exception: " + e);
      this.logger.logInfo("sendData exception message: " + errmsg);

      //			if((errmsg.indexOf("out") > 0)||(errmsg.indexOf("OOM") > 0))
      //			{
      if (self.decoder.oomAlready == 0) {
        var objData = {
          t: kConStatusEvt,
          e: -12,
        };
        self.postMessage(objData);
        self.decoder.oomAlready = 1; //Just report once. 
      }
      //			}			
    }
  } else {
    this.logger.logInfo("Send data to decoder, too long length = " + dLen + " for url " + this.url);
    var times = dLen / this.cacheLength;
    for (var i = 0; i < times; i++) {
      var arrary = typedArray.slice(this.cacheLength * i, this.cacheLength * (i + 1) - 1);
      Module.HEAPU8.set(arrary, this.cacheBuffer);
      Module._sendData(this.cacheBuffer, this.cacheLength);
    }

    var left = dLen - times * this.cacheLength;
    if (left > 0) {
      var arrary = typedArray.slice(this.cacheLength * times);
      Module.HEAPU8.set(arrary, this.cacheBuffer);
      Module._sendData(this.cacheBuffer, left);
    }
  }
  //	this.logger.logInfo("Send data to decoder, length = " + typedArray.length);
};

Decoder.prototype.muteAudio = function (mute) {
  this.muteAudioSwitch = mute;
  this.logger.logInfo("Set audio mute flag = " + mute);
};

Decoder.prototype.setPreview = function (preview) {
  this.is_preview = preview;
  this.logger.logInfo("Set preview flag = " + preview);
};


Decoder.prototype.processReq = function (req) {
  //this.logger.logInfo("processReq " + req.t + ".");
  switch (req.t) {
    case kInitDecoderReq:
      this.initDecoder(req.s, req.c, req.u);
      break;
    case kUninitDecoderReq:
      this.uninitDecoder();
      break;
    case kOpenDecoderReq:
      this.openDecoder();
      break;
    case kCloseDecoderReq:
      this.closeDecoder();
      break;
    case kStartDecodingReq:
      this.startDecoding(req.i);
      break;
    case kPauseDecodingReq:
      this.pauseDecoding();
      break;
    case kFeedDataReq:
      this.sendData(req.d);
      break;
    case kMuteAudioReq:
      this.muteAudio(req.i);
      break;
    case KSetPreviewFlag:
      this.setPreview(req.i);
      break;
    default:
      this.logger.logError("Unsupport messsage " + req.t);
  }
};

Decoder.prototype.cacheReq = function (req) {
  if (req) {
    this.tmpReqQue.push(req);
  }
};

Decoder.prototype.onWasmLoaded = function () {
  this.logger.logInfo("Wasm loaded.");
  this.wasmLoaded = true;

  this.videoCallback = Module.addFunction(function (buff, size, timestamp) {
    var outArray = Module.HEAPU8.subarray(buff, buff + size);
    var data = new Uint8Array(outArray);
    var objData = {
      t: kVideoFrame,
      s: timestamp,
      d: data
    };
    self.decoder.logger.logInfo("video frame call back ");
    self.postMessage(objData, [objData.d.buffer]);
  }, 'viii');

  this.audioCallback = Module.addFunction(function (buff, size, type) {
    var outArray = Module.HEAPU8.subarray(buff, buff + size);
    var data = new Uint8Array(outArray);

    if (type == 0) {
      var objData = {
        t: kVideoFrame,
        s: 0,
        d: data
      };
      //			self.decoder.logger.logInfo("video frame call back ");			

      if (self.decoder.is_preview == 1) {
        self.decoder.dec_frame++;
        if (self.decoder.dec_frame == 1)
          self.postMessage(objData, [objData.d.buffer]);
      } else
        self.postMessage(objData, [objData.d.buffer]);
    } else {
      var objData = {
        t: kAudioFrame,
        d: data
      };

      if (self.decoder.muteAudioSwitch == 0)
        self.postMessage(objData, [objData.d.buffer]);
      //			else
      //				self.decoder.logger.logInfo("audio frame call back, muted here !!!");					
    }
  }, 'viii');

  this.videoParaCallBack = Module.addFunction(function (width, height, cvo) {
    var objData = {
      t: kVideoParaEvt,
      w: width,
      h: height,
      v: cvo
    };
    self.decoder.logger.logInfo("videoParaCallBack call back, w: " + width + ", h: " + height + ", v: " + cvo);
    self.postMessage(objData);
  }, 'vii');

  this.statusCallBack = Module.addFunction(function (error) {
    self.decoder.logger.logInfo("State call back " + error + ".");
    var objData = {
      t: kConStatusEvt,
      e: error,
    };
    self.postMessage(objData);
  }, 'vi');

  while (this.tmpReqQue.length > 0) {
    var req = this.tmpReqQue.shift();
    this.processReq(req);
  }
};

self.decoder = new Decoder;

self.onmessage = function (evt) {
  if (!self.decoder) {
    console.log("[ER] Decoder not initialized!");
    return;
  }

  var req = evt.data;
  if (!self.decoder.wasmLoaded) {
    self.decoder.cacheReq(req);
    self.decoder.logger.logInfo("Temp cache req " + req.t + ".");
    return;
  }

  self.decoder.processReq(req);
};

function onWasmLoaded() {
  if (self.decoder) {
    self.decoder.onWasmLoaded();
  } else {
    console.log("[ER] No decoder!");
  }
}