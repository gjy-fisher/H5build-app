function handleJobAreasRes(data) {
    var resDate = [{value: 1, text: '全部'}];
    if (!!data && data.datas.length > 0) {
        data.datas.forEach(function (value) {
            var item = {value: '', text: ''};
            item.value = value.jobAreaCode;
            item.text = value.jobAreaName;
            resDate.push(item);
        });
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    resDate.push({value: 0, text: '我的'});
    return resDate;
}

function handleDutyListRes(data) {
    var resDate = [];
    if (!!data && data.datas.length > 0) {
        resDate = data.datas;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}

function handlePilotOrderListRes(data) {
    var resDate = [];
    if (!!data && data.pageDatas.curRows > 0) {
        resDate = data.pageDatas.list;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}

function handlePilotOrderListbyDutyRes(data) {
    var resDate = [];
    if (!!data && data.pageDatas.list.length > 0) {
        resDate = data.pageDatas.list;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}

function checkPage() {
    var jobAreaCode = !!mui('#jobArea')[0].getAttribute('data-value') ? mui('#jobArea')[0].getAttribute('data-value') : '';
    if(jobAreaCode == "0" || jobAreaCode == "1"){
        if (vueData && vueData.showPilotOrderList && vueData.totalCount > 0) {
            if (!!mui('#pullrefresh').pullToRefresh()) {
                mui('#pullrefresh').pullToRefresh().setStopped(false);
                if (vueData.currPage * vueData.pagesize >= vueData.totalCount) {
                    mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
                }
                else {
                    mui('#pullrefresh').pullToRefresh().refresh(true);
                    mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(false);
                }
            }
        }
        else if (vueData && vueData.showPilotOrderList && vueData.totalCount <= 0) {
            if (!!mui('#pullrefresh').pullToRefresh()) {
                mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
                mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
            }
        }
    }
    else{
        mui('#pullrefresh').pullToRefresh().refresh(true);
        mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
    }
}

var userPicker = '';
var viewApi = mui('#app').view({
    defaultPage: '#list'
});

var vueData = new Vue({
    el: '#list',
    data: {
        jobAreas: [{
            value: 1,
            text: '全部'
        }, {
            value: 0,
            text: '我的'
        }],
        now: dateUtils.now('yyyy-MM-dd'),
        DutyList: [],
        dutyDetailList: {},
        showLoading: true,
        queryInput: {date: dateUtils.now('yyyy-MM-dd'), jobAreaCode: 0},
        pages: [],
        pagesize: 10,
        totalCount: 0,
        currPage: 1,
        PilotOrderList: [],
        showPilotOrderList: true
    },
    watch: {},
    updated: function (e) {
        mui("ul.mui-table-view-striped").on("tap", "li.mui-table-view-cell", function (e) {
            //获取自定义的属性值
            var id = this.getAttribute("data-id");
            vueData.dutyDetailList[id.split('_')[0]].forEach(function (v) {
                if (v.resourceid == id.split('_')[1])
                    vueDetail.dutyDetail = v;
            });
            viewApi.go('#detail');
        });
        mui("#PilotOrderListBuDuty").on("tap", ".my-card.mui-table-view-cell", function (e) {
            //获取自定义的属性值
            var id = this.getAttribute("data-id");
            vueData.PilotOrderList.forEach(function (v) {
                if (v.resourceid == id)
                    vueDetail.dutyDetail = v;
            });
            viewApi.go('#detail');
        });
    },
    mounted:function (e){
        this.showLoading = this.dutyDetailList.length <= 0;
        console.log('=this.showLoading=' + this.showLoading);
    },
    methods: {
        getPilotOrderListData:function(dutyId) {
            var PilotOrderList = {
                storeKey: STOREKEY_SCHEDULE,
                apiUrl: '/api/query/queryPilotOrderList',
                reqType: 'POST',
                reqData: {"dutyId": dutyId, "pageIndex": 1, "pageSize": 100}
            };
            //获取作业信息
            getAjaxData(PilotOrderList).then(function (data) {
                try{
                    console.log('=PilotOrderList=' + data);
                    if (!vueData.dutyDetailList[dutyId]) {
                        vueData.dutyDetailList[dutyId] = [];
                    }
                    vueData.dutyDetailList[dutyId] = handlePilotOrderListRes(data);
                    vueData.showLoading = false;
                    checkPage();
                }
                catch (ex){
                    mui.toast(ex);
                }
            }).catch(function (err) {
                console.log('=schedule=' + err);
                vueData.showLoading = false;
            });
        },
        getAreasData:function() {
            var JobAreasOpt = {
                storeKey: 'JobAreasList',
                apiUrl: '/api/query/queryAllJobArea',
                reqType: 'GET',
                reqData: {}
            };
            //获取区域信息
            getAjaxData(JobAreasOpt).then(function (data) {
                try {
                    console.log('=data=' + data);
                    vueData.jobAreas = handleJobAreasRes(data);
                    if (!!userPicker)
                        userPicker.setData(vueData.jobAreas);
                }
                catch (ex) {
                    mui.toast(ex);
                }
            }).catch(function (err) {
                mui.toast(err);
            });
        },
        getDutyData:function(loadstaus) {
            try {
                var date = !!mui('#queryDate')[0].innerText ? mui('#queryDate')[0].innerText : '';
                var jobAreaCode = !!mui('#jobArea')[0].getAttribute('data-value') ? mui('#jobArea')[0].getAttribute('data-value') : '';
                if (jobAreaCode != "0" && jobAreaCode != "1") {
                    vueData.showPilotOrderList = false;
                    //获取班次信息
                    if (loadstaus == 'down' || (vueData.queryInput.date != date || vueData.queryInput.jobAreaCode != jobAreaCode)) {
                        vueData.queryInput.date = date;
                        vueData.queryInput.jobAreaCode = jobAreaCode;
                        vueData.DutyList = [];
                        vueData.dutyDetailList = {};
                    }
                    var queryDutyList = {
                        storeKey: 'queryDutyList',
                        apiUrl: '/api/query/queryDutyList',
                        reqType: 'POST',
                        reqData: {
                            "date": mui('#queryDate')[0].innerText,
                            "jobAreaCode": mui('#jobArea')[0].getAttribute('data-value')
                        }
                    };
                    getAjaxData(queryDutyList).then(function (data) {
                        try{
                            console.log('=queryDutyListdata=' + data);
                            vueData.DutyList = handleDutyListRes(data);
                            mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                            checkPage();
                        }
                        catch (ex){
                          mui.toast(ex);
                          mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                            mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
                        }
                    }).catch(function (err) {
                        mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                        mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
                    });
                }
                else {
                    vueData.showPilotOrderList = true;
                    //获取引航信息列表
                    if (loadstaus == 'down' || (vueData.queryInput.date != date || vueData.queryInput.jobAreaCode != jobAreaCode)) {
                        vueData.queryInput.date = date;
                        vueData.queryInput.jobAreaCode = jobAreaCode;
                        vueData.PilotOrderList = [];
                        vueData.pages = [];
                        vueData.currPage = 1;
                    }
                    var PilotOrderListOpt = {
                        storeKey: 'PilotOrderListByduty',
                        apiUrl: '/api/query/queryPilotOrderList',
                        reqType: 'POST',
                        reqData: {
                            "showType": parseInt(jobAreaCode),
                            "date": date,
                            "pageIndex": vueData.currPage,
                            "pageSize": vueData.pagesize
                        }
                    };
                    PilotOrderListOpt.reqData.pageIndex = loadstaus == 'up' ? ++PilotOrderListOpt.reqData.pageIndex : 1;
                    //获取船舶信息
                    getAjaxData(PilotOrderListOpt).then(function (data) {
                        try {
                            if (vueData.pages.indexOf(data.pageDatas.currPage) < 0) {
                                vueData.pages.push(data.pageDatas.currPage);
                                vueData.totalCount = data.pageDatas.totalCount;
                                vueData.currPage = data.pageDatas.currPage;
                                vueData.PilotOrderList = vueData.PilotOrderList.concat(handlePilotOrderListbyDutyRes(data));
                            }
                            mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                            checkPage();
                        }
                        catch (ex) {
                            mui.toast(ex);
                            mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                            mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
                        }
                    }).catch(function (err) {
                        mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                        mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
                    });
                }
            }
            catch (ex) {
                mui.toast(ex);
                mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
            }
        },
    },
})
;
var vueDetail = new Vue({
    el: '#detail',
    data: {
        dutyDetail: {}
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
            if (e.detail.page.id == 'detail') {
                mui('#scroll2').scroll().scrollTo(0, 0, 300);
            }
        });
        view.addEventListener('pageBack', function (e) {
            //console.log(e.detail.page.id + ' back');
        });

        $.ready(function () {
            var dateOption = '{"type":"date","beginYear":2016,"endYear":2020}';
            var jobAreaOption = vueData.jobAreas;
            //循环初始化所有下拉刷新，上拉加载。
            $.each(document.querySelectorAll('#pullrefresh'), function (index, pullRefreshEl) {
                $(pullRefreshEl).pullToRefresh({
                    down: {
                        auto: true,//可选,默认false.首次加载自动上拉刷新一次
                        callback: function () {
                            var self = this;
                            setTimeout(function () {
                                console.log('我在刷新了');
                                ///获取班次信息
                                vueData.getDutyData('down');
                                //self.disablePullupToRefresh();
                            }, 1000);
                        }
                    },
                    up: {
                        callback: function () {
                            var self = this;
                            setTimeout(function () {
                                vueData.getDutyData('up');
                                //self.endPullUpToRefresh(true);
                            }, 1000);
                        }
                    }
                });
            });
            bindDateEvent(mui, $('.input-date'), dateOption, vueData.getDutyData);
            bindPreNextDateEvent(mui, $('.date'), $('#queryDate')[0], vueData.getDutyData);
            userPicker = bindPopPickerEvent(mui, document.getElementById('jobArea'), jobAreaOption, vueData.getDutyData);
            $(".mui-scroll ul").on("tap", ".ysy-add-list", function (e) {
                if (!this.classList.contains('mui-active')) {
                    mui('#scroll1').scroll().scrollTo(0,0,300);
                    var dutyid = this.getAttribute('data-dutyId');
                    console.log('=data-dutyId=' + dutyid);
                    vueData.showLoading = true;
                    vueData.getPilotOrderListData(dutyid);
                }
            });
            scrollToTop({domSelector: '#title1', scrollDomSelector: '#scroll1'});
            scrollToTop({domSelector: '#title2', scrollDomSelector: '#scroll2'});
            vueData.getAreasData();
        });
    })(mui, document);
}
catch (ex) {
    mui.toast(ex);
}