const mqtt = require('mqtt')
//引入ws模块
const WebSocket = require('ws')
const wsMq = new WebSocket.Server({ port: 9119 })
const wsClients = new Set()

const clientId = `tcp_${Math.random().toString(16).slice(3)}`
const connectUrl = `tcp://broker.emqx.io:1883/`
const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  login: 'admin',
  passcode: 'admin',
  reconnectPeriod: 1000
})

const topic = '01TIANZHUSHAN_10009305'
const topicArr = ['testtopic/hik', 'testtopic/hik2']
client.on('connect', (e) => {
  console.log('Connected', e)
  client.subscribe(topicArr, () => {
    console.log(`Subscribe to topic '${topicArr}'`)
  })
  wsMq.on('connection', (ws) => {
    wsClients.add(ws)
    ws.on('close', () => wsClients.delete(ws))
  })
  // setInterval(() => {
  //   client.publish('testtopic/hik', 'testtopic/hik1')
  //   client.publish('testtopic/hik2', 'testtopic/hik2')
  // }, 2000)
})
client.on('message', (topic, message) => {
  console.log('Received Message:', topic, message.toString())
  // 转发消息
  const msg = JSON.stringify({ topic, data: message.toString() })
  wsClients.forEach((client) => client.send(msg))
})
