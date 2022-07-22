/*Example: 
https://www.javascripture.com/JSON
*/

self.importScripts("common.js");

function Downloader() {
  this.logger = new Logger("Downloader");
  this.ws = null;
}

Downloader.prototype.getFileInfo = function (url, port, protocol) {
  this.logger.logInfo("Getting file size " + url + ".");
  var size = 0;
  var status = 0;
  var reported = false;

  if (this.ws != null)
    this.logger.logInfo("getFileInfo," + url + " ws  already connected..");

  this.ws = new WebSocket(protocol + "://" + port); //The flsh server IP & Port. 
  this.ws.binaryType = 'arraybuffer';
  this.ws.onopen = function () {
    // Web Socket �������ϣ�ʹ�� send() ������������
    console.log("ws connected, " + url + "send data...");

    var objData = {
      t: kGetFileInfoRsp,
      i: {
        sz: 0,
        st: 1
      }
    };

    //this.logger.logInfo("File size " + size + " bytes, status " + status + ".");
    self.postMessage(objData);
  };

  this.ws.onclose = function (evt) {
    var objData = {
      t: kWsClosed,
    };
    self.postMessage(objData);
  };

  this.ws.onerror = function (evt) {
    var objData = {
      t: kGetFileInfoRsp,
      i: {
        sz: 0,
        st: -1
      }
    };
    self.postMessage(objData);
  };

  this.ws.onmessage = function (evt) {
    var objData = {
      t: kFileData,
      d: evt.data,
    };
    self.postMessage(objData, [objData.d]);

  }.bind(this);
};

Downloader.prototype.sendPlayRequest = function (url) {
  this.logger.logInfo("send playing json request for " + url);

  var rootJ = {};
  rootJ.dev_url = url;
  rootJ.action = "play";
  var jsonStr = JSON.stringify(rootJ);
  let urlArray = new TextEncoder("utf-8").encode(jsonStr);
  let bUrlArray = new Int8Array(urlArray);

  var urlLen = urlArray.length;

  // The ws has frame struct, so no require to add my header. 
  //	var sendArray = new ArrayBuffer(urlLen+4);
  //	var bArray = new Int8Array(sendArray);
  //	bArray.set(bUrlArray,4); 

  //	bArray[0] = 0x24;
  //	bArray[1] = 0xC0;	 //Command. 
  //	bArray[2] = 0x00; 
  //	bArray[3] = urlLen; 
  //		console.log(new TextDecoder("utf-8").decode(bArray));

  //	this.ws.send(bArray);
  this.ws.send(bUrlArray);
  this.logger.logInfo("send play json out ...");
};


self.downloader = new Downloader();

self.onmessage = function (evt) {
  if (!self.downloader) {
    console.log("[ER] Downloader not initialized!");
    return;
  }
  var objData = evt.data;

  //	console.log("downloader processReq " + objData.t + ".");
  switch (objData.t) {
    case kGetFileInfoReq:
      self.downloader.getFileInfo(objData.u, objData.p, objData.w);
      break;
    case kDownloadFileReq:
      self.downloader.sendPlayRequest(objData.u);
      break;
    case kCloseDownloaderReq:
      console.log("close ws ...");
      self.downloader.ws.close();
      self.downloader.ws = null;
      break;
    default:
      self.downloader.logger.logError("Unsupport messsage " + objData.t);
  }
};