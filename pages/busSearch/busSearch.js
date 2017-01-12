//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    directionDropdownShowFlag: false,
    numIndex:0,
    directionIndex:0,
    busServiceNoArray:[],
    busDirectionArray:[]
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
      directionIndex: e.detail.value
    })
  },
  //event function end

  getAllBusServiceNo: function(){
    var that = this;
    wx.request({
      url: "https://www.mytransport.sg/content/mytransport/ptp_drawer_container/jcr:content/bus_arrival_time.getBuses?",
      success: function(res) {
        that.setData({
          busServiceNoArray:res.data
        })
      }
    })
  },

  getBusDirection: function(){
    var that = this;
    var selectedBusNo = that.data.busServiceNoArray[this.data.numIndex];
    wx.request({
      url: "https://www.mytransport.sg/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getDirections?busServiceId="+selectedBusNo,
      success: function(res) {
        var array = [];
        for (var i = 0; i < res.data.length; i++) {
          array.push(res.data[i]["description"]);
        };
        that.setData({
          busDirectionArray:array
        })
      }
    })
  },


  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    this.getAllBusServiceNo();
  }

})
