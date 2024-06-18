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
  // 环境检测
  const envData = {
    monEnvData: [
      {
        monEnvAreaId: 'CH-05',
        monEnvAreaDesc: '站厅公共区1',
        monEnvRtData: [
          {
            monEnvType: 1,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 0,
            monEnvYcValue: 20.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 2,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          }
        ]
      },
      {
        monEnvAreaId: 'CH-06',
        monEnvAreaDesc: '站厅公共区1',
        monEnvRtData: [
          {
            monEnvType: 1,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 0,
            monEnvYcValue: 20.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 2,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          }
        ]
      },
      {
        monEnvAreaId: 'CH-07',
        monEnvAreaDesc: '站厅公共区1',
        monEnvRtData: [
          {
            monEnvType: 1,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 0,
            monEnvYcValue: 20.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 2,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          }
        ]
      },
      {
        monEnvAreaId: 'CH-08',
        monEnvAreaDesc: '站厅公共区1',
        monEnvRtData: [
          {
            monEnvType: 1,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 0,
            monEnvYcValue: 20.0,
            monEnvLimitLevel: 2
          },
          {
            monEnvType: 2,
            monEnvYcValue: 10.0,
            monEnvLimitLevel: 2
          }
        ]
      }
    ]
  }
  const data1 = {
    monDevPoiData: [
      {
        monDevId: 'AGM01',
        monDevYxAlarmFlag: 1,
        monDevYxName: 'dmaf.--2274.St',
        monDevYxDesc: '站厅自动检票机AGM10通信状态',
        monDevYxStateDesc: '异常'
      }
    ]
  }

  const fire = {
    monFireData: [
      {
        monFireAreaId: '第一防烟分区',
        monFireType: 2
      },
      {
        monFireAreaId: '第二防烟分区',
        monFireType: 2
      },
      // {
      //   monFireAreaId: '第三防烟分区',
      //   monFireType: 2
      // },
      // {
      //   monFireAreaId: '第四防烟分区',
      //   monFireType: 2
      // },
      {
        monFireAreaId: '第五防烟分区',
        monFireType: 2
      },
      {
        monFireAreaId: '第六防烟分区',
        monFireType: 2
      }
    ]
  }

  const roomFire = {
    monFireRoom: [
      {
        fireRoomDesc: '变配电室',
        roomFireFlag: 1,
        roomFireAreaId: '第一防烟分区',
        cameraGrp: ['34020000001320000001']
      },
      {
        fireRoomDesc: '通风空调电控室',
        roomFireFlag: 0,
        roomFireAreaId: '第六防烟分区',
        cameraGrp: ['34020000001320000171']
      },
      {
        fireRoomDesc: '商用通信设备室',
        roomFireFlag: 0,
        roomFireAreaId: '第五防烟分区',
        cameraGrp: ['34020000001320000161']
      },
      {
        fireRoomDesc: '专用通信设备室',
        roomFireFlag: 0,
        roomFireAreaId: '第五防烟分区',
        cameraGrp: ['34020000001320000171']
      },
      {
        fireRoomDesc: '弱电综合电源室',
        roomFireFlag: 0,
        roomFireAreaId: '第五防烟分区',
        cameraGrp: ['34020000001320000001']
      },
      {
        fireRoomDesc: '综合监控设备室',
        roomFireFlag: 0,
        roomFireAreaId: '第五防烟分区',
        cameraGrp: ['34020000001320000161']
      },
      {
        fireRoomDesc: '信号设备室',
        roomFireFlag: 0,
        roomFireAreaId: '第五防烟分区',
        cameraGrp: ['34020000001320000171']
      },
      {
        fireRoomDesc: '警用通信设备室',
        roomFireFlag: 0,
        roomFireAreaId: '第一防烟分区',
        cameraGrp: ['34020000001320000162']
      },
      {
        fireRoomDesc: '通风空调电控室',
        roomFireFlag: 0,
        roomFireAreaId: '第二防烟分区',
        cameraGrp: ['34020000001320000001']
      }
    ]
  }

  // 设备状态三维显示
  const devStatusData2 = {
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
  const devStatusData = {
    monDevData: [
      {
        monDevId: 'AGM01',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM01',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM01',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM01',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM02',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM02',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM02',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM02',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM03',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM03',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM03',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM03',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM04',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM04',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM04',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM04',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM05',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM05',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM05',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM05',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM06',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM06',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM06',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM06',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM07',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM07',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM07',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM07',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM08',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM08',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM08',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM08',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM09',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM09',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM09',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM09',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM10',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM10',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM10',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM10',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM11',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM11',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM11',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM11',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM12',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM12',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM12',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM12',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM13',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM13',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM13',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM13',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM14',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM14',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM14',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM14',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM15',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM15',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM15',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM15',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM16',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM16',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM16',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM16',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM17',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM17',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM17',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM17',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM18',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM18',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM18',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM18',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM19',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM19',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM19',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM19',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM20',
        monDevYxValue: 2,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM20',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM20',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM20',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM21',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM21',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM21',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM21',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM22',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM22',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM22',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM22',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM23',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM23',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM23',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM23',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM24',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM24',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM24',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM24',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM25',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM25',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM25',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM25',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM26',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM26',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM26',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM26',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM27',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM27',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM27',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM27',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM28',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM28',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM28',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM28',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'AGM29',
        monDevYxValue: 1,
        monDevDispPolicy: 2
      },
      {
        monDevId: 'AGM29',
        monDevYxValue: 0,
        monDevDispPolicy: 3
      },
      {
        monDevId: 'AGM29',
        monDevYxValue: 0,
        monDevDispPolicy: 5
      },
      {
        monDevId: 'AGM29',
        monDevYxValue: 1,
        monDevDispPolicy: 1
      },
      {
        monDevId: 'Z04-DDF-A1',
        monDevYxValue: 0,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z04-DDF-A1',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: 'Z04-DDF-A2',
        monDevYxValue: 0,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z04-DDF-A2',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: 'Z05-DDF-A1',
        monDevYxValue: 1,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z05-DDF-A1',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: 'Z05-DDF-A2',
        monDevYxValue: 1,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z05-DDF-A2',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: 'Z04-DDF-B1',
        monDevYxValue: 0,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z04-DDF-B1',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: 'Z04-DDF-B2',
        monDevYxValue: 0,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z04-DDF-B2',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: 'Z05-DDF-B1',
        monDevYxValue: 1,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z05-DDF-B1',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: 'Z05-DDF-B2',
        monDevYxValue: 1,
        monDevDispPolicy: 23
      },
      {
        monDevId: 'Z05-DDF-B2',
        monDevYxValue: 0,
        monDevDispPolicy: 24
      },
      {
        monDevId: '0205-H01(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 18
      },
      {
        monDevId: '0205-H01(N)',
        monDevYxValue: 2,
        monDevDispPolicy: 17
      },
      {
        monDevId: '0205-H04(K3)',
        monDevYxValue: 0,
        monDevDispPolicy: 18
      },
      {
        monDevId: '0205-H04(K3)',
        monDevYxValue: 2,
        monDevDispPolicy: 17
      },
      {
        monDevId: '0205-H02(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 18
      },
      {
        monDevId: '0205-H02(N)',
        monDevYxValue: 2,
        monDevDispPolicy: 17
      },
      {
        monDevId: '0205-H03(K2)',
        monDevYxValue: 0,
        monDevDispPolicy: 18
      },
      {
        monDevId: '0205-H03(K2)',
        monDevYxValue: 2,
        monDevDispPolicy: 17
      },
      {
        monDevId: '0205-E17(K3)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E17(K3)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E18(K3)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E18(K3)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E19(K4)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E19(K4)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E20(K4)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E20(K4)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E03(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E03(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E04(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E04(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E07(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E07(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E08(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E08(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E13(K1)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E13(K1)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E14(K1)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E14(K1)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E15(K2)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E15(K2)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E16(K2)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E16(K2)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E01(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E01(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E02(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E02(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E05(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E05(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '0205-E06(N)',
        monDevYxValue: 4,
        monDevDispPolicy: 14
      },
      {
        monDevId: '0205-E06(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 16
      },
      {
        monDevId: '卷帘门01',
        monDevYxValue: 2,
        monDevDispPolicy: 25
      },
      {
        monDevId: '卷帘门01',
        monDevYxValue: 1,
        monDevDispPolicy: 27
      },
      {
        monDevId: '卷帘门01',
        monDevYxValue: 0,
        monDevDispPolicy: 28
      },
      {
        monDevId: '卷帘门01',
        monDevYxValue: 0,
        monDevDispPolicy: 26
      },
      {
        monDevId: '卷帘门02',
        monDevYxValue: 2,
        monDevDispPolicy: 25
      },
      {
        monDevId: '卷帘门02',
        monDevYxValue: 1,
        monDevDispPolicy: 27
      },
      {
        monDevId: '卷帘门02',
        monDevYxValue: 0,
        monDevDispPolicy: 28
      },
      {
        monDevId: '卷帘门02',
        monDevYxValue: 0,
        monDevDispPolicy: 26
      },
      {
        monDevId: '卷帘门03',
        monDevYxValue: 2,
        monDevDispPolicy: 25
      },
      {
        monDevId: '卷帘门03',
        monDevYxValue: 1,
        monDevDispPolicy: 27
      },
      {
        monDevId: '卷帘门03',
        monDevYxValue: 0,
        monDevDispPolicy: 28
      },
      {
        monDevId: '卷帘门03',
        monDevYxValue: 0,
        monDevDispPolicy: 26
      },
      {
        monDevId: '卷帘门04',
        monDevYxValue: 2,
        monDevDispPolicy: 25
      },
      {
        monDevId: '卷帘门04',
        monDevYxValue: 1,
        monDevDispPolicy: 27
      },
      {
        monDevId: '卷帘门04',
        monDevYxValue: 0,
        monDevDispPolicy: 28
      },
      {
        monDevId: '卷帘门04',
        monDevYxValue: 0,
        monDevDispPolicy: 26
      },
      {
        monDevId: '防火卷帘06',
        monDevYxValue: 0,
        monDevDispPolicy: 22
      },
      {
        monDevId: '防火卷帘06',
        monDevYxValue: 0,
        monDevDispPolicy: 21
      },
      {
        monDevId: '防火卷帘01',
        monDevYxValue: 0,
        monDevDispPolicy: 22
      },
      {
        monDevId: '防火卷帘01',
        monDevYxValue: 0,
        monDevDispPolicy: 21
      },
      {
        monDevId: '防火卷帘05',
        monDevYxValue: 0,
        monDevDispPolicy: 22
      },
      {
        monDevId: '防火卷帘05',
        monDevYxValue: 0,
        monDevDispPolicy: 21
      },
      {
        monDevId: '防火卷帘04',
        monDevYxValue: 0,
        monDevDispPolicy: 22
      },
      {
        monDevId: '防火卷帘04',
        monDevYxValue: 0,
        monDevDispPolicy: 21
      },
      {
        monDevId: '防火卷帘02',
        monDevYxValue: 0,
        monDevDispPolicy: 22
      },
      {
        monDevId: '防火卷帘02',
        monDevYxValue: 0,
        monDevDispPolicy: 21
      },
      {
        monDevId: '防火卷帘03',
        monDevYxValue: 0,
        monDevDispPolicy: 22
      },
      {
        monDevId: '防火卷帘03',
        monDevYxValue: 0,
        monDevDispPolicy: 21
      },
      {
        monDevId: 'ASD2',
        monDevYxValue: 1,
        monDevDispPolicy: 11
      },
      {
        monDevId: 'ASD2',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD2',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD2',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD2',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD2',
        monDevYxValue: 0,
        monDevDispPolicy: 9
      },
      {
        monDevId: 'MSD2_1',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'MSD2_2',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_1',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_2',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_3',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_4',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_5',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_6',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'ASD124',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD124',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD124',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD124',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD201',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD201',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD201',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD201',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD202',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD202',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD202',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD202',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD203',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD203',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD203',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD203',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD204',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD204',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD204',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD204',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD205',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD205',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD205',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD205',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD206',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD206',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD206',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD206',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD207',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD207',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD207',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD207',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD208',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD208',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD208',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD208',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD209',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD209',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD209',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD209',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD210',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD210',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD210',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD210',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD211',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD211',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD211',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD211',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD212',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD212',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD212',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD212',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD214',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD214',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD214',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD214',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD215',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD215',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD215',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD215',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD216',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD216',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD216',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD216',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD217',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD217',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD217',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD217',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD218',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD218',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD218',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD218',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD219',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD219',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD219',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD219',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD220',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD220',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD220',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD220',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD221',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD221',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD221',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD221',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD222',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD222',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD222',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD222',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD223',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD223',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD223',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD223',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD224',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD224',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD224',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD224',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD1',
        monDevYxValue: 1,
        monDevDispPolicy: 11
      },
      {
        monDevId: 'ASD1',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD1',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD1',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD1',
        monDevYxValue: 0,
        monDevDispPolicy: 8
      },
      {
        monDevId: 'ASD1',
        monDevYxValue: 0,
        monDevDispPolicy: 9
      },
      {
        monDevId: 'MSD1_1',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'MSD1_2',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_1',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_2',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_3',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_4',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_5',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_6',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'ASD101',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD101',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD101',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD101',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD102',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD102',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD102',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD102',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD103',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD103',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD103',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD103',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD104',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD104',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD104',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD104',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD105',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD105',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD105',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD105',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD106',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD106',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD106',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD106',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD107',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD107',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD107',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD107',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD108',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD108',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD108',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD108',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD109',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD109',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD109',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD109',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD110',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD110',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD110',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD110',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD111',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD111',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD111',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD111',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD112',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD112',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD112',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD112',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD113',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD114',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD114',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD114',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD114',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD115',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD115',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD115',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD115',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD116',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD116',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD116',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD116',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD117',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD117',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD117',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD117',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD119',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD120',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD120',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD120',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD120',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD121',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD121',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD121',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD121',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD122',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD122',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD122',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD122',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'ASD123',
        monDevYxValue: 0,
        monDevDispPolicy: 13
      },
      {
        monDevId: 'ASD123',
        monDevYxValue: 0,
        monDevDispPolicy: 6
      },
      {
        monDevId: 'ASD123',
        monDevYxValue: 0,
        monDevDispPolicy: 7
      },
      {
        monDevId: 'ASD123',
        monDevYxValue: 0,
        monDevDispPolicy: 12
      },
      {
        monDevId: 'EED2_7',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_8',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_9',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_10',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_11',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED2_12',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_7',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_8',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_9',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_10',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_11',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: 'EED1_12',
        monDevYxValue: 0,
        monDevDispPolicy: 10
      },
      {
        monDevId: '站厅PIS',
        monDevYxValue: 0,
        monDevDispPolicy: 20
      },
      {
        monDevId: '上行PIS',
        monDevYxValue: 0,
        monDevDispPolicy: 20
      },
      {
        monDevId: '下行PIS',
        monDevYxValue: 0,
        monDevDispPolicy: 20
      },
      {
        monDevId: 'PIS',
        monDevYxValue: 0,
        monDevDispPolicy: 19
      },
      {
        monDevId: 'AGM01',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM02',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM03',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM04',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM05',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM06',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM07',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM08',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM09',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM10',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM11',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM12',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM13',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM14',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM15',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM16',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM17',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM18',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM19',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM20',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM21',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM22',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM23',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM24',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM25',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM26',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM27',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM28',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: 'AGM29',
        monDevYxValue: 0,
        monDevDispPolicy: 4
      },
      {
        monDevId: '0205-E13(K1)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E14(K1)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E15(K2)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E16(K2)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E17(K3)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E18(K3)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E19(K4)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E20(K4)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E01(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E02(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E03(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E04(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E05(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E06(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E07(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-E08(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-H03(K2)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-H04(K3)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-H02(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-H01(N)',
        monDevYxValue: 0,
        monDevDispPolicy: 15
      },
      {
        monDevId: '0205-H91(N)',
        monDevYxValue: 1,
        monDevDispPolicy: 15
      }
    ]
  }

  setInterval(() => {
    // devPoiData()
    ws.send(JSON.stringify(envData))
    ws.send(JSON.stringify(fire))
    // ws.send(JSON.stringify(roomFire))
  }, 5000)
  setTimeout(() => {
    ws.send(JSON.stringify(devStatusData))
    ws.send(JSON.stringify(data1))
    ws.send(JSON.stringify(roomFire))
  }, 6000)
  setTimeout(() => {
    roomFire.monFireRoom[0].roomFireFlag = 0
    ws.send(JSON.stringify(roomFire))
  }, 12000)
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
  const devArr = ['电梯1', '电梯2']
  Array.from({ length: 50 }).forEach((v, k) => {
    devArr.push('AGM' + (k + '').padStart(2, 0))
  })
  let res = {
    initAlarmData: []
  }
  devArr.forEach((v, index) => {
    index = index + 1
    const obj = Mock.mock({
      alarmId: index,
      ymd: 20231008,
      hmsms: Random.date('HHmmssSSS'),
      alarmlevel: Random.natural(1, 1),
      'alarmstate|1': [1, 2, 3], //报警、事故、恢复、已确认
      tonetimes: '语音报警次数', //暂时未用到
      equipmentid: v,
      station_desc: '渌水道站',
      'system_name|1': ['PIS', 'AFC', 'DQHZ', 'PA', 'BAS', 'ACS', 'PSD', 'FG'],
      'system_desc|1': ['AA系统', 'BB系统', 'CC系统'],
      member_name0: '成员名', //暂时未用到
      char_info: '宇视系统IABA:109VC-上行尾|||' + index,
      tone_info: '事件语音内容', //暂时未用到
      cameraGrp: ['34020000001320000001', '34020000001320000171', '34020000001320000161', '34020000001320000161'] //摄像机组名
    })
    res.initAlarmData.push(obj)
  })
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
  setInterval(() => {
    const data = {
      lightingData: [
        {
          lightingAreaId: 'Area9',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area17',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area11',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area8',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area19',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area7',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area2',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area3',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area1',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area21',
          lightingLevel: 2
        },
        {
          lightingAreaId: 'Area23',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area26',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area28',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area34',
          lightingLevel: 2
        },
        {
          lightingAreaId: 'Area32',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area24',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area36',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area10',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area12',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area18',
          lightingLevel: 0
        },
        {
          lightingAreaId: '',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area20',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area4',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area5',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area6',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area33',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area35',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area29',
          lightingLevel: 0
        },
        {
          lightingAreaId: 'Area27',
          lightingLevel: 0
        },
        {
          lightingAreaId: '',
          lightingLevel: 0
        },
        {
          lightingAreaId: '',
          lightingLevel: 0
        },
        {
          lightingAreaId: '',
          lightingLevel: 0
        }
      ]
    }
    ws.send(JSON.stringify(data), (err) => {
      if (err) {
        ws.close()
      }
    })
  }, 10000)
})
