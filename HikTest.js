// 海康sdk
const Hikopenapi = require('hikopenapi-node')
// const Hikopenapi = require('hikopenapi-native-node')
const Koa = require('koa')
const Router = require('koa-router')
const StompNode = require('stompjs')
const mqtt = require('mqtt')
// 处理视频乱码
const iconv = require('iconv-lite')
//引入ws模块
const WebSocket = require('ws')

const app = new Koa()
const router = new Router()

// const wsMq = new WebSocket.Server({ port: 9119 })
// const wsClients = new Set()
// const appKey = '27104148'
// const appSecret = 'Rue9bhB1TRnOf0dFDjvj'
const appKey = '27568725'
const appSecret = 'tWGt6G45vAPaAFX1CUrb'
// 天津7
// const appKey = '28429618'
// const appSecret = 'tbeCFQJK3tSzUFEkN3I1'
// 15鼓楼地址 : 10.71.115.1:9443
// 10天塔地址 : 10.71.110.1:9443
const baseUrl = 'https://192.168.10.70:443'
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
      pageSize: 20,
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
      pageSize: 20,
      regionIndexCode: '0deb1bb3a0fb4e91b77b1cc44db64864',
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

// get cameras 关键方法，里面啥都有
const getCameras = () => {
  return new Promise(async (resolve) => {
    // const requestUrl = 'https://123.123.123.123:443/artemis/api/video/v1/cameras/previewURLs'

    const requestUrl = '/artemis/api/video/v2/cameras/previewURLs'
    const requestUrl2 = '/artemis/api/resource/v1/cameras'
    // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'

    const body = JSON.stringify({
      pageNo: 1,
      pageSize: 400,
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
  let cameraIndexCode
  if (indexCode) {
    cameraIndexCode = indexCode
  } else {
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
      // cameraIndexCode: '0deb1bb3a0fb4e91b77b1cc44db64864',
      // planID: cameraIndexCode,
      cameraIndexCode,
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
      cameraIndexCode: '67b0ed528012463bbec5c58d21926b39',
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
    //     "eventTypes": [
    //         131605,
    //         131676,
    //         131677,
    //         131678,
    //         131670
    //     ]
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
  console.log('result', result)

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

const getStompMq = async () => {
  const result = await getTopicInfo()
  let text = convertData(JSON.parse(result)?.data)
  if (text?.data && text?.data?.topicName) {
    const { host, clientId, userName, password, topicName } = text?.data
    const hostArr = host.replace('tcp://', '').split(':')
    const ip = hostArr[0]
    const port = parseInt(hostArr[1])
    const headers = {
      host,
      'client-id': clientId,
      login: userName,
      passcode: password
    }
    // const headers = {
    //     // login: 'artemis_27104148',
    //     // passcode: '7fbaa20d6fea'
    //     clientId: '6ebbc06746c649d4b6af16f5f4054a8d',
    //     userName: 'artemis_27104148',
    //     password: '7fbaa20d6fea'
    // }
    const onConnected = (frame) => {
      console.log(frame)
      Object.keys(topicName).forEach((key) => {
        client.subscribe(topicName[key], responseCallback)
      })
    } // 失败后的处理
    const responseCallback = (frame) => {
      console.log(frame.body)
      try {
        // 格式化MQ消息
        let data = JSON.parse(frame.body)
        console.log(data)
      } catch (e) {
        console.log(e)
      }
    }
    const onFailed = (frame) => {
      console.log('MQ Failed: ' + frame) // 失败后  等待5秒后重新连接
      setTimeout(() => {
        const client = StompNode.overTCP(ip, port)
        client.connect(headers, onConnected, onFailed)
      }, 3000)
    }
    const client = Stomp.overTCP(ip, port)
    client.connect(headers, onConnected, onFailed)
  }
}
// getStompMq()

// 通过mqtt获取mq消息，之后通过websocket转发给前端
const getMqttMq = async () => {
  // 获取mq订阅信息
  const result = await getTopicInfo()
  const text = convertData(JSON.parse(result)?.data)
  if (text.data && text.data.topicName) {
    const { host, clientId, userName, password, topicName } = text?.data
    // 创建mqtt客户端连接mq服务器
    const mqClient = mqtt.connect(host, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      login: userName,
      passcode: password,
      reconnectPeriod: 1000
    })
    // topic对象转换为数组，便于订阅
    const topicArr = Object.values(topicName)
    mqClient.on('connect', (e) => {
      console.log('Connected', e)
      wsMq.on('connection', (ws) => {
        wsClients.add(ws)
        ws.on('close', () => wsClients.delete(ws))
      })
      // 订阅
      mqClient.subscribe(topicArr, () => {
        console.log(`Subscribe to topic '${topicArr}'`)
      })
    })
    mqClient.on('message', (topic, message) => {
      console.log('Received Message:', topic, message.toString())
      // 转发消息
      const msg = JSON.stringify({ topic, data: payload.toString() })
      wsClients.forEach((client) => client.send(msg))
    })
  } else {
    console.log('获取MQ信息失败:', convertData(JSON.parse(result)?.data))
  }
}
// getMqttMq()

app.use(router.routes()).use(router.allowedMethods()) //把前面所有定义的方法添加到app应用上去
app.listen(4885)
