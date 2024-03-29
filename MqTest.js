const mqtt = require('mqtt')

const host = '192.168.19.27'
const port = '61614'
const clientId = `tcp_${Math.random().toString(16).slice(3)}`

const connectUrl = `ws://192.168.19.27:61614/`

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    login: 'admin',
    passcode: 'admin',
    reconnectPeriod: 1000,
})

// const topic = '/exchange/epai.xihan.ui'
const topic = '01TIANZHUSHAN_10009305'
// const topic2 = 'EnergyManage'
// const topic = 'artemis/even_behavior/7617069061/admin'
// const topic2 = 'artemis/even_iac/7617069062/admin'
const topicArr = [topic]
client.on('connect', (e) => {
    console.log('Connected', e)
    client.subscribe(topicArr, () => {
        console.log(`Subscribe to topic '${topicArr}'`)
    })
    // setInterval(() => {
    //     const msg = {
    //         '01天竺山站_10009305': 0
    //     }
    //     client.publish('XM_2_receive_topic', JSON.stringify(msg), { qos: 0, retain: false }, (error) => {
    //         if (error) {
    //             console.error(error)
    //         }
    //     })
    // }, 8000)
})
client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload)
})