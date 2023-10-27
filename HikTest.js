// 海康sdk
const Hikopenapi = require('hikopenapi-node')
const Koa = require('koa')
const Router = require('koa-router')
const Stomp = require('stompjs');

const app = new Koa()
const router = new Router()
const appKey = '27104148'
const appSecret = 'Rue9bhB1TRnOf0dFDjvj'

// get trees
const getTrees = () => {
    return new Promise(async (resolve) => {
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/resource/v1/unit/getAllTreeCode'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({})
        const timeout = 15
        const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
        resolve(res)
    })
}

//获取事件
router.get('/getTrees', async (ctx) => {
    const result = await getTrees()
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

// get regions
const getRegions = () => {
    return new Promise(async (resolve) => {
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/resource/v1/regions'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({
            "pageNo": 1,
            "pageSize": 20,
            "treeCode": "0"
        })
        const timeout = 15
        const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
        resolve(res)
    })
}

//获取事件
router.get('/getRegions', async (ctx) => {
    const result = await getRegions()
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

// get camera from reagions
const getRegionCameras = () => {
    return new Promise(async (resolve) => {
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/resource/v1/regions/regionIndexCode/cameras'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({
            "pageNo": 1,
            "pageSize": 20,
            "regionIndexCode": "38f3c0dcb23145cd8c8fc9ab85aa841e",
            "treeCode": "0"
        })
        const timeout = 15
        const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
        resolve(res)
    })
}

//获取事件
router.get('/getRegionCameras', async (ctx) => {
    const result = await getRegionCameras()
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

// get cameras
const getCameras = () => {
    return new Promise(async (resolve) => {
        // const requestUrl = 'https://123.123.123.123:443/artemis/api/video/v1/cameras/previewURLs'
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/video/v2/cameras/previewURLs'
        const requestUrl2 = '/artemis/api/resource/v1/cameras'
        // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({
            "pageNo": 1,
            "pageSize": 20,
            "treeCode": "0"
        })
        const timeout = 15
        const res = await Hikopenapi.httpPost(baseUrl + requestUrl2, headers, body, appKey, appSecret, timeout)
        resolve(res)
    })
}

// get stream
const getUrl = (type) => {
    return new Promise(async (resolve) => {
        // const requestUrl = 'https://123.123.123.123:443/artemis/api/video/v1/cameras/previewURLs'
        // const baseUrl = 'https://192.168.10.70:443'
        // const requestUrl = '/artemis/api/video/v2/cameras/previewURLs'
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/video/v1/cameras/previewURLs'
        // const requestUrl2 = '/artemis/api/resource/v1/cameras'
        // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({
            cameraIndexCode: '67b0ed528012463bbec5c58d21926b39',
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
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/video/v1/cameras/playbackURLs'
        // const requestUrl2 = '/artemis/api/resource/v1/cameras'
        // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({
            "planID": "100001",
            "beginTime": "2017-09-26T00:00:00.000+08:00",
            "endTime": "2023-09-26T20:00:00.000+08:00",
            cameraIndexCode: '67b0ed528012463bbec5c58d21926b39',
            "recordLocation": "0",
            "protocol": "rtsp",
            "needReturnClipInfo": true,
            "uuid": "4750e3a4a5bbad3cda5bbad3cd4af9ed5101",
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
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/common/v1/event/getTopicInfo'
        const requestUrl2 = '/artemis/api/nms/v1/alarm/getTopic'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
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
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/common/v1/event/getTopicInfo'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({
            "eventTypes": [
                131605,
                131676,
                131677,
                131678,
                131670
            ]
        })
        const timeout = 15
        const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
        resolve(res)
    })
}
// 报警
const getAlarm = () => {
    return new Promise(async (resolve) => {
        const baseUrl = 'https://192.168.10.10:443'
        const requestUrl = '/artemis/api/nms/v1/alarm/alarmInfo'
        const headers = { 'content-type': 'application/json', accept: 'application/json' }
        const body = JSON.stringify({})
        const timeout = 15
        const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
        resolve(res)
    })
}

//获取相机列表
router.get('/getCameras', async (ctx) => {
    const result = await getCameras()
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

//获取事件
router.get('/getTopic', async (ctx) => {
    const result = await getTopic()
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

//获取报警
router.get('/getAlarm', async (ctx) => {
    const result = await getAlarm()
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
})


//ws
router.get('/getWsUrl', async (ctx) => {
    const result = await getUrl('ws')
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

//rtsp
router.get('/getRtspUrl', async (ctx) => {
    const result = await getUrl('rtsp')
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

//hls
router.get('/getHlsUrl', async (ctx) => {
    const result = await getUrl('hls')
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text)
    ctx.body = text
})

const getMq = async () => {
    const result = await getTopicInfo()
    console.log(JSON.parse(result))
    let buff = new Buffer(JSON.parse(result).data, 'base64')
    let text = buff.toString('ascii')
    console.log(text);
    if (text.data && text.data.topicName) {
        const { host, clientId, userName, password } = result.data
        const ip = '192.168.10.10'
        const port = 1883
        const headers = {
            clientId,
            userName,
            password
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
            client.subscribe(
                // 订阅到交换机
                'artemis/event_face/3187675137/admin',
                responseCallback
            )
            client.subscribe(
                // 订阅到交换机
                'artemis/event_physicalConfront/131677/admin',
                responseCallback
            )
            client.subscribe(
                // 订阅到交换机
                'artemis/event_framesPeopleCounting/131676/admin',
                responseCallback
            )
            client.subscribe(
                // 订阅到交换机
                'artemis/event_indoorPhysicalConfront/131678/admin',
                responseCallback
            )
            client.subscribe(
                // 订阅到交换机
                'artemis/event_fallDown/131605/admin',
                responseCallback
            )
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
                const client = Stomp.overTCP(ip, port)
                client.connect(headers, onConnected, onFailed)
            }, 3000)
        }
        const client = Stomp.overTCP(ip, port)
        client.connect(headers, onConnected, onFailed)
    }
}
// getMq()

app.use(router.routes()).use(router.allowedMethods()) //把前面所有定义的方法添加到app应用上去
app.listen(4884)