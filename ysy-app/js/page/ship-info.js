/*处理ajax返回结果*/
function handleShipListRes(data) {
    var resDate = [];
    if (!!data && data.pageDatas.list.length > 0) {
        resDate = data.pageDatas.list;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}

/*处理ajax返回结果*/
function handleShipDetailRes(data) {
    var resDate = [];
    if (!!data && !!data.datas) {
        resDate = data.datas;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}

/**
 * 页面单页初始化与vue初始化，先是vue初始化再初始化mui的scroll插件，防止scroll插件无法滚动
 */
var viewApi = mui('#app').view({
    defaultPage: '#list'
});
var vueData = new Vue({
    el: '#list',
    data: {
        pages: [],
        pagesize: 10,
        totalCount: 0,
        currPage: 1,
        shipList: [],
        shipListDetail: [],
        queryInput: {callSgn: ''}
    },
    watch:{

    },
    updated: function (e) {
        mui(".mui-scroll-wrapper .mui-scroll").on("tap", ".my-card.mui-table-view-cell", function (e) {
            //获取自定义的属性值
            var id = this.getAttribute("data-id");
            vueData.getShipDetailData(id);
            viewApi.go('#detail');
        });
        if (vueData && vueData.totalCount > 0) {
            if (!!mui('#pullrefresh').pullToRefresh()) {
                mui('#pullrefresh').pullToRefresh().setStopped(false);
                if (vueData.currPage * vueData.pagesize >= vueData.totalCount) {
                    mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
                    mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
                }
                else {
                    mui('#pullrefresh').pullToRefresh().refresh(true);
                    mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(false);
                }
            }
        }
        else if (vueData && vueData.totalCount <= 0) {
            if (!!mui('#pullrefresh').pullToRefresh()) {
                mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
                mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
            }
        }
    },
    mounted:function(e){

    },
    methods: {
        getShipDetailData:function(Id) {
            var ShipDetail = {apiUrl: '/api/query/szgShipInfo/' + Id, reqType: 'GET', reqData: {}};
            //获取作业信息
            getAjaxData(ShipDetail).then(function (data) {
                try{
                    console.log('=ShipDetail=' + data);
                    vueDetail.shipListDetail = handleShipDetailRes(data);
                    vueData.shipList.forEach(function (v) {
                        if (v.resourceid == Id)
                            vueDetail.shipListDetail.shipTypeName = v.shipTypeName;
                    });
                }
                catch (ex){
                  mui.toast(ex);
                }
            }).catch(function (err) {
                console.log(err);
            });
        },
        getShipListData:function(loadstaus) {
            var callSgnInput = !!mui('#searchValue')[0].value ? mui('#searchValue')[0].value : '';
            if (loadstaus == 'down' || vueData.queryInput.callSgn != callSgnInput) {
                vueData.queryInput.callSgn = callSgnInput;
                vueData.shipList = [];
                vueData.pages = [];
                vueData.currPage = 1;
            }
            var ShipListOpt = {
                storeKey: STOREKEY_SHIP,
                apiUrl: '/api/query/szgShipInfolist',
                reqType: 'POST',
                reqData: {
                    "callSgn": callSgnInput,
                    "shipNameCn": "",
                    "pageIndex": vueData.currPage,
                    "pageSize": vueData.pagesize
                }
            };
            ShipListOpt.reqData.pageIndex = loadstaus == 'up' ? ++ShipListOpt.reqData.pageIndex : 1;
            //获取船舶信息
            getAjaxData(ShipListOpt).then(function (data) {
                try{
                    if (vueData.pages.indexOf(data.pageDatas.currPage) < 0) {
                        vueData.pages.push(data.pageDatas.currPage);
                        vueData.totalCount = data.pageDatas.totalCount;
                        vueData.currPage = data.pageDatas.currPage;
                        vueData.shipList = vueData.shipList.concat(handleShipListRes(data));
                    }
                    mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                }
                catch (ex){
                  mui.toast(ex);
                }
            }).catch(function (err) {
                mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
            });
        }
    }
});
var vueDetail = new Vue({
    el: '#detail',
    data: {
        shipListDetail: {},
        req: stringUtil.getURLParam('sourceType') //页面的请求参数对象,当请求参数sourceType=='post'时显示上传异常的按钮
    }
});

try {
    (function ($, doc) {
        mui.init({
            swipeBack: false,
            gestureConfig: {
                doubletap: true
            }
        });
        var deceleration = mui.os.ios ? 0.003 : 0.0009;
        mui('.mui-scroll-wrapper').scroll({
            bounce: false,
            indicators: true,
            deceleration: deceleration
        });
        var view = viewApi.view;
        var oldBack = $.back;
        $.back = function () {
            if (viewApi.canBack()) {
                viewApi.back();
            } else {
                oldBack();
            }
        };
        view.addEventListener('pageBeforeShow', function (e) {
            //console.log(e.detail.page.id + ' beforeShow');
        });
        view.addEventListener('pageShow', function (e) {
            //console.log(e.detail.page.id + ' show');
        });
        view.addEventListener('pageBeforeBack', function (e) {
            //console.log(e.detail.page.id + ' beforeBack');
            if(e.detail.page.id=='detail'){
                mui('#scroll2').scroll().scrollTo(0,0,300);
            }
        });
        view.addEventListener('pageBack', function (e) {
            //console.log(e.detail.page.id + ' back');
        });

        $.ready(function () {
            //循环初始化所有下拉刷新，上拉加载。
            $.each(document.querySelectorAll('#pullrefresh'), function (index, pullRefreshEl) {
                $(pullRefreshEl).pullToRefresh({
                    down: {
                        auto: true,//可选,默认false.首次加载自动上拉刷新一次
                        callback: function () {
                            var self = this;
                            setTimeout(function () {
                                ///获取船舶列表信息
                                vueData.getShipListData('down');
                            }, 1000);
                        }
                    },
                    up: {
                        callback: function () {
                            var self = this;
                            setTimeout(function () {
                                vueData.getShipListData('up');
                                self.endPullUpToRefresh(false);
                            }, 1000);
                        }
                    }
                });
            });
            mui(".mui-content").on("tap", ".mui-btn.search", function (e) {
                mui('#pullrefresh').pullToRefresh().pullDownLoading();
            });
            scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll1'});
            scrollToTop({domSelector:'#title2',scrollDomSelector:'#scroll2'});
        });
        
        $btnException = doc.getElementById('btnException');
        if($btnException){
        	$btnException.addEventListener("tap",function () {
				var webview_exception = preloadWindow("exception.html");
				data  = {
					"shipInfoId":vueDetail.shipListDetail.resourceid || '',
					"callSgn":vueDetail.shipListDetail.callSgn || '',
					"imoNum":vueDetail.shipListDetail.imoNum || '',
					"mmsi":vueDetail.shipListDetail.mmsi || '',
					"shipNameEn":vueDetail.shipListDetail.shipNameEn || '',
					"shipNameCn":vueDetail.shipListDetail.shipNameCn || ''
				};
				console.log('==exception data == : '+ JSON.stringify(data));
				setTimeout(function () {
					mui.fire(webview_exception, 'initData', data);
					webview_exception.show("slide-in-right", 300);
				},200);
				
				//openWindow("exception.html",true,{})
			});
        }
        
		
    })(mui, document);
}
catch (ex) {
    mui.toast(ex);
}