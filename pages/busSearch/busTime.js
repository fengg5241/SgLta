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
    },
    // busTime:{busNo,firstNextTime,secondNextTime}
    currentStopId:null,
    currentStopDesc:"",
    busTimeArray: [],
    latitude:null,
    longitude:null,
    favoriteFlag:false,
    markers: [{
      iconPath: "/image/location.png",
      id: 0,
      latitude: null,
      longitude: null,
      width: 50,
      height: 50
    }],
  },
  onLoad: function (options) {
    
    this.setData({
      currentStopId: options.busStopId
    });

    
    // 动态显示title根据stop name
    if(options.busStopDesc != null){

      this.setData({
        currentStopDesc: options.busStopDesc
      });
    }

    this.showFavoriteStatus(options.busStopId);

    this.getBusArrivalTime(options.busStopId,options.busStopDesc,options.busServiceId,true);
  },

  showFavoriteStatus: function(stopId){
    try {
      var favoriteObject = wx.getStorageSync('favorite')
      if (favoriteObject && favoriteObject[stopId]) {
          this.setData({
            favoriteFlag:true
          });
      }else {
        this.setData({
          favoriteFlag:false
        });
      }
    } catch (e) {
      
    }
  },

  toggleFavoriteFlag: function(){
    this.setData({
      favoriteFlag:!this.data.favoriteFlag
    });

    var favoriteObject = wx.getStorageSync('favorite');
    if(this.data.favoriteFlag){
      if(!favoriteObject){
        favoriteObject = {};
      }
      favoriteObject[this.data.currentStopId] = this.data.currentStopDesc;
    }else {
      if(favoriteObject && favoriteObject[this.data.currentStopId]){
        delete favoriteObject[this.data.currentStopId];
      }
    }

    wx.setStorageSync('favorite', favoriteObject);
  },

  refreshBusTime: function (e){
    var currentBusServiceId = e.currentTarget.dataset.busserviceid;
    this.getBusArrivalTime(this.data.currentStopId,this.data.currentStopDesc,currentBusServiceId,false);
  },

  getBusArrivalTime: function (busStopId,busStopDesc,busServiceId,searchLocationFlag){
    app.showLoadingWindow();
    var that = this;
    if(!searchLocationFlag){
      if(busServiceId != null){
        that.updateBusArrivalTime(busStopId,[busServiceId]);
      }
    } else {
        var isSingleBus = busServiceId != null;
        var url = 'https://www.mytransport.sg/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getBusStop?query=' + busStopId;
        if (isSingleBus) {
          url += "_" + busServiceId;
        }

        wx.request({
          url: url,
          success: function(res) {
            var busArray = res.data.buses;
            if(busArray != null){
              that.setData({
                currentStopDesc: res.data.busStopDescription
              });

              that.setData({
                latitude:res.data.latitude,
                longitude:res.data.longitude,
                markers:[{
                  iconPath: "/image/location.png",
                  id: 0,
                  latitude: res.data.latitude,
                  longitude: res.data.longitude,
                  width: 50,
                  height: 50
                }]
              });

              // Make bus service is unique 
              var busServiceIdArray = [];
              for (var i = 0; i < busArray.length; i++) {
                if(busServiceIdArray.indexOf(busArray[i]) < 0){ 
                  busServiceIdArray.push(busArray[i]);
                }
              }
              that.updateBusArrivalTime(busStopId,busServiceIdArray);
            }else {
              that.setData({
                currentStopDesc: "Unknown Stop"
              });
              app.hideLoadingWindow();
            }

          }
        });

    }



  },

  updateBusArrivalTime: function (busStopId,busServiceIdArray){
    var that = this;
    wx.request({
      url: "https://s3-ap-southeast-1.amazonaws.com/lta-eta-web-2/bus_arrival.baf2.js",
      success: function(res) {
        var etaDataTemp = res.data;
        wx.request({
          url: "https://s3-ap-southeast-1.amazonaws.com/lta-ntp-web/utctime.txt",
          success: function(res1) {
            var ntpDataTemp = res1.data;
            //etaDataTemp = "etaCallback(['20170115164540])'...";
            var etaDataStr = etaDataTemp.substring(13);
            etaDataStr = etaDataStr.substring(0,etaDataStr.length- 3);
            var etaData = etaDataStr.split(",");
            
            var ntpDataStr = ntpDataTemp.substring(13);
            var ntpData = ntpDataStr.substring(0,ntpDataStr.length- 3);

            //var lastUpdated = hooks('20170115172840', 'YYYYMMDDHHmmss')._d;

            var busArrivalTimes = that.parseBusArrivalTime(etaData[1]);
            

          
            
            var busTimeTempArray = [];
            if(busArrivalTimes[busStopId] != null){
              for (var i = 0; i < busServiceIdArray.length; i++) {
                var busServiceId = busServiceIdArray[i];

                var at = ['N.A.', 'N.A.'];
                var ol = ['', ''];
                var wc = ['', ''];
                if (busArrivalTimes[busStopId][busServiceId] != null) {
                  var busArrivalTime = busArrivalTimes[busStopId][busServiceId];
                  var selectedArrivals = [];
                  for (var j = 0; j < busArrivalTime.length && selectedArrivals.length < 2; j++) {
                    if (busArrivalTime[j].arrivalTime != '-') {
                      busArrivalTime[j].arrivalTime = that.calculateArrivalMinites(busArrivalTime[j].arrivalTime, ntpData);
                      if (busArrivalTime[j].arrivalTime >= 0) {
                        selectedArrivals.push(busArrivalTime[j]);
                      }
                    }
                  } 
                
                  if (selectedArrivals.length > 0) {
                    at[0] = selectedArrivals[0].arrivalTime == '0' ? 'Arr' : selectedArrivals[0].arrivalTime + ' min';
                    ol[0] = selectedArrivals[0].occupancyLevel;
                    wc[0] = selectedArrivals[0].wheelchair;
                    if (selectedArrivals.length > 1) {
                      at[1] = selectedArrivals[1].arrivalTime == '0' ? 'Arr' : selectedArrivals[1].arrivalTime + ' min';
                      ol[1] = selectedArrivals[1].occupancyLevel;
                      wc[1] = selectedArrivals[1].wheelchair;
                    }
                  }

                  console.log("busTimeArray:--"+selectedArrivals);


                }

                
                if(that.data.busTimeArray.length > 0){  // 说明已经加载过的，就局部刷新时间
                  for (var k = 0; k < that.data.busTimeArray.length; k++) {
                    var busTimeObject = that.data.busTimeArray[k];
                    if(busTimeObject.busServiceId == busServiceId){
                      busTimeObject.firstNextTime = at[0];
                      busTimeObject.secondNextTime = at[1];
                    }
                  }
                }else { // 如果没有加载过的就加进去数组
                  var busTime = {busServiceId:busServiceId,firstNextTime:at[0],secondNextTime:at[1]};
                  busTimeTempArray.push(busTime);
                }
                
              }
            }

            if(that.data.busTimeArray.length == 0){
              that.setData({
                busTimeArray:busTimeTempArray
              });
            }else {
              that.setData({
                busTimeArray:that.data.busTimeArray
              });
            }
            app.hideLoadingWindow();
          }
        })

        // that.setData({
        //   busServiceNoArray:res.data
        // })
      }
    })
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
                busArrivalTimes[busStopId][busServiceId] = this.busArrivalTimeDecode(busArrivalTimeText);
            }
        }
      }

      return busArrivalTimes;
  },

  calculateArrivalMinites: function (arrivalTime, currentTime) {
    return parseInt(hooks(arrivalTime).diff(hooks(currentTime)) / 1000 / 60);
  }


})

