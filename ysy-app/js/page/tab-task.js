/**
 * 处理ajax返回的分页数据
 * @param data
 * @param pliotStatus
 */
function handleListRes(data, pliotStatus) {
    var resDate = [];
    if (!!data && !!data.code && data.pageDatas.list.length > 0) {
        resDate = data.pageDatas.list;
        if (vueData.tabPages[pliotStatus].pages.indexOf(data.pageDatas.currPage) < 0) {
            vueData.tabPages[pliotStatus].pages.push(data.pageDatas.currPage);
            vueData.tabPages[pliotStatus].totalCount = data.pageDatas.totalCount;
            vueData.tabPages[pliotStatus].currPage = data.pageDatas.currPage;
            vueData.tabPages[pliotStatus].pilotOrderList = vueData.tabPages[pliotStatus].pilotOrderList.concat(resDate);
            setStorage(pliotStatus,vueData.tabPages[pliotStatus].pilotOrderList);
           
        }
    }
    else {
        //mui.toast('暂无数据返回，请稍后重试');
    }
}

/**
 * 处理缓存返回的数据
 * @param data
 * @param pliotStatus
 */
function handleOffLineListRes(data) {
    for(var key in data){
        vueData.tabPages[key].pilotOrderList=data[key];
    }
}

/**
 * 根据分页数据动态显示下拉提示信息
 * @param politageStatus  引航状态
 * @param index  顶部滑动tap的下标
 */
function checkPage(politageStatus, index) {
    if (vueData && vueData.tabPages[politageStatus].totalCount > 0) {
        if (!!mui('.mui-slider-group .mui-scroll').pullToRefresh()[index]) {
            mui('.mui-slider-group .mui-scroll').pullToRefresh()[index].setStopped(false);
            if (vueData.tabPages[politageStatus].currPage * vueData.tabPages[politageStatus].pagesize >= vueData.tabPages[politageStatus].totalCount) {
                mui('.mui-slider-group .mui-scroll').pullToRefresh()[index].endPullUpToRefresh(true);
                if(!mui('.mui-pull-bottom-tips')[index].classList.contains('mui-hidden')){
                    setTimeout(function () {
                        mui('.mui-pull-bottom-tips')[index].classList.add('mui-hidden');
                    },100);
                }
            }
            else {
                //mui('.mui-slider-group .mui-scroll').pullToRefresh()[index].refresh(true);
                mui('.mui-slider-group .mui-scroll').pullToRefresh()[index].endPullUpToRefresh(false);
            }
        }
    }
    else if (vueData && vueData.tabPages[politageStatus].totalCount <= 0) {
        if (!!mui('.mui-slider-group .mui-scroll').pullToRefresh()[index]) {
            mui('.mui-slider-group .mui-scroll').pullToRefresh()[index].endPullUpToRefresh(true);
            if(!mui('.mui-pull-bottom-tips')[index].classList.contains('mui-hidden')){
                setTimeout(function () {
                    mui('.mui-pull-bottom-tips')[index].classList.add('mui-hidden');
                },100);
            }
        }
    }
}

/**
 * 刷新离线数据
 */
function updateOffLineData() {
    //获取缓存
    var OffLineData= getOffLineDataForPage();
    handleOffLineListRes(OffLineData);
    mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
    mui('.mui-pull-bottom-tips')[1].classList.add('mui-hidden');
    mui('.mui-pull-bottom-tips')[2].classList.add('mui-hidden');
}

/**
 * 将分页的key保存起来
 * @param data 分页key
 */
function setCache(data) {
    var pagesCache = getStorage('pagesCache');
    if (!pagesCache.key)
        pagesCache.key = [];
    if (pagesCache.key.indexOf(data) < 0)
        pagesCache.key.push(data);
    setStorage('pagesCache', pagesCache);
}

/**
 * set根据key值查找缓存分页，再根据id查找对象再根据opt配置项修改对应的属性项
 * @param id
 * @param key
 * @param opt
 */
function setPageCacheByOption(key,id, opt) {
    var OffLineData= getOffLineDataForPage();
    for(var cacheKey in OffLineData){
        if (cacheKey == key) {
            var OffLineDataForCacheKey=OffLineData[cacheKey];
            var len=OffLineDataForCacheKey.length;
            for (var i = 0; i < len; i++) {
                    if(OffLineDataForCacheKey[i].resourceid== id) {
                        for (var item in opt) {
                            OffLineDataForCacheKey[i][item] = opt[item];
                        }
                        setStorage(cacheKey,OffLineDataForCacheKey);
                        break;
                    }
                }
        }
    }
}

