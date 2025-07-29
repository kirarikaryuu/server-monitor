const Stomp = require('stompjs')

const getMq = () => {
  const clientId = `ws_${Math.random().toString(16).slice(3)}`
  const ip = 'broker.emqx.io'
  const port = '1883'
  const headers = {
    login: 'admin',
    passcode: 'admin',
    'client-id': clientId
  }
  const onConnected = (frame) => {
    console.log(frame)
    client.subscribe(
      // 订阅到交换机
      'testtopic/#',
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
getMq()
