//获取应用实例
var app = getApp();
var hooks = require( '../../moment.js' );

Page({
  data: {
    list: [
      {
        id: 'view',
        name: '视图容器',
        open: false,
        pages: ['view', 'scroll-view', 'swiper']
      }, {
        id: 'content',
        name: '基础内容',
        open: false,
        pages: ['text', 'icon', 'progress']
      }
    ],
    busArrivalTimeCharMap :{
        '0': '00',
        '1': '01',
        '2': '02',
        '3': '03',
        '4': '04',
        '5': '05',
        '6': '06',
        '7': '07',
        '8': '08',
        '9': '09',
        'A': '10',
        'B': '11',
        'C': '12',
        'D': '13',
        'E': '14',
        'F': '15',
        'G': '16',
        'H': '17',
        'I': '18',
        'J': '19',
        'K': '20',
        'L': '21',
        'M': '22',
        'N': '23',
        'O': '24',
        'P': '25',
        'Q': '26',
        'R': '27',
        'S': '28',
        'T': '29',
        'U': '30',
        'V': '31',
        'W': '32',
        'X': '33',
        'Y': '34',
        'Z': '35',
        'a': '36',
        'b': '37',
        'c': '38',
        'd': '39',
        'e': '40',
        'f': '41',
        'g': '42',
        'h': '43',
        'i': '44',
        'j': '45',
        'k': '46',
        'l': '47',
        'm': '48',
        'n': '49',
        'o': '50',
        'p': '51',
        'q': '52',
        'r': '53',
        's': '54',
        't': '55',
        'u': '56',
        'v': '57',
        'w': '58',
        'x': '59',
        '-': '-'
    }
  },
  onLoad: function (options) {
    app.showLoadingWindow();
    var that = this;
    // 动态显示title根据stop name
    wx.setNavigationBarTitle({
      title:options.busStopDesc
    });

    wx.request({
      url: "https://s3-ap-southeast-1.amazonaws.com/lta-eta-web-2/bus_arrival.baf2.js",
      success: function(res) {
        var etaDataTemp = res.data;
        wx.request({
          url: "https://s3-ap-southeast-1.amazonaws.com/lta-ntp-web/utctime.txt",
          success: function(res1) {
            var ntpData = res1.data;
            //etaDataTemp = "etaCallback(['20170115164540])'...";
            var etaDataStr = etaDataTemp.substring(13);
            console.log("last 字符:----"+etaDataStr[etaDataStr.length-1]);
            etaDataStr = etaDataStr.substring(0,etaDataStr.length- 3);
            var etaData = etaDataStr.split(",");

            var lastUpdated = hooks('20170115172840', 'YYYYMMDDHHmmss')._d;
            console.log("lastUpdated:"+lastUpdated);

            var busArrivalTimes = that.parseBusArrivalTime(etaData[1]);
            // that.setData({
            //   busServiceNoArray:res.data
            // })
            app.hideLoadingWindow();
          }
        })

        // that.setData({
        //   busServiceNoArray:res.data
        // })
      }
    })
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },

  busArrivalTimeDecode: function (timeText) {
    var busArrivalTimeCharMap = this.data.busArrivalTimeCharMap;
      var times = [];
      var unitLength = 8;
      for (var i = 0; i < timeText.length / unitLength; i++) {
        var year = busArrivalTimeCharMap[timeText.charAt(i * unitLength)];
        var month = busArrivalTimeCharMap[timeText.charAt(i * unitLength + 1)];
        var date = busArrivalTimeCharMap[timeText.charAt(i * unitLength + 2)];
        var hour = busArrivalTimeCharMap[timeText.charAt(i * unitLength + 3)];
          var minute = busArrivalTimeCharMap[timeText.charAt(i * unitLength + 4)];
          var second = busArrivalTimeCharMap[timeText.charAt(i * unitLength + 5)];
          var wheelchair = timeText.charAt(i * unitLength + 6);
          var occupancyLevel = timeText.charAt(i * unitLength + 7);
          
          times[i] = {};
          times[i].arrivalTime = year == '-' || month == '-' || date == '-' || hour == '-' || minute == '-' || second == '-' ? '-' : '20' + year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
          times[i].wheelchair = wheelchair;
          times[i].occupancyLevel = occupancyLevel;
      }
      return times;
  },

  parseBusArrivalTime: function (arrivalString) {
      var busArrivalTimes = {};
      
      if (arrivalString != '') {
        var busStopArr = arrivalString.split('$');
        for (var i = 0; i < busStopArr.length; i++) {
          var busStopText = busStopArr[i];
            var busStopId = busStopText.substring(0, 5);
            var busArrivalArr = busStopText.substring(6).split(';');
            busArrivalTimes[busStopId] = {};
            for (var j = 0; j < busArrivalArr.length; j++) {
              var busArrivalText = busArrivalArr[j];
                var busServiceArr = busArrivalText.split(':');
                var busServiceId = busServiceArr[0];
                var busArrivalTimeText = busServiceArr[1];
                busArrivalTimes[busStopId][busServiceId] = busArrivalTimeDecode(busArrivalTimeText);
            }
        }
      }

      return busArrivalTimes;
  },

  calculateArrivalMinites: function (arrivalTime, currentTime) {
    return parseInt(moment(arrivalTime).diff(moment(currentTime)) / 1000 / 60);
  }


})

