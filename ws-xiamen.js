const WebSocket = require('ws') //引入模块
const Mock = require('mockjs')
const { faker } = require('@faker-js/faker/locale/zh_CN');
const sxlList = require('./data')
// 海康sdk
const Hikopenapi = require('hikopenapi-node')
const Koa = require('koa')
const Router = require('koa-router')
// nacos
const { NacosNamingClient } = require('nacos');

const app = new Koa()
const router = new Router()

// 创建 nacos 客户端实例
const client = new NacosNamingClient({
  logger: console,
  serverList: '192.168.20.179:8848',
  namespace: 'public',
})

// get stream
const getUrl = (type) => {
  return new Promise(async (resolve) => {
    // const requestUrl = 'https://123.123.123.123:443/artemis/api/video/v1/cameras/previewURLs'
    const baseUrl = 'https://192.168.10.70:443'
    const requestUrl = '/artemis/api/video/v2/cameras/previewURLs'
    const requestUrl2 = '/artemis/api/resource/v1/cameras'
    // const requestUrl = 'https://192.168.10.70:443/api/video/v2/cameras/previewURLs'
    const headers = { 'content-type': 'application/json', accept: 'application/json' }
    const body = JSON.stringify({
      cameraIndexCode: '0b438f15c7754a788ec3cdc239f6be17',
      streamType: 0,
      protocol: type,
      transmode: 1,
      expand: 'streamform=rtp&transcode=1&videotype=h264'
    })
    const timeout = 15
    const appKey = '27568725'
    const appSecret = 'tWGt6G45vAPaAFX1CUrb'
    const res = await Hikopenapi.httpPost(baseUrl + requestUrl, headers, body, appKey, appSecret, timeout)
    resolve(res)
  })
}

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

// // nacos
// router.get('/nacos', async (ctx) => {
//   // subscribe instance
//   // const url = new Promise((resolve) => {
//   //   // 服务名
//   //   client.subscribe({
//   //     serviceName: 'smart-alarm',
//   //     groupName: 'DEFAULT_GROUP',
//   //     clusters: 'DEFAULT'
//   //   }, (hosts) => {
//   //     console.log(hosts)
//   //     resolve(hosts)
//   //   })
//   // })
//   // const result = await url
//   // const result = 'ws://192.168.31.61'
//   const result = 'ws://192.168.19.27'
//   ctx.body = result
// })

app.use(router.routes()).use(router.allowedMethods()) //把前面所有定义的方法添加到app应用上去
app.listen(4396)

const Random = Mock.Random

// 综合看板
const wsPublic = new WebSocket.Server({ port: 9484 })
// 巡检实时数据
const patrol = new WebSocket.Server({ port: 9486 })
// 环境监测
const envMonitor = new WebSocket.Server({ port: 9490 })
// 风水联动的能管管理
const energyWs = new WebSocket.Server({ port: 9493 })

// 综合看板 9492
const controlWs = new WebSocket.Server({ port: 9482 })

// // 综合看板
// const wsPublic = new WebSocket.Server({ port: 9514 })
// // 巡检实时数据
// const patrol = new WebSocket.Server({ port: 9515 })
// // 环境监测
// const envMonitor = new WebSocket.Server({ port: 9516 })
// // 风水联动的能管管理
// const energyWs = new WebSocket.Server({ port: 9518 })

// const wsFlow = new WebSocket.Server({ port: 9484 })
const wsEnv = new WebSocket.Server({ port: 9483 })
const inoutEnv = new WebSocket.Server({ port: 9485 })

const alarm = new WebSocket.Server({ port: 9489 })



const testUnity = new WebSocket.Server({ port: 32131 })

// #define JASON_MONITORENV_DATANUM "monitorEnvAreaNum"
// #define JASON_MONITORENV_ENVAREATYPEID "envAreaTypeID"
// #define JASON_MONITORENV_ENVAREATYPEDESC "envAreaTypeDesc"
// #define JASON_MONITORENV_MONITORTYPE "monitorType"
// #define JASON_MONITORENV_MONITORTYPEID "envNameTypeID"
// #define JASON_MONITORENV_MONITORTYPEDESC "envNameTypeDesc"
// #define JASON_MONITORENV_MONITORTYPEUNIT "envNameTypeUnit"
// #define JSON_REGDATA_MONITORYCVALUE "monitorYcValue"

