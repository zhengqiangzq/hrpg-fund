import utils from '@/common/js/utils' // 公共方法
import validate from '@/common/js/validate' // 公共验证方法
import handleAPI from '@/common/js/handleApi' // 基本操作API的方法
import initRules from '@/common/js/initRules' // 初始化验证规则
import store from '@/store'

export default {
  install(app, options) {
    app.config.globalProperties.$fn = utils
    app.config.globalProperties.$validate = validate
    app.config.globalProperties.$handleAPI = handleAPI
    app.config.globalProperties.$initRules = initRules
    app.config.globalProperties.$permission = (
      code,
      list = store.state.permission.permissionCodes
    ) => {
      if (list) {
        return list.indexOf(code) > -1
      }
    }
    app.config.globalProperties.validSe = function (value) {
        // 基础Unicode表情（含肤色修饰）
        const unicodeEmoji = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu;
        // 组合表情（含零宽连接符）
        const compositeEmoji = /[\uD83C-\uDBFF][\uDC00-\uDFFF][\u200D\uFE0F]?/g;
        // 常见字符表情（需转义特殊字符）
        // const textEmoji = /(?:[:;=][\'\"\-]?[\)\(DPpdOo\/\\\|]|<3|\([\'\"]?[\)\|\\\/][\'\"\)]?)/g;
        return String(value)
            .replace(unicodeEmoji,'')
            .replace(compositeEmoji,'')
            // .replace(textEmoji, '')
            ?.trim()
    }
    app.directive('enterNumber', {
      //禁止输入中文和小数点
      inserted(el) {
        el.addEventListener('keypress', function (e) {
          e = e || window.event
          let charcode = typeof e.charCode === 'number' ? e.charCode : e.keyCode
          let re = /\d/
          if (
            !re.test(String.fromCharCode(charcode)) &&
            charcode > 9 &&
            !e.ctrlKey
          ) {
            if (e.preventDefault) {
              e.preventDefault()
            } else {
              e.returnValue = false
            }
          }
        })
      },
    })
    app.directive('focus', {
      inserted(el, binding, vnode) {
        // 聚焦元素
        el.querySelector('input').focus()
      },
    })
  },
}
