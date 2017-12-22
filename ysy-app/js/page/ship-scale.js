/**
* @fileName: ship-scale.js
* @author: gjyu
* @time: 2017/12/4
* @disc:
*/
/*处理ajax返回结果*/
function handleShipScaleRes(data) {
    var resDate=[];
    if(!!data&&data.pageDatas.list.length>0){
        resDate=data.pageDatas.list;
    }
    else {
        mui.toast('暂无数据返回，请稍后重试');
    }
    return resDate;
}
function handleShipTypesRes(data) {
    var resDate=[];
    resDate.push({value: '', text: '全部'});
    if(!!data&&data.datas.length>0){
        data.datas.forEach(function(value){
            var item={value: '', text: ''};
            item.value=value.shipTypeCode;
            item.text=value.shipTypeName;
            resDate.push(item);
        });
    }
    return resDate;
}
var userPicker='';
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
        ShipScale:[],
        queryInput:{searchStr:''},
        ShipPickers:[{
            value: '',
            text: '全部'
        }]
    },
    watch:function(e){

    },
    updated: function(e) {
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
        getShipTypes:function(){
            try{
                var ShipTypesOpt={storeKey:STOREKEY_SHIP_SCALE,apiUrl:'/api/query/queryShipType',reqType:'GET',reqData:{}};
                //获取信息
                getAjaxData(ShipTypesOpt).then(function(data){
                    vueData.ShipPickers=handleShipTypesRes(data);
                    if(!!userPicker)
                        userPicker.setData(vueData.ShipPickers);
                }).catch(function (err) {
                    mui.toast(err);
                    mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                });
            }
            catch (ex){
                mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
              mui.toast(ex);
            }
        },
        getShipScaleData:function(loadstaus){
            try{
                var searchStrInput=!!mui('#showShipPicker')[0].getAttribute('data-value')?mui('#showShipPicker')[0].getAttribute('data-value'):'';
                if(loadstaus=='down'||vueData.queryInput.searchStr!=searchStrInput){
                    vueData.queryInput.searchStr=searchStrInput;
                    vueData.ShipScale=[];
                    vueData.pages=[];
                    vueData.currPage=1;
                }
                var ShipScaleOpt={storeKey:'ShipScaleList',apiUrl:'/api/query/szgShipScalelist',reqType:'POST',reqData:{"shipType":searchStrInput,"pageIndex":vueData.currPage,"pageSize":vueData.pagesize}};
                ShipScaleOpt.reqData.pageIndex=loadstaus=='up'?++ShipScaleOpt.reqData.pageIndex:1;
                //获取船舶信息
                getAjaxData(ShipScaleOpt).then(function(data){
                    if(vueData.pages.indexOf(data.pageDatas.currPage)<0){
                        vueData.pages.push(data.pageDatas.currPage);
                        vueData.totalCount=data.pageDatas.totalCount;
                        vueData.currPage=data.pageDatas.currPage;
                        vueData.ShipScale=vueData.ShipScale.concat(handleShipScaleRes(data));
                    }
                    mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                }).catch(function(err){
                    mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(true);
                });
            }
            catch (ex){
              mui.toast(ex);
            }
        }
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
        });
        view.addEventListener('pageBack', function (e) {
            //console.log(e.detail.page.id + ' back');
        });

        $.ready(function() {
            var ShipPickerOption=vueData.ShipPickers;
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
                                vueData.getShipScaleData('down');
                            }, 1000);
                        }
                    },
                    up: {
                        callback: function() {
                            var self = this;
                            setTimeout(function() {
                                vueData.getShipScaleData('up');
                                self.endPullUpToRefresh(false);
                            }, 1000);
                        }
                    }
                });
            });
            userPicker=bindPopPickerEvent(mui,document.getElementById('showShipPicker'),ShipPickerOption,vueData.getShipScaleData);
            vueData.getShipTypes();
            scrollToTop({domSelector:'#title1',scrollDomSelector:'#scroll1'});
        });
    })(mui,document);
}
catch (ex){
    mui.toast(ex);
}