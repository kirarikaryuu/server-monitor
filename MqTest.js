const mqtt = require('mqtt')

const host = '192.168.10.10'
const port = '1883'
const clientId = `tcp_${Math.random().toString(16).slice(3)}`

const connectUrl = `tcp://${host}:${port}`

const client = mqtt.connect(connectUrl, {
    // clientId,
    clean: true,
    connectTimeout: 4000,
    // username: 'admin',
    // password: 'admin',
    "clientId": "793f9cd2b00643b28a171cafd086aa32",
    "username": "artemis_27104148",
    "password": "7fbaa20d6fea",
    reconnectPeriod: 1000,
})

// const topic = '/exchange/epai.xihan.ui'
const topic = 'artemis/even_behavior/7617069061/admin'
const topic2 = 'artemis/even_iac/7617069062/admin'
const topicArr = [topic, topic2]
client.on('connect', () => {
    console.log('Connected')
    client.subscribe(topicArr, () => {
        console.log(`Subscribe to topic '${topicArr}'`)
    })
    // setInterval(() => {
    //     client.publish(topic, 'nodejs mqtt test11111111111111', { qos: 0, retain: false }, (error) => {
    //         if (error) {
    //             console.error(error)
    //         }
    //     })
    // }, 3000)
})
client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString())
})