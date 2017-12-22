/*!
 * 作业管理表单提交 
 */
(function($,w,doc) {
	
	var url = API_URL+ '/api/update/batchUpdatePliotStatus';
	
	var feedback = {
		id: document.getElementById('resourceid'),
        drTime: document.getElementById('drTime'),
        startTime: document.getElementById('startTime'),
		lrTime: document.getElementById('lrTime'),
		endTime: document.getElementById('endTime'),
		viseCode: document.getElementById('viseCode'),
		remarks: document.getElementById('remarks'),
		imageList: document.getElementById('image-list'),
		submitBtn: document.getElementById('submit')
	};
    feedback.url=url;
	feedback.files = [];
	feedback.uploader = null;
	feedback.deviceInfo = null;
    feedback.picIndex=1;  //图片位置(数量)
    feedback.size=0;  //图片文件总大小
    feedback.imageIndexIdNum=0; //已选择待上传的图片数量
    feedback.maxImageNum=1; //最多允许上传的图片数量

	mui.plusReady(function() {
        getGeoLocation({
            sucCallback:function(p){
                if(p && p.address){
                    mui('#location')[0].innerText = p.address.city;
                }
            },
            errCallback:function(e){}}
        );
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
		feedback.id.value = '';
        feedback.drTime.value = '';
        feedback.startTime.value = '';
		feedback.lrTime.value = '';
		feedback.endTime.value = '';
		feedback.viseCode.value = '';
		feedback.remarks.value = '';
		feedback.imageList.innerHTML = '';
		feedback.newPlaceholder();
		feedback.files = [];
        feedback.picIndex = 1;
        feedback.size = 0;
        feedback.imageIndexIdNum = 0;
	};
	feedback.getFileInputArray = function() {
		return [].slice.call(feedback.imageList.querySelectorAll('.file'));
	};
	feedback.addFile = function(path) {
        feedback.imageIndexIdNum++;
		feedback.files.push({name:"pic_"+ feedback.id.value+"_"+feedback.picIndex,path:path,id:"img-"+feedback.picIndex});
		feedback.picIndex++;
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
		//feedback.imageIndexIdNum++;
		var placeholder = document.createElement('div');
		placeholder.setAttribute('class', 'image-item space');
		var up = document.createElement("div");
		up.setAttribute('class','image-up')
		//删除图片
		var closeButton = document.createElement('div');
		closeButton.setAttribute('class', 'image-close');
		closeButton.innerHTML = 'X';
		closeButton.id = "img-"+feedback.picIndex;
		//小X的点击事件
		closeButton.addEventListener('tap', function(event) {
			setTimeout(function() {
				for(var temp=0;temp<feedback.files.length;temp++){
					if(feedback.files[temp].id==closeButton.id){
						feedback.files.splice(temp,1);
					}
				}
				feedback.imageList.removeChild(placeholder);
                feedback.imageIndexIdNum--;
                feedback.newPlaceholder();
			}, 0);
			return false;
		}, false);

		//
		var fileInput = document.createElement('div');
		fileInput.setAttribute('class', 'file');
		fileInput.setAttribute('id', 'image-' + feedback.picIndex);
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
					feedback.size += zip.size;
					console.log("zip.target: " + zip.target + ",filesize:"+zip.size+",totalsize:"+feedback.size);
					if (feedback.size > (10*1024*1024)) {
						return mui.toast('文件超大,请重新选择~');
					}
					if (!self.parentNode.classList.contains('space')) { //已有图片
						//feedback.files.splice(index-1,1,{name:"images"+index,path:e,id:"img-"+index});
						feedback.files.splice(index-1,1,{name:"pic_"+ feedback.id.value+"_"+index,path:e,id:"img-"+index});
					} else { //加号
						placeholder.classList.remove('space');
						feedback.addFile(zip.target);//压缩后的文件
						if(feedback.imageIndexIdNum < feedback.maxImageNum){ //如果没有超过图片数量限制，则可以继续上传
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
    w.feedback=feedback;
})(mui,window,window.document);