/**
 * delete根据key值查找缓存分页，再删除对应id的对象
 * @param key
 * @param id
 * @returns {string} 返回要删除的项
 */
function deletePageCacheItem(key, id) {
    var returnItem = '';
    var OffLineData= getOffLineDataForPage();
    for(var cacheKey in OffLineData){
        if (cacheKey == key) {
            var OffLineDataForCacheKey=OffLineData[cacheKey];
            var len=OffLineDataForCacheKey.length;
            for (var i = 0; i < len; i++) {
                if(OffLineDataForCacheKey[i].resourceid== id) {
                    returnItem =OffLineDataForCacheKey[i];
                    OffLineDataForCacheKey[i] = null;
                    delete OffLineDataForCacheKey[i];
                    OffLineDataForCacheKey=OffLineDataForCacheKey.filter(function (x) {
                        return x!=undefined&&x!=null;
                    });
                    setStorage(cacheKey,OffLineDataForCacheKey);
                    break;
                }
            }
        }
    }
    return returnItem;
}

/**
 * get根据key值查找缓存分页，再根据id查找对象
 * @param key
 * @param id
 * @returns {string} 返回要删除的项
 */
function getPageCacheItem(key, id) {
    var returnItem = '';
    var OffLineData= getOffLineDataForPage();
    for(var cacheKey in OffLineData){
        if (cacheKey == key) {
            var OffLineDataForCacheKey=OffLineData[cacheKey];
            var len=OffLineDataForCacheKey.length;
            for (var i = 0; i < len; i++) {
                if(OffLineDataForCacheKey[i].resourceid== id) {
                    returnItem =OffLineDataForCacheKey[i];
                    break;
                }
            }
        }
    }
    return returnItem;
}
/**
 * add根据key值查找缓存分页，再在数组头增加对应的对象
 * @param key
 * @param returnItem
 */
function addPageCacheItem(key, Item) {
    var OffLineData= getOffLineDataForPage();
    for(var cacheKey in OffLineData){
        if (cacheKey == key) {
            OffLineData[cacheKey].unshift(Item);
            setStorage(cacheKey,OffLineData[cacheKey]);
        }
    }
}

/**
 * 根据地址获取文件对象
 * @param fileAddres
 */
function getImgObj(fileAddres) {

}

/**
 * 表单提交离线数据
 * @param postOffLineData
 */
function postDataByDataForm(postOffLineData) {
        var formData = new FormData();
        var postdata1 = JSON.stringify(postOffLineData);
        formData.append("postData", postdata1); //表单对象
        postOffLineData.forEach(function (v) {
            if(v.pics.length>0)
            {
                v.pics.forEach(function (value) {
                    formData.append(value.name+"[]", getImgObj(value.path));
                });
            }
            if(v.audios.length>0)
            {
                v.audios.forEach(function (value) {
                    formData.append(value.name+"[]", getImgObj(value.path));
                });
            }
        });
        mui.ajax({
                type: 'POST',
                url: '',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (data) {
                    if(data.code==1){
                        console.log('success');
                    }
                    else{
                        console.log('fail');
                    }
                },
                error: function (xhr, t) {
                    console.log('fail');
                }
            });
}

/**
 * 更新缓存动作
 * @param oldKey  旧状态标志
 * @param NewKey   新状态标志
 * @param id   resouceid
 * @param opt   移动项moveItem更改属性的对象集合
 */
function offLineUpdateCache(oldKey,NewKey,id,opt,callback) {
    var errMsg = "==updatePilotStatusSuccess离线== ";
    var moveItem=getPageCacheItem(oldKey,id);
    for(var updateItem in opt){
        moveItem[updateItem]=opt[updateItem];
    }
    addPageCacheItem(NewKey,moveItem);
    var deleteItem=deletePageCacheItem(oldKey,id);
    if(deleteItem.resourceid==moveItem.resourceid){
        callback();
        mui.toast('离线更新状态成功');
        //离线刷新
        var OffLineData= getOffLineDataForPage();
        handleOffLineListRes(OffLineData);
        viewApi.go('#list');
        mui("#drTime")[0].value='';
        mui("#startTime")[0].value='';
        feedback.clearForm();
    }
    else{
        mui.toast('离线更新状态失败');
    }
}

/**
 * 获取分页key的缓存键值
 */
