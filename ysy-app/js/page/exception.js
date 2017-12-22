/*!
 * 异常上报
 */
(function($,w,doc) {
	
	var url = API_URL+ '/api/update/updateException';
	
	mui.init();
	mui('.mui-scroll-wrapper').scroll();

	//图片相关
	var picIndex = 1;  //图片位置(数量)
	var size = 0;  //图片文件总大小
	var imageIndexIdNum = 0; //已选择待上传的图片数量
	var maxImageNum = 1; //最多允许上传的图片数量

	var feedback = {
		shipInfoId: document.getElementById('shipInfoId'), 
		abnormalTime: document.getElementById('abnormalTime'),
		abnormalType: document.getElementById('abnormalType'),
		longitude: document.getElementById('longitude'),
		latitude:document.getElementById('latitude'),
		abnormalAddress: document.getElementById('abnormalAddress'),
		abnormalEvent: document.getElementById('abnormalEvent'),
		imageList: document.getElementById('image-list'),
		
		history: document.getElementById('history'), //hl
		empty: document.getElementById('empty'),  //le
		record: document.getElementById('record'), //er
		rtime: document.getElementById('rtime'), //rt
		play: document.getElementById('play'), //ep
		ptime: document.getElementById('ptime'), //pt
		progress: document.getElementById('progress'), //pp
		schedule: document.getElementById('schedule'), //ps
		voiceList: document.getElementById('voice-list'),
		btnStartRecord: document.getElementById('btnStartRecord'),
		btnStopRecord: document.getElementById('btnStopRecord'),
		btnCleanHistory: document.getElementById('btnCleanHistory'),
		btnStopPlay: document.getElementById('btnStopPlay'),
		history: document.getElementById('history'),

		submitBtn: document.getElementById('submit')
	};
	feedback.files = [];
	feedback.audios = [];
	feedback.uploader = null;  
	feedback.deviceInfo = null; 
	
	doc.addEventListener('initData', function(event) {
		feedback.clearForm();
		var shipInfoId = event.detail.shipInfoId;
		if(!shipInfoId) {
			return;
		}
		feedback.shipInfoId.value = shipInfoId;
		$(".callSgn")[0].innerText = event.detail.callSgn;
		$(".imoNum")[0].innerText = event.detail.imoNum;
		$(".mmsi")[0].innerText = event.detail.mmsi;
		$(".shipNameEn")[0].innerText = event.detail.shipNameEn;
		$(".shipNameCn")[0].innerText = event.detail.shipNameCn;
	});

	mui.plusReady(function() {
		// 获取音频目录对象
		plus.io.resolveLocalFileSystemURL('_doc/', function(entry){
			entry.getDirectory('audio/szg', {create:true}, function(dir){
				gentry = dir;
				//feedback.updateHistory();
			}, function(e){
				console.log('Get directory "audio" failed: '+e.message);
			});
		}, function(e){
			console.log('Resolve "_doc/" failed: '+e.message);
		} );
		
		getGeoLocation({
			sucCallback:function(p){
				if(p && p.address){
					feedback.longitude.value = p.coords.longitude;
					feedback.latitude.value = p.coords.latitude;
					// p.address.city + p.address.district + 
					feedback.abnormalAddress.value = p.addresses;
				}
			},
			errCallback:function(e){}}
		);
		//日期控件
		bindDateTimeEvent(mui('.dtpicker'));
		//设备信息，无需修改
		feedback.deviceInfo = {
			appid: plus.runtime.appid, 
			imei: plus.device.imei, //设备标识
			images: feedback.files, //图片文件
			p: mui.os.android ? 'a' : 'i', //平台类型，i表示iOS平台，a表示Android平台。
			md: plus.device.model, //设备型号
			app_version: plus.runtime.version,
			plus_version: plus.runtime.innerVersion, //基座版本号
			os:  mui.os.version,
			net: ''+plus.networkinfo.getCurrentType()
		}
	});
	
	/**
	 *提交成功之后，恢复表单项 
	 */
	feedback.clearForm = function() {
		//feedback.shipInfoId.value = '';
		feedback.abnormalTime.value = '';
		feedback.abnormalType.value = '';
		/*feedback.longitude.value = '';
		feedback.latitude.value = '';
		feedback.abnormalAddress.value = '';*/
		feedback.abnormalEvent.value = '';
		feedback.imageList.innerHTML = '';
		feedback.history.innerHTML = '';
		feedback.newPlaceholder();
		feedback.files = [];
		feedback.audios = [];
		picIndex = 1;
		audioIndex = 1;
		size = 0;
		voiceSize = 0;
		imageIndexIdNum = 0;
		
		if(feedback.btnStartRecord && feedback.btnStartRecord.classList.contains('mui-hidden')) {
			feedback.btnStartRecord.classList.remove('mui-hidden');
		}
		if(feedback.history && !feedback.history.classList.contains('mui-hidden')) {
			feedback.history.classList.add('mui-hidden');
		}
		if(feedback.btnCleanHistory && !feedback.btnCleanHistory.classList.contains('mui-hidden')) {
			feedback.btnCleanHistory.classList.add('mui-hidden');
		}
	};
	feedback.getFileInputArray = function() {
		return [].slice.call(feedback.imageList.querySelectorAll('.file'));
	};
	feedback.getVoiceArray = function() {
		return [].slice.call(feedback.history.querySelectorAll('li.ditem'));
	};
	feedback.addFile = function(path) {
		imageIndexIdNum++;
		feedback.files.push({name:"images"+picIndex,path:path,id:"img-"+picIndex});
		picIndex++;
	};
	feedback.addAudio = function(path) {
		feedback.audios.push({name:"audio"+audioIndex,path:path,id:"audio-"+audioIndex});
		audioIndex++;
	};
	/**
	 * 初始化图片域占位
	 */
	feedback.newPlaceholder = function() {
		var fileInputArray = feedback.getFileInputArray();
		if (fileInputArray &&
			fileInputArray.length > 0 &&
			fileInputArray[fileInputArray.length - 1].parentNode.classList.contains('space')) {
			return;
		};
		//imageIndexIdNum++;
		var placeholder = document.createElement('div');
		placeholder.setAttribute('class', 'image-item space');
		var up = document.createElement("div");
		up.setAttribute('class','image-up')
		//删除图片
		var closeButton = document.createElement('div');
		closeButton.setAttribute('class', 'image-close');
		closeButton.innerHTML = 'X';
		closeButton.id = "img-"+picIndex;
		//小X的点击事件
		closeButton.addEventListener('tap', function(event) {
			setTimeout(function() {
				for(var temp=0;temp<feedback.files.length;temp++){
					if(feedback.files[temp].id==closeButton.id){
						feedback.files.splice(temp,1);
					}
				}
				feedback.imageList.removeChild(placeholder);
				imageIndexIdNum--;
				feedback.newPlaceholder();
			}, 0);
			return false;
		}, false);
		
		//
		var fileInput = document.createElement('div');
		fileInput.setAttribute('class', 'file');
		fileInput.setAttribute('id', 'image-' + picIndex);
		fileInput.addEventListener('tap', function(event) {
			var self = this;
			var index = (this.id).substr(-1);
			
			//相册选图
			plus.gallery.pick(function(e) {
				console.log("event:"+e);
				var name = e.substr(e.lastIndexOf('/') + 1);
				console.log("name:"+name);
				
				//压缩
				plus.zip.compressImage({
					src: e,
					dst: '_doc/' + name,
					overwrite: true,
					quality: 50
				}, function(zip) {
					size += zip.size  
					console.log("zip.target: " + zip.target + ",filesize:"+zip.size+",totalsize:"+size);
					if (size > (10*1024*1024)) {
						return mui.toast('文件超大,请重新选择~');
					}
					if (!self.parentNode.classList.contains('space')) { //已有图片
						feedback.files.splice(index-1,1,{name:"images"+index,path:e,id:"img-"+index});
					} else { //加号
						placeholder.classList.remove('space');
						feedback.addFile(zip.target);//压缩后的文件
						if(imageIndexIdNum < maxImageNum){ //如果没有超过图片数量限制，则可以继续上传
							feedback.newPlaceholder();
						}
					}
					up.classList.remove('image-up');
					placeholder.style.backgroundImage = 'url(' + zip.target + ')';
				}, function(zipe) {
					mui.toast('压缩失败！')
				});

			}, function(e) {
				mui.toast(e.message);
			},{});
		}, false);
		
		placeholder.appendChild(closeButton);
		placeholder.appendChild(up);
		placeholder.appendChild(fileInput);
		feedback.imageList.appendChild(placeholder);
	};
	feedback.newPlaceholder();
	//提交 
	feedback.submitBtn.addEventListener('tap', function(event) {
		mui(this).button('loading'); 
		if (feedback.shipInfoId.value == '' || feedback.abnormalTime.value == '' || feedback.abnormalType.value == '' ) {
			mui(this).button('reset'); 
			return mui.toast('信息填写不符合规范');
		}
		if (feedback.abnormalType.value.length > 60 || feedback.abnormalEvent.value.length > 200) {
			mui(this).button('reset'); 
			return mui.toast('信息超长,请重新填写~');
		}
		var formdata = {"WEB_PARAM":JSON.stringify({
							shipInfoId: feedback.shipInfoId.value,
							abnormalTime: feedback.abnormalTime.value+":00",
							abnormalType: feedback.abnormalType.value,
							longitude: feedback.longitude.value,
							latitude: feedback.latitude.value,
							abnormalAddress: feedback.abnormalAddress.value,
							abnormalEvent: feedback.abnormalEvent.value
						})};
		var data = mui.extend({}, feedback.deviceInfo, formdata, {
				images: feedback.files,
				audios: feedback.audios
			});
		if(feedback.files.length>0){
			data["picKey"] = 'image';
		}
		if(feedback.audios.length>0){
			data["audioKey"] = 'audio';
		}
		
		if(isOnline()){ //在线提交
			feedback.send(data); 
			
		}else{ //离线缓存
			//TODO 
			return mui.toast("连接网络失败，请稍后再试");
		}

	}, false);
	feedback.send = function(content) {
		console.log("准备提交的数据："+ JSON.stringify(content));
		feedback.uploader = plus.uploader.createUpload(url, 
			{method: 'POST' }, 
			function(upload, status) {
				plus.nativeUI.closeWaiting()
				mui('#submit').button('reset'); 
				console.log("upload cb:"+upload.responseText);
				if(status==200){
					var data = JSON.parse(upload.responseText);
					//上传成功，重置表单
					if (data.code === 1) {
						mui.alert("提交成功","确定",function () {
							feedback.clearForm();
							//mui.back();
						});
					}else{
						mui.toast('提交失败，请重试');
					}
				}else{
					console.log("提交失败. "+ status);
					mui.toast('提交失败'+ + status +'，请重试');
				}
			}
		);
		
		var token = getStorage(STOREKEY_LOGIN).token;
    	//token = "DB0004C5FB3C583579397B050A1B0D52";
		feedback.uploader.setRequestHeader("Cookie",'JSESSIONID='+token);
		feedback.uploader.setRequestHeader("token",token);
		//添加上传数据
		mui.each(content, function(key, val) {
			if (key !== 'images' && key != 'audios') {
				console.log("addData:"+key+","+val);
				feedback.uploader.addData(key, val);
			} 
		});
		//添加上传图片文件
		mui.each(feedback.files, function(index, element) {
			var f = feedback.files[index];
			console.log("addImageFile:"+JSON.stringify(f));
			feedback.uploader.addFile(f.path, {
				key: 'image'
			});
//			feedback.uploader.addFile(f.path, {
//				key: f.name
//			});
		});
		console.log('语音数据：'+feedback.audios);
		//添加上传语音文件
		mui.each(feedback.audios, function(index, element) {
			var f = feedback.audios[index];
			console.log("addAudioFile:"+JSON.stringify(f));
			feedback.uploader.addFile(f.path, {
				key: 'audio'
			});
//			feedback.uploader.addFile(f.path, {
//				key: f.name
//			});
		});

		//开始上传任务
		feedback.uploader.start();

		plus.nativeUI.showWaiting();
	};
	
	
	
	//语音相关
	var audioIndex = 1; //语音位置(数量)
	var voiceSize = 0;  //录音文件总大小
	var gentry=null;
	var bUpdated=false; //用于兼容可能提前注入导致DOM未解析完更新的问题
	
	// 格式化时长字符串，格式为"HH:MM:SS"
	timeToStr=function(ts){
		if(isNaN(ts)){
			return "--:--:--";
		}
		var h=parseInt(ts/3600);
		var m=parseInt((ts%3600)/60);
		var s=parseInt(ts%60);
		return (ultZeroize(h)+":"+ultZeroize(m)+":"+ultZeroize(s));
	};
	// 格式化日期时间字符串，格式为"YYYY-MM-DD HH:MM:SS"
	dateToStr=function(d){
		return (d.getFullYear()+"-"+ultZeroize(d.getMonth()+1)+"-"+ultZeroize(d.getDate())+" "+ultZeroize(d.getHours())+":"+ultZeroize(d.getMinutes())+":"+ultZeroize(d.getSeconds()));
	};
	/**
	 * zeroize value with length(default is 2).
	 * @param {Object} v
	 * @param {Number} l
	 * @return {String} 
	 */
	ultZeroize=function(v,l){
		var z="";
		l=l||2;
		v=String(v);
		for(var i=0;i<l-v.length;i++){
			z+="0";
		}
		return z+v;
	};
	
	// 添加播放项
	function createItem( entry ) {
		var li = document.createElement('li');
		li.className = 'ditem';
		li.style = 'padding: 10px;';
		li.innerHTML = '<span class="iplay" style="background-size: 80px 74px;"><font class="aname"></font><br/><font class="ainf"></font></span>';
		//li.setAttribute('onclick', 'playAudio(this)');
		//追加
		//feedback.history.insertBefore(li, feedback.empty.nextSibling);
		//只保存最新一个
		feedback.history.innerHTML = '';
		feedback.history.insertBefore(li);
		
		li.querySelector('.aname').innerText ='点击可播放录音'; //entry.name;
		li.querySelector('.ainf').innerText = '...';
		li.entry = entry;
		feedback.updateInformation(li);
		// 设置空项不可见
		//feedback.empty.style.display = 'none';
		
		feedback.addAudio('_doc/audio/szg/'+entry.name);
	};
	// 开始录音
	var r=null,t=0,ri=null;
	feedback.startRecord = function(){
		console.log('开始录音：'); 
		r = plus.audio.getRecorder();
		if ( r == null ) {
			console.log('录音对象未获取');
			return;
		}
		r.record({filename:'_doc/audio/szg/'}, function(p){
			console.log('录音完成：'+p);
			plus.io.resolveLocalFileSystemURL(p, function(entry){
				createItem(entry);
			}, function(e){
				console.log('读取录音文件错误：'+e.message);
			});
		}, function(e){
			console.log('录音失败：'+e.message);
		} );
		feedback.record.style.display = 'block';
		t = 0;
		ri = setInterval(function(){
			t++;
			feedback.rtime.innerText = timeToStr(t);
		}, 1000);
	};
	// 停止录音
	feedback.stopRecord = function(){
		feedback.record.style.display = 'none';
		feedback.rtime.innerText = '00:00:00';
		clearInterval(ri);
		ri = null;
		r.stop();
		w = null;
		r = null;
		t = 0;
	};
	//删除指定的文件
	feedback.delFile = function() {
		var voiceArray = feedback.getVoiceArray();
		console.log('==========='+voiceArray.length);
		if (voiceArray && voiceArray.length > 0 && voiceArray[0].entry) {
			var voiceEntry = voiceArray[0].entry;
			var relativePath = '_doc/audio/szg/'+voiceEntry.name;
			plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
	            entry.remove(function(entry) {
	            	feedback.audios = [];
	            	audioIndex = 1;
	                console.log("文件删除成功==" + relativePath);
	                feedback.history.innerHTML = '<li id="empty" class="ditem-empty">无历史记录</li>';
					feedback.empty = document.getElementById('empty');
	            }, function(e) {
	                console.log("文件删除失败=" + relativePath);
	            });
	        });
		};
    }
	// 清除历史记录
	feedback.cleanHistory = function(){
		feedback.history.innerHTML = '<li id="empty" class="ditem-empty">无历史记录</li>';
		feedback.empty = document.getElementById('empty');
		// 删除音频文件
		console.log('清空录音历史记录：');
		gentry.removeRecursively(function(){
			console.log('操作成功！');
		}, function(e){
			console.log('操作失败：'+e.message);
		});
	};
	// 获取录音历史列表
	feedback.updateHistory = function(){
		if(bUpdated||!gentry||!document.body){//兼容可能提前注入导致DOM未解析完更新的问题
			return;
		}
	  	var reader = gentry.createReader();
	  	reader.readEntries(function(entries){
	  		for(var i in entries){
	  			if(entries[i].isFile){
	  				createItem(entries[i]);
	  			}
	  		}
	  	}, function(e){
	  		console.log('读取录音列表失败：'+e.message);
	  	});
		bUpdated = true;
	};
	// 获取录音文件信息
	feedback.updateInformation = function(li){
		if(!li || !li.entry){
			return;
		}
		var entry = li.entry;
		entry.getMetadata(function(metadata){
			console.log("录音文件详情："+ JSON.stringify(metadata));
			li.querySelector('.ainf').innerText = stringUtil.bytesToSize(metadata.size);  //dateToStr(metadata.modificationTime);
		}, function(e){
			console.log('获取文件"'+entry.name+'"信息失败：'+e.message);
		} );
	};
	// 播放音频文件
	feedback.playAudio = function(li){
		if(!li || !li.entry){
			console.log('无效的音频文件');
			return;
		}
		console.log('播放音频文件：'+ li.entry.name);
		feedback.startPlay('_doc/audio/szg/'+li.entry.name);
	};
	// 播放文件相关对象
	var p=null,pi=null;
	// 开始播放
	feedback.startPlay = function(url){
		//console.log('准备播放url: '+url);
		feedback.play.style.display = 'block';
		var L = feedback.progress.clientWidth;
		p = plus.audio.createPlayer(url);
		p.play(function(){
			console.log('播放完成！');
			// 播放完成
			feedback.ptime.innerText = timeToStr(d)+'/'+timeToStr(d);
			feedback.schedule.style.webkitTransition = 'all 0.3s linear';
			feedback.schedule.style.width = L+'px';
			feedback.stopPlay();
		}, function(e){
			console.log('播放音频文件"'+url+'"失败：'+e.message);
		});
		// 获取总时长
		var d = p.getDuration();
		if(!d){
			feedback.ptime.innerText = '00:00:00/'+timeToStr(d);
		}
		pi = setInterval(function(){
			if(!d){ // 兼容无法及时获取总时长的情况
				d = p.getDuration();
			}
			var c = p.getPosition();
			if(!c){  // 兼容无法及时获取当前播放位置的情况
				return;
			}
			feedback.ptime.innerText = timeToStr(c)+'/'+timeToStr(d);
			var pct = Math.round(L*c/d);
			if(pct < 8){
				pct = 8;
			}
			feedback.schedule.style.width = pct+'px';
		}, 1000);
	};
	// 停止播放
	feedback.stopPlay = function(){
		clearInterval(pi);
		pi=null;
		setTimeout(feedback.resetPlay, 500);
		// 操作播放对象
		if(p){
			p.stop();
			p=null;
		}
	};
	// 重置播放页面内容
	feedback.resetPlay = function(){
		feedback.play.style.display = 'none';
		feedback.schedule.style.width = '8px';
		feedback.schedule.style.webkitTransition = 'all 1s linear';
		feedback.ptime.innerText = '00:00:00/00:00:00';	
	};
	
	// 录音 
	feedback.btnStartRecord.addEventListener('tap', function(event) {
		feedback.startRecord();
	}, false);
	//停止录音
	feedback.btnStopRecord.addEventListener('tap',function(event){
		if(feedback.btnStartRecord && !feedback.btnStartRecord.classList.contains('mui-hidden')) {
			feedback.btnStartRecord.classList.add('mui-hidden');
		}
		if(feedback.history && feedback.history.classList.contains('mui-hidden')) {
			feedback.history.classList.remove('mui-hidden');
		}
		if(feedback.btnCleanHistory && feedback.btnCleanHistory.classList.contains('mui-hidden')) {
			feedback.btnCleanHistory.classList.remove('mui-hidden');
		}
		feedback.stopRecord();
	},false);
	//删除录音文件
	feedback.btnCleanHistory.addEventListener('tap',function(event){
		//feedback.cleanHistory(); //删除整个录音目录下的所有文件
		feedback.delFile(); //删除最新的个个录音
		
		if(feedback.btnStartRecord && feedback.btnStartRecord.classList.contains('mui-hidden')) {
			feedback.btnStartRecord.classList.remove('mui-hidden');
		}
		if(feedback.history && !feedback.history.classList.contains('mui-hidden')) {
			feedback.history.classList.add('mui-hidden');
		}
		if(feedback.btnCleanHistory && !feedback.btnCleanHistory.classList.contains('mui-hidden')) {
			feedback.btnCleanHistory.classList.add('mui-hidden');
		}
	},false);
	//播放录音
	mui('#history').on('tap','li.ditem',function(event){
		 //var id = this.getAttribute("id");
		 feedback.playAudio(this);
	});
	//停止播放
	feedback.btnStopPlay.addEventListener('tap',function(event){
		feedback.stopPlay();
	},false);
	
	
	// 重写关闭
//	var _back=window.back;
//	w.resetback = function(){
//		// 停止播放
//		if(feedback.play.style.display == 'block'){
//			stopPlay();
//		}else if(feedback.record.style.display == 'block'){
//			stopRecord();
//		}else{
//			_back();
//		}
//	}
//	window.back=resetback;
	
	
})(mui,window,window.document);
