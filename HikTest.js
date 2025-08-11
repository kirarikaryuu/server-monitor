const Mock = require('mockjs')
const Random = Mock.Random
// 海康sdk
const Hikopenapi = require('hikopenapi-node')
const Koa = require('koa')
const Router = require('koa-router')
const mqtt = require('mqtt')
// 处理视频乱码
const iconv = require('iconv-lite')
//引入ws模块
const WebSocket = require('ws')

const app = new Koa()
const router = new Router()

const wsMq = new WebSocket.Server({ port: 9119 })
const wsClients = new Set()

// 凯发 10.70
const appKey = '27568725'
const appSecret = 'tWGt6G45vAPaAFX1CUrb'
// // 天津7
// const appKey = '28429618'
// const appSecret = 'tbeCFQJK3tSzUFEkN3I1'
// 15鼓楼地址 : 10.71.115.1:9443
// 10天塔地址 : 10.71.110.1:9443
const baseUrl = 'https://192.168.10.70:443'
// const baseUrl = 'https://10.71.110.1:9443'
const headers = {
  'Accept-Charset': 'utf-8',
  'content-type': 'application/json;charset=UTF-8',
  accept: 'application/json'
}

const convertData = (data) => {
  const buff = Buffer.from(data, 'base64')
  return iconv.decode(buff, 'gbk')
}