const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 综合看板ws
wsPublic.on('connection', (ws) => {
  const staitonsFlow = () => {
    const stationArr = Array.from({ length: 4 }, () => faker.address.streetName() + '站')
    const data = {
      monPaxData: [
      ]
    }
    stationArr.forEach((val) => {
      const data1 = {
        "monPaxStation": val,
        "monPaxType": 0,
        "monPaxYcValue": faker.datatype.number({ min: 50, max: 300 })
      }
      const data2 = {
        "monPaxStation": val,
        "monPaxType": 1,
        "monPaxYcValue": faker.datatype.number({ min: 50, max: 300 })
      }
      data.monPaxData.push(data1, data2)
    })
    ws.send(JSON.stringify(data))

    //推送变化值
    const staitonsFlowTimer = setInterval(() => {
      const newData = {
        monPaxData: [
        ]
      }
      const index = Random.natural(0, 1)
      const index2 = Random.natural(2, 3)

      const data1 = {
        "monPaxStation": stationArr[index],
        "monPaxType": Random.natural(0, 1),
        "monPaxYcValue": faker.datatype.number({ min: 50, max: 300 })
      }
      const data2 = {
        "monPaxStation": stationArr[index2],
        "monPaxType": Random.natural(0, 1),
        "monPaxYcValue": faker.datatype.number({ min: 50, max: 300 })
      }
      newData.monPaxData.push(data1, data2)
      ws.send(JSON.stringify(newData), (err) => {
        if (err) {
          clearInterval(staitonsFlowTimer)
          ws.close()
        }
      })
    }, 2000)
  }
  staitonsFlow()

  // 客流趋势ws
  const inout = () => {
    const place = Random.natural(7, 9)
    let res = {
      monPaxTrend: []
    }
    for (let index = 0; index < place; index++) {
      const half = index % 2
      let hour = Math.floor(index / 2) + 6
      if (hour < 10) {
        hour = '0' + hour
      }
      let time
      if (half === 1) {
        time = `${hour}:30`
      } else {
        time = `${hour}:00`
      }
      const obj = {
        monPaxRecordTime: time,
        inboardPaxNum: Random.natural(0, 1000),
        outboardPaxNum: Random.natural(0, 1000)
      }
      res.monPaxTrend.push(obj)
    }
    ws.send(JSON.stringify(res))
    ws.on('message', (message) => {
      // console.log('flow received: %s', message)
    })
    //推送变化值
    const inoutTimer = setInterval(() => {
      let obj = {
        monPaxRecordTime: Random.time('HH:mm'),
        inboardPaxNum: Random.natural(0, 1000),
        outboardPaxNum: Random.natural(0, 1000)
      }
      res.monPaxTrend.push(obj)
      // console.log(res)
      ws.send(JSON.stringify(res), (err) => {
        if (err) {
          clearInterval(inoutTimer)
          ws.close()
        }
      })
    }, 6000)
  }
  inout()


  ws.on('message', (message) => {
    console.log('staitonsDev received: %s', message)
    const devHealthTypeData = {
      devHealthTypeData: [
        {
          devHealthDevType: 0,
          devHealthState: [
            {
              devHealthStateDesc: '正常',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '隔离',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 1,
          devHealthState: [
            {
              devHealthStateDesc: '运行',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '停止',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 2,
          devHealthState: [
            {
              devHealthStateDesc: '运行',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '停止',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 3,
          devHealthState: [
            {
              devHealthStateDesc: '运行',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '停止',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 4,
          devHealthState: [
            {
              devHealthStateDesc: '正常',
              devHealthStateValue: 0,
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 1
            }
          ]
        },
        {
          devHealthDevType: 5,
          devHealthState: [
            {
              devHealthStateDesc: '正常',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 1
            }
          ]
        },
        {
          devHealthDevType: 6,
          devHealthState: [
            {
              devHealthStateDesc: '开启',
              devHealthStateValue: 0,
            },
            {
              devHealthStateDesc: '关闭',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 7,
          devHealthState: [
            {
              devHealthStateDesc: '开启',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '关闭',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 8,
          devHealthState: [
            {
              devHealthStateDesc: '开启',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '关闭',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 9,
          devHealthState: [
            {
              devHealthStateDesc: '开启',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '关闭',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 10,
          devHealthState: [
            {
              devHealthStateDesc: '开启',
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '关闭',
              devHealthStateValue: 1
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 2
            }
          ]
        }
      ]
    }
    const devUpdate = () => {
      const update = {
        devHealthMon: []
      }
      const data = devHealthTypeData.devHealthTypeData
      data.forEach((val) => {
        const obj = {
          devHealthDevType: val.devHealthDevType,
          devHealthState: []
        }
        val.devHealthState.forEach((v) => {
          const stateObj = {
            devHealthStateValue: v.devHealthStateValue,
            devHealthStateNum: faker.datatype.number({ min: 2, max: 30 })
          }
          obj.devHealthState.push(stateObj)
        })
        update.devHealthMon.push(obj)
      })
      ws.send(JSON.stringify(update), (err) => {
        if (err) {
          ws.close()
          clearInterval(devTimer)
        }
      })
    }

    const devTimer = setInterval(() => {
      devUpdate()
    }, 5000)
    ws.send(JSON.stringify(devHealthTypeData), (err) => {
      if (err) {
        ws.close()
        clearInterval(devTimer)
      }
    })
    devUpdate()
  })
})

// 环境监测ws
wsEnv.on('connection', (ws) => {
  // 环境监测
  let res = {
    monitorEnvAreaNum: 2,
    path: [
      {
        envAreaTypeID: 0,
        envAreaTypeDesc: '站厅',
        monitorType: [
          {
            envNameTypeID: 0,
            envNameTypeDesc: '温度',
            envNameTypeUnit: '℃'
          },
          {
            envNameTypeID: 1,
            envNameTypeDesc: '湿度',
            envNameTypeUnit: '%'
          },
          {
            envNameTypeID: 2,
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'ppm'
          },
          {
            envNameTypeID: 3,
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'ppm'
          },
          {
            envNameTypeID: 4,
            envNameTypeDesc: 'SO₂',
            envNameTypeUnit: 'ppm'
          },
          {
            envNameTypeID: 5,
            envNameTypeDesc: 'CO₂',
            envNameTypeUnit: 'ppm'
          }
        ]
      },
      {
        envAreaTypeID: 1,
        envAreaTypeDesc: '站台',
        monitorType: [
          {
            envNameTypeID: 0,
            envNameTypeDesc: '温度',
            envNameTypeUnit: '℃'
          },
          {
            envNameTypeID: 1,
            envNameTypeDesc: '湿度',
            envNameTypeUnit: '%'
          },
          {
            envNameTypeID: 2,
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'ppm'
          },
          {
            envNameTypeID: 3,
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'ppm'
          },
          {
            envNameTypeID: 4,
            envNameTypeDesc: 'SO₂',
            envNameTypeUnit: 'ppm'
          },
          {
            envNameTypeID: 5,
            envNameTypeDesc: 'CO₂',
            envNameTypeUnit: 'ppm'
          }
        ]
      }
    ]
  }
  res = JSON.stringify(res)
  ws.send(res)
  ws.on('message', (message) => {
    console.log('env received: %s', message)
  })
  const send = () => {
    let res = {
      rtYcNum: 12,
      data: [
        {
          envAreaTypeID: 1, //0:站台,1:站厅
          envNameTypeID: 0,
          monitorYcValue: Random.natural(-20, 40)
        },
        {
          envAreaTypeID: 1,
          envNameTypeID: 1,
          monitorYcValue: Random.natural(0, 100)
        },
        {
          envAreaTypeID: 1,
          envNameTypeID: 2,
          monitorYcValue: Random.natural(100, 1000)
        },
        {
          envAreaTypeID: 1,
          envNameTypeID: 3,
          monitorYcValue: Random.natural(100, 1000)
        },
        {
          envAreaTypeID: 1,
          envNameTypeID: 4,
          monitorYcValue: Random.natural(100, 1000)
        },
        {
          envAreaTypeID: 1,
          envNameTypeID: 5,
          monitorYcValue: Random.natural(100, 1000)
        },
        {
          envAreaTypeID: 0,
          envNameTypeID: 0,
          monitorYcValue: Random.natural(-20, 40)
        },
        {
          envAreaTypeID: 0,
          envNameTypeID: 1,
          monitorYcValue: Random.natural(0, 100)
        },
        {
          envAreaTypeID: 0,
          envNameTypeID: 2,
          monitorYcValue: Random.natural(100, 1000)
        },
        {
          envAreaTypeID: 0,
          envNameTypeID: 3,
          monitorYcValue: Random.natural(100, 1000)
        },
        {
          envAreaTypeID: 0,
          envNameTypeID: 4,
          monitorYcValue: Random.natural(100, 1000)
        },
        {
          envAreaTypeID: 0,
          envNameTypeID: 5,
          monitorYcValue: Random.natural(100, 1000)
        }
      ]
    }
    res = JSON.stringify(res)
    ws.send(res, (err) => {
      // console.log(envTimer)
      if (err) {
        if (envTimer) {
          clearInterval(envTimer)
        }
        ws.close()
      }
    })
  }
  send()
  // //推送变化值
  const envTimer = setInterval(send, 4000)
})

// 客流趋势ws
inoutEnv.on('connection', (ws) => {
  const place = Random.natural(7, 9)
  let res = {
    rtDataNum: place,
    data: []
  }
  for (let index = 0; index < place; index++) {
    const half = index % 2
    let hour = Math.floor(index / 2) + 6
    if (hour < 10) {
      hour = '0' + hour
    }
    let time
    if (half === 1) {
      time = `${hour}:30`
    } else {
      time = `${hour}:00`
    }
    const obj = {
      recordTime: time,
      inboardPassNum: Random.natural(300, 800),
      outboardPassNum: Random.natural(300, 800)
    }
    res.data.push(obj)
  }
  ws.send(JSON.stringify(res))
  ws.on('message', (message) => {
    // console.log('flow received: %s', message)
  })
  //推送变化值
  const inoutTimer = setInterval(() => {
    let obj = {
      recordTime: Random.time('HH:mm'),
      inboardPassNum: Random.natural(300, 800),
      outboardPassNum: Random.natural(300, 800)
    }
    res.data.push(obj)
    // console.log(res)
    ws.send(JSON.stringify(res), (err) => {
      if (err) {
        clearInterval(inoutTimer)
        ws.close()
      }
    })
  }, 6000)
})

// 报警
// deleteAlarmData
// updateAlarmData
// addAlarmData
// initAlarmData
alarm.on('connection', (ws) => {
  let count = Random.natural(7, 13)
  let res = {
    initAlarmData: []
  }
  for (let index = 0; index <= count; index++) {
    const obj = Mock.mock({
      alarmId: index,
      // ymd: Random.date('yyyy-MM-dd'),
      // hmsms: Random.time(),
      ymd: Random.date('yyyyMMdd'),
      hmsms: 162412333,
      alarmlevel: Random.natural(1, 3),
      'alarmstate|1': [1, 2, 3, 4, 5, null], //报警、事故、恢复、已确认
      tonetimes: '语音报警次数', //暂时未用到
      equipmentid: sxlList[index] + '',
      station_desc: '渌水道站',
      'system_name|1': ['FAS', 'AFC', 'CCTV'],
      'system_desc|1': ['AA系统', 'BB系统', 'CC系统'],
      member_name0: '成员名', //暂时未用到
      char_info: '宇视系统IABA:109VC渌水道-上行尾' + index,
      tone_info: '事件语音内容', //暂时未用到
      'cameraGrp|0-4': [0] //摄像机组名
    })

    res.initAlarmData.push(obj)
  }
  ws.send(JSON.stringify(res))
  ws.on('message', (message) => {
    console.log('alarm received: %s', message)
    // 更新
    if (JSON.parse(message).alarmidlist) {
      const idList = JSON.parse(message).alarmidlist
      idList.forEach((val) => {
        let updateIndex = res.initAlarmData.findIndex((data) => data.alarmId === val)
        let updateObj = res.initAlarmData[updateIndex]
        updateObj.alarmstate = 5
        let update = {
          updateAlarmData: updateObj
        }
        ws.send(JSON.stringify(update), (err) => {
          if (err) {
            ws.close()
          }
        })
      })
    }
  })
  //推送变化值
  try {
    const alarmTimer = setInterval(() => {
      if (count < sxlList.length) count++
      // 新增
      let add = {
        addAlarmData: Mock.mock({
          alarmId: count,
          ymd: Random.date('yyyyMMdd'),
          hmsms: 162412333,
          alarmlevel: Random.natural(1, 3),
          'alarmstate|1': [1, 2, 3, 4, 5, null], //报警、事故、恢复、已确认
          tonetimes: '语音报警次数', //暂时未用到
          equipmentid: sxlList[count] + '',
          station_desc: '渌水道站',
          'system_name|1': ['FAS', 'AFC', 'CCTV'],
          'system_desc|1': ['AA系统', 'BB系统', 'CC系统'],
          member_name0: '成员名', //暂时未用到
          char_info: '宇视系统IABA:109VC渌水道-上行尾' + count,
          tone_info: '事件语音内容', //暂时未用到
          'cameraGrp|0-4': [0] //摄像机组名
        })
      }
      // console.log(res)
      res.initAlarmData.push(add.addAlarmData)
      ws.send(JSON.stringify(add), (err) => {
        if (err) {
          clearInterval(alarmTimer)
          ws.close()
        }
      })
      // 更新
      let updateIndex = Random.natural(0, res.initAlarmData.length - 1)
      let updateObj = res.initAlarmData[updateIndex]
      updateObj.char_info = '更新了' + count
      let update = {
        updateAlarmData: updateObj
      }
      ws.send(JSON.stringify(update), (err) => {
        if (err) {
          clearInterval(alarmTimer)
          ws.close()
        }
      })
      // 删除
      let delIndex = Random.natural(0, res.initAlarmData.length - 1)
      let del = {
        deleteAlarmData: res.initAlarmData[delIndex]
      }
      res.initAlarmData.splice(delIndex, 1)
      ws.send(JSON.stringify(del), (err) => {
        if (err) {
          clearInterval(alarmTimer)
          ws.close()
        }
      })
      // 事件
      let event = {
        EventData: [
          Mock.mock({
            ymd: Random.date('yyyyMMdd'),
            hmsms: 162412333,
            alarmlevel: Random.natural(0, 3),
            'alarmstate|1': [1, 2, 3, 4, 5, null], //报警、事故、恢复、已确认
            tonetimes: '语音报警次数', //暂时未用到
            station_desc: '渌水道站',
            'system_desc|1': ['AA系统', 'BB系统', 'CC系统'],
            member_name0: '成员名', //暂时未用到
            char_info: '电伴热DBR_s_032号回路系统运行/停止状态',
            tone_info: '事件语音内容' //暂时未用到
          })
        ]
      }
      ws.send(JSON.stringify(event), (err) => {
        if (err) {
          clearInterval(alarmTimer)
          ws.close()
        }
      })
    }, 5000)
  } catch (error) {
    console.log(error)
  }
})

// 自动巡检ws
patrol.on('connection', (ws) => {
  // 模式推送
  setTimeout(() => {
    const result = {
      mode: {
        fsldModeId: 2222,
        zhzmModeId: 5,
        operationModeId: 1111
      }
    }
    ws.send(JSON.stringify(result))
    console.log(result);
  }, 2000)
  const ykObj = Mock.mock({
    devYxName: guid(),
    devYxDesc: '遥信描述',
    devYxStateDesc: '遥信状态描述',
    'devYxStateAlarmFlag|1': [0, 1],
    isYk: 1,
    ykStateGrpDesc: [
      {
        ykStateDesc: 'node1',
        ykValue: 1
      },
      {
        ykStateDesc: 'node2',
        ykValue: 2
      }
    ]
  })
  ws.on('message', (message) => {
    console.log('patrol received: %s', message)
    const res = JSON.parse(message)
    if (res && res.RegCommand == 2) {
      const obj = Mock.mock({
        devYxInfo: [],
        devId: res.RegDevId,
        'cameraGrp|1': [[], [1]]
      })
      const count = Random.natural(5, 9)
      // const count = 1
      for (i = 0; i < count; i++) {
        const info = Mock.mock({
          devYxName: guid(),
          devYxDesc: '描述' + i,
          devYxStateDesc: '状态描述' + i,
          'devYxStateAlarmFlag|1': [0, 1],
          isYk: 0
        })
        obj.devYxInfo.push(info)
      }
      obj.devYxInfo.push(ykObj)
      ws.send(JSON.stringify(obj))

      setTimeout(() => {
        const result = Mock.mock({
          type: 'update',
          data: []
        })
        const data = {
          devId: res.RegDevId,
          devYxInfo: []
        }
        obj.devYxInfo.slice(0, obj.devYxInfo.length - 1).forEach((val, key) => {
          data.devYxInfo.push(
            Mock.mock({
              devYxName: val.devYxName,
              devYxDesc: '描述' + key,
              devYxStateDesc: `状态描述${key}已更新`,
              'devYxStateAlarmFlag|1': [0, 1]
            })
          )
        })
        result.data.push(data)
        ws.send(JSON.stringify(result))
      }, 2000)
    }
  })
  //推送
  const patrolPush = () => {
    console.log('自动巡检push')
    const id = [1, 2]
    const name = ['巡检1号', '巡检2号']
    const count = Random.natural(0, 1)
    let res = Mock.mock({
      patrolFuncName: id[count],
      patrolName: name[count]
    })
    res = JSON.stringify(res)
    ws.send(res, (err) => {
      if (err) {
        // if (patrolTimer) clearInterval(patrolTimer)
        ws.close()
      }
    })
  }
  const planPush = () => {
    console.log('应急预案push')
    let res = Mock.mock({
      emgPlanData: {
        emgPlanId: 1,
        emgPlanDesc: '应急预案描述' + 1,
        emgPlanType: '应急预案类型' + 1,
        emgPlanInfo: '应急预案内容' + 1,
        cameraGrp: [1, 2, 3, 4, 5]
      }
    })
    res = JSON.stringify(res)
    ws.send(res, (err) => {
      if (err) {
        // if (patrolTimer) clearInterval(patrolTimer)
        ws.close()
      }
    })
  }
  setTimeout(() => {
    patrolPush()
    planPush()
  }, 6000)
  // const patrolTimer = setInterval(() => {
  //   planPush()
  // }, 10000)
})

// 客流密度ws
envMonitor.on('connection', (ws) => {
  let envTimer = null
  ws.on('message', (message) => {
    console.log('envMonitor received: %s', message)
    const type = parseInt(JSON.parse(message)?.FuncType)
    console.log(type)
    if (type == 0) {
      const sendMsg = () => {
        let res = {
          data: []
        }
        // 迅维数据
        // const devList = [2146104845, 2146128697, 2146124096, 2146124097, 2146124098]
        // for (let index = 0; index < devList.length; index++) {
        //   const obj = Mock.mock({
        //     monitorEnvDevId: devList[index],
        //     'envNameTypeDesc|1': ['温度', '湿度', 'CO₂', 'SO₂', 'PM10', 'PM2.5'],
        //     envNameTypeUnit: '℃',
        //     monitorYcValue: Random.natural(0, 1000)
        //   })
        //   res.data.push(obj)
        // }
        res.data = [
          {
            "monitorEnvDevId": "温度传感器3",
            "Floor": "站厅层",
            "envNameTypeDesc": "温度",
            "envNameTypeUnit": "℃",
            "monitorYcValue": 30
          },
          {
            "monitorEnvDevId": "温度传感器4",
            "Floor": "站厅层",
            "envNameTypeDesc": "温度",
            "envNameTypeUnit": "℃",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "湿度传感器1",
            "Floor": "站厅层",
            "envNameTypeDesc": "湿度",
            "envNameTypeUnit": "%rh",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "温度传感器2",
            "Floor": "站厅层",
            "envNameTypeDesc": "温度",
            "envNameTypeUnit": "℃",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "湿度传感器5",
            "Floor": "8号线站台",
            "envNameTypeDesc": "湿度",
            "envNameTypeUnit": "%rh",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "CO2传感器1",
            "Floor": "站厅层",
            "envNameTypeDesc": "CO2",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "湿度传感器3",
            "Floor": "站厅层",
            "envNameTypeDesc": "湿度",
            "envNameTypeUnit": "%rh",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "温度传感器5",
            "Floor": "8号线站台",
            "envNameTypeDesc": "温度",
            "envNameTypeUnit": "℃",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "湿度传感器2",
            "Floor": "站厅层",
            "envNameTypeDesc": "湿度",
            "envNameTypeUnit": "%rh",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "温度传感器1",
            "Floor": "站厅层",
            "envNameTypeDesc": "温度",
            "envNameTypeUnit": "℃",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "湿度传感器4",
            "Floor": "站厅层",
            "envNameTypeDesc": "湿度",
            "envNameTypeUnit": "%rh",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "二氧化硫探测器2",
            "Floor": "站厅层",
            "envNameTypeDesc": "SO2",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM2.5探测器5",
            "Floor": "8号线站台",
            "envNameTypeDesc": "PM2.5",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM2.5探测器4",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM2.5",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM2.5探测器3",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM2.5",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM10探测器6",
            "Floor": "8号线站台",
            "envNameTypeDesc": "PM10",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM10探测器5",
            "Floor": "8号线站台",
            "envNameTypeDesc": "PM10",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 40
          },
          {
            "monitorEnvDevId": "PM10探测器4",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM10",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "二氧化硫探测器1",
            "Floor": "站厅层",
            "envNameTypeDesc": "SO2",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM10探测器1",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM10",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "二氧化硫探测器5",
            "Floor": "8号线站台",
            "envNameTypeDesc": "SO2",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM2.5探测器1",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM2.5",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM2.5探测器2",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM2.5",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM10探测器3",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM10",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM2.5探测器7",
            "Floor": "8号线站台",
            "envNameTypeDesc": "PM2.5",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM10探测器2",
            "Floor": "站厅层",
            "envNameTypeDesc": "PM10",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM2.5探测器6",
            "Floor": "8号线站台",
            "envNameTypeDesc": "PM2.5",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "PM10探测器7",
            "Floor": "8号线站台",
            "envNameTypeDesc": "PM10",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 600
          },
          {
            "monitorEnvDevId": "二氧化硫探测器4",
            "Floor": "8号线站台",
            "envNameTypeDesc": "SO2",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          },
          {
            "monitorEnvDevId": "二氧化硫探测器3",
            "Floor": "站厅层",
            "envNameTypeDesc": "SO2",
            "envNameTypeUnit": "PPM",
            "monitorYcValue": 0
          }
        ]
        res.data.forEach((val, key) => {
          val.monitorYcValue = Random.natural(0, 100)
        })
        res = JSON.stringify(res)
        console.log(res)
        ws.send(res, (err) => {
          if (err) {
            clearInterval(envTimer)
            ws.close()
          }
        })
      }
      sendMsg()
      envTimer = setInterval(sendMsg, 4000)
    } else {
      if (envTimer) {
        clearInterval(envTimer)
      }
    }
  })
})

// 报警
// deleteAlarmData
// updateAlarmData
// addAlarmData
// initAlarmData
testUnity.on('connection', (ws) => {
  const devArr = ['闸机048', '闸机047', '闸机046', '闸机045', '闸机044', '闸机043', '电梯012', '电梯011']
  let res = {
    initAlarmData: []
  }
  for (let index = 0; index < devArr.length; index++) {
    const obj = Mock.mock({
      alarmId: index,
      ymd: Random.date('yyyyMMdd'),
      hmsms: 162412333,
      alarmlevel: Random.natural(1, 1),
      'alarmstate|1': [1, 2, 3], //报警、事故、恢复、已确认
      tonetimes: '语音报警次数', //暂时未用到
      'equipmentid|1': ['闸机048', '闸机047', '闸机046', '闸机045', '闸机044', '闸机043', '电梯012', '电梯011'],
      station_desc: '渌水道站',
      'system_name|1': ['FAS', 'AFC', 'CCTV'],
      'system_desc|1': ['AA系统', 'BB系统', 'CC系统'],
      member_name0: '成员名', //暂时未用到
      char_info: '宇视系统IABA:109VC渌水道-上行尾' + index,
      tone_info: '事件语音内容', //暂时未用到
      'cameraGrp|1': [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]] //摄像机组名
    })

    res.initAlarmData.push(obj)
  }
  ws.send(JSON.stringify(res))
  ws.on('message', (message) => {
    console.log('testUnity received: %s', message)
    // 更新
    console.log(JSON.parse(message))
    if (JSON.parse(message).alarmidlist) {
      const idList = JSON.parse(message).alarmidlist
      idList.forEach((val) => {
        let updateIndex = res.initAlarmData.findIndex((data) => data.alarmId === val)
        let updateObj = res.initAlarmData[updateIndex]
        updateObj.alarmstate = 5
        let update = {
          updateAlarmData: updateObj
        }
        ws.send(JSON.stringify(update), (err) => {
          if (err) {
            ws.close()
          }
        })
      })
    }
  })

  const alarmTimer = setInterval(() => {
    // 事件
    let event = {
      EventData: [
        Mock.mock({
          ymd: Random.date('yyyyMMdd'),
          hmsms: 162412333,
          alarmlevel: Random.natural(0, 3),
          'alarmstate|1': [1, 2, 3, 4, 5, null], //报警、事故、恢复、已确认
          tonetimes: '语音报警次数', //暂时未用到
          station_desc: '渌水道站',
          // 'system_desc|1': ['AA系统', 'BB系统', 'CC系统'],
          system_desc: '环控BAS',
          member_name0: '成员名', //暂时未用到
          char_info: '电伴热DBR_s_032号回路系统运行/停止状态',
          tone_info: '事件语音内容' //暂时未用到
        })
      ]
    }
    ws.send(JSON.stringify(event), (err) => {
      if (err) {
        clearInterval(alarmTimer)
        ws.close()
      }
    })
  }, 1000)
  // //推送变化值
  // try {
  //   const alarmTimer = setInterval(() => {
  //     // 删除
  //     let delIndex = res.initAlarmData.length - 1
  //     let del = {
  //       deleteAlarmData: res.initAlarmData[delIndex]
  //     }
  //     res.initAlarmData.splice(delIndex, 1)
  //     ws.send(JSON.stringify(del), (err) => {
  //       if (err) {
  //         clearInterval(alarmTimer)
  //         ws.close()
  //       }
  //     })
  //   }, 5000)
  // } catch (error) {
  //   console.log(error)
  // }
})

// 综合看板ws
controlWs.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('controlWs received: %s', message)
    const msgArr = {
      5: '遥控执行发令超时',
      6: '遥控撤消',
      7: '遥控成功',
      8: '拒动',
      9: '非期望控制结果',
      10: '用于不等待控制结果的对象发执行令后报告成功'
    }
    const index = Random.natural(5, 10)
    // 执行追踪
    let msg = {
      funcType: 1,
      opResInfo: "控制输出下发.....",
      resultType: 4
    }
    ws.send(JSON.stringify(msg), (err) => {
      if (err) {
        ws.close()
      }
    })
    setTimeout(() => {
      // 更新
      let result = {
        funcType: 1,
        opResInfo: msgArr[index],
        resultType: index
      }
      ws.send(JSON.stringify(result), (err) => {
        if (err) {
          ws.close()
        }
      })
    }, 1000)
  })
})
