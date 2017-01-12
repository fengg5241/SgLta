//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  sendRequest: function (paramObject,callBack){
    wx.request({
      url: paramObject.url, //仅为示例，并非真实的接口地址
      data: paramObject.data,
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        callBack(res);
      }
    })
  },

  globalData:{
    userInfo:null
  }
})