const ffmpeg = require('fluent-ffmpeg')
const express = require('express')
const webSocketStream = require('websocket-stream/stream')
const expressWebSocket = require('express-ws')

// ffmpeg.setFfmpegPath(ffmpegPath.path)
ffmpeg.setFfmpegPath('D:/code/ffmpeg/bin/ffmpeg')

/**
 * 创建一个后端服务
 */
function createServer() {
  const app = express()
  app.use(express.static(__dirname))
  expressWebSocket(app, null, {
    perMessageDeflate: true
  })
  app.ws('/rtsp/', rtspToFlvHandle)
  app.ws('/rtsp2/', sendToUnity)

  app.get('/', (req, response) => {
    response.send('当你看到这个页面的时候说明rtsp流媒体服务正常启动中......')
  })

  app.listen(8100, () => {
    console.log('转换rtsp流媒体服务启动了，服务端口号为8100')
  })
}

/**
 * rtsp 转换 flv 的处理函数
 * @param ws
 * @param req
 */
const rtspToFlvHandle = (ws, req) => {
  const stream = webSocketStream(
    ws,
    {
      binary: true,
      browserBufferTimeout: 1000000
    },
    {
      browserBufferTimeout: 1000000
    }
  )
  ws.on('message', (msg) => {
    console.log(`receive message ${msg}`)
    ws.send('default response')
  })
  // const url = req.query.url
  const url = new Buffer(req.query.url, 'base64').toString() // 前端对rtsp url进行了base64编码，此处进行解码
  console.log('rtsp url:', req.query.url)
  console.log('rtsp base64 url:', url)
  try {
    ffmpeg(url)
      .addInputOption('-rtsp_transport', 'tcp', '-buffer_size', '102400')
      .on('start', (commandLine) => {
        // commandLine 是完整的ffmpeg命令
        console.log(commandLine, '转码 开始')
      })
      .on('codecData', function (data) {
        console.log(data, '转码中......')
      })
      .on('progress', function (progress) {
        // console.log(progress, '转码进度')
      })
      .on('error', function (err, a, b) {
        console.log(url, '转码 错误: ', err.message)
        console.log('输入错误', a)
        console.log('输出错误', b)
      })
      .on('end', function () {
        console.log(url, '转码 结束!')
      })
      .addOutputOption(
        '-threads',
        '5', // 一些降低延迟的配置参数
        '-tune',
        'zerolatency',
        '-preset',
        'ultrafast'
      )
      .outputFormat('flv') // 转换为flv格式
      .videoCodec('libx264') // ffmpeg无法直接将h265转换为flv的，故需要先将h265转换为h264，然后再转换为flv
      .withSize('400x?') // 转换之后的视频分辨率原来的50%, 如果转换出来的视频仍然延迟高，可按照文档上面的描述，自行降低分辨率
      .noAudio() // 去除声音
      .pipe(stream)
  } catch (error) {
    console.log('抛出异常', error)
  }
}
const sendToUnity = () => {
  const url = new Buffer(req.query.url, 'base64').toString() // 前端对rtsp url进行了base64编码，此处进行解码
  console.log('rtsp url:', req.query.url)
  console.log('rtsp base64 url:', url)
  const ffmpegStream = ffmpeg(url)
    .noAudio()
    .videoCodec('libx264')
    .format('flv')
    .on('error', function (error) {
      console.log('error ffmpeg', error)
    })
    .on('end', function () {
      console.log('exchanged end ffmpeg')
      // res.end();
    })
    .pipe()
  ffmpegStream
    .on('data', (chunk) => {
      console.log(chunk.length, chunk)
      ws.send(chunk)
    })
    .on('end', () => {
      console.log('ffmpeg pipe end')
    })
}
createServer()
