import { aesEncrypt } from '@/utils/aes-util.js'
    ;(function (open, send) {
    XMLHttpRequest.prototype.open = function () {
        open.apply(this, arguments)
    }
    XMLHttpRequest.prototype.send = function () {
        /**
         * 接口请求前增加自定义业务逻辑处理
         */
        let uuid = Math.random().toString(36).slice(-6) + (1 + Math.random())
        let timestamp = Math.floor(Date.now() / 1000)
        let nonceStr = uuid + ':' + timestamp
        this.setRequestHeader('sign', aesEncrypt(nonceStr, timestamp.toString()))
        this.setRequestHeader('timestamp', timestamp)
        this.setRequestHeader('nonceStr', uuid)
        send.apply(this, arguments)
    }
})(XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.send)