// get trees
const getTrees = () => {
  return new Promise(async (resolve) => {
    const requestUrl = '/artemis/api/resource/v1/unit/getAllTreeCode'
    const body = JSON.stringify({})
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

//获取事件
router.get('/getTrees', async (ctx) => {
  const result = await getTrees()
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

// get regions
const getRegions = () => {
  return new Promise(async (resolve) => {
    const requestUrl = '/artemis/api/resource/v1/regions'

    const body = JSON.stringify({
      pageNo: 1,
      pageSize: 200,
      treeCode: '0'
    })
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

//获取事件
router.get('/getRegions', async (ctx) => {
  const result = await getRegions()
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

// get camera from reagions
const getRegionCameras = () => {
  return new Promise(async (resolve) => {
    const requestUrl = '/artemis/api/resource/v1/regions/regionIndexCode/cameras'

    const body = JSON.stringify({
      pageNo: 1,
      pageSize: 200,
      regionIndexCode: '92ca8437a67342adb93949555a105dd1',
      treeCode: '0'
    })
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

//获取事件
router.get('/getRegionCameras', async (ctx) => {
  const result = await getRegionCameras()
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

// get cameras
const getCameras = () => {
  return new Promise(async (resolve) => {
    // const requestUrl = 'https://123.123.123.123:443/artemis/api/video/v1/cameras/previewURLs'

    const requestUrl = '/artemis/api/video/v2/cameras/previewURLs'
    const requestUrl2 = '/artemis/api/resource/v1/cameras'
    // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'

    const body = JSON.stringify({
      pageNo: 1,
      pageSize: 5000,
      treeCode: '0'
    })
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl2, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

//获取相机列表
router.get('/getCameras', async (ctx) => {
  const result = await getCameras()
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

// get stream
const getUrl = (type, indexCode) => {
  console.log('getUrl', type, indexCode)
  let planID, cameraIndexCode
  if (indexCode) {
    planID = cameraIndexCode = indexCode
  } else {
    planID = '10095'
    cameraIndexCode = '74bc15fcd4dd4fd18f4bd3c323b0afe3'
  }
  return new Promise(async (resolve) => {
    // const requestUrl = 'https://123.123.123.123:443/artemis/api/video/v1/cameras/previewURLs'
    // const baseUrl = 'https://192.168.10.70:443'
    // const requestUrl = '/artemis/api/video/v2/cameras/previewURLs'

    const requestUrl = '/artemis/api/video/v1/cameras/previewURLs'
    // const requestUrl2 = '/artemis/api/resource/v1/cameras'
    // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'

    const body = JSON.stringify({
      cameraIndexCode,
      planID,
      streamType: 0,
      protocol: type,
      transmode: 1,
      expand: 'streamform=rtp&transcode=1&videotype=h264'
    })
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

// get his stream
const getHisUrl = (type) => {
  return new Promise(async (resolve) => {
    // const requestUrl = 'https://123.123.123.123:443/artemis/api/video/v1/cameras/previewURLs'
    // const baseUrl = 'https://192.168.10.70:443'
    // const requestUrl = '/artemis/api/video/v2/cameras/previewURLs'

    const requestUrl = '/artemis/api/video/v1/cameras/playbackURLs'
    // const requestUrl2 = '/artemis/api/resource/v1/cameras'
    // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'

    const body = JSON.stringify({
      planID: '100001',
      beginTime: '2017-09-26T00:00:00.000+08:00',
      endTime: '2023-09-26T20:00:00.000+08:00',
      cameraIndexCode: 'c911b270a6bf40c1a218c048e63fee51',
      recordLocation: '0',
      protocol: 'rtsp',
      needReturnClipInfo: true,
      uuid: '4750e3a4a5bbad3cda5bbad3cd4af9ed5101',
      expand: 'streamform=rtp&transcode=1&videotype=h264'
    })
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

// 事件
const getTopic = () => {
  return new Promise(async (resolve) => {
    const requestUrl = '/artemis/api/common/v1/event/getTopicInfo'
    const requestUrl2 = '/artemis/api/nms/v1/alarm/getTopic'

    // const body = JSON.stringify({
    //   eventTypes: [131605, 131676, 131677, 131678, 131670]
    // })
    const body = JSON.stringify({})
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl2, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}
// 事件2
const getTopicInfo = () => {
  return new Promise(async (resolve) => {
    const requestUrl = '/artemis/api/common/v1/event/getTopicInfo'
    const requestUrl2 = '/artemis/api/nms/v1/alarm/getTopic'

    const body = JSON.stringify({
      // eventTypes: [131605, 131676, 131677, 131678, 131670]
    })
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl2, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}
// 报警
const getAlarm = () => {
  return new Promise(async (resolve) => {
    const requestUrl = '/artemis/api/nms/v1/alarm/alarmInfo'

    const body = JSON.stringify({})
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

//获取事件
router.get('/getTopic', async (ctx) => {
  const result = await getTopic()
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

//获取报警
router.get('/getAlarm', async (ctx) => {
  const result = await getAlarm()

  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

//ws
router.get('/getWsUrl', async (ctx) => {
  const { code } = ctx.query ?? ''
  const result = await getUrl('ws', code)
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

//rtsp
router.get('/getRtspUrl', async (ctx) => {
  const result = await getUrl('rtsp')
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

//hls
router.get('/getHlsUrl', async (ctx) => {
  const result = await getUrl('hls')
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

app.use(router.routes()).use(router.allowedMethods()) //把前面所有定义的方法添加到app应用上去
app.listen(4885)

// 通过mqtt获取mq消息，之后通过websocket转发给前端
const getMqttMq = async () => {
  // 获取mq订阅信息
  const messageArr = []
  const result = await getTopicInfo()
  const text = JSON.parse(convertData(JSON.parse(result)?.data))
  if (text.data && text.data.topicName) {
    const { host, clientId, userName, password, topicName } = text?.data
    // 创建mqtt客户端连接mq服务器
    console.log('host', text, host.replace('tcp://', 'mqtt://'))
    const mqClient = mqtt.connect(host, {
      clientId,
      connectTimeout: 4000,
      username: userName,
      password: password,
      reconnectPeriod: 1000
    })
    // topic对象转换为数组，便于订阅
    const topicArr = Object.values(topicName)
    console.log('topicArr', topicArr)
    mqClient.on('connect', (e) => {
      console.log('Connected', e)
      wsMq.on('connection', (ws) => {
        console.log('connect ws')
        wsClients.add(ws)
        // ws首次连接时，循环消息数组，转发给客户端
        messageArr.forEach((msg) => {
          ws.send(msg)
        })
        ws.on('close', () => {
          console.log('delete ws')
          wsClients.delete(ws)
        })
      })
      // 订阅
      mqClient.subscribe(topicArr, () => {
        console.log(`Subscribe to topic '${topicArr}'`)
      })
    })
    mqClient.on('message', (topic, message) => {
      console.log('Received Message111:', topic, message.toString())
      // 存储所有消息到数组中，便于转发给前端
      messageArr.push(message.toString())
      console.log('messageArr', messageArr)
      // 转发消息
      wsClients.forEach((client) => {
        client.send(message.toString())
        // 如果消息数组长度超过100，则删除第一个元素
        if (messageArr.length > 100) messageArr.shift()
      })
    })
  } else {
    console.log('获取MQ信息失败:', convertData(JSON.parse(result)?.data))
  }
}
getMqttMq()

wsMq.on('connection', (ws) => {
  const data = [
    {
      mid: 'e7aa03f9-d99f-4dde-b33b-0ca86cd49672',
      out: false,
      createAt: '2025-07-28 14:35:29',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o4e19p850a7456-8d322f2b5*829==sp**612t=*7816=3255586*4120=3l5*2464=1o225-13*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685246000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o4e19p850a7456-8d322f2b5*829==sp**612t=*7816=3255586*4120=3l5*2464=1o225-13*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:47:26+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:47:26Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"91e264555d5544e68c6ef056c19214fb","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:47:26","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '27a8c48d-b041-43b2-be56-372f79417c76',
      out: false,
      createAt: '2025-07-28 14:35:34',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.192.139.7:6120/pic?1dd529ze5-=s64f11461ec5a--2512050640f78i9b7*=*d8d0i*s1d=i9p1p=*m6i1t=0e91560a-795i929*e231i19=","componentId":"ibehavior","happenedTime":1590665940000,"transInfo":"{\\"ipAddress\\":\\"10.19.156.247\\",\\"protocol\\":\\"HTTP\\",\\"dateTime\\":\\"2020-05-28T11:39:00Z\\",\\"eventType\\":\\"behaviorResult\\",\\"eventDescription\\":\\"behaviorResult\\",\\"analysisResult\\":[{\\"algorithmID\\":\\"OSYwJjEmNCYzLjIuNQ==\\",\\"taskID\\":\\"temp_fb1672c8e4044263bf71f70bb2b0d6fd\\",\\"timeStamp\\":\\"2020-05-28T19:39:45+08:00\\",\\"targetAttrs\\":{\\"regionIndexCode\\":\\"e80acc78090d437f9e13645187726e35\\",\\"transmission\\":{\\"taskIds\\":\\"07d44f4681564d2bb3b4ab3a79d52236\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"69985f6351f246eeab2220c75169f9c7\\",\\"videoStructure\\":1,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"6f26e66ac50d46fca99d07824d777022\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"9-1-3.2.5\\",\\"timeZone\\":28800},\\"behaviorAnalysisResult\\":[{\\"id\\":1,\\"bkImage\\":\\"http://10.192.139.7:6120/pic?1dd529ze5-=s64f11461ec5a--2512050640f78i9b7*=*d8d0i*s1d=i9p1p=*m6i1t=0e91560a-795i929*e231i19=\\",\\"bkImageType\\":\\"url\\",\\"behaviorAttrs\\":{\\"eventType\\":\\"unattendedBaggage\\",\\"ruleID\\":\\"f94882fcb42f642\\",\\"ruleCustomName\\":\\"civ08xwvr4\\"}}]}]}","eventType":"unattendedBaggage","uuid":"de62085009504835821de7635f8c8820","inputSourceName":"Camera 4-3","tags":{"{报警时间}":"2020-05-28 19:39:00","{报警类型}":"物品遗留检测","{设备名称}":"6f26e66ac50d46fca99d07824d777022"},"deviceIndexcode":"6f26e66ac50d46fca99d07824d777022","eventLevel":"h","deploymentId":"69985f6351f246eeab2220c75169f9c7","inputSourceIndexCode":"6f26e66ac50d46fca99d07824d777022","eventOjectiveName":"Camera 4-3","eventObjectiveIndexCode":"6f26e66ac50d46fca99d07824d777022"}',
      qos: 0,
      retain: false
    },
    {
      mid: '27a8c48d-b041-43b2-be56-372f79417c76',
      out: false,
      createAt: '2025-07-28 14:36:34',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://192.168.10.10:6120/pic?dd00=5402l24-do7b19*53e8f906-8346484b9*536s=**011==*p416=5t9168078752=8l8*2617=7o4*548-110oef-pi07fe=00100","componentId":"ibehavior","happenedTime":1695781580000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"fallDown\\",\\"ruleID\\":\\"323872bb4673d7e\\"},\\"bkImage\\":\\"http://192.168.10.10:6120/pic?dd00=5402l24-do7b19*53e8f906-8346484b9*536s=**011==*p416=5t9168078752=8l8*2617=7o4*548-110oef-pi07fe=00100\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"38f3c0dcb23145cd8c8fc9ab85aa841e\\",\\"transmission\\":{\\"taskIds\\":\\"af829fed4767470b952308b3ab69e47a\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"92f846d77ec04e48838cba98bca6f62b\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"483ba5c630c44f049601357b5ddaeba3\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"13-1-3.3.8_4.5.0\\"},\\"taskID\\":\\"temp_6b160955a9a6410cb8e6ce69d2855d6f\\",\\"timeStamp\\":\\"2023-09-27T10:26:20+08:00\\"}],\\"dateTime\\":\\"2023-09-27T02:26:20Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"192.168.10.150\\",\\"protocol\\":\\"HTTP\\"}","eventType":"fallDown","uuid":"ed569fb2368b4eb5bb1e4c772d1b7913","inputSourceName":"Camera 4-4","tags":{"{报警时间}":"2023-09-27 10:26:20","{报警类型}":"fallDown","{设备名称}":"突然摔倒"},"deviceIndexcode":"483ba5c630c44f049601357b5ddaeba3","eventLevel":"h","deploymentId":"92f846d77ec04e48838cba98bca6f62b","inputSourceIndexCode":"483ba5c630c44f049601357b5ddaeba3","eventOjectiveName":"突然摔倒","eventObjectiveIndexCode":"483ba5c630c44f049601357b5ddaeba3"}',
      qos: 0,
      retain: false
    },
    {
      mid: '27a8c48d-b041-43b2-be56-372f79417c76',
      out: false,
      createAt: '2025-07-28 14:37:34',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p250a7656-8d322f2b5*829==sp**612t=*7916=3255282*5029=0l2*4864=1o435-19*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685252000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p250a7656-8d322f2b5*829==sp**612t=*7916=3255282*5029=0l2*4864=1o435-19*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:47:31+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:47:32Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"4b1465eaa12043dcbf12c2fcff4eb73a","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:47:32","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '27a8c48d-b041-43b2-be56-372f79417c76',
      out: false,
      createAt: '2025-07-28 14:47:34',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p250a7656-8d322f2b5*829==sp**612t=*7916=3255282*5029=0l2*4864=1o435-19*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685252000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p250a7656-8d322f2b5*829==sp**612t=*7916=3255282*5029=0l2*4864=1o435-19*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:47:31+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:47:32Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"d7d2cdc851de427ea03d6026213e3441","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:47:32","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '27a8c48d-b041-43b2-be56-372f79417c76',
      out: false,
      createAt: '2025-07-28 14:57:34',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p250a7656-8d322f2b5*829==sp**612t=*7916=3255282*5029=0l2*4864=1o435-19*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685252000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p250a7656-8d322f2b5*829==sp**612t=*7916=3255282*5029=0l2*4864=1o435-19*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:47:31+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:47:32Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"a4d4446c151e430bbb1ec8a605a6a9fe","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:47:32","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '2eab2968-8c09-4d4d-96e3-2e069671087a',
      out: false,
      createAt: '2025-07-28 14:36:41',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?1d32174f873do-4fl*21-5427156-8d322f2b5*929==sp***121==3t5578861331=5l1*4428=9o9*20a0-6pi1eao=458d9=240","componentId":"ibehavior","happenedTime":1753685318000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?1d32174f873do-4fl*21-5427156-8d322f2b5*929==sp***121==3t5578861331=5l1*4428=9o9*20a0-6pi1eao=458d9=240\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:48:38+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:48:38Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"355fbb58e9de40a7b205db14c3ce8933","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:48:38","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '41059fc0-c4e1-4381-8f5e-0f686e70ddcc',
      out: false,
      createAt: '2025-07-28 14:37:06',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?1d32174f873do-4fl*41-5847156-8d322f2b5*929==sp***131==3t5578364532=7l4*4623=3o9*68a0-6pi1eao=458d9=240","componentId":"ibehavior","happenedTime":1753685343000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?1d32174f873do-4fl*41-5847156-8d322f2b5*929==sp***131==3t5578364532=7l4*4623=3o9*68a0-6pi1eao=458d9=240\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:49:03+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:49:03Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"1abb0dddeb11483191c2ddcd31e7af1e","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:49:03","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '74844ecf-38d8-42cc-bd1b-f58c2f35e95f',
      out: false,
      createAt: '2025-07-28 14:37:08',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?1d32174f873do-4fl*91-5877156-8d322f2b5*929==sp***141==3t5578564633=6l4*4221=5o9*08a0-0pi1eao=458d9=240","componentId":"ibehavior","happenedTime":1753685345000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?1d32174f873do-4fl*91-5877156-8d322f2b5*929==sp***141==3t5578564633=6l4*4221=5o9*08a0-0pi1eao=458d9=240\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:49:05+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:49:05Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"ef4810cb1aa345a8847238ad22657a7f","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:49:05","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '99418548-f9d3-418b-b4f2-8f3f3473d3e7',
      out: false,
      createAt: '2025-07-28 14:37:12',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?1d32174f873do-4fl*31-5697156-8d322f2b5*929==sp***151==3t5578365035=3l6*0832=9o9*54a0-6pi1eao=458d9=240","componentId":"ibehavior","happenedTime":1753685353000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"647092fe5ab2a4c\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?1d32174f873do-4fl*31-5697156-8d322f2b5*929==sp***151==3t5578365035=3l6*0832=9o9*54a0-6pi1eao=458d9=240\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"bd98e437fd974934bfeb83bc06e69275\\",\\"transmission\\":{\\"taskIds\\":\\"e774123f34ec4f3a998f63497d3801b5\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"1dd862bc0d534d7ca8fb4bbec229ae64\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"d69aba12ef814eb9b0da12e7cc53939f\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_9d8ced2031034c9ca6a89765a26fc5cd\\",\\"timeStamp\\":\\"2025-07-28T14:49:13+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:49:13Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.110.14\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"8394ac30efd94ac985ffdc9dfa3b1528","inputSourceName":"站厅北部扶梯东侧对摄#2定","tags":{"{报警时间}":"2025-07-28 14:49:13","{报警类型}":"loitering","{设备名称}":"站厅北部扶梯东侧对摄#2定"},"deviceIndexcode":"d69aba12ef814eb9b0da12e7cc53939f","eventLevel":"h","deploymentId":"1dd862bc0d534d7ca8fb4bbec229ae64","inputSourceIndexCode":"d69aba12ef814eb9b0da12e7cc53939f","eventOjectiveName":"站厅北部扶梯东侧对摄#2定","eventObjectiveIndexCode":"d69aba12ef814eb9b0da12e7cc53939f"}',
      qos: 0,
      retain: false
    },
    {
      mid: '8930a75c-b6eb-49fa-a29c-227ec4b363d9',
      out: false,
      createAt: '2025-07-28 14:38:37',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o6e19p610a*6o6=2244*2l5=7453648755t3==161***ps==929*5b2f223d8-6517255-10*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685434000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o6e19p610a*6o6=2244*2l5=7453648755t3==161***ps==929*5b2f223d8-6517255-10*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:50:34+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:50:34Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"b7591cfdf64149cbaae4907215b7525a","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:50:34","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '7d29c0e9-e3e6-4ea1-bb57-0be4ffdd933f',
      out: false,
      createAt: '2025-07-28 14:38:37',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o4e19p310a*0o9=0244*3l1=5483658755t3==171***ps==929*5b2f223d8-6517545-13*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685435000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o4e19p310a*0o9=0244*3l1=5483658755t3==171***ps==929*5b2f223d8-6517545-13*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:50:34+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:50:35Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"6393a9004b6a40828b56ad1c36accca1","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:50:35","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '579c0c7c-c848-4219-bd1c-732973af1c4d',
      out: false,
      createAt: '2025-07-28 14:38:42',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p310a*4o1=8244*3l7=7403698755t3==181***ps==929*5b2f223d8-6517715-17*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685439000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p310a*4o1=8244*3l7=7403698755t3==181***ps==929*5b2f223d8-6517715-17*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:50:39+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:50:39Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"3490cb8e2b3a416c8da4c682fd8d5eba","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:50:39","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: 'ca41bd06-3313-456a-875a-8054f55f6840',
      out: false,
      createAt: '2025-07-28 14:38:47',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o0e19p510a*9o3=8244*2l5=7424648755t3==191***ps==929*5b2f223d8-6517965-10*lf4-od378f471231","componentId":"ibehavior","happenedTime":1753685444000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o0e19p510a*9o3=8244*2l5=7424648755t3==191***ps==929*5b2f223d8-6517965-10*lf4-od378f471231\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:50:44+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:50:44Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"b9e9d8f694fa4b3298df47c29e153c58","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:50:44","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '70ec42f6-6d4b-4a8c-b89f-345a5c94660d',
      out: false,
      createAt: '2025-07-28 14:38:53',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o8e19p020a7356-8d322f2b5*929==sp**011==t5*7816534759l0*4622=7o2*205-=3*1f40od178l47-2313f1","componentId":"ibehavior","happenedTime":1753685451000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o8e19p020a7356-8d322f2b5*929==sp**011==t5*7816534759l0*4622=7o2*205-=3*1f40od178l47-2313f1\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:50:50+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:50:51Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"67d65ee8eda94ff69b08c1b56ace3b78","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:50:51","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: 'bda442db-e1dc-4db3-bef8-af0781744ee3',
      out: false,
      createAt: '2025-07-28 14:38:55',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p720a7756-8d322f2b5*929==sp**111==t5*7816534657l2*4827=4o1*425-=5*1f49od178l47-2313f1","componentId":"ibehavior","happenedTime":1753685452000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o2e19p720a7756-8d322f2b5*929==sp**111==t5*7816534657l2*4827=4o1*425-=5*1f49od178l47-2313f1\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:50:52+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:50:52Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"ad4e16d7d623481090385306e5d1c74e","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:50:52","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    },
    {
      mid: '752239bf-92a0-4dc3-8a62-437e78a99e20',
      out: false,
      createAt: '2025-07-28 14:39:26',
      topic: 'artemis/even_behavior/7617069061/admin',
      payload:
        '{"snappedPicUrl":"http://10.71.122.8:6120/pic?dd44=0a29i85-=o8e19p320a7156-8d322f2b5*929==sp**211==t5*7816834657l3*4929=4o4*765-=7*1f42od178l47-2313f1","componentId":"ibehavior","happenedTime":1753685483000,"transInfo":"{\\"analysisResult\\":[{\\"behaviorAnalysisResult\\":[{\\"behaviorAttrs\\":{\\"ruleCustomName\\":\\"key1\\",\\"eventType\\":\\"loitering\\",\\"ruleID\\":\\"5a569967f04b7f1\\"},\\"bkImage\\":\\"http://10.71.122.8:6120/pic?dd44=0a29i85-=o8e19p320a7156-8d322f2b5*929==sp**211==t5*7816834657l3*4929=4o4*765-=7*1f42od178l47-2313f1\\",\\"bkImageType\\":\\"url\\",\\"id\\":1}],\\"targetAttrs\\":{\\"regionIndexCode\\":\\"f125567de2b64709b5a83638066ba468\\",\\"transmission\\":{\\"taskIds\\":\\"f6e5061eec3d4b828da91e7a70a80d43\\"},\\"recognitionSign\\":2,\\"mainTaskId\\":\\"56352ffe74b045c4a7a8a0a586092c84\\",\\"videoStructure\\":1,\\"timeZone\\":28800,\\"crossingId\\":1,\\"cameraIndexCode\\":\\"0262b4414a2840e6a1f26a8d64f8cf7c\\",\\"analysisType\\":\\"realtime\\",\\"algorithmTag\\":\\"11-1-3.3.8_1.9.0\\"},\\"taskID\\":\\"temp_7f9567dd17464bbda50190be25048745\\",\\"timeStamp\\":\\"2025-07-28T14:51:23+08:00\\"}],\\"dateTime\\":\\"2025-07-28T06:51:23Z\\",\\"eventDescription\\":\\"behaviorResult\\",\\"eventType\\":\\"behaviorResult\\",\\"ipAddress\\":\\"10.71.115.16\\",\\"protocol\\":\\"HTTP\\"}","eventType":"loitering","uuid":"d234f8bad32644ecac8a1f22cf14d344","inputSourceName":"站厅中部扶梯东侧#2定","tags":{"{报警时间}":"2025-07-28 14:51:23","{报警类型}":"loitering","{设备名称}":"站厅中部扶梯东侧#2定"},"deviceIndexcode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventLevel":"h","deploymentId":"56352ffe74b045c4a7a8a0a586092c84","inputSourceIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c","eventOjectiveName":"站厅中部扶梯东侧#2定","eventObjectiveIndexCode":"0262b4414a2840e6a1f26a8d64f8cf7c"}',
      qos: 0,
      retain: false
    }
  ]
  let count = 0
  const timer = setInterval(() => {
    ws.send(JSON.stringify(data[Random.natural(0, data.length - 1)]))
    count++
    if (count > 20) {
      clearInterval(timer)
    }
  }, 10000)
})
