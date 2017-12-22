/**
 * 我的相关操作
 **/

mui.init();
var viewApi = mui('#app').view({
	defaultPage: '#setting'
});
mui('.mui-scroll-wrapper').scroll();

//setTimeout(function () {
//	defaultImg();
//	setTimeout(function() {
//		initImgPreview();
//	}, 300);
//},500);

/*
var vueSetting = new Vue({
    el: '#setting',
    data: {
        userName:'1',
        organization:'1',
        mobile:'1'
    }
});

var vueAccount = new Vue({
    el: '#account',
    data: {
        userName:'1',
        userCode:'1',
        abbreviation:'1',
        organization:'1',
        stationName:'1',
        mobile:'1',
        email:'1'
    }
});
*/

var view = viewApi.view;
(function($,w,doc) {
	var oldBack = $.back;
	$.back = function() {
		if (viewApi.canBack()) {
			viewApi.back();
		} else {
			oldBack();
		}
	};
	//监听页面切换事件方案1,通过view元素监听所有页面切换事件，目前提供pageBeforeShow|pageShow|pageBeforeBack|pageBack四种事件(before事件为动画开始前触发)
	//第一个参数为事件名称，第二个参数为事件回调，其中e.detail.page为当前页面的html对象
	view.addEventListener('pageBeforeShow', function(e) {
		//console.log(e.detail.page.id + ' beforeShow');
	});
	view.addEventListener('pageShow', function(e) {
		//console.log(e.detail.page.id + ' show');
	});
	view.addEventListener('pageBeforeBack', function(e) {
		//console.log(e.detail.page.id + ' beforeBack');
	});
	view.addEventListener('pageBack', function(e) {
		//console.log(e.detail.page.id + ' back');
	});

	doc.getElementById('btnPilotage').addEventListener("tap",function () {
		openWindow("pilotage.html",true,{})
	});
	doc.getElementById('btnWorkload').addEventListener("tap",function () {
		openWindow("workload.html",true,{})
	});
	doc.getElementById('btnShipScale').addEventListener("tap",function () {
		openWindow("ship-scale.html",true,{})
	});
	//批量同步离线作业 
	doc.getElementById('onlineSynTask').addEventListener("tap",function () {
		var the = this;
		mui.confirm('请保证网络稳定情况下同步','同步确认',['取消','确认同步'],function (e) {
			switch (e.index){
				case 1:
					if(isOnline()){
						mui(the).button('loading');
				        postOffLineData.call(the,new Promise(),appDeviceInfo()).then(function (data) {
				        	console.log('===11111==='+JSON.stringify(data));
				        	mui(the).button('reset');
				            if (data) {
				                mui.alert('成功同步完成。');
				            }else{
				                mui.alert('同步失败，请稍后重试。');
				            }
				        }, function (err) {
				        	console.log('====2222=='+JSON.stringify(err));
				        	mui(the).button('reset');
				            mui.alert(err);
				        });
				    }
					break;
				default:
					break;
			}
		},'div');
	});
	doc.getElementById('btnLogout').addEventListener('tap', function() {
		var the = this;
		mui(this).button('loading'); // 切换为loading状态
		mui.confirm('<font color="red">退出将清空本地所有离线待同步的数据，请谨慎！</font>','退出确认',['取消','确认退出'],function (e) {
			switch (e.index){
				case 1:
					logout();
					setTimeout(function() {
						mui(the).button('reset');
					}.bind(this), 500);
					break;
				default:
					mui(the).button('reset');
					break;
			}
		},'div');
	}, false);
	
	//登录用户信息
	var objUser = getUserInfo();
	mui('.userName1')[0].innerText = objUser.userName || '--';
	mui('.organization1')[0].innerText = objUser.organization || '--';
	mui('.mobile1')[0].innerText = objUser.mobile || '--';
	mui('.userName')[0].innerText = objUser.userName || '--';
	mui('.userCode')[0].innerText = objUser.userCode || '--';
	mui('.abbreviation')[0].innerText = objUser.abbreviation || '--';
	mui('.organization')[0].innerText = objUser.organization || '--';
	mui('.stationName')[0].innerText = objUser.stationName || '--';
	mui('.mobile')[0].innerText = objUser.mobile || '--';
	mui('.email')[0].innerText = objUser.email || '--';
	
	
})(mui,window, document);



////更换头像
//mui(".mui-table-view-cell").on("tap", "#head", function(e) {
//	if(mui.os.plus){
//		var a = [{
//			title: "拍照"
//		}, {
//			title: "从手机相册选择"
//		}];
//		plus.nativeUI.actionSheet({
//			title: "修改头像",
//			cancel: "取消",
//			buttons: a
//		}, function(b) {
//			switch (b.index) {
//				case 0:
//					break;
//				case 1:
//					getImage();
//					break;
//				case 2:
//					galleryImg();
//					break;
//				default:
//					break
//			}
//		})	
//	}
//	
//});

