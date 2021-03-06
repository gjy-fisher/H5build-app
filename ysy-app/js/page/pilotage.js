function handlePilotageListRes(data) {
    var resDate=[];
    if(!!data&&data.pageDatas.curRows>0){
        resDate=data.pageDatas.list;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}
var viewApi = mui('#app').view({
    defaultPage: '#list'
});

var vueData=new Vue({
    el:'#list',
    data:{
        now:dateUtils.now('yyyy-MM-dd'),
        pages:[],
        pagesize:10,
        totalCount:0,
        currPage:1,
        pilotageList:[],
        queryInput:{date:''}
    },
    watch:{

    },
    updated: function(e) {
        mui("#pullrefresh").on("tap",".my-card.mui-table-view-cell",function(e){
            //获取自定义的属性值
            var id = this.getAttribute("data-id");
            vueData.pilotageList.forEach(function(v){
                if(v.resourceid==id)
                    vueDetail.pilotageDetail=v;
            });
            console.log(JSON.stringify(vueDetail.pilotageDetail));
            viewApi.go('#detail');
        });
        if(vueData&&vueData.totalCount>0){
            if(!!mui('#pullrefresh').pullToRefresh()){
                mui('#pullrefresh').pullToRefresh().setStopped(false);
                if(vueData.currPage*vueData.pagesize>=vueData.totalCount)
                {
                    mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
                    mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
                }
                else
                {
                    mui('#pullrefresh').pullToRefresh().refresh(true);
                    mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(false);
                }
            }
        }
        else if(vueData&&vueData.totalCount<=0){
            if(!!mui('#pullrefresh').pullToRefresh()){
                mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
                mui('.mui-pull-bottom-tips')[0].classList.add('mui-hidden');
            }
        }
    },
    mounted:function(e){

    },
    methods:{
        getPilotageListData:function(loadstaus){
            var date=!!mui('#queryDate')[0].innerText?mui('#queryDate')[0].innerText:'';
            if(loadstaus=='down'||vueData.queryInput.date!=date){
                vueData.queryInput.date=date;
                vueData.pilotageList=[];
                vueData.pages=[];
                vueData.currPage=1;
            }
            //获取引航列表信息
            var pilotageListOpt={storeKey:STOREKEY_PILOTAGE,apiUrl:'/api/query/queryPilotOrderList',reqType:'POST',reqData:{"date":mui('#queryDate')[0].innerText,"pliotStatus":'end',showType : 0,"pageIndex":vueData.currPage,"pageSize":vueData.pagesize}};
            pilotageListOpt.reqData.pageIndex=loadstaus=='up'?++pilotageListOpt.reqData.pageIndex:1;
            getAjaxData(pilotageListOpt).then(function(data){
                try{
                    if(vueData.pages.indexOf(data.pageDatas.currPage)<0){
                        vueData.pages.push(data.pageDatas.currPage);
                        vueData.totalCount=data.pageDatas.totalCount;
                        vueData.currPage=data.pageDatas.currPage;
                        vueData.pilotageList=vueData.pilotageList.concat(handlePilotageListRes(data));
                    }
                    mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                }
                catch (ex){
                  mui.toast(ex);
                }
            }).catch(function(err){
                mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
            });
        }
    }
});
var vueDetail=new Vue({
    el:'#detail',
    data:{
        pilotageDetail:{}
    }
});
try{
    (function($,doc) {
        mui.init({
            swipeBack: false,
            gestureConfig:{
                doubletap: true
            }
        });
        var deceleration = mui.os.ios?0.003:0.0009;
        mui('.mui-scroll-wrapper').scroll({
            bounce: false,
            indicators: true,
            deceleration:deceleration
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

        $.ready(function() {
            var dateOption='{"type":"date","beginYear":2016,"endYear":2020}';
            var jobAreaOption=vueData.jobAreas;
            //循环初始化所有下拉刷新，上拉加载。
            $.each(document.querySelectorAll('#pullrefresh'), function(index, pullRefreshEl) {
                $(pullRefreshEl).pullToRefresh({
                    down: {
                        auto: true,//可选,默认false.首次加载自动上拉刷新一次
                        callback: function() {
                            var self = this;
                            setTimeout(function() {
                                ///获取班次信息
                                vueData.getPilotageListData('down');
                            }, 1000);
                        }
                    },
                    up: {
                        callback: function() {
                            var self = this;
                            setTimeout(function() {
                                vueData.getPilotageListData('up');
                                self.endPullUpToRefresh(false);
                            }, 1000);
                        }
                    }
                });
            });
            bindDateEvent(mui,$('.input-date'),dateOption,vueData.getPilotageListData);
            bindPreNextDateEvent(mui,$('.date'),$('#queryDate')[0],vueData.getPilotageListData);
            scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll1'});
            scrollToTop({domSelector:'#title2',scrollDomSelector:'#scroll2'});
        });
    })(mui,document);
}
catch (ex){
    mui.toast(ex);
}