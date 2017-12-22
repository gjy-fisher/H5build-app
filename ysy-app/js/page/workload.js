/*处理ajax返回结果*/
function handleWorkListRes(data) {
    var resDate=[];
    if(!!data&&data.pageDatas.list.length>0){
        resDate=data.pageDatas.list;
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
var vueData=new Vue({
    el:'#list',
    data:{
        pages:[],
        pagesize:10,
        totalCount:0,
        currPage:1,
        workList:[],
        now:dateUtils.now('yyyy-MM-dd'),
        shipListDetail:[],
        queryInput:{startWorkDate:dateUtils.now('yyyy-MM-dd'),"endWorkDate":dateUtils.now('yyyy-MM-dd'),}
    },
    watch:{

    },
    updated: function(e) {
        mui(".mui-scroll-wrapper .mui-scroll").on("tap",".my-card.mui-table-view-cell",function(e){
            //获取自定义的属性值
            var id = this.getAttribute("data-id");
            vueData.workList.forEach(function(v){
                if(v.source_id==id)
                    vueDetail.workListDetail=v;
            });
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
        getWorkListData:function(loadstaus){
            var startWorkDate=!!mui('#queryBeginDate')[0].innerText?mui('#queryBeginDate')[0].innerText:'';
            var endWorkDate=!!mui('#queryEndDate')[0].innerText?mui('#queryEndDate')[0].innerText:'';
            //下拉刷新或者查询条件改变就重新从第一页加载数据
            if(loadstaus=='down'||(vueData.queryInput.startWorkDate!=startWorkDate||vueData.queryInput.endWorkDate!=endWorkDate)){
                vueData.queryInput.startWorkDate=startWorkDate;
                vueData.queryInput.endWorkDate=endWorkDate;
                vueData.workList=[];
                vueData.pages=[];
                vueData.currPage=1;
            }
            var workListOpt={storeKey:STOREKEY_WORKLOAD,apiUrl:'/api/query/szgPilotEntryInnerList',reqType:'POST',reqData:{"startWorkDate":startWorkDate,"endWorkDate":endWorkDate,"pageIndex":vueData.currPage,"pageSize":vueData.pagesize}};
            workListOpt.reqData.pageIndex=loadstaus=='up'?++workListOpt.reqData.pageIndex:1;
            //获取船舶信息
            try{
                getAjaxData(workListOpt).then(function(data){
                    if(vueData.pages.indexOf(data.pageDatas.currPage)<0){
                        vueData.pages.push(data.pageDatas.currPage);
                        vueData.totalCount=data.pageDatas.totalCount;
                        vueData.currPage=data.pageDatas.currPage;
                        vueData.workList=vueData.workList.concat(handleWorkListRes(data));
                    }
                    if(loadstaus=='down')
                        mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                    else
                        mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(false);
                }).catch(function(err){
                    if(loadstaus=='down')
                        mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                    else
                        mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(false);
                });
            }
            catch (ex){
              mui.toast(ex);
            }
        }
    }
});
var vueDetail=new Vue({
    el:'#detail',
    data:{
        workListDetail:{}
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
            var dateOption='{"type":"date","beginYear":2010,"endYear":2030}';
            //循环初始化所有下拉刷新，上拉加载。
            $.each(document.querySelectorAll('#pullrefresh'), function(index, pullRefreshEl) {
                $(pullRefreshEl).pullToRefresh({
                    down: {
                        auto: true,//可选,默认false.首次加载自动上拉刷新一次
                        callback: function() {
                            var self = this;
                            setTimeout(function() {
                                console.log('我在刷新了');
                                ///获取船舶列表信息
                                vueData.getWorkListData('down');
                            }, 1000);
                        }
                    },
                    up: {
                        callback: function() {
                            var self = this;
                            setTimeout(function() {
                                vueData.getWorkListData('up');
                            }, 1000);
                        }
                    }
                });
            });
            bindDateEvent(mui,$('.ysy-date'),dateOption,function(){
                var startWorkDate=!!mui('#queryBeginDate')[0].innerText?mui('#queryBeginDate')[0].innerText:'';
                var endWorkDate=!!mui('#queryEndDate')[0].innerText?mui('#queryEndDate')[0].innerText:'';
                if(new Date(startWorkDate)>new Date(endWorkDate)){
                    mui.alert('开始时间不可大于结束时间');
                    $('#queryBeginDate')[0].innerText=endWorkDate;
                    return;
                }
                else{
                    mui('#pullrefresh').pullToRefresh().pullDownLoading();
                }
            });
            scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll1'});
        });
    })(mui,document);
}
catch (ex){
    mui.toast(ex);
}