/*处理ajax返回结果*/
function handleberthListRes(data) {
    var resDate=[];
    if(!!data&&data.pageDatas.list.length>0){
        resDate=data.pageDatas.list;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}
/*处理ajax返回结果*/
function handleShipDetailRes(data) {
    var resDate=[];
    if(!!data&&!!data.data){
        resDate=data.data;
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
        berthList:[],
        berthListDetail:[],
        queryInput:{searchStr:''},
        online:isOnline()
    },
    watch:{

    },
    updated: function(e) {
        mui(".mui-scroll-wrapper .mui-scroll").on("tap",".my-card.mui-table-view-cell",function(e){
            //获取自定义的属性值
            var id = this.getAttribute("data-id");
            vueData.berthList.forEach(function(v){
                if(v.resourceid==id)
                    vueDetail.berthListDetail=v;
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
        getShipDetailData:function(Id) {
            var ShipDetail={storeKey:'ShipDetail',apiUrl:'/api/query/szgShipInfo/'+Id,reqType:'GET',reqData:{}};
            //获取作业信息
            getAjaxData(ShipDetail).then(function(data){
                try{
                    console.log('=ShipDetail='+data);
                    vueDetail.berthListDetail=handleShipDetailRes(data);
                    vueData.berthList.forEach(function(v){
                        if(v.resourceid==Id)
                            vueDetail.berthListDetail.shipTypeName=v.shipTypeName;
                    });
                }
                catch (ex){
                  mui.toast(ex);
                }
            }).catch(function(err){
                console.inof(err);
            });
        },
        getberthListData:function(loadstaus){
            var searchStrInput=!!mui('#searchValue')[0].value?mui('#searchValue')[0].value:'';
            if(loadstaus=='down'||vueData.queryInput.searchStr!=searchStrInput){
                vueData.queryInput.searchStr=searchStrInput;
                vueData.berthList=[];
                vueData.pages=[];
                vueData.currPage=1;
            }
            var berthListOpt={storeKey:STOREKEY_BERTH,apiUrl:'/api/query/szgBerthAnchlist',reqType:'POST',reqData:{"searchStr":searchStrInput,"pageIndex":vueData.currPage,"pageSize":vueData.pagesize}};
            berthListOpt.reqData.pageIndex=loadstaus=='up'?++berthListOpt.reqData.pageIndex:1;
            //获取船舶信息
            getAjaxData(berthListOpt).then(function(data){
                try{
                    if(vueData.pages.indexOf(data.pageDatas.currPage)<0){
                        vueData.pages.push(data.pageDatas.currPage);
                        vueData.totalCount=data.pageDatas.totalCount;
                        vueData.currPage=data.pageDatas.currPage;
                        vueData.berthList=vueData.berthList.concat(handleberthListRes(data));
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
        berthListDetail:{},
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
                                vueData.getberthListData('down');
                            }, 1000);
                        }
                    },
                    up: {
                        callback: function() {
                            var self = this;
                            setTimeout(function() {
                                vueData.getberthListData('up');
                                self.endPullUpToRefresh(false);
                            }, 1000);
                        }
                    }
                });
            });
            mui(".mui-content").on("tap",".mui-btn.search",function(e){
                mui('#pullrefresh').pullToRefresh().pullDownLoading();
            });
            scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll1'});
            scrollToTop({domSelector:'#title2',scrollDomSelector:'#scroll2'});
        });
    })(mui,document);
}
catch (ex){
    mui.toast(ex);
}