function getImage() {
	var c = plus.camera.getCamera();
	c.captureImage(function(e) {
		plus.io.resolveLocalFileSystemURL(e, function(entry) {
			var s = entry.toLocalURL() + "?version=" + new Date().getTime();
			console.log("==拍照文件本地路径==："+s);
			document.getElementById("head-img").src = s;
			document.getElementById("head-img1").src = s;
			//变更大图预览的src
			//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
			document.querySelector("#__mui-imageview__group .mui-slider-item img").src = s + "?version=" + new Date().getTime();
		}, function(e) {
			console.log("读取拍照文件错误：" + e.message);
		});
	}, function(s) {
		console.log("error" + s);
	}, {
		filename: "_doc/head.jpg"
	})
}

function galleryImg() {
	plus.gallery.pick(function(a) {
		plus.io.resolveLocalFileSystemURL(a, function(entry) {
			plus.io.resolveLocalFileSystemURL("_doc/", function(root) {
				root.getFile("head.jpg", {}, function(file) {
					//文件已存在
					file.remove(function() {
						console.log("file remove success");
						entry.copyTo(root, 'head.jpg', function(e) {
								var e = e.fullPath + "?version=" + new Date().getTime();
								document.getElementById("head-img").src = e;
								document.getElementById("head-img1").src = e;
								//变更大图预览的src
								//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
								document.querySelector("#__mui-imageview__group .mui-slider-item img").src = e + "?version=" + new Date().getTime();;
							},
							function(e) {
								console.log('copy image fail:' + e.message);
							});
					}, function() {
						console.log("delete image fail:" + e.message);
					});
				}, function() {
					//文件不存在
					entry.copyTo(root, 'head.jpg', function(e) {
							var path = e.fullPath + "?version=" + new Date().getTime();
							document.getElementById("head-img").src = path;
							document.getElementById("head-img1").src = path;
							//变更大图预览的src
							//目前仅有一张图片，暂时如此处理，后续需要通过标准组件实现
							document.querySelector("#__mui-imageview__group .mui-slider-item img").src = path;
						},
						function(e) {
							console.log('copy image fail:' + e.message);
						});
				});
			}, function(e) {
				console.log("get _www folder fail");
			})
		}, function(e) {
			console.log("读取拍照文件错误：" + e.message);
		});
	}, function(a) {}, {
		filter: "image"
	})
};

function defaultImg() {
	if(mui.os.plus){
		plus.io.resolveLocalFileSystemURL("_doc/head.jpg", function(entry) {
			var s = entry.fullPath + "?version=" + new Date().getTime();;
			document.getElementById("head-img").src = s;
			document.getElementById("head-img1").src = s;
		}, function(e) {
			document.getElementById("head-img").src = '../../images/user-photo.png';
			document.getElementById("head-img1").src = '../../images/user-photo.png';
		})
	}else{
		document.getElementById("head-img").src = '../../images/user-photo.png';
		document.getElementById("head-img1").src = '../../images/user-photo.png';
	}
	
}
document.getElementById("head-img1").addEventListener('tap', function(e) {
	e.stopPropagation();
});
//document.getElementById("welcome").addEventListener('tap', function(e) {
//	//显示启动导航
//	mui.openWindow({
//		id: 'guide',
//		url: '../../guide.html',
//		show: {
//			aniShow: 'fade-in',
//			duration: 300
//		},
//		waiting: {
//			autoShow: false
//		}
//	});
//});

// 已在公共js方法里
//function initImgPreview() {
//	var imgs = document.querySelectorAll("img.mui-action-preview");
//	imgs = mui.slice.call(imgs);
//	if (imgs && imgs.length > 0) {
//		var slider = document.createElement("div");
//		slider.setAttribute("id", "__mui-imageview__");
//		slider.classList.add("mui-slider");
//		slider.classList.add("mui-fullscreen");
//		slider.style.display = "none";
//		slider.addEventListener("tap", function() {
//			slider.style.display = "none";
//		});
//		slider.addEventListener("touchmove", function(event) {
//			event.preventDefault();
//		})
//		var slider_group = document.createElement("div");
//		slider_group.setAttribute("id", "__mui-imageview__group");
//		slider_group.classList.add("mui-slider-group");
//		imgs.forEach(function(value, index, array) {
//			//给图片添加点击事件，触发预览显示；
//			value.addEventListener('tap', function() {
//				slider.style.display = "block";
//				_slider.refresh();
//				_slider.gotoItem(index, 0);
//			})
//			var item = document.createElement("div");
//			item.classList.add("mui-slider-item");
//			var a = document.createElement("a");
//			var img = document.createElement("img");
//			img.setAttribute("src", value.src);
//			a.appendChild(img)
//			item.appendChild(a);
//			slider_group.appendChild(item);
//		});
//		slider.appendChild(slider_group);
//		document.body.appendChild(slider);
//		var _slider = mui(slider).slider();
//	}
//}

if(mui.os.stream){
	document.getElementById("check_update").display = "none";
}


//检查更新
document.getElementById("update").addEventListener('tap', function() {
//	var server = "http://www.dcloud.io/check/update"; //获取升级描述文件服务器地址
//	mui.getJSON(server, {
//		"appid": plus.runtime.appid,
//		"version": plus.runtime.version,
//		"imei": plus.device.imei
//	}, function(data) {
//		if (data.status) {
//			plus.ui.confirm(data.note, function(i) {
//				if (0 == i) {
//					plus.runtime.openURL(data.url);
//				}
//			}, data.title, ["立即更新", "取　　消"]);
//		} else {
//			mui.toast('已是最新版本~')
//		}
//	});
});


