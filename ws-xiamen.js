const WebSocket = require('ws') //引入模块
const Mock = require('mockjs')
const { faker } = require('@faker-js/faker/locale/zh_CN')
const sxlList = require('./data')
// 海康sdk
const Hikopenapi = require('hikopenapi-node')
const Koa = require('koa')
const Router = require('koa-router')
// nacos
const { NacosNamingClient } = require('nacos')

const app = new Koa()
const router = new Router()

// 创建 nacos 客户端实例
const client = new NacosNamingClient({
  logger: console,
  serverList: '192.168.20.179:8848',
  namespace: 'public'
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
const pushWs = new WebSocket.Server({ port: 9485 })
// 巡检实时数据
const patrol = new WebSocket.Server({ port: 9486 })
// 环境监测
const envMonitor = new WebSocket.Server({ port: 9490 })
// 风水联动的能管管理
const energyWs = new WebSocket.Server({ port: 9493 })

// 综合看板 9492
const controlWs = new WebSocket.Server({ port: 9482 })

// 智慧照明
const lightWs = new WebSocket.Server({ port: 9487 })

// // 综合看板
// const wsPublic = new WebSocket.Server({ port: 9514 })
// // 巡检实时数据
// const patrol = new WebSocket.Server({ port: 9515 })
// // 环境监测
// const envMonitor = new WebSocket.Server({ port: 9516 })
// // 风水联动的能管管理
// const energyWs = new WebSocket.Server({ port: 9518 })

// const wsFlow = new WebSocket.Server({ port: 9484 })

const alarm = new WebSocket.Server({ port: 9489 })

const testUnity = new WebSocket.Server({ port: 9483 })

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
    const stationArr = Array.from({ length: 4 }, () => faker.address.street() + '站')
    const data = {
      monPaxData: []
    }
    stationArr.forEach((val) => {
      const data1 = {
        monPaxStation: val,
        monPaxType: 0,
        monPaxYcValue: faker.datatype.number({ min: 50, max: 300 })
      }
      const data2 = {
        monPaxStation: val,
        monPaxType: 1,
        monPaxYcValue: faker.datatype.number({ min: 50, max: 300 })
      }
      data.monPaxData.push(data1, data2)
    })
    ws.send(JSON.stringify(data))

    //推送变化值
    const staitonsFlowTimer = setInterval(() => {
      const newData = {
        monPaxData: []
      }
      const index = Random.natural(0, 1)
      const index2 = Random.natural(2, 3)

      const data1 = {
        monPaxStation: stationArr[index],
        monPaxType: Random.natural(0, 1),
        monPaxYcValue: faker.datatype.number({ min: 50, max: 300 })
      }
      const data2 = {
        monPaxStation: stationArr[index2],
        monPaxType: Random.natural(0, 1),
        monPaxYcValue: faker.datatype.number({ min: 50, max: 300 })
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
    console.log('9484 staitonsDev received: %s', message)
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
              devHealthStateValue: 0
            },
            {
              devHealthStateDesc: '故障',
              devHealthStateValue: 2
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
              devHealthStateValue: 2
            }
          ]
        },
        {
          devHealthDevType: 6,
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

// 推送ws
pushWs.on('connection', (ws) => {
  // 设备查看
  const devPoiData = () => {
    const data = {
      monDevPoiData: []
    }

    const devArr = ['AGM01', 'AGM02', 'AGM03', 'AGM04', 'AGM05', 'AGM06', '电梯1', '电梯2']
    const arr2 = [0, 1, 2, 3]
    arr2.forEach((val) => {
      devArr.forEach((v, k) => {
        const obj = Mock.mock({
          monDevId: v,
          'monDevYxAlarmFlag|1': [0, 1], //1:报警  0：正常
          monDevYxName: '设备遥信名' + val + k,
          monDevYxDesc: '遥信描述' + val + k,
          monDevYxStateDesc: '遥信状态描述' + val + k
        })
        data.monDevPoiData.push(obj)
      })
    })
    ws.send(JSON.stringify(data))
  }
  const data0 = {
    monDevPoiData: [
      {
        monDevId: 'AGM01',
        monDevYxAlarmFlag: 1,
        monDevYxName: 'dmaf.--2233.St',
        monDevYxDesc: '站厅自动检票机AGM10回收票箱1容量',
        monDevYxStateDesc: '将满'
      },
      {
        monDevId: 'AGM01',
        monDevYxAlarmFlag: 1,
        monDevYxName: 'dmaf.--2234.St',
        monDevYxDesc: '站厅自动检票机AGM10回收票箱2容量',
        monDevYxStateDesc: '将满'
      },
      {
        monDevId: 'AGM01',
        monDevYxAlarmFlag: 0,
        monDevYxName: 'dmaf.--2274.St',
        monDevYxDesc: '站厅自动检票机AGM10通信状态',
        monDevYxStateDesc: '正常'
      },
      {
        monDevId: 'LCD-T-01',
        monDevYxAlarmFlag: 0,
        monDevYxName: 'dmaf.--2274.St',
        monDevYxDesc: '站厅PIS屏LCD-T-01通信状态',
        monDevYxStateDesc: '不正常'
      }
    ]
  }
  ws.send(JSON.stringify(data0))
  const data1 = {
    monDevPoiData: [
      {
        monDevId: 'AGM01',
        monDevYxAlarmFlag: 1,
        monDevYxName: 'dmaf.--2274.St',
        monDevYxDesc: '站厅自动检票机AGM10通信状态',
        monDevYxStateDesc: '正常'
      }
    ]
  }

  // 设备状态三维显示
  const devStatusData = {
    monDevData: [
      { monDevId: 'AGM01', monDevYxValue: 1, monDevDispPolicy: 1 },
      { monDevId: 'AGM01', monDevYxValue: 0, monDevDispPolicy: 1 },
      { monDevId: 'AGM01', monDevYxValue: 0, monDevDispPolicy: 2 },
      { monDevId: 'AGM01', monDevYxValue: 1, monDevDispPolicy: 2 },
      { monDevId: 'AGM01', monDevYxValue: 2, monDevDispPolicy: 2 },
      { monDevId: 'AGM01', monDevYxValue: 0, monDevDispPolicy: 3 },
      { monDevId: 'AGM01', monDevYxValue: 1, monDevDispPolicy: 3 },
      { monDevId: 'AGM01', monDevYxValue: 0, monDevDispPolicy: 4 },
      { monDevId: 'AGM01', monDevYxValue: 1, monDevDispPolicy: 4 },
      { monDevId: 'AGM01', monDevYxValue: 0, monDevDispPolicy: 5 },
      { monDevId: 'AGM01', monDevYxValue: 1, monDevDispPolicy: 5 },
      { monDevId: 'ASD216', monDevYxValue: 0, monDevDispPolicy: 6 },
      { monDevId: 'ASD216', monDevYxValue: 1, monDevDispPolicy: 6 },
      { monDevId: 'ASD216', monDevYxValue: 0, monDevDispPolicy: 7 },
      { monDevId: 'ASD216', monDevYxValue: 1, monDevDispPolicy: 7 },
      { monDevId: 'MSD1_1', monDevYxValue: 0, monDevDispPolicy: 10 },
      { monDevId: 'MSD1_1', monDevYxValue: 1, monDevDispPolicy: 10 },
      { monDevId: 'ASD216', monDevYxValue: 0, monDevDispPolicy: 12 },
      { monDevId: 'ASD216', monDevYxValue: 1, monDevDispPolicy: 12 },
      { monDevId: 'ASD216', monDevYxValue: 0, monDevDispPolicy: 13 },
      { monDevId: 'ASD216', monDevYxValue: 1, monDevDispPolicy: 13 },
      { monDevId: '电梯15', monDevYxValue: 0, monDevDispPolicy: 14 },
      { monDevId: '电梯15', monDevYxValue: 1, monDevDispPolicy: 14 },
      { monDevId: '电梯15', monDevYxValue: 2, monDevDispPolicy: 14 },
      { monDevId: '电梯15', monDevYxValue: 4, monDevDispPolicy: 14 },
      { monDevId: '电梯15', monDevYxValue: 0, monDevDispPolicy: 15 },
      { monDevId: '电梯15', monDevYxValue: 1, monDevDispPolicy: 15 },
      { monDevId: '电梯15', monDevYxValue: 0, monDevDispPolicy: 16 },
      { monDevId: '电梯15', monDevYxValue: 1, monDevDispPolicy: 16 },
      { monDevId: '电梯15', monDevYxValue: 0, monDevDispPolicy: 17 },
      { monDevId: '电梯15', monDevYxValue: 1, monDevDispPolicy: 17 },
      { monDevId: '电梯15', monDevYxValue: 2, monDevDispPolicy: 17 },
      { monDevId: '直梯01', monDevYxValue: 0, monDevDispPolicy: 18 },
      { monDevId: '直梯01', monDevYxValue: 1, monDevDispPolicy: 18 },
      { monDevId: 'LCD-T-01', monDevYxValue: 0, monDevDispPolicy: 19 },
      { monDevId: 'LCD-T-02', monDevYxValue: 1, monDevDispPolicy: 19 },
      { monDevId: 'LCD-T-03', monDevYxValue: 2, monDevDispPolicy: 20 },
      { monDevId: 'LCD-T-04', monDevYxValue: 3, monDevDispPolicy: 20 },
      { monDevId: '卷帘门01', monDevYxValue: 0, monDevDispPolicy: 21 },
      { monDevId: '卷帘门01', monDevYxValue: 1, monDevDispPolicy: 21 },
      { monDevId: '卷帘门01', monDevYxValue: 0, monDevDispPolicy: 22 },
      { monDevId: '卷帘门01', monDevYxValue: 1, monDevDispPolicy: 22 },
      { monDevId: 'Z04-DDF-A1', monDevYxValue: 0, monDevDispPolicy: 23 },
      { monDevId: 'Z04-DDF-A1', monDevYxValue: 1, monDevDispPolicy: 23 },
      { monDevId: 'Z04-DDF-A1', monDevYxValue: 0, monDevDispPolicy: 24 },
      { monDevId: 'Z04-DDF-A1', monDevYxValue: 1, monDevDispPolicy: 24 },
      { monDevId: '出入口_5', monDevYxValue: 0, monDevDispPolicy: 25 }
    ]
  }
  setInterval(() => {
    // devPoiData()
  }, 5000)
  setTimeout(() => {
    ws.send(JSON.stringify(devStatusData))
    ws.send(JSON.stringify(data1))
  }, 6000)
  ws.on('message', (message) => {
    console.log('9485 received: %s', message)
  })
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
    // console.log(result);
    const planPush = () => {
      console.log('应急预案push')
      let res = {
        trigType: 1,
        emgPlanId: 1,
        emgPlanDesc: '应急预案描述' + 1,
        emgPlanType: '应急预案类型' + 1,
        emgPlanInfo: '应急预案内容' + 1,
        cameraGrp: [
          '34020000001320000001',
          '34020000001320000002',
          '34020000001320000003',
          '34020000001320000003',
          '34020000001320000003'
        ]
      }
      res = JSON.stringify(res)
      ws.send(res, (err) => {
        if (err) {
          // if (patrolTimer) clearInterval(patrolTimer)
          ws.close()
        }
      })
    }
    const patrolPush = () => {
      const data = {
        trigType: 0,
        patrolFuncName: '20230911095238364',
        patrolDesc: '巡检1号',
        patrolNodeList: [
          {
            id: 'node0',
            position: {
              x: 92.2796096801758,
              y: -20.5573348999023,
              z: -486.839996337891
            }
          },
          {
            id: 'node2',
            position: {
              x: -5.03,
              y: 20.57,
              z: 523.56
            }
          },
          {
            id: 'node3',
            position: {
              x: 6.85,
              y: 20.57,
              z: 527.23
            }
          },
          {
            id: 'node4',
            position: {
              x: 20.03,
              y: 20.57,
              z: 525.25
            }
          },
          {
            id: 'node5',
            position: {
              x: 31.95,
              y: 20.57,
              z: 523.1
            }
          },
          {
            id: 'node6',
            position: {
              x: 18.13,
              y: 20.57,
              z: 515.57
            }
          },
          {
            id: 'node7',
            position: {
              x: 5.08,
              y: 20.57,
              z: 511.34
            }
          },
          {
            id: 'node8',
            position: {
              x: 2.79,
              y: 20.57,
              z: 519.35
            }
          }
        ]
      }
      res = JSON.stringify(data)
      ws.send(res, (err) => {
        if (err) {
          // if (patrolTimer) clearInterval(patrolTimer)
          ws.close()
        }
      })
    }

    // 预案推送
    // planPush()
    // patrolPush()
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
        'cameraGrp|1': [[], ['34020000001320000003']]
      })
      const count = Random.natural(5, 9)
      // const count = 1
      for (i = 0; i < count; i++) {
        const info = Mock.mock({
          devYxName: guid(),
          devYxDesc: '描述' + i,
          devYxStateDesc: '状态描述' + i,
          'devYxStateAlarmFlag|1': ['34020000001320000003', '34020000001320000003'],
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
            monitorEnvDevId: '温度传感器3',
            Floor: '站厅层',
            envNameTypeDesc: '温度',
            envNameTypeUnit: '℃',
            monitorYcValue: 30
          },
          {
            monitorEnvDevId: '温度传感器4',
            Floor: '站厅层',
            envNameTypeDesc: '温度',
            envNameTypeUnit: '℃',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '湿度传感器1',
            Floor: '站厅层',
            envNameTypeDesc: '湿度',
            envNameTypeUnit: '%rh',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '温度传感器2',
            Floor: '站厅层',
            envNameTypeDesc: '温度',
            envNameTypeUnit: '℃',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '湿度传感器5',
            Floor: '8号线站台',
            envNameTypeDesc: '湿度',
            envNameTypeUnit: '%rh',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'CO2传感器1',
            Floor: '站厅层',
            envNameTypeDesc: 'CO2',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '湿度传感器3',
            Floor: '站厅层',
            envNameTypeDesc: '湿度',
            envNameTypeUnit: '%rh',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '温度传感器5',
            Floor: '8号线站台',
            envNameTypeDesc: '温度',
            envNameTypeUnit: '℃',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '湿度传感器2',
            Floor: '站厅层',
            envNameTypeDesc: '湿度',
            envNameTypeUnit: '%rh',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '温度传感器1',
            Floor: '站厅层',
            envNameTypeDesc: '温度',
            envNameTypeUnit: '℃',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '湿度传感器4',
            Floor: '站厅层',
            envNameTypeDesc: '湿度',
            envNameTypeUnit: '%rh',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '二氧化硫探测器2',
            Floor: '站厅层',
            envNameTypeDesc: 'SO2',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM2.5探测器5',
            Floor: '8号线站台',
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM2.5探测器4',
            Floor: '站厅层',
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM2.5探测器3',
            Floor: '站厅层',
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM10探测器6',
            Floor: '8号线站台',
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM10探测器5',
            Floor: '8号线站台',
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 40
          },
          {
            monitorEnvDevId: 'PM10探测器4',
            Floor: '站厅层',
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '二氧化硫探测器1',
            Floor: '站厅层',
            envNameTypeDesc: 'SO2',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM10探测器1',
            Floor: '站厅层',
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '二氧化硫探测器5',
            Floor: '8号线站台',
            envNameTypeDesc: 'SO2',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM2.5探测器1',
            Floor: '站厅层',
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM2.5探测器2',
            Floor: '站厅层',
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM10探测器3',
            Floor: '站厅层',
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM2.5探测器7',
            Floor: '8号线站台',
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM10探测器2',
            Floor: '站厅层',
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM2.5探测器6',
            Floor: '8号线站台',
            envNameTypeDesc: 'PM2.5',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: 'PM10探测器7',
            Floor: '8号线站台',
            envNameTypeDesc: 'PM10',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 600
          },
          {
            monitorEnvDevId: '二氧化硫探测器4',
            Floor: '8号线站台',
            envNameTypeDesc: 'SO2',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
          },
          {
            monitorEnvDevId: '二氧化硫探测器3',
            Floor: '站厅层',
            envNameTypeDesc: 'SO2',
            envNameTypeUnit: 'PPM',
            monitorYcValue: 0
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
  const devArr = ['AGM01', 'AGM02', 'AGM03', 'AGM04', 'AGM05', 'AGM06', '电梯1', '电梯2']
  let res = {
    initAlarmData: []
  }
  for (let index = 0; index < devArr.length; index++) {
    const obj = Mock.mock({
      alarmId: index,
      ymd: 20231008,
      hmsms: Random.date('HHmmssSSS'),
      alarmlevel: Random.natural(1, 1),
      'alarmstate|1': [1, 2, 3], //报警、事故、恢复、已确认
      tonetimes: '语音报警次数', //暂时未用到
      'equipmentid|1': ['AGM01', 'AGM02', 'AGM03', 'AGM04', 'AGM05', 'AGM06', '电梯1', '电梯2'],
      station_desc: '渌水道站',
      'system_name|1': ['PIS', 'AFC', 'DQHZ', 'PA', 'BAS', 'ACS', 'PSD', 'FG'],
      'system_desc|1': ['AA系统', 'BB系统', 'CC系统'],
      member_name0: '成员名', //暂时未用到
      char_info: '宇视系统IABA:109VC-上行尾|||' + index,
      tone_info: '事件语音内容', //暂时未用到
      cameraGrp: ['34020000001320000003', '34020000001320000003', '34020000001320000003', '34020000001320000003'] //摄像机组名
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

  const data1 = {
    initAlarmData: [
      {
        alarmId: 61,
        ymd: 20231024,
        hmsms: 113108919,
        alarmlevel: 1,
        alarmstate: 2,
        tonetimes: 0,
        equipmentid: '电梯5',
        station_desc: '',
        system_name: 'SOM',
        system_desc: '智慧车站',
        member_name0: 'dmsm.--1316.St',
        char_info: '                 扶梯自动扶梯0204-E03(N)扶梯故障 |||正常',
        tone_info: '一级报警.wav',
        cameraGrp: []
      },
      {
        alarmId: 63,
        ymd: 20231024,
        hmsms: 112054285,
        alarmlevel: 1,
        alarmstate: 4,
        tonetimes: 0,
        equipmentid: '电梯6',
        station_desc: '',
        system_name: 'SOM',
        system_desc: '智慧车站',
        member_name0: 'dmsm.--1329.St',
        char_info: '                 扶梯自动扶梯0204-E04(N)扶梯故障 |||正常',
        tone_info: '',
        cameraGrp: []
      }
    ]
  }
  const data2 = {
    initAlarmData: [
      {
        alarmId: 61,
        ymd: 20231024,
        hmsms: 113126469,
        alarmlevel: 1,
        alarmstate: 4,
        tonetimes: 0,
        equipmentid: '电梯5',
        station_desc: '',
        system_name: 'SOM',
        system_desc: '智慧车站',
        member_name0: 'dmsm.--1316.St',
        char_info: '                 扶梯自动扶梯0204-E03(N)扶梯故障 |||正常',
        tone_info: '',
        cameraGrp: []
      },
      {
        alarmId: 63,
        ymd: 20231024,
        hmsms: 112054285,
        alarmlevel: 1,
        alarmstate: 4,
        tonetimes: 0,
        equipmentid: '电梯6',
        station_desc: '',
        system_name: 'SOM',
        system_desc: '智慧车站',
        member_name0: 'dmsm.--1329.St',
        char_info: '                 扶梯自动扶梯0204-E04(N)扶梯故障 |||正常',
        tone_info: '',
        cameraGrp: []
      }
    ]
  }
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
          char_info: '电伴热DBR_s_032号回路系统运行/停止状态' + Random.natural(100, 500) + '|||状态',
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
    const { funcType } = JSON.parse(message)
    switch (funcType) {
      case 1:
        const msgArr = {
          5: '遥控执行发令超时',
          6: '遥控撤消',
          7: '遥控成功',
          8: '拒动',
          9: '非期望控制结果',
          10: '报告成功'
        }
        const index = Random.natural(5, 10)
        // 执行追踪
        let msg = {
          funcType: 1,
          opResInfo: '控制输出下发.....',
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
        setTimeout(() => {
          // 更新
          let result = {
            funcType: 1,
            opResInfo: '',
            resultType: 127
          }
          ws.send(JSON.stringify(result), (err) => {
            if (err) {
              ws.close()
            }
          })
        }, 1800)
        break
      case 2:
        const msgArr2 = {
          0: '执行',
          1: '超时',
          2: '成功',
          3: '失败',
          126: '模拟量输出命令错误',
          127: ''
        }
        const index2 = Random.natural(1, 3)
        // 执行追踪
        let msg2 = {
          funcType: 2,
          opResInfo: '执行...',
          resultType: 0
        }
        ws.send(JSON.stringify(msg2), (err) => {
          if (err) {
            ws.close()
          }
        })
        setTimeout(() => {
          // 更新
          let result = {
            funcType: 1,
            opResInfo: msgArr2[index2],
            resultType: index2
          }
          ws.send(JSON.stringify(result), (err) => {
            if (err) {
              ws.close()
            }
          })
        }, 1000)
        setTimeout(() => {
          // 更新
          let result = {
            funcType: 1,
            opResInfo: msgArr2[127],
            resultType: 127
          }
          ws.send(JSON.stringify(result), (err) => {
            if (err) {
              ws.close()
            }
          })
        }, 1500)
        break
    }
  })
})

// 智慧照明
lightWs.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('9487 received: %s', message)
  })
})
