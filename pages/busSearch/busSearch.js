//获取应用实例
var app = getApp()
Page({
  data: {
    directionDropdownShowFlag: false,
    busStopDropdownShowFlag:false,
    inputBusStopId:null,
    numIndex:0,
    directionIndex:0,
    stopIndex:0,
    directionIndex:0,
    busServiceNoArray:[],
    busDirectionArray:[],
    busStopArray:[],// 得有一个存储原始对象array变量，用来再查询的时候根据index取得stopid
    busStopDisplayArray:[]// 因为要显示id-stopName 这个形式 所以专门新建一个数组用来显示
  },
  bindKeyInput: function (e) {
    this.setData({
      inputBusStopId: e.detail.value
    })
  },

  //event function start
  bindBusServiceNoChange: function(e) {
    this.setData({
      numIndex: e.detail.value,
      directionDropdownShowFlag: true
    });

    // 选完bus 就可以选方向了
    this.getBusDirection();

  },
  bindBusDirectionChange: function(e) {
    this.setData({
      directionIndex: e.detail.value,
      busStopDropdownShowFlag: true
    })

    // 选完direction 就可以选stop了
    this.getBusStop();
  },
  bindBusStopChange: function(e) {
    this.setData({
      stopIndex: e.detail.value
    })
  },
  //event function end

  getAllBusServiceNo: function(){
    app.showLoadingWindow();
    var that = this;
    wx.request({
      url: "https://www.mytransport.sg/content/mytransport/ptp_drawer_container/jcr:content/bus_arrival_time.getBuses?",
      success: function(res) {
        that.setData({
          busServiceNoArray:res.data
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
          busDirectionArray:res.data
        });
        app.hideLoadingWindow();
      }
    })
  },

  getBusStop: function(){
    app.showLoadingWindow();
    var that = this;
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
          busStopDisplayArray:array
        });
        app.hideLoadingWindow();
      }
    })
  },

  submit: function(){
    var that = this;
    var selectedBusNo = that.data.busServiceNoArray[this.data.numIndex];
    var selectedBusStopId = that.data.busStopArray[this.data.stopIndex].busStopId;
    var selectedBusStopDesc = that.data.busStopArray[this.data.stopIndex].busStopDescription;
    var urlStr = "busTime?busStopId="+selectedBusStopId+"&busStopDesc="+selectedBusStopDesc;
    if (selectedBusNo != "") {
      urlStr += "&busNo="+selectedBusNo;
    };

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
