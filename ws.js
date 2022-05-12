const WebSocket = require('ws') //引入模块
const Mock = require('mockjs')
const sxlList = require('./data')

const Random = Mock.Random
const wsFlow = new WebSocket.Server({ port: 8887 })
const wsEnv = new WebSocket.Server({ port: 8888 })
const inoutEnv = new WebSocket.Server({ port: 8889 })
const alarm = new WebSocket.Server({ port: 8890 })

// #define JASON_MONITORENV_DATANUM "monitorEnvAreaNum"
// #define JASON_MONITORENV_ENVAREATYPEID "envAreaTypeID"
// #define JASON_MONITORENV_ENVAREATYPEDESC "envAreaTypeDesc"
// #define JASON_MONITORENV_MONITORTYPE "monitorType"
// #define JASON_MONITORENV_MONITORTYPEID "envNameTypeID"
// #define JASON_MONITORENV_MONITORTYPEDESC "envNameTypeDesc"
// #define JASON_MONITORENV_MONITORTYPEUNIT "envNameTypeUnit"
// #define JSON_REGDATA_MONITORYCVALUE "monitorYcValue"

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
      monitorYcValue: Random.natural(0, 1000)
    }
    res.data.push(obj)
  }
  res = JSON.stringify(res)
  ws.send(res)
  ws.on('message', (message) => {
    // console.log('flow received: %s', message)
  })
  //推送变化值
  const flowTimer = setInterval(() => {
    let num = Random.natural(1, place)
    let res = {
      rtYcNum: 1,
      data: [
        {
          monitorAreaDesc: '位置' + num,
          monitorAreaID: num,
          monitorYcValue: Random.natural(0, 1000)
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
      console.log(err)
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
      equipmentid: sxlList[index],
      station_desc: '渌水道站',
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
          equipmentid: sxlList[count],
          station_desc: '渌水道站',
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
        EventData: Mock.mock({
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
