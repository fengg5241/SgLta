//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    favoriteStopArray: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow: function() {
    this.getFavoriteStop();
  },

  getFavoriteStop: function(){
    var favoriteObject = wx.getStorageSync('favorite');
    var array = [];
    if(favoriteObject){
      for(var key in favoriteObject){
        array.push({stopId:key,stopDesc:favoriteObject[key]});
      }
    }
    this.setData({
      favoriteStopArray: array
    });
  }
})
