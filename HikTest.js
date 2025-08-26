const dayjs = require('dayjs')
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

// 是否为测试环境
const isTest = true
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

// 获取区域信息列表
router.get('/getRegions', async (ctx) => {
  const result = await getRegions()
  let text = convertData(JSON.parse(result)?.data)
  ctx.body = text
})

// get camera from reagions
const getRegionCameras = (code) => {
  return new Promise(async (resolve) => {
    const requestUrl = '/artemis/api/resource/v1/regions/regionIndexCode/cameras'
    const body = JSON.stringify({
      pageNo: 1,
      pageSize: 200,
      regionIndexCode: code ?? 'f1af7246-a4e7-4edf-b2c4-55e51398d267',
      treeCode: '0'
    })
    const timeout = 15
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

// 根据区域信息，获取该区域下所有摄像头信息
router.get('/getRegionCameras', async (ctx) => {
  const { code } = ctx.query ?? ''
  const result = await getRegionCameras(code)
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
      pageSize: 500,
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
  const inoutArr = []
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
        messageArr.forEach((msg) => {
          ws.send(msg)
        })
        inoutArr.forEach((msg) => {
          ws.send(msg)
        })
        ws.on('close', () => {
          console.log('delete ws')
          wsClients.delete(ws)
        })
      })
      // 订阅
      mqClient.subscribe(topicArr, () => {
        console.log(`Subscribe to topic ${topicArr}'`)
      })
    })
    mqClient.on('message', (topic, message) => {
      try {
        console.log('Received Message:', topic)
        if (topic === topicName['behavior']) {
          let data
          // 获取data
          if (JSON.parse(message.toString())?.payload) {
            console.log(JSON.parse(JSON.parse(message.toString())?.payload))
            data = JSON.parse(JSON.parse(message.toString())?.payload)
          } else {
            data = JSON.parse(message.toString())
          }
          const type = data?.eventType
          console.log('eventType', type)
          switch (type) {
            case 'loitering':
              messageArr.push(message.toString())
              console.log('messageArr', messageArr)
              // 转发消息
              wsClients.forEach((client) => {
                client.send(message.toString())
                if (messageArr.length > 100) messageArr.shift()
              })
              break
            case 'framesPeopleCounting':
              // 转发消息
              wsClients.forEach((client) => {
                client.send(message.toString())
              })
              break
            case 'PeopleCounting':
              const isSameDate = (timestamp1, timestamp2) => {
                const date1 = new Date(timestamp1)
                const date2 = new Date(timestamp2)
                return (
                  date1.getFullYear() === date2.getFullYear() &&
                  date1.getMonth() === date2.getMonth() &&
                  date1.getDate() === date2.getDate()
                )
              }

              // 隔日的数据要清除
              if (inoutArr.length > 0) {
                const time1 = JSON.parse(inoutArr[0])?.happenedTime
                const time2 = JSON.parse(message.toString())?.happenedTime
                if (!isSameDate(time1, time2)) {
                  inoutArr = []
                }
              }

              inoutArr.push(message.toString())
              // 转发消息
              wsClients.forEach((client) => {
                client.send(message.toString())
              })
              break
          }
        }
      } catch (e) {
        console.log('error', e)
      }
    })
  } else {
    console.log('获取MQ信息失败:', convertData(JSON.parse(result)?.data))
  }
}
// getMqttMq()

if (isTest) {
  wsMq.on('connection', (ws) => {
    const fs = require('fs')
    fs.readFile('mqdata.json', 'utf8', (err, res) => {
      if (err) {
        console.error(err)
        return
      }
      const data = JSON.parse(res)
      data.forEach((v) => {
        const data = JSON.parse(v.payload)
        data.happenedTime = dayjs(parseInt(data.happenedTime))
          .set('year', dayjs().year())
          .set('month', dayjs().month())
          .set('date', dayjs().date())
          .valueOf()
        v.payload = JSON.stringify(data)
        data.happenedTime = ws.send(JSON.stringify(v))
      })
    })

    // let count = 0
    // const send = () => {
    //   ws.send(JSON.stringify(data[Random.natural(0, data.length - 1)]))
    //   ws.send(JSON.stringify(data[Random.natural(0, data.length - 1)]))
    //   count++
    // }
    // send()
    // const timer = setInterval(send, 1000)
  })
}