function getCache() {
    return getStorage('pagesCache');
}

/**
 * 创建end缓存对象
 */
function  createEndCachePage() {
    var endData={"pageDatas":{"totalCount":0,"pageSize":10,"totalPage":0,"currPage":1,"curRows":0,"list":[]},"code":1};
    setStorage('end_1', endData);
}
/**
 * 页面首次加载的数据初始化
 */
function getInitData(loadStatus) {
    //mui('.mui-slider-group .mui-scroll').pullToRefresh()[0].pullDownLoading();
    vueData.getPilotOrderListDataByStatus(loadStatus||'down','notify');
    vueData.getPilotOrderListDataByStatus(loadStatus||'down','ready');
    vueData.getPilotOrderListDataByStatus(loadStatus||'down','start');
}

/**
 * 时间控件初始化
 * @param $
 * @param ele
 * @param opt
 * @param callback
 */
function initDate1($,ele,opt,callback) {
    ele.each(function(i, btn) {
        btn.addEventListener('tap', function() {
            var _self = this;
            if(_self.picker) {
                _self.picker.show(function (rs) {
                    console.log('选择结果: ' + rs.text);
                    _self.querySelector('.search-date').value=rs.text;
                    callback();
                    _self.picker.dispose();
                    _self.picker = null;
                });
            } else {
                var optionsJson = opt || '{}';
                var options = JSON.parse(optionsJson);
                var id = this.getAttribute('id');
                _self.picker = new $.DtPicker(options);
                _self.picker.show(function(rs) {
                    console.log('选择结果: ' + rs.text);
                    _self.querySelector('.search-date').value=rs.text;
                    callback();
                    _self.picker.dispose();
                    _self.picker = null;
                });
            }
        }, false);
    });
}

/**
 * 单页返回
 */
//function gobackToDetail() {
//    mui.back();
//}

/**
 * 确认引航
 */
function sureToStart() {
    mui(this).button('loading');
    vueData.postStart(this);
}

/**
 * 事件绑定
 */
function bindEvent() {
    document.querySelector('.mui-slider').addEventListener('slide', function (event) {
        vueData.currentTapNum=event.detail.slideNumber;
        switch (event.detail.slideNumber) {
            case 0:
                vueDetail.showReceiveBtn = true;
                vueDetail.showStartBtn = false;
                vueDetail.showEndBtn = false;
                vueData.currentTap='notify';
                break;
            case 1:
                vueDetail.showReceiveBtn = false;
                vueDetail.showStartBtn = true;
                vueDetail.showEndBtn = false;
                vueData.currentTap='ready';
                break;
            case 2:
                vueDetail.showReceiveBtn = false;
                vueDetail.showStartBtn = false;
                vueDetail.showEndBtn = true;
                vueData.currentTap='start';
                break;
        }
        console.log(event.detail.slideNumber);
    });
    /*document.getElementById('endSure').addEventListener('tap', function () {
        var lrTime=mui('#lrTime')[0].value;
        var endTime=mui('#endTime')[0].value;
        if(!lrTime||!endTime){
            mui.alert('请选择时间');
        }
        else{
            vueEndDetail.pilotageDetail=vueDetail.pilotageDetail;
            vueEndDetail.lrTime=lrTime;
            vueEndDetail.endTime=endTime;
            viewApi.go('#endEle');
        }
    }, false);*/
    document.getElementById('submit').addEventListener('tap', function () {
        vueData.postEndOK(this);
    }, false);
    document.getElementById('sure').addEventListener('tap', function () {
        vueData.postStart(this);
    }, false);
    document.getElementById('btnReceive').addEventListener('tap', function () {
        vueData.postReceive(this);
    }, false);
    document.getElementById('btnStart').addEventListener('tap', function () {
        viewApi.go('#readyForm');
    }, false);
    document.getElementById('btnEndPilot').addEventListener('tap', function () {
        vueEndDetail.pilotageDetail=vueDetail.pilotageDetail;
        viewApi.go('#endEle');
    }, false);
    $btnException = document.getElementById('btnException');
    if($btnException){
        $btnException.addEventListener("tap",function () {
            var webview_exception = preloadWindow("exception.html");
            data  = {
                "shipInfoId":vueDetail.pilotageDetail.shipInfoId || '',
                "callSgn":vueDetail.pilotageDetail.callSgn || '',
                "imoNum":vueDetail.pilotageDetail.imoNum || '',
                "mmsi":vueDetail.pilotageDetail.mmsi || '',
                "shipNameEn":vueDetail.pilotageDetail.shipNameEn || '',
                "shipNameCn":vueDetail.pilotageDetail.shipNameCn || ''
            };
            console.log('==exception data == : '+ JSON.stringify(data));
            setTimeout(function () {
            	mui.fire(webview_exception, 'initData', data);
                webview_exception.show("slide-in-right", 300);
            },200);
        });
    }
    mui(".pullrefresh").on("tap", ".my-card.mui-table-view-cell", function (e) {
        //获取自定义的属性值
        var id = this.getAttribute("data-id");
        vueData.tabPages[vueData.currentTap].pilotOrderList.forEach(function (v) {
            if (v.resourceid == id)
                vueDetail.pilotageDetail = v;
        });
        viewApi.go('#detail');
    });
    scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll1'});
    scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll2'});
    scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll3'});
    scrollToTop({domSelector:'#title2',scrollDomSelector:'#scroll22'});
}


