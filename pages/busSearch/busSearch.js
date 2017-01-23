//获取应用实例
var app = getApp()
Page({
  data: {
    directionDropdownShowFlag: false,
    busStopDropdownShowFlag:false,
    submitDisabled:true,
    inputBusStopId:null,
    numIndex:0,
    stopIndex:0,
    directionIndex:0,
    busServiceNoArray:['Select Bus Service No'],
    busDirectionArray:[],
    busStopArray:[],// 得有一个存储原始对象array变量，用来再查询的时候根据index取得stopid
    busStopDisplayArray:[]// 因为要显示id-stopName 这个形式 所以专门新建一个数组用来显示
  },
  bindKeyInput: function (e) {
    this.setData({
      inputBusStopId: e.detail.value,
       // Reset dropdown list to default
      numIndex: 0,
      directionDropdownShowFlag: false,
      busStopDropdownShowFlag:false,
      submitDisabled:e.detail.value == ""
    });
  },

  //event function start
  bindBusServiceNoChange: function(e) {
    var direFlag = true;
    if (e.detail.value == 0){
      direFlag = false;
    }
    this.setData({
        numIndex: e.detail.value,
        directionDropdownShowFlag: direFlag,
        busStopDropdownShowFlag: false,
        inputBusStopId: null,
        submitDisabled:true
    });

    // 选完bus 就可以选方向了
    this.getBusDirection();

  },
  bindBusDirectionChange: function(e) {
    // 当系统第一次加载dropdown list
    var index = e.detail.value;
    if(index > 0 && index >= this.data.busDirectionArray.length){
      index = 0;
    }
    this.setData({
      directionIndex: index,
      busStopDropdownShowFlag: true,
       submitDisabled:true
    })

    // 选完direction 就可以选stop了
    this.getBusStop();
  },
  bindBusStopChange: function(e) {
    this.setData({
      stopIndex: e.detail.value,
      submitDisabled:false
    })
  },
  //event function end

  getAllBusServiceNo: function(){
    app.showLoadingWindow();
    var that = this;
    wx.request({
      url: "https://www.mytransport.sg/content/mytransport/ptp_drawer_container/jcr:content/bus_arrival_time.getBuses?",
      success: function(res) {
        var tempArray = that.data.busServiceNoArray;
        tempArray = tempArray.concat(res.data);
        that.setData({
          busServiceNoArray:tempArray,
          numIndex:0
        })
        app.hideLoadingWindow();
      }
    })
  },

  getBusDirection: function(){
    app.showLoadingWindow();
    var that = this;
    var selectedBusNo = that.data.busServiceNoArray[this.data.numIndex];
    wx.request({
      url: "https://www.mytransport.sg/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getDirections?busServiceId="+selectedBusNo,
      success: function(res) {

        that.setData({
          busDirectionArray:res.data,
          directionIndex:0
        });
        app.hideLoadingWindow();
      }
    })
  },

  getBusStop: function(){
    app.showLoadingWindow();
    var that = this;
    if(that.data.busDirectionArray[this.data.directionIndex] != null ){
      var selectedBusNo = that.data.busServiceNoArray[this.data.numIndex];
      var selectedBusDirection = that.data.busDirectionArray[this.data.directionIndex].direction;
      wx.request({
        url: "https://www.mytransport.sg/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getRoutes?busServiceId="+selectedBusNo+"&direction="+selectedBusDirection,
        success: function(res) {
          var array = [];
          for (var i = 0; i < res.data.length; i++) {
            array.push(res.data[i]["busStopId"] + "-" + res.data[i]["busStopDescription"]);
          };
          that.setData({
            busStopArray:res.data,
            busStopDisplayArray:array,
            stopIndex:0,
            submitDisabled:false
          });
          app.hideLoadingWindow();
        }
      })
    }else {
      app.hideLoadingWindow();
    }

  },

  submit: function(){
    var that = this;
    var urlStr = "busTime?busStopId=";
    var inputBusStopId = that.data.inputBusStopId;
    if(inputBusStopId == null){
      var selectedBusNo = that.data.busServiceNoArray[this.data.numIndex];
      var selectedBusStopId = that.data.busStopArray[this.data.stopIndex].busStopId;
      var selectedBusStopDesc = that.data.busStopArray[this.data.stopIndex].busStopDescription;
      urlStr += selectedBusStopId+"&busStopDesc="+selectedBusStopDesc+"&busServiceId="+selectedBusNo;
    }else {
      urlStr += inputBusStopId;
    }

    wx.navigateTo({
      url: urlStr
    });
  },


  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    this.getAllBusServiceNo();
  }

})
