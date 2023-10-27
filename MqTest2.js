const Stomp = require('stompjs');

const getMq = () => {
    // const host = 'ws://localhost:61614/'
    const ip = 'broker.emqx.io'
    const port = '1883'
    const headers = {
        login: 'admin',
        passcode: 'admin',
        'client-id': 'test111'
    }
    // const headers = {
    //     "userName": "artemis_27104148",
    //     "password": "7fbaa20d6fea"
    // }
    const onConnected = (frame) => {
        console.log(frame)
        client.subscribe(
            // 订阅到交换机
            'ActiveMQ.DLQ',
            responseCallback
        )
        // client.subscribe(
        //     // 订阅到交换机
        //     'artemis/even_nms/7617069060/admin',
        //     responseCallback
        // )
        // client.subscribe(
        //     // 订阅到交换机
        //     'artemis/even_iac/7617069062/admin',
        //     responseCallback
        // )
        // client.subscribe(
        //     // 订阅到交换机
        //     'artemis/even_behavior/7617069061/admin',
        //     responseCallback
        // )
        // client.subscribe(
        //     // 订阅到交换机
        //     'artemis/even_device/7617069059/admin',
        //     responseCallback
        // )
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
            // const client = Stomp.overWS(host)
            const client = Stomp.overTCP(ip, port)
            client.connect(headers, onConnected, onFailed)
        }, 3000)
    }
    // const client = Stomp.overWS(host)
    const client = Stomp.overTCP(ip, port)
    client.connect(headers, onConnected, onFailed)
}
getMq()