//网页刷新事件，每次刷新都进行离线缓存检查，有就上传，没有就网络刷新
function getData(loadStatus) {
    if(isOnline()){
        postOffLineData(feedback.deviceInfo).then(function (data) {
            if (data) {
                getInitData(loadStatus);
            }
            else
            {
                updateOffLineData();
            }
        }, function (err) {
            mui.toast(err);
            mui('.mui-slider-group .mui-scroll').pullToRefresh()[vueData.oldTapindex].endPullDownToRefresh(true);
        });
    }
    else{
        mui('.mui-slider-group .mui-scroll').pullToRefresh()[vueData.oldTapindex].endPullDownToRefresh(true);
        updateOffLineData();
    }
}

var userPicker = '';
var viewApi = mui('#app').view({
    defaultPage: '#list'
});

var vueData = new Vue({
    data: {
        currentTap: 'notify',
        currentTapNum:0,
        oldTapindex:0,
        tabPages: {
            notify: {
                pilotOrderList: [],
                pages: [],
                pagesize: 10,
                totalCount: 0,
                currPage: 1,
            },
            ready: {
                pilotOrderList: [],
                pages: [],
                pagesize: 10,
                totalCount: 0,
                currPage: 1,
            },
            start: {
                pilotOrderList: [],
                pages: [],
                pagesize: 10,
                totalCount: 0,
                currPage: 1,
            },
            end:{
                pilotOrderList: [],
                pages: [],
                pagesize: 10,
                totalCount: 0,
                currPage: 1,
            },
        },
        Detail: {},
        showLoading:false,
        showDataCount:0
    },
    watch: {

    },
    updated: function (e) {

    },
    mounted:function(e) {

    },
    computed: {
        currentTapIndex:function () {
            var index=0;
            switch (vueData.currentTap){
                case 'notify':index=0;break;
                case 'ready':index=1;break;
                case 'start':index=2;break;
            }
            return index;
        }
    },
    methods: {
        //上下拉刷新页面方法
        getPilotOrderListDataByStatus:function(loadstaus) {
            try{
                var pliotStatus = 'notify';
                var onLineRefresh=true;
                if (!!arguments[1]) {
                    pliotStatus = arguments[1];
                }
                //获取各tap列表信息
                if (loadstaus == 'down') {
                    vueData.tabPages[pliotStatus].pilotOrderList = [];
                    vueData.tabPages[pliotStatus].pages = [];
                    vueData.tabPages[pliotStatus].currPage = 1;
                }
                var queryList = {
                    apiUrl: '/api/query/queryPilotOrderList',
                    reqType: 'POST',
                    reqData: {
                        "showType": 0,
                    }
                };
                queryList.storeKey = pliotStatus;
                queryList.reqData.pliotStatus = pliotStatus;
                queryList.reqData.pageIndex = vueData.tabPages[pliotStatus].currPage;
                queryList.reqData.pageSize = vueData.tabPages[pliotStatus].pagesize;
                queryList.reqData.pageIndex = loadstaus == 'up' ? ++queryList.reqData.pageIndex : 1;
                queryList.storeKey = queryList.storeKey+'Cache';
                getAjaxData(queryList).then(function (data) {
                    console.log('=queryList=' + data);
                    handleListRes(data, pliotStatus);
                    if(loadstaus == 'down'){
                        mui('.mui-slider-group .mui-scroll').pullToRefresh()[vueData.oldTapindex].endPullDownToRefresh(true);
                    }
                    else{
                        mui('.mui-slider-group .mui-scroll').pullToRefresh()[vueData.oldTapindex].endPullUpToRefresh(true);
                    }
                    checkPage(pliotStatus,pliotStatus=='notify'?0:pliotStatus=='ready'?1:2);
                }).catch(function (err) {
                    if(loadstaus == 'down'){
                        mui('.mui-slider-group .mui-scroll').pullToRefresh()[vueData.oldTapindex].endPullDownToRefresh(true);
                    }
                    else{
                        mui('.mui-slider-group .mui-scroll').pullToRefresh()[vueData.oldTapindex].endPullUpToRefresh(true);
                    }
                    checkPage(pliotStatus,pliotStatus=='notify'?0:pliotStatus=='ready'?1:2);
                });
            }
            catch (ex){
                mui('.mui-slider-group .mui-scroll').pullToRefresh()[vueData.oldTapindex].endPullUpToRefresh(true);
                mui.toast(ex);
            }
        },
        //提交Receive信息
        postReceive:function(that) {
            try{
                mui(that).button('loading');
                var id=vueDetail.pilotageDetail.resourceid;
                var formdata = {"WEB_PARAM":[{
                    id:id,
                    pliotStatus:'ready'
                }]};
                var data = mui.extend({}, feedback.deviceInfo, formdata, {});
                var opt={};
                opt.data=data;
                opt.oldStatus = 'notify';
                opt.storeKey =  'ready';
                opt.that=that;
                opt.url=feedback.url;
                opt.sucCallback = function (opt) {
                    mui(opt.that).button('reset');
                    mui.toast('更新状态成功');
                    getInitData();
                    viewApi.go('#list');
                };
                opt.errCallback = function (opt) {
                    mui(opt.that).button('reset');
                    console.log("提交失败. "+ opt.status);
                    mui.toast('提交失败'+ + opt.status +'，请重试');
                };
                opt.offLineCallback = function (opt) {
                    console.log('offLineCallback');
                    offLineUpdateCache(opt.oldStatus,opt.storeKey,id,{
                        pliotStatus:'ready',
                        isEdit:1,
                        isSyn:0
                    },function () {
                        mui(opt.that).button('reset');
                    });
                };
                if(isOnline()){ //在线提交
                    sendFormData(opt);
                }else{ //离线缓存
                    //TODO
                    opt.offLineCallback(opt);
                }
            }
            catch (ex){
                mui(that).button('reset');
                mui.toast(ex);
            }
        },
        //提交Start信息
        postStart:function(that) {
            try{
                //TODO 表单验证
                var drTime=mui('#drTime')[0].value;
                var startTime=mui('#startTime')[0].value;
                if(!drTime||!startTime){
                    mui.alert('请选择时间');
                }
                else{
                    mui(that).button('loading');
                    var id=vueDetail.pilotageDetail.resourceid;
                    var formdata = {"WEB_PARAM":[{
                        id:id,
                        pliotStatus:'start',
                        shipStartTime:drTime,
                        workStartTime:startTime
                    }]};
                    var data = mui.extend({}, feedback.deviceInfo, formdata, {});

                    var opt = {};
                    opt.data = data;
                    opt.oldStatus = 'ready';
                    opt.storeKey = 'start';
                    opt.that=that;
                    opt.url=feedback.url;
                    opt.sucCallback = function (opt) {
                        mui(opt.that).button('reset');
                        mui.toast('更新状态成功');
                        getInitData();
                        viewApi.go('#list');
                    };
                    opt.errCallback = function (opt) {
                        mui(opt.that).button('reset');
                        console.log("提交失败. "+ opt.status);
                        mui.toast('提交失败'+ + opt.status +'，请重试');
                    };
                    opt.offLineCallback = function (opt) {
                        console.log('offLineCallback');
                        offLineUpdateCache(opt.oldStatus,opt.storeKey,id,{
                            boardTime: drTime,
                            startWorkTime: startTime,
                            pliotStatus:'start',
                            isEdit:1,
                            isSyn:0
                        },function () {
                            mui(opt.that).button('reset');
                        });
                    };
                    if(isOnline()){ //在线提交
                        sendFormData(opt);
                    }else{ //离线缓存
                        //TODO
                        opt.offLineCallback(opt);
                    }
                }
            }
            catch (ex){
                mui(that).button('reset');
                mui.toast(ex);
            }
        },
        //提交end信息
        postEndOK:function(that) {
            try{
                //TODO 表单验证
                var id=vueDetail.pilotageDetail.resourceid;
                var lrTime=document.getElementById('lrTime').value;
                var endTime=document.getElementById('endTime').value;
                var viseCode=document.getElementById('viseCode').value;
                var remarks=document.getElementById('remarks').value;
                if (id == '' || lrTime == '' ||  endTime== '' ||  viseCode== '') {
                    return mui.toast('信息填写不符合规范');
                }
                if (viseCode.length > 50 || remarks.length > 200) {
                    return mui.toast('信息超长,请重新填写~')
                }
                mui(that).button('loading');
                var formdata = {"WEB_PARAM":[{
                    id:feedback.id.value,
                    pliotStatus:'end',
                    shipEndTime:lrTime,
                    workEndTime:endTime,
                    viseCode:viseCode,
                    remarks:remarks,
                    pics:feedback.files
                }]};
                var data = mui.extend({}, feedback.deviceInfo, formdata, {
                    images: feedback.files
                });
                if(feedback.files.length>0){
                    data["picKey"] = 'pic_'+feedback.id.value;
                }

                var opt = {};
                opt.data = data;
                opt.files=feedback.files;
                opt.oldStatus = 'start';
                opt.storeKey =  'end';
                opt.that=that;
                opt.url=feedback.url;
                opt.sucCallback = function (opt) {
                    mui(opt.that).button('reset');
                    mui.toast('更新状态成功');
                    getInitData();
                    viewApi.go('#list');
                };
                opt.errCallback = function (opt) {
                    mui(opt.that).button('reset');
                    console.log("提交失败. "+ opt.status);
                    mui.toast('提交失败'+ + opt.status +'，请重试');
                };
                opt.offLineCallback = function (opt) {
                    console.log('offLineCallback');
                    offLineUpdateCache(opt.oldStatus,opt.storeKey,id,{
                        pliotStatus: 'end',
                        wheelTime: lrTime, 'endWorkTime': endTime, 'viseCode': viseCode, 'remarks': remarks,
                        "pics": feedback.files,
                        isEdit:1,
                        isSyn:0
                    },function () {
                        mui(opt.that).button('reset');
                    });
                };
                if(isOnline()){ //在线提交
                    sendFormData(opt);
                }else{ //离线缓存
                    //TODO
                    opt.offLineCallback(opt);
                }
            }
            catch (ex){
                mui(that).button('reset');
                mui.toast(ex);
            }
        },
    }
}).$mount('#list');
var vueDetail = new Vue({
    el: '#detail',
    data: {
        pilotageDetail: {resourceid:'',masterUserId:''},
        showReceiveBtn: true,
        showStartBtn: false,
        showEndBtn: false,
        btnEnableForMaster:true
    },
    mounted:function () {
        this.btnEnableForMaster=this.pilotageDetail.resourceid==getUserInfo().resourceid||true;
    }
});
var vueEndDetail = new Vue({
    el: '#endEle',
    data: {
        pilotageDetail: {},

    },
    updated: function (e) {

    },
    mounted:function () {

    },
});
//主函数
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
            mui('#scroll2').scroll().scrollTo(0,0,300);
            feedback.clearForm();
        });
        view.addEventListener('pageBack', function (e) {
            //console.log(e.detail.page.id + ' back');
        });

        $.ready(function () {
            bindEvent();
            //循环初始化所有下拉刷新，上拉加载。
            $.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function (index, pullRefreshEl) {
                $(pullRefreshEl).pullToRefresh({
                    down: {
                        callback: function () {
                            //当前下拉刷新插件下标
                            vueData.oldTapindex=vueData.currentTapIndex;
                            var self = this;
                            setTimeout(function () {
                                console.log('我在刷新了');
                                ///获取信息
                                updateOffLineData();
                                getData();
                            }, 1000);
                        }
                    },
                    up: {
                        callback: function () {
                            //当前下拉刷新插件下标
                            vueData.oldTapindex=vueData.currentTapIndex;
                            var self = this;
                            setTimeout(function () {
                                updateOffLineData();
                                getData('up');
                            }, 1000);
                        }
                    }
                });
            });
            initDate1(mui,$('.input-date1'),'',function () {});
            //有网情况下检测离线的数据并上传，否则直接加载缓存
            updateOffLineData();
            vueData.currentTap='notify';
            mui('.mui-slider-group .mui-scroll').pullToRefresh()[0].pullDownLoading();
        });
    })(mui, document);
}
catch (ex) {
    mui.toast(ex);
}