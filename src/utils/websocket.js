let ws
let tt
// 避免重复连接
let lockReconnect = false

let websocket = {
  init: function (url, func) {
    try {
      if ('WebSocket' in window) {
        ws = new WebSocket(url)
      } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(url)
      } else {
        console.log('您的浏览器不支持 WebSocket!')
        return
      }
    } catch (error) {
      console.log(error)
      reconnect()
    }

    ws.onmessage = function (e) {
      heartCheck.start()
      if (e.data === 'heartBeatSuccess') {
        // 心跳消息不做处理
        return
      }
      func(e)
    }

    ws.onclose = function () {
      console.log('连接已关闭')
      reconnect()
    }

    ws.onopen = function () {
      console.log('连接成功')
      heartCheck.start()
    }

    ws.onerror = function (e) {
      reconnect()
    }
  },
  send: function (sender, reception, body, flag) {
    let data = {
      sender: sender,
      reception: reception,
      body: body,
      flag: flag,
    }
    let msg = JSON.stringify(data)
    ws.send(msg)
  },
  close() {
    ws.close()
  },
  getWebSocket() {
    return ws
  },
  getStatus() {
    if (ws.readyState == 0) {
      return '未连接'
    } else if (ws.readyState == 1) {
      return '已连接'
    } else if (ws.readyState == 2) {
      return '连接正在关闭'
    } else if (ws.readyState == 3) {
      return '连接已关闭'
    }
  },
}

export default websocket

function reconnect() {
  if (lockReconnect) {
    return
  }
  lockReconnect = true
  // 没连接上会一直重连，设置延迟避免请求过多
  tt && clearTimeout(tt)
  tt = setTimeout(function () {
    console.log('执行断线重连...')
    websocket.init()
    lockReconnect = false
  }, 10000)
}

//心跳检测
let heartCheck = {
  timeout: 6000,
  timeoutObj: null,
  serverTimeoutObj: null,
  start: function () {
    // console.log('开始心跳检测')
    let self = this
    this.timeoutObj && clearTimeout(this.timeoutObj)
    this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj)
    this.timeoutObj = setTimeout(function () {
      // 这里发送一个心跳，后端收到后，返回一个心跳消息，onmessage拿到返回的心跳就说明连接正常
      ws.send('heartBeat')
      self.serverTimeoutObj = setTimeout(function () {
        if (ws.readyState != 1) {
          ws.close()
        }
      }, self.timeout)
    }, this.timeout)
  },
}
