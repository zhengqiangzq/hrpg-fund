import store from '@/store'
import i18n from '@/lang/index.js'
import router from '@/router'
const { t } = i18n.global
const validate = {
  // 校验邮编
  zipCode: (rule, value, callback) => {
    if (value && !/^[a-zA-Z0-9 ]{3,12}$/.test(value)) {
      callback(new Error(t('err_zip_code')))
    } else {
      callback()
    }
  },
  // 固定电话或者手机号码
  cellphone: (rule, value, callback) => {
    if (
      !/(^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.test(
        value
      ) &&
      value
    ) {
      callback(new Error(t('err_tel')))
    } else {
      callback()
    }
  },
  // 验证固定电话， 例028-1312331
  telephone: (rule, value, callback) => {
    if (!/^0\d{2,3}-\d{7,8}$/.test(value) && value) {
      callback(new Error(t('err_tel')))
    } else {
      callback()
    }
  },
  // 验证固定电话， 例028-1312331
  fax: (rule, value, callback) => {
    if (!/^0\d{2,3}-\d{7,8}$/.test(value) && value) {
      callback(new Error('传真格式错误'))
    } else {
      callback()
    }
  },
  // 邮箱
  mail: (rule, value, callback) => {
    if (
      value &&
      !/^[A-Za-zd0-9]+([-_.][A-Za-zd]+)*@([A-Za-zd0-9]+[-.])+[A-Za-zd]{2,5}$/.test(
        value
      )
    ) {
      callback(new Error(t('err_email')))
    } else {
      callback()
    }
  },
  // 身份证
  idCard: (rule, value, callback) => {
    if (
      value &&
      !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(
        value
      )
    ) {
      callback(new Error(t('err_id_card')))
    } else {
      callback()
    }
  },
  // 数字
  onlyNumber: (rule, value, callback) => {
    if (value && isNaN(value)) {
      callback(new Error('只能输入数字'))
    } else {
      callback()
    }
  },
  allNumber: (rule, value, callback) => {
    let reg = /^(-?\d+)(\.\d+)?$/
    if (value && !reg.test(value)) {
      callback(new Error('只能输入数字'))
    } else {
      callback()
    }
  },
  // 数字-自然数大于1
  naturalnumber1: (rule, value, callback) => {
    const reg = /^[1-9]\d*$/
    if (!reg.test(value)) {
      callback(new Error('输入大于等于1的整数'))
    } else {
      callback()
    }
  },
  // 数字-自然数
  naturalnumber: (rule, value, callback) => {
    const reg = /^(0|[1-9][0-9]*)$/
    if (!reg.test(value)) {
      callback(new Error('输入大于等于0的整数'))
    } else {
      callback()
    }
  },
  // 数字-自然数-非必填
  naturalnumberNo: (rule, value, callback) => {
    const reg = /^(0|[1-9][0-9]*)$/
    if (value !== undefined) {
      if (!reg.test(value)) {
        callback(new Error('输入大于等于0的整数'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },
  // 数字-正数-无小数校验-非必填
  positiveScore: (rule, value, callback) => {
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    if (value !== undefined && value !== null) {
      if (!reg.test(value)) {
        callback(new Error('输入大于0的数字'))
      } else if (value > 9999) {
        callback(new Error('输入的数字不能大于9999'))
      } else {
        callback()
      }
    }
  },
  // 数字-正数
  positive: (rule, value, callback, obj) => {
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let qty_show_precision =
    isDrug ? (store.state.permission.systemConfig.drug_qty_show_precision || 0) : (store.state.permission.systemConfig.qty_show_precision || 0)
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      qty_show_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.qty_show_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_qty_show_precision : qty_show_precision
    }
    const pattern = new RegExp('^\\d+.?\\d{0,' + qty_show_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入大于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${qty_show_precision}位`))
    } else if (value > 99999999) {
      callback(new Error('输入的数字不能大于99999999'))
    } else {
      callback()
    }
  },
  // 数字-正数/负数
  numberNotZero: (rule, value, callback, obj) => {
    const reg = /^-?(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let qty_show_precision =
    isDrug ? (store.state.permission.systemConfig.drug_qty_show_precision || 0) : (store.state.permission.systemConfig.qty_show_precision || 0)
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      qty_show_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.qty_show_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_qty_show_precision : qty_show_precision
    }
    const pattern = new RegExp('^-?\\d+.?\\d{0,' + qty_show_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入不为0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${qty_show_precision}位`))
    } else if (value > 99999999) {
      callback(new Error('输入的数字不能大于99999999'))
    } else {
      callback()
    }
  },
  // 仅用于湿度
  humValidator: (rule, value, callback) => {
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    if (value && isNaN(value)) {
      if (!reg.test(value)) {
        callback(new Error('输入大于0的数字'))
      } else if (value > 99999999) {
        callback(new Error('输入的数字不能大于99999999'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },
  // 数字-正数和0
  positiveAndZero: (rule, value, callback, obj) => {
    const reg = /^(0|[1-9]\d{0,8})(\s|$|\.\d{0,}\b)/
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let qty_show_precision =
    isDrug ? (store.state.permission.systemConfig.drug_qty_show_precision || 0) : (store.state.permission.systemConfig.qty_show_precision || 0)
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      qty_show_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.qty_show_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_qty_show_precision : qty_show_precision
    }
    const pattern = new RegExp('^\\d+.?\\d{0,' + qty_show_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入大于等于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${qty_show_precision}位`))
    } else if (value > 99999999) {
      callback(new Error('输入的数字不能大于99999999'))
    } else {
      callback()
    }
  },
  // 浮点数
  floatPointNumber: (rule, value, callback) => {
    const reg = /^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/
    if (!reg.test(value)) {
      callback(new Error('输入正确的数字'))
    } else {
      callback()
    }
  },
  // number: (rule, value, callback) => {
  //   const reg = /^[+-]?\d+(\.\d+)?$|^$|^(\d+|\-){7,}$/
  //   if (!reg.test(value)) {
  //     callback(new Error(t('输入正确的数字')))
  //   } else {
  //     callback()
  //   }
  // },
  // 验证是否是[-8000000-8000000]的小数
  isBtn8000000: (rule, value, callback) => {
    if (value && isNaN(value) && (value < -8000000 || value > 8000000)) {
      callback(new Error('只能输入数字，值为[-8000000,8000000]'))
    } else {
      callback()
    }
  },
  // 大小写字母
  validatAlphabets: (rule, value, callback) => {
    const reg = /^[A-Za-z]+$/
    if (value && !reg.test(value)) {
      callback(new Error('err_value_alphabets'))
    } else {
      callback()
    }
  },
  //校验不能输入中文
  validatChinese: (rule, value, callback) => {
    const reg = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi
    if (value && reg.test(value)) {
      callback(new Error('不能输入中文'))
    } else if (escape(value).indexOf('%u') != -1) {
      callback(new Error('不能输入中文字符'))
    } else {
      callback()
    }
  },
  validatEn: (rule, value, callback) => {
    const reg = /^[0-9a-zA-Z]+$/
    if (value && !reg.test(value)) {
      callback(new Error('只能输入数字，英文或字母数字组合'))
    } else {
      callback()
    }
  },
  //只能输入中英文
  validatEnAndChinese: (rule, value, callback) => {
    const reg = /^[a-zA-Z\u4e00-\u9fa5]+$/
    if (value && !reg.test(value)) {
      callback(new Error('只能输入中英文'))
    } else {
      callback()
    }
  },
  //金额必填
  positiveMoney: (rule, value, callback, obj) => {
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let price_precision =
    isDrug ? (store.state.permission.systemConfig.drug_price_precision || 0) : (store.state.permission.systemConfig.price_precision || 0)
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      price_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.price_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_price_precision : price_precision
    }
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入正确且大于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${price_precision}位`))
    } else if (value > 999999999999999) {
      callback(new Error('输入的数字不能大于999999999999999'))
    } else {
      callback()
    }
  },
  //金额非必填
  positiveMoneyNo: (rule, value, callback, obj) => {
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let price_precision =
    isDrug ? (store.state.permission.systemConfig.drug_price_precision || 0) : (store.state.permission.systemConfig.price_precision || 0)
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      price_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.price_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_price_precision : price_precision
    }
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (value) {
      if (!reg.test(value)) {
        callback(new Error('输入正确且大于0的数字'))
      } else if (!pattern.test(value)) {
        callback(new Error(`小数点后最多只能输入${price_precision}位`))
      } else if (value > 999999999999999) {
        callback(new Error('输入的数字不能大于999999999999999'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },
  //金额必填大于等于0
  positiveMoneyZero: (rule, value, callback, obj) => {
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let price_precision =
      isDrug ? (store.state.permission.systemConfig.drug_price_precision || 0) : (store.state.permission.systemConfig.price_precision || 0)  
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      price_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.price_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_price_precision : price_precision
    }
    const reg = /^(0|[1-9]\d{0,8})(\s|$|\.\d{0,}\b)/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入正确且大于等于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${price_precision}位`))
    } else if (value > 999999999999999) {
      callback(new Error('输入的数字不能大于999999999999999'))
    } else {
      callback()
    }
  },
  //金额必填大于等于0
  positiveAssetMoneyZero: (rule, value, callback) => {
    let assets_price_precision =
      store.state.permission.systemConfig.assets_price_precision || 0
    const reg = /^\d+(?=\.{0,1}\d+$|$)/
    const pattern = new RegExp('^\\d+.?\\d{0,' + assets_price_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入正确且大于等于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${assets_price_precision}位`))
    } else if (value > 999999999999999) {
      callback(new Error('输入的数字不能大于999999999999999'))
    } else {
      callback()
    }
  },

  //金额非必填大于等于0
  positiveMoneyNoZero: (rule, value, callback, obj) => {
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let price_precision =
      isDrug ? (store.state.permission.systemConfig.drug_price_precision || 0) : (store.state.permission.systemConfig.price_precision || 0)  
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      price_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.price_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_price_precision : price_precision
    }  
    const reg = /^(0|[1-9]\d{0,8})(\s|$|\.\d{0,}\b)/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (value) {
      if (!reg.test(value)) {
        callback(new Error('输入正确且大于等于0的数字'))
      } else if (!pattern.test(value)) {
        callback(new Error(`小数点后最多只能输入${price_precision}位`))
      } else if (value > 999999999999999) {
        callback(new Error('输入的数字不能大于999999999999999'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },
  positiveNo: (rule, value, callback) => {
    //数字非必填
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let qty_show_precision =
      isDrug ? (store.state.permission.systemConfig.drug_qty_show_precision || 0) : (store.state.permission.systemConfig.qty_show_precision || 0)  
    if(obj && obj.hasOwnProperty('generalProductCategory')){
      qty_show_precision = obj.generalProductCategory === '0' ? store.state.permission.systemConfig.qty_show_precision : obj.generalProductCategory === '4' ? store.state.permission.systemConfig.drug_qty_show_precision : qty_show_precision
    }  
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    const pattern = new RegExp('^\\d+.?\\d{0,' + qty_show_precision + '}$')
    if (value) {
      if (!reg.test(value)) {
        callback(new Error('输入大于0的数字'))
      } else if (!pattern.test(value)) {
        callback(new Error(`小数点后最多只能输入${qty_show_precision}位`))
      } else if (value > 99999999) {
        callback(new Error('输入的数字不能大于99999999'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },
  validatURL: (rule, value, callback) => {
    const reg =
      /^(http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?|^((http:\/\/|https:\/\/)?([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d{0,5})?(\/.*)?$/
    if (value && !reg.test(value)) {
      callback(new Error('请输入正确的URL地址'))
    } else {
      callback()
    }
  },

  // 数字-正数和0
  positiveAndZeroAsset: (rule, value, callback) => {
    const reg = /^(0|[1-9]\d{0,8})(\s|$|\.\d{0,}\b)/
    let qty_show_precision = 0
    const pattern = new RegExp('^\\d+.?\\d{0,' + qty_show_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入大于等于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${qty_show_precision}位`))
    } else if (value > 99999999) {
      callback(new Error('输入的数字不能大于99999999'))
    } else {
      callback()
    }
  },
  //金额必填
  positiveMoneyAsset: (rule, value, callback) => {
    let price_precision =
      store.state.permission.systemConfig.assets_price_precision || 0
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入正确且大于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${price_precision}位`))
    } else if (value > 999999999999999) {
      callback(new Error('输入的数字不能大于999999999999999'))
    } else {
      callback()
    }
  },
  //金额非必填
  positiveMoneyNoAsset: (rule, value, callback) => {
    let price_precision =
      store.state.permission.systemConfig.assets_price_precision || 0
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (value) {
      if (!reg.test(value)) {
        callback(new Error('输入正确且大于0的数字'))
      } else if (!pattern.test(value)) {
        callback(new Error(`小数点后最多只能输入${price_precision}位`))
      } else if (value > 999999999999999) {
        callback(new Error('输入的数字不能大于999999999999999'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },
  //金额必填大于等于0
  positiveMoneyZeroAsset: (rule, value, callback) => {
    let price_precision =
      store.state.permission.systemConfig.assets_price_precision || 0
    const reg = /^(0|[1-9]\d{0,8})(\s|$|\.\d{0,}\b)/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (!reg.test(value)) {
      callback(new Error('输入正确且大于等于0的数字'))
    } else if (!pattern.test(value)) {
      callback(new Error(`小数点后最多只能输入${price_precision}位`))
    } else if (value > 999999999999999) {
      callback(new Error('输入的数字不能大于999999999999999'))
    } else {
      callback()
    }
  },
  //金额非必填大于等于0
  positiveMoneyNoZeroAsset: (rule, value, callback) => {
    let price_precision =
      store.state.permission.systemConfig.assets_price_precision || 0
    const reg = /^(0|[1-9]\d{0,8})(\s|$|\.\d{0,}\b)/
    const pattern = new RegExp('^\\d+.?\\d{0,' + price_precision + '}$')
    if (value) {
      if (!reg.test(value)) {
        callback(new Error('输入正确且大于等于0的数字'))
      } else if (!pattern.test(value)) {
        callback(new Error(`小数点后最多只能输入${price_precision}位`))
      } else if (value > 999999999999999) {
        callback(new Error('输入的数字不能大于999999999999999'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },
  positiveNoAsset: (rule, value, callback) => {
    //数字非必填
    let qty_show_precision = 0
    const reg = /^(?!(0[0-9]{0,8}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/
    const pattern = new RegExp('^\\d+.?\\d{0,' + qty_show_precision + '}$')
    if (value) {
      if (!reg.test(value)) {
        callback(new Error('输入大于0的数字'))
      } else if (!pattern.test(value)) {
        callback(new Error(`小数点后最多只能输入${qty_show_precision}位`))
      } else if (value > 99999999) {
        callback(new Error('输入的数字不能大于99999999'))
      } else {
        callback()
      }
    } else {
      callback()
    }
  },

  positiveAndLetter: (rule, value, callback) => {
    //数字非必填
    const reg = /^(?=.*[a-zA-Z])(?=.*\d)[\s\S]{8,20}$/
    if (value == '') {
      callback(new Error('请输入密码'))
    } else if (!reg.test(value)) {
      callback(new Error('密码必须包含字母和数字，且长度在8~20位之间'))
    } else {
      callback()
    }
  },
}
export default validate
