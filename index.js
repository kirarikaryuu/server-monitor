const Koa = require('koa')
const { createMockServer } = require('grpc-mock')

const app = new Koa()
const mockServer = createMockServer({
  protoPath: './proto/third_grpc.proto',
  packageName: 'third.grpc',
  serviceName: 'AutoCheckService',
  rules: [
    {
      method: 'AutoCheckCommand',
      input: { devName: 111, openStationFlag: 0 },
      output: { message: '0' }
    }
  ]
})

app.use(async (ctx) => {
  ctx.body = 'hello koa2'
})

app.listen(3000)
mockServer.listen('0.0.0.0:50051')

console.log('[demo] start-quick is starting at port 3000')
