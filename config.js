/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

//var host = "14592619.qcloud.la"
var busSearchHost = "www.mytransport.sg";
var busTimeHost = "s3-ap-southeast-1.amazonaws.com";

var config = {

    // 下面的地址配合云端 Server 工作
    busSearchHost,

    busServiceNoUrl: `https://${busSearchHost}/content/mytransport/ptp_drawer_container/jcr:content/bus_arrival_time.getBuses?`,

    busDirectionUrl: `https://${busSearchHost}/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getDirections?`,

    busStopUrl: `https://${busSearchHost}/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getRoutes?`,
    
    getBusServiceNoByStopUrl: `https://${busTimeHost}/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getBusStop?`,

    getBusServiceNoByStopUrl: `https://${busTimeHost}/content/mytransport/home/myconcierge/busarrivaltime/jcr:content/par/bus_arrival_time.getBusStop?`,

    // 登录地址，用于建立会话
    loginUrl: `https://${busSearchHost}/login`,

    // 测试的请求地址，用于测试会话
    requestUrl: `https://${busSearchHost}/testRequest`,

    // 用code换取openId
    openIdUrl: `https://${busSearchHost}/openid`,

    // 测试的信道服务接口
    tunnelUrl: `https://${busSearchHost}/tunnel`,

    // 生成支付订单的接口
    paymentUrl: `https://${busSearchHost}/payment`,

    // 发送模板消息接口
    templateMessageUrl: `https://${busSearchHost}/templateMessage`,

    // 上传文件接口
    uploadFileUrl: `https://${busSearchHost}/upload`,

    // 下载示例图片接口
    downloadExampleUrl: `https://${busSearchHost}/static/weapp.jpg`
};

module.exports = config
