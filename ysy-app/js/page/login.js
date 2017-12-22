/**
 * 登录相关操作
 **/
(function($, w, doc) {
	$.init({
		statusBarBackground: '#f7f7f7'
	});
	
	doc.addEventListener('initPage', function(event) {
		plus.nativeUI.closeWaiting(); 
	});
	
	$.ready(function () {
		
	})
	
	$.plusReady(function() {
		//plus.screen.lockOrientation("portrait-primary");
		var settings = getStorage(STOREKEY_SETTINGS); // user.getSettings();
		var state = getStorage(STOREKEY_LOGIN); // user.getState();
		
		var toPilotIndex = function() {
			//openWindow("html/pilot/index.html",true,{});
			var pilotIndex = $.preload({
				"id": 'pilotIndex',
				"url": 'html/pilot/index.html'
			});
			//$.fire(pilotIndex, 'show', null); 
			setTimeout(function() {
				$.openWindow({
					id: 'pilotIndex',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: false
					}
				});
			}, 0);
		};
		var toAgentIndex = function() {
			//openWindow("html/agent/index.html",true,{});
			var agentIndex = $.preload({
				"id": 'agentIndex',
				"url": 'html/agent/index.html'
			});
			setTimeout(function() {
				$.openWindow({
					id: 'agentIndex',
					show: {
						aniShow: 'pop-in'
					},
					waiting: {
						autoShow: false
					}
				});
			}, 0);
		};
		
		//检查 "登录状态" (开始)
		try{
			if ((settings && settings.autoLogin) && state.token) {
				if(state.role == 'agent'){ //船代
					toAgentIndex();
				}else{ //引水员
					toPilotIndex();
				}
			} else {
				//setStorage(STOREKEY_LOGIN,null);
			}
		}catch(e){
			console.error('登录界面异常：'+e);
		}

		//检查 "登录状态" (结束)
		var loginBtn = doc.getElementById('login');
		var accountTxt = doc.getElementById('account');
		var passwordTxt = doc.getElementById('password');
		var autoLoginBtn = doc.getElementById("autoLogin");
		loginBtn.addEventListener('tap', function(event) {
			var loginInfo = {
				account: accountTxt.value,
				password: passwordTxt.value
			};
			login(loginInfo, function(err) {
				if (err) {
					toast(err);
					return;
				}
				toPilotIndex();
			});
		});
		$.enterfocus('#login-form input', function() {
			$.trigger(loginBtn, 'tap');
		});
		
		autoLoginBtn.classList[(settings && settings.autoLogin)? 'add' : 'remove']('mui-active')
		autoLoginBtn.addEventListener('toggle', function(event) {
			setTimeout(function() {
				var isActive = event.detail.isActive;
				settings.autoLogin = isActive;
				setStorage(STOREKEY_SETTINGS,settings);
			}, 50);
		}, false);
		
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if (backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
		
		setTimeout(function() {
			plus.navigator.closeSplashscreen();
		}, 600);
	});

}(mui, window, document));
