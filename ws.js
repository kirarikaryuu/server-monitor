const WebSocket = require('ws') //引入模块
const Mock = require('mockjs')
const sxlList = require('./data')

const Random = Mock.Random
const wsFlow = new WebSocket.Server({ port: 9484 })
const wsEnv = new WebSocket.Server({ port: 9483 })
const inoutEnv = new WebSocket.Server({ port: 9485 })
const alarm = new WebSocket.Server({ port: 9489 })
const patrol = new WebSocket.Server({ port: 9487 })
const envMonitor = new WebSocket.Server({ port: 9490 })

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

// 客流密度ws
wsFlow.on('connection', (ws) => {
  const place = Random.natural(7, 14)
  let res = {
    rtYcNum: place,
    data: []
  }
  for (let index = 1; index <= place; index++) {
    const obj = {
      monitorAreaDesc: '位置' + index,
      monitorAreaID: index,
      monitorYcValue: Random.natural(0, 1000),
      areaDisplayRange: Random.natural(1, 80),
      paxVolumeWarn: 60,
      paxVolumeAlarm: 80,
      position: Mock.mock({
        x: Random.natural(-900, -7500),
        'y|1': [11223, 9700],
        z: Random.natural(-12000, -25000)
      })
    }
    res.data.push(obj)
  }
  res = JSON.stringify(res)
  ws.send(res)

  //推送变化值
  const flowTimer = setInterval(() => {
    let num = Random.natural(1, place)
    let res = {
      rtYcNum: 1,
      data: [
        {
          monitorAreaDesc: '位置' + num,
          monitorAreaID: num,
          monitorYcValue: Random.natural(0, 1000),
          areaDisplayRange: Random.natural(1, 80),
          paxVolumeWarn: 60,
          paxVolumeAlarm: 80,
          position: Mock.mock({
            x: Random.natural(-900, -7500),
            'y|1': [11223, 9700],
            z: Random.natural(-12000, -25000)
          })
        }
      ]
    }
    res = JSON.stringify(res)
    // console.log(res)
    ws.send(res, (err) => {
      if (err) {
        clearInterval(flowTimer)
        ws.close()
      }
    })
  }, 1000)
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
      inboardPassNum: Random.natural(0, 1000),
      outboardPassNum: Random.natural(0, 1000)
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
      inboardPassNum: Random.natural(0, 1000),
      outboardPassNum: Random.natural(0, 1000)
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
    if (JSON.parse(message).alarmIdlist) {
      const idList = JSON.parse(message).alarmIdlist
      idList.forEach((val) => {
        let updateIndex = res.initAlarmData.findIndex((data) => data.equipmentid === val)
        let updateObj = res.initAlarmData[updateIndex]
        updateObj.alarmstate = 5
        let update = {
          updateAlarmData: [updateObj]
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
        'cameraGrp|1': [[1], [1, 2]]
      })
      const count = Random.natural(1, 3)
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
        obj.devYxInfo.forEach((val) => {
          data.devYxInfo.push(
            Mock.mock({
              devYxName: val.devYxName,
              devYxStateDesc: '更新了',
              'devYxStateAlarmFlag|1': [0, 1]
            })
          )
        })
        result.data.push(data)
        ws.send(JSON.stringify(result))
      }, 1000)
    }
  })
  //推送
  const push = () => {
    console.log('自动巡检push')
    const id = [1, 2]
    const name = ['巡检1号', '巡检2号']
    const count = Random.natural(0, 1)
    let res = Mock.mock({
      patrolFuncId: id[count],
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
  setTimeout(() => {
    push()
  }, 6000)
  // const patrolTimer = setInterval(push(), 3000)
})

// 客流密度ws
envMonitor.on('connection', (ws) => {
  let envTimer = null
  ws.on('message', (message) => {
    console.log('envMonitor received: %s', message)
    const type = parseInt(JSON.parse(message)?.FuncType)
    console.log(type)
    if (type == 0) {
      const place = Random.natural(7, 14)
      const sendMsg = () => {
        let res = {
          rtYcNum: place,
          data: []
        }
        for (let index = 0; index <= place; index++) {
          const obj = Mock.mock({
            monitorEnvDevId: sxlList[index],
            'envNameTypeDesc|1': ['温度', '湿度', 'CO₂', 'SO₂', 'PM10', 'PM2.5'],
            envNameTypeUnit: '℃',
            monitorYcValue: Random.natural(0, 1000)
          })
          res.data.push(obj)
        }
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
