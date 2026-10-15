import { ElMessage, ElMessageBox } from 'element-plus'
import { getLodop } from '@/assets/js/LodopFuncs.js'
import store from '@/store'
import router from '@/router'
import _ from 'lodash'
import * as math from 'mathjs'
let timer = null
let lastCall = 0
const blacklist = [
  'commonName',
  'productCode',
  'standard',
  'trademark',
  'unitConvertCoefficient',
  'productStatus',
  'productStatusValue',
  'brandId',
  'brandCode',
  'brandName',
  'unitId',
  'unitName',
  'picture',
  'productRemark',
  'licenseId',
  'licenseNumber',
  'licenseName',
  'licenseEnName',
  'licenseBeginDate',
  'licenseEndDate',
  'generalProductCategory',
  'qtyOperateMode',
  'qtyOperateModeValue',
  'productKeyWord',
  'alias',
  'productType',
  'productTypeValue',
  'codeType',
  'codeTypeValue',
  'productCategoryId',
  'productCategoryValue',
  'calcUnitId',
  'calcUnitName',
  'mnemonic',
  'needBatchNumber',
  'needBatchNumberValue',
  'dosageForm',
  'dosageFormValue',
  'temporaryPurch',
  'temporaryPurchValue',
  'storageCondition',
  'defaultSupplierId',
  'defaultSupplierName',
  'defaultSupplierCode',
  'defaultSupplierPrice',
  'financialAccount',
  'financialAccountValue',
  'acquisitionReplaceConsume',
  'acquisitionReplaceConsumeValue',
  'withOperateTable',
  'mainCode',
  'productNearlyEffective',
  'packingSpecification',
  'invoiceCategory',
  'invoiceCategoryValue',
  'caseCategory',
  'caseCategoryValue',
  'needSequence',
  'needSequenceValue',
  'epidemicPrevention',
  'epidemicPreventionValue',
  'largeUnitQty',
  'smallUnitQty',
  'nationCode',
  'provinceCode',
  'nationHealthInsurance',
  'medicalNumber',
  '_id',
  'isSunPurchase',
  'isSunPurchaseValue',
  'isBargaining',
  'isBargainingValue',
  'isCharge',
  'isChargeValue',
  'settlementMethod',
  'settlementMethodValue',
  'isConsignment',
  'isConsignmentValue',
  'isLimitPrice',
  'isLimitPriceValue',
  'purchaseLimitPrice',
  'expectedUsageTimes',
  'putShelfStatus',
  'putShelfStatusValue',
  'networkType',
  'networkTypeValue',
  'serialNum',
  'uuid',
  'isChoice',
  'key',
] //黑名单

export default {
  /**
   * 通过key找到在列表中对应的显示
   * @param {Object} obj
   *  @param obj.dataList 数据列表
   *  @param obj.value    数据的值对应的字段名称   例如 'value'
   *  @param obj.label    数据的说明对应的字段名称 例如 'label'
   *  @param obj.data     当前传入的数据值
   * @return name        返回当前传入值在数组中对应的名字
   */
  getDataName: (obj) => {
    let name = obj.data
    if (Array.isArray(obj.dataList) && obj.dataList.length > 0) {
      for (let i = 0; i < obj.dataList.length; i++) {
        if (obj.dataList[i][obj.value] === obj.data) {
          name = obj.dataList[i][obj.label]
        }
      }
    }
    return name
  },
  getLocalPrinterList: () => {
    let LODOP = getLodop()
    let iPrinterList = LODOP.GET_PRINTER_COUNT()
    let options = []
    for (let i = 0; i < iPrinterList; i++) {
      let printerName = LODOP.GET_PRINTER_NAME(i)
      options.push({
        label: printerName,
        id: i,
      })
    }
    return options
  },
  // 获取组件类型和名称
  getComponentsData: (pcRouter) => {
    if (!pcRouter) return {}
    const pcArr = pcRouter.split('&')
    const obj = {}
    pcArr.forEach((item) => {
      const tempArr = item.split('=')
      obj[tempArr[0]] = tempArr[1]
    })
    return obj
  },
  // flowType-跳转页面，权重大于判断assigneeList fromComponent动态传值，处理Navbar等特殊情况
  setFlowData(obj) {
    window.$wujie?.bus.$emit('flowSonSetChange', 'setFlowData', obj)
    // console.log(route)
    // let tempPath = false
    // if (
    //   fromComponent !== 'Navbar' &&
    //   route.path !== '/task/myPendingTask' &&
    //   route.path !== '/task/myFinishedTask' &&
    //   route.path !== '/dashboard'
    // ) {
    //   tempPath = true
    // }
    // let queryParams = {
    //   taskName: val.nodeName || val.taskName,
    //   processDefinitionName: val.title,
    //   processInstanceInitiator: val.submitUserName,
    //   processInstanceId: val.processInstanceId,
    //   processDefinitionId: val.processDefinitionId,
    //   backRouter: route.path,
    // }
    // const currentUser = store.state.user.userInfo.user.id
    // if (flowType === 'myApply') {
    //   router.push({
    //     path: '/task/myApplyDetails',
    //     query: queryParams,
    //   })
    // } else if (
    //   flowType === 'myPending' ||
    //   (val.assigneeList && val.assigneeList.indexOf(currentUser) !== -1)
    // ) {
    //   queryParams.taskId = val.taskId || val.id
    //   if (route.path === '/task/myPendingDetails') {
    //     queryParams.backRouter = route.query.backRouter
    //     router.replace({
    //       path: tempPath
    //         ? '/task/myPendingDetails/' + route.meta.title
    //         : '/task/myPendingDetails',
    //       query: queryParams,
    //     })
    //   } else {
    //     router.push({
    //       path: tempPath
    //         ? '/task/myPendingDetails/' + route.meta.title
    //         : '/task/myPendingDetails',
    //       query: queryParams,
    //     })
    //   }
    // } else {
    //   router.push({
    //     path: tempPath
    //       ? '/task/myFinishedDetails/' + route.meta.title
    //       : '/task/myFinishedDetails',
    //     query: queryParams,
    //   })
    // }
  },
  // flowType-跳转页面，权重大于判断assigneeList
  setFlowPath(proxy) {
    window.$wujie?.bus.$emit('flowSonSetChange', 'onClose', proxy)
    // const routePath = proxy.$route.path
    // const backRouter = proxy.$route.query.backRouter
    // if (routePath.includes('/task/myApplyDetails')) {
    //   const view = {
    //     name: 'myApplyDetails',
    //     path: routePath,
    //   }
    //   proxy.$store.dispatch('tabsView/delView', view)
    // } else if (routePath.includes('/task/myFinishedDetails')) {
    //   const view = {
    //     name: routePath.includes('/task/myFinishedDetails/')
    //       ? 'myFinishedDetail'
    //       : 'myFinishedDetails',
    //     path: routePath,
    //   }
    //   proxy.$store.dispatch('tabsView/delView', view)
    // } else if (routePath.includes('/task/myPendingDetails')) {
    //   const view = {
    //     name: routePath.includes('/task/myPendingDetails/')
    //       ? 'myPendingDetail'
    //       : 'myPendingDetails',
    //     path: proxy.$route.path,
    //   }
    //   proxy.$store.dispatch('tabsView/delView', view)
    // }
    // if (backRouter) {
    //   proxy.$router.push(backRouter)
    // } else {
    //   if (JSON.stringify(proxy.$route.query) === '{}') {
    //     proxy.$router.push('/')
    //   } else {
    //     proxy.$router.go(-1)
    //   }
    // }
  },
  // 一般用于数量
  qtyFormatter: (num, column, cellValue, index) => {
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    if (
      num &&
      num.emptyRowType &&
      (num.emptyRowType === '1' || num.emptyRowType === '2')
    ) {
      return ''
    }
    let systemConfig = store.state.permission.systemConfig
    let qty_show_precision = isDrug
      ? systemConfig.drug_qty_show_precision
      : systemConfig.qty_show_precision
    if (num.hasOwnProperty('generalProductCategory')) {
      qty_show_precision =
        num.generalProductCategory === '0'
          ? systemConfig.qty_show_precision
          : num.generalProductCategory === '4'
          ? systemConfig.drug_qty_show_precision
          : qty_show_precision
    }
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num && !isNaN(num)) {
      return format_number(
        parseFloat(num),
        qty_show_precision,
        2
        // isDrug ? systemConfig.drug_qty_show_retention_strategy : systemConfig.qty_show_retention_strategy
      )
    }
    if (newNum && !!newNum.isColspan) {
      return ''
    } else {
      return format_number(
        parseFloat(0),
        qty_show_precision,
        2
        // isDrug ? systemConfig.drug_qty_show_retention_strategy : systemConfig.qty_show_retention_strategy
      )
    }
  },
  qtyFixedFormatter: (num, column, cellValue, index) => {
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num && !isNaN(num)) {
      return format_number(parseFloat(num), 2, 2)
    }
    if (newNum && !!newNum.isColspan) {
      return ''
    } else {
      return format_number(parseFloat(0), 2, 2)
    }
  },
  priceFormatter: (num, column, cellValue, index) => {
    let isDrug = router.currentRoute.value.path.includes('/drug/')
    let systemConfig = store.state.permission.systemConfig
    let price_precision = isDrug
      ? systemConfig.drug_price_precision
      : systemConfig.price_precision
    if (num.hasOwnProperty('generalProductCategory')) {
      price_precision =
        num.generalProductCategory === '0'
          ? systemConfig.price_precision
          : num.generalProductCategory === '4'
          ? systemConfig.drug_price_precision
          : price_precision
    }
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num && !isNaN(num)) {
      return format_number(parseFloat(num), price_precision, 2)
    }
    if (newNum && !!newNum.isColspan) {
      return ''
    } else {
      return format_number(parseFloat(0), price_precision, 2)
    }
  },
  // 数字转三位分节符（一般用于金额）
  TripartiteMethod: (num, column, cellValue, index) => {
    if (
      num == null ||
      num &&
      num.emptyRowType &&
      (num.emptyRowType === '1' || num.emptyRowType === '2')
    ) {
      return ''
    }
    let systemConfig = store.state.permission.systemConfig
    let amount_precision = 2
    let value = 0
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num) {
      num = format_number(
        parseFloat(num),
          amount_precision,
        2,
        systemConfig.amount_supplement_0
      ).toString()
      let type = true
      let t1 = '',
        t2 = '',
        arr = []
      //去除逗号字符
      num = num.replace(/,/g, '')

      //判断是否有小数点
      if (num.indexOf('.') < 0) {
        t1 = num.split('')
      } else {
        type = false
        arr = num.split('.')
        t1 = arr[0].toString().split('')
        t2 = arr[1].toString()
      }

      //添加逗号字符

      let result = [],
        counter = 0
      for (let i = t1.length - 1; i >= 0; i--) {
        counter++
        result.unshift(t1[i])
        if (counter % 3 == 0 && i != 0 && t1[i - 1] !== '-') {
          result.unshift(',')
        }
      }

      // let result2 = [], counter2 = 0;
      // for (let i = 0; i < t2.length; i ++) {
      //     counter2 ++;
      //     result2.push(t2[i]);
      //     if ((counter2 % 3) == 0 && i < t2.length-1) {
      //         result2.push(',');
      //     }
      // }

      //判断显示类型是否有小数
      if (type === true) {
        value = result.join('')
      } else {
        value = result.join('') + '.' + t2
      }
    } else {
      if (newNum && !!newNum.isColspan) {
        value = ''
      } else {
        value = format_number(
          parseFloat(value),
          amount_precision,
          2,
          systemConfig.amount_supplement_0
        )
      }
    }
    return value
  },
  // 资产金额数字转三位分节符
  TripartiteMethodAsset: (num, column, cellValue, index) => {
    //assets_price_retention_strategy,assets_price_precision
    let systemConfig = store.state.permission.systemConfig
    let value = 0
    let newNum = num
    num = typeof num === 'number' ? num : cellValue
    if (num) {
      num = format_number(
        parseFloat(num),
        systemConfig.assets_price_precision,
        systemConfig.assets_price_retention_strategy
      ).toString()
      let type = true
      let t1 = '',
        t2 = '',
        arr = []
      //去除逗号字符
      num = num.replace(/,/g, '')

      //判断是否有小数点
      if (num.indexOf('.') < 0) {
        t1 = num.split('')
      } else {
        type = false
        arr = num.split('.')
        t1 = arr[0].toString().split('')
        t2 = arr[1].toString()
      }

      //添加逗号字符

      let result = [],
        counter = 0
      for (let i = t1.length - 1; i >= 0; i--) {
        counter++
        result.unshift(t1[i])
        if (counter % 3 == 0 && i != 0 && t1[i - 1] !== '-') {
          result.unshift(',')
        }
      }

      // let result2 = [], counter2 = 0;
      // for (let i = 0; i < t2.length; i ++) {
      //     counter2 ++;
      //     result2.push(t2[i]);
      //     if ((counter2 % 3) == 0 && i < t2.length-1) {
      //         result2.push(',');
      //     }
      // }

      //判断显示类型是否有小数
      if (type === true) {
        value = result.join('')
      } else {
        value = result.join('') + '.' + t2
      }
    } else {
      if (newNum && !!newNum.isColspan) {
        value = ''
      } else {
        value = format_number(
          parseFloat(value),
          systemConfig.assets_price_precision,
          systemConfig.assets_price_retention_strategy
        )
      }
    }
    return value
  },
  getAssetRate(num) {
    let systemConfig = store.state.permission.systemConfig
    if (num) {
      return format_number(
        parseFloat(num),
        systemConfig.assets_price_precision + 2,
        systemConfig.assets_price_retention_strategy
      )
    }
    return num
  },

  getAssetAmount(num) {
    let systemConfig = store.state.permission.systemConfig
    if (num) {
      return format_number(
        parseFloat(num),
        systemConfig.assets_price_precision,
        systemConfig.assets_price_retention_strategy
      )
    }
    return num
  },

  // 三位分节符转换为数字
  TripartiteReturnNumber: (num) => {
    if (typeof num === 'string') {
      if (num.indexOf(',') !== -1) {
        num = num.replace(/,/g, '')
      }
    }
    return parseFloat(num)
  },
  /**
   * 对请求失败的HTTP状态码做处理
   * @param {Number} code     HTTP状态码
   * @param {String} message  错误提示
   * @return message 返回处理过的提示信息
   */
  requestError: (code, message) => {
    const statusCode = (code + '').replace(/[^0-9]+/g, '') - 0

    switch (statusCode) {
      case 400:
        return 'Bad Request (错误的请求)'
      case 401:
        return 'Unauthorized (请求要求身份验证)'
      case 403:
        return 'Forbidden (服务器拒绝请求)'
      case 404:
        return 'NOT Found (服务器找不到请求的资源)'
      case 405:
        return 'Bad Request (禁用请求中指定的方法)'
      case 406:
        return 'Not Acceptable (无法使用请求的内容特性响应请求的网页)'
      case 407:
        return 'Proxy Authentication Required (需要代理授权)'
      case 408:
        return 'Request Timed-Out (服务器等候请求时发生超时)'
      case 409:
        return 'Conflict (服务器在完成请求时发生冲突。服务器必须在响应中包含有关冲突的信息)'
      case 410:
        return 'Gone (请求的资源已被永久删除)'
      case 411:
        return 'Length Required (服务器不接受不含有效内容长度标头字段的请求)'
      case 412:
        return 'Precondition Failed (未满足前提条件)'
      case 413:
        return 'Request Entity Too Large (请求实体过大)'
      case 414:
        return 'Request, URI Too Large (请求的 URI 过长)'
      case 415:
        return 'Unsupported Media Type (不支持的媒体类型)'
      case 429:
        return '您的操作过于频繁,请稍后重试'
      case 500:
        return 'Internal Server Error (服务器内部错误)'
      case 501:
        return 'Not Implemented (尚未实施)'
      case 502:
        return 'Bad Gateway (错误网关)'
      case 503:
        return 'Server Unavailable (服务不可用)'
      case 504:
        return 'Gateway Timed-Out (网关超时)'
      case 505:
        return 'HTTP Version not supported (HTTP 版本不受支持)'
      default:
        return message
    }
  },
  /**
   * 传入时间戳，转换指定的时间格式
   * @param {Number} val      时间戳
   * @param {String} dateType 要得到的时间格式 例如 YYYY-MM-DD hh:mm:ss
   * @return dataStr 例如 YYYY-MM-DD hh:mm:ss
   */
  switchTime: (val = +new Date(), dateType = 'YYYY-MM-DD hh:mm:ss') => {
    // 将字符串转换成数字
    const timeStamp = +new Date(val)

    // 如果转换成数字出错
    if (!timeStamp) {
      return val
    }
    let str
    // 得到时间字符串
    const dateStr = new Date(timeStamp)
    str = dateType.replace('YYYY', dateStr.getFullYear())
    str = str.replace(
      'MM',
      (dateStr.getMonth() + 1 < 10 ? '0' : '') + (dateStr.getMonth() + 1)
    )
    str = str.replace(
      'DD',
      (dateStr.getDate() < 10 ? '0' : '') + dateStr.getDate()
    )
    str = str.replace(
      'hh',
      (dateStr.getHours() < 10 ? '0' : '') + dateStr.getHours()
    )
    str = str.replace(
      'mm',
      (dateStr.getMinutes() < 10 ? '0' : '') + dateStr.getMinutes()
    )
    str = str.replace(
      'ss',
      (dateStr.getSeconds() < 10 ? '0' : '') + dateStr.getSeconds()
    )

    return str
  },
  /**
   * 时间显示
   */
  timeView: function (val) {
    const now = +new Date() // 当时时间
    const timeStamp = +new Date(val) // 需要处理的时间
    const result = now - timeStamp // 相差的时间戳
    const min = 60 * 1000 // 分钟的毫秒数
    const hour = 60 * 60 * 1000 // 小时的毫秒数
    const day = 60 * 60 * 1000 * 24 // 日的毫秒数
    if (result / min < 1) {
      return '刚刚发布'
    } else if (result / min < 60) {
      return ~~(result / min) + '分钟前'
    } else if (result / hour > 1 && result / hour < 24) {
      return ~~(result / hour) + '小时前'
    } else if (result / day > 1 && result / day < 7) {
      return ~~(result / day) + '天前'
    } else if (
      this.switchTime(now, 'YYYY') === this.switchTime(timeStamp, 'YYYY')
    ) {
      return this.switchTime(timeStamp, 'MM月DD日')
    } else {
      return this.switchTime(timeStamp, 'YYYY年MM月DD日')
    }
  },
  /**
   * a模拟window.open，不会被浏览器拦截
   * @param {String} url        a标签打开的地址
   * @param {String} id         a标签的ID
   * @param {String} targetType a标签点击打开的方式（当前页面打开还是新窗口打开）
   */
  openWindow: (url, targetType = '_blank', id = 'open', download = false) => {
    // 如果存在则删除
    if (document.getElementById(id)) {
      document.body.removeChild(document.getElementById(id))
    }
    const a = document.createElement('a')
    a.setAttribute('href', url)
    if (download) {
      a.setAttribute('download', url)
    }
    a.setAttribute('target', targetType)
    a.setAttribute('id', id)
    document.body.appendChild(a)
    a.click()
  },
  /**
   * 复制
   * @param {String} value 要复制的值
   */
  copyData(value) {
    const inputDom = document.createElement('input')
    inputDom.value = value
    document.body.appendChild(inputDom)
    inputDom.select() // 选择对象
    document.execCommand('Copy') // 执行浏览器复制命令
    document.body.removeChild(inputDom) // 删除DOM
    ElMessage({
      type: 'success',
      duration: 3500,
      message: '复制成功',
      showClose: true,
    })
  },
  /**
   * 将树结构转换为一级列表
   * @param {Array} treeData
   *@return {Array} arr
   */
  treeToList(treeData, arr = []) {
    for (let i = 0; i < treeData.length; i++) {
      const item = treeData[i]
      arr.push(item)
      if (item.children && item.children.length !== 0) {
        this.treeToList(item.children, arr)
      }
    }
    return arr
  },
  /**
   * 将一级的数据结构处理成树状数据结构
   * @param {Object} obj {key, pKey, data}
   *  @param obj.key  字段名称 比如id
   *  @param obj.pKey 父字段名称 比如 pid
   *  @param obj.rootPValue 根节点的父字段的值
   *  @param obj.data 需要处理的数据
   *  @param obj.jsonData 是否深复制数据（默认是true）
   * @return {Array} arr
   */
  getTreeArr: (obj) => {
    if (!Array.isArray(obj.data)) {
      return []
    }
    obj.jsonData = obj.jsonData === false ? obj.jsonData : true
    const arr = obj.jsonData ? JSON.parse(JSON.stringify(obj.data)) : obj.data
    const arr1 = []
    // 将数据处理成数状结构
    arr.forEach((item) => {
      let index = 0
      item.children = []
      arr.forEach((item1) => {
        // 得到树结构关系
        if (item[obj.key] === item1[obj.pKey]) {
          item.children.push(item1)
        }
        // 判断根节点
        if (item1[obj.key] !== item[obj.pKey]) {
          index++
        }
      })
      // 没传入根节点，根据当前数据结构得到根节点
      if (!('rootPValue' in obj) && index === arr.length) {
        arr1.push(item)
      }
    })
    // 传入根节点，根据传入的根节点组成树结构
    if ('rootPValue' in obj) {
      arr.forEach((item) => {
        if (item[obj.pKey] === obj.rootPValue) {
          arr1.push(item)
        }
      })
    }
    return arr1
  },
  /**
   * 数组去重
   * @param {Array} data 要去重的数组
   * @param {String} key 作为去重依据的字段 (处理对象数组时需要传入)
   * @return arr 返回处理后的数据
   */
  handleRepeatArr(data, key) {
    if (!Array.isArray(data)) {
      return
    }
    /** 1.递归去重，缺点，会将数据默认排序 */
    // // 先对数据做排序处理
    // data = data.sort((item, item1) => {
    //   if (key) {
    //     return item[key] - item1[key]
    //   }
    //   return item - item1
    // })
    // // 递归去重
    // function getData (index) {
    //   if (index >= 1) {
    //     // 判断当前数据和下一条数据是否相等
    //     let result = key ? data[index][key] === data[index - 1][key] : data[index] === data[index - 1]
    //     if (result) {
    //       data.splice(index, 1)
    //     }
    //     getData(index - 1)
    //   }
    // }
    // getData(data.length - 1)
    // return data

    /** 2.根据对象的属性不同去重 */
    const arr = []
    const obj = {}
    data.forEach((item, index) => {
      const attr = key ? item[key] : item
      if (!obj[attr]) {
        obj[attr] = index + 1
        arr.push(item)
      }
    })
    return arr

    /** 3.利用indexOf以及forEach (适合处理数组，不适合处理对象数组) */
    // let arr = []
    // data.forEach((item, index) => {
    //   // 如果当前元素在之后没有出现过(后面出现的数据会保留)
    //   // let result = data.indexOf(item, index + 1)
    //   // 如果当前元素在之前没有出现过(前面出现的数据会保留)
    //   let result = index === 0 ? -1 : data.lastIndexOf(item, index - 1)
    //   if (result === -1) {
    //     arr.push(item)
    //   }
    // })
    // return arr

    /** 4.new Set (适合处理数组，不适合处理对象数组) */
    // return [...new Set(data)]

    /** 5. 双层循环去重 （占用内存高） */
    // for (let i = 0, len = data.length; i < len; i++) {
    //   for (let j = i + 1; j < len; j++) {
    //     let result = key ? data[i][key] === data[j][key] : data[i] === data[j]
    //     if (result) {
    //       data.splice(j, 1)
    //       len--
    //       j--
    //     }
    //   }
    // }
    // return data
  },
  /**
   * 搜索框字符串，将问号后面字符得到并转换为对象
   * @return {Object}
   */
  getLocationSearch() {
    const str = window.location.search
    const arr = str.substr(1).split('&')
    const obj = {}
    for (const item of arr) {
      const data = item.split('=')
      obj[data[0]] = data[1]
    }
    return obj
  },
  bytesToSize(bytes) {
    if (bytes === 0) return '0 B'
    var k = 1024 // or 1024
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    var i = ~~(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
  },

  getMergeData(data, mergeFiled) {
    const rowUnionData = {}
    const mergeData = {}
    data.forEach((item, index) => {
      let str = item.productId
      if (mergeFiled && mergeFiled.length) {
        mergeFiled.forEach((el) => {
          str = str + '' + item[el]
        })
      }
      if (item.emptyRowType !== '1') {
        if (rowUnionData[str]) {
          rowUnionData[str].indexs.push(index)
        } else {
          rowUnionData[str] = {
            indexs: [index],
          }
        }
      }
    })
    //将reagentId出现多次的行，组装成合并行的参数
    for (let productId in rowUnionData) {
      if (rowUnionData[productId].indexs.length <= 1) {
        // 不需要合并
        continue
      }
      // 组装合并数据
      const mergeConfig = {
        startIndex: rowUnionData[productId].indexs[0],
        rowspan: rowUnionData[productId].indexs.length,
        colspan: 1,
      }
      mergeData[productId] = mergeConfig
    }
    return mergeData
  },

  parseExcel(resp, fileName) {
    //调用成功，在html中创建一个a元素
    let aTag = document.createElement('a')
    //创建一个blob对象
    let blob = new Blob([resp.data], {
      //Excel文件版本
      type: 'multipart/form-data;charset=utf-8', //application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
    })
    // 这个content是下载的文件内容，自己修改
    let temp = resp.headers
      ? resp.headers['content-disposition'].split(';')[1].split('filename=')[1]
      : ''
    // console.log(decodeURIComponent(temp))
    //对文件名乱码转义--【Node.js】使用iconv-lite解决中文乱码
    // let iconv = import('iconv-lite')
    // iconv.skipDecodeWarning = true //忽略警告
    // let _fileName = iconv.decode(temp, 'utf-8')
    let _fileName = temp ? decodeURIComponent(temp) : '未命名文件'
    aTag.download = fileName ? fileName : _fileName
    aTag.href = window.URL.createObjectURL(blob) //创建一个URL对象
    document.body.appendChild(aTag)
    aTag.click()
    document.body.removeChild(aTag)
    window.URL.revokeObjectURL(blob) //释放URL对象
  },

  isEmptyString(value) {
    if (
      value == null ||
      typeof value === 'undefined' ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return true
    } else {
      return false
    }
  },

  isNotEmptyString(value) {
    if (
      value == null ||
      typeof value === 'undefined' ||
      value.trim() === '' ||
      value.length > 200
    ) {
      return false
    } else {
      return true
    }
  },
  maxString200(value) {
    if (value && value.length > 200) {
      return false
    } else {
      return true
    }
  },

  isGreaterThan200(value) {
    if (value.length > 200) {
      return false
    } else {
      return true
    }
  },

  //封装验证函数
  checkForm(formRefs) {
    const resultArr = formRefs.map(async (formRef) => {
      if (formRef) {
        let result = await new Promise(function (resolve, reject) {
          formRef.validate((valid, obj) => {
            console.log(valid)
            console.log(obj)
            console.log('表单是否生成-1项')
            if (valid) {
              resolve()
            } else {
              reject()
            }
          })
        })
        return result
      }
    })
    if (resultArr.length === formRefs.length) {
      return Promise.all(resultArr)
    }
  },

  // 时间选择器快捷查询键
  pickerOptionsFn() {
    return [
      {
        text: '最近一周',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
        },
        /* onClick(picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          picker.$emit('pick', [start, end])
        }, */
      },
      {
        text: '最近一个月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
        },
        /* onClick(picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          picker.$emit('pick', [start, end])
        }, */
      },
      {
        text: '最近三个月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          return [start, end]
        },
        /* onClick(picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
          picker.$emit('pick', [start, end])
        }, */
      },
      {
        text: '最近半年',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
          return [start, end]
        },
        /* onClick(picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
          picker.$emit('pick', [start, end])
        }, */
      },
      {
        text: '最近一年',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
          return [start, end]
        },
        /* onClick(picker) {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
          picker.$emit('pick', [start, end])
        }, */
      },
    ]
  },
  // 日期选择器快捷查询键
  pickerDateOptionsFn() {
    return {
      shortcuts: [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            return [start, end]
          },
          /* onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }, */
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            return [start, end]
          },
          /* onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }, */
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            return [start, end]
          },
          /* onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }, */
        },
        // {
        //   text: '最近半年',
        //   value: () => {
        //     const end = new Date()
        //     const start = new Date()
        //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
        //     return [start, end]
        //   },
        //   /* onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
        //     picker.$emit('pick', [start, end])
        //   }, */
        // },
        // {
        //   text: '最近一周',
        //   onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     if (
        //       start.getTime() - 3600 * 1000 * 24 * 30 <
        //       new Date(2020, 7, 1)
        //     ) {
        //       start.setTime(new Date(2020, 7, 1))
        //     } else {
        //       start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        //     }
        //     end.setTime(end - 3600 * 1000 * 24)
        //     picker.$emit('pick', [start, end])
        //   },
        // },
        // {
        //   text: '最近一个月',
        //   onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     if (
        //       start.getTime() - 3600 * 1000 * 24 * 30 <
        //       new Date(2020, 7, 1)
        //     ) {
        //       start.setTime(new Date(2020, 7, 1))
        //     } else {
        //       start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        //     }
        //     end.setTime(end - 3600 * 1000 * 24)
        //     picker.$emit('pick', [start, end])
        //   },
        // },
        // {
        //   text: '最近三个月',
        //   onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     if (
        //       start.getTime() - 3600 * 1000 * 24 * 90 <
        //       new Date(2020, 7, 1)
        //     ) {
        //       start.setTime(new Date(2020, 7, 1))
        //     } else {
        //       start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        //     }
        //     end.setTime(end - 3600 * 1000 * 24)
        //     picker.$emit('pick', [start, end])
        //   },
        // },
      ],
      disabledDate(time) {
        // if(time.getTime() < new Date(2020, 7, 1)) {
        //   return time.getTime() < new Date(2020, 7, 1)
        // }else {
        return time.getTime() > new Date() - 3600 * 1000 * 24
        // }
      },
    }
  },
  //日期选择器快捷查询键,不包含当前一天
  pickerDateOptionsNoCurDateFn() {
    return {
      shortcuts: [
        {
          text: '最近一周',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 8)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
          /* onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }, */
        },
        {
          text: '最近一个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 31)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
          /* onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }, */
        },
        {
          text: '最近三个月',
          value: () => {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 91)
            end.setTime(end.getTime() - 3600 * 1000 * 24)
            return [start, end]
          },
          /* onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }, */
        },
        // {
        //   text: '最近半年',
        //   value: () => {
        //     const end = new Date()
        //     const start = new Date()
        //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
        //     return [start, end]
        //   },
        //   /* onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 183)
        //     picker.$emit('pick', [start, end])
        //   }, */
        // },
        // {
        //   text: '最近一周',
        //   onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     if (
        //       start.getTime() - 3600 * 1000 * 24 * 30 <
        //       new Date(2020, 7, 1)
        //     ) {
        //       start.setTime(new Date(2020, 7, 1))
        //     } else {
        //       start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        //     }
        //     end.setTime(end - 3600 * 1000 * 24)
        //     picker.$emit('pick', [start, end])
        //   },
        // },
        // {
        //   text: '最近一个月',
        //   onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     if (
        //       start.getTime() - 3600 * 1000 * 24 * 30 <
        //       new Date(2020, 7, 1)
        //     ) {
        //       start.setTime(new Date(2020, 7, 1))
        //     } else {
        //       start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        //     }
        //     end.setTime(end - 3600 * 1000 * 24)
        //     picker.$emit('pick', [start, end])
        //   },
        // },
        // {
        //   text: '最近三个月',
        //   onClick(picker) {
        //     const end = new Date()
        //     const start = new Date()
        //     if (
        //       start.getTime() - 3600 * 1000 * 24 * 90 <
        //       new Date(2020, 7, 1)
        //     ) {
        //       start.setTime(new Date(2020, 7, 1))
        //     } else {
        //       start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        //     }
        //     end.setTime(end - 3600 * 1000 * 24)
        //     picker.$emit('pick', [start, end])
        //   },
        // },
      ],
      disabledDate(time) {
        // if(time.getTime() < new Date(2020, 7, 1)) {
        //   return time.getTime() < new Date(2020, 7, 1)
        // }else {
        return time.getTime() > new Date() - 3600 * 1000 * 24
        // }
      },
    }
  },

  //数组分组,arr需要分组的数组,str按那个字段分组,type分组字段类型
  setGrouping(arr, str, type) {
    let mp = {}
    let ret = []
    arr.forEach((item) => {
      if (typeof mp[item[str]] === type) {
        ret[mp[item[str]]].push(item)
      } else {
        mp[item[str]] = ret.length
        ret.push([item])
      }
    })
    return ret
  },
  setTrim(str) {
    //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, '')
  },
  setTrimObj(obj, key) {
    //删除左右两端的空格
    if (key === 'queryMap' && Object.keys(obj).length) {
      for (let item in obj) {
        let val = obj[item].value
        if (Object.prototype.toString.call(val) == '[object String]') {
          obj[item].value = val.replace(/(^\s*)|(\s*$)/g, '')
        }
      }
    }
    return obj
  },
  isString(str) {
    //判断字符串类型
    return Object.prototype.toString.call(str) == '[object String]'
  },
  deepClone(x) {
    // 深拷贝
    let root = _.cloneDeep(x)
    return root
  },
  throttle(fn, data, delay) {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      clearTimeout(timer)
    }
    lastCall = now
    timer = setTimeout(() => {
      lastCall = now
      fn(data)
    }, delay)
  },
  delEmptyAttribute(query, arr = []) {
    //删除空属性 arr不需要清空的对象
    for (const key in query) {
      if (!query[key]) {
        if (arr.length) {
          if (!arr.includes(key)) {
            delete query[key]
          }
        } else {
          delete query[key]
        }
      }
    }
    return query
  },
  dateDiff(sDate1, sDate2) {
    let aDate, oDate1, oDate2, iDays
    oDate1 = new Date(sDate1)
    oDate2 = sDate2 ? new Date(sDate2) : new Date()
    aDate = Date.parse(oDate2) - Date.parse(oDate1)
    iDays = parseFloat((aDate / (1000 * 60 * 60 * 24)).toFixed(2))
    return iDays
  },
  dateDiffLicen(sDate1, sDate2) {
    //两个日期相差的天数，日期格式2020-01-01
    let aDate, oDate1, oDate2, iDays
    aDate = sDate1.split('-')
    oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]) //转换为12-18-2002格式
    if (!sDate2) {
      oDate2 = new Date()
    } else {
      aDate = sDate2.split('-')
      oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0])
    }
    iDays = parseInt(
      (Date.parse(oDate1) - Date.parse(oDate2)) / 1000 / 60 / 60 / 24
    )
    return iDays
  },
  //解决精度+
  accAdd(a, b) {
    return accAddFn(a, b)
  },
  //解决精度-
  Subtr(arg1, arg2) {
    return SubtrFn(arg1, arg2)
  },
  //解决精度 *
  accMul(arg1, arg2) {
    return accMulFn(arg1, arg2)
  },
  //解决精度 /
  accDiv(arg1, arg2) {
    return accDivFn(arg1, arg2)
  },
  getSort(arr, str, level = 'asc') {
    //表格列排序
    return sortList(arr, str, level)
  },
  //设置表格列 str排序字段，level升将序控制
  /*
   *componentType: input input输入框
   *componentType: number 数字输入框
   * componentType: price 价格
   * componentType: date 日期输入框
   * componentType: dateTime 日期时间输入框
   * componentType: select-model 字典输入框
   * componentType: select-user 选择人弹框
   * componentType: select-product 选择产品弹框
   * componentType: datetimerange 日期区间选择
   * componentType: slip-select api查询下拉选择
   * code: 字典
   * asValue: value映射
   * 普通查询用插槽: slot:true
   */
  setSearchList(
    searchList,
    obj,
    isDateSplit = true,
    str = 'searchLevel',
    level = 'asc'
  ) {
    let queryMap = {}
    let keysArr = Object.keys(obj)
    let arr = []
    let list = searchList.filter((item) => {
      let newValue = item.asValue ? item.asValue : item.value
      if (keysArr.length && keysArr.includes(item.value)) {
        item.show = obj[item.value].searchLevel > 0 && !item.permission
        item.searchLevel = obj[item.value].searchLevel
        item.label = obj[item.value].label
        let searchDefaultValue = obj[item.value].searchDefaultValue
        if (
          isJSON(obj[item.value].searchDefaultValue) &&
          searchDefaultValue.indexOf('{') > -1
        ) {
          searchDefaultValue = JSON.parse(obj[item.value].searchDefaultValue)
        }
        item.searchDefaultValue = searchDefaultValue
        if (
          obj[item.value].queryType === 'IN' ||
          obj[item.value].queryType === 'NOT_IN' ||
          obj[item.value].queryType === 'BETWEEN'
        ) {
          if (
            item.componentType === 'select-model' ||
            item.componentType === 'slip-select'
          ) {
            item.multiple = true
          } else if (
            item.componentType === 'select-user' ||
            item.componentType === 'select-product' ||
            item.componentType === 'select-use-status' ||
            item.componentType === 'select-device-type' ||
            item.componentType === 'select-asset-classify-type' ||
            item.componentType === 'select-fiscal-period' ||
            item.componentType === 'select-patrol-route' ||
            item.componentType === 'select-maintenance' ||
            item.componentType === 'select-repair-user' ||
            item.componentType === 'select-maintenance-user' ||
            item.componentType === 'select-shelf-no' ||
            item.componentType === 'select-product-class' ||
            item.componentType === 'select-tree-data'
          ) {
            item.checkBox = true
            item.highlightRow = false
          }
        } else {
          if (
            item.componentType === 'select-user' ||
            item.componentType === 'select-product' ||
            item.componentType === 'select-use-status' ||
            item.componentType === 'select-device-type' ||
            item.componentType === 'select-asset-classify-type' ||
            item.componentType === 'select-fiscal-period' ||
            item.componentType === 'select-patrol-route' ||
            item.componentType === 'select-maintenance' ||
            item.componentType === 'select-repair-user' ||
            item.componentType === 'select-maintenance-user' ||
            item.componentType === 'select-shelf-no' ||
            item.componentType === 'select-product-class' ||
            item.componentType === 'select-tree-data'
          ) {
            item.checkBox = false
            item.highlightRow = true
          }
        }
        if (!isDateSplit) {
          if (keysArr.length && keysArr.includes(item.value)) {
            if (
              obj[item.value].fieldType === 'LocalDateTime' &&
              obj[item.value].queryType === 'BETWEEN'
            ) {
              item.componentType = 'datetimerange'
              item.fieldType === 'LocalDateTime'
              item.isPreferenceShow = true
              item.isPreferenceControl = true
              item.isDateSplit = isDateSplit
            } else if (
              obj[item.value].fieldType === 'LocalDate' &&
              obj[item.value].queryType === 'BETWEEN'
            ) {
              item.componentType = 'daterange'
              item.fieldType === 'LocalDate'
              item.queryType === 'BETWEEN'
              item.isPreferenceShow = true
              item.isPreferenceControl = true
              item.isDateSplit = isDateSplit
            }
          }
        }
        let type = Object.prototype.toString.call(searchDefaultValue)
        let tempValue =
          type === '[object Object]'
            ? searchDefaultValue.key && searchDefaultValue.key.length
              ? searchDefaultValue.key.toString()
              : ''
            : searchDefaultValue || ''
        if (obj[item.value] && obj[item.value]['searchLevel'] < 1) {
          tempValue = ''
        }
        if (item.asValue && obj[item.asValue] && obj[item.asValue].queryType) {
          queryMap[newValue] = {
            queryType: obj[item.asValue].queryType,
            value: tempValue,
          }
        } else {
          queryMap[newValue] = {
            queryType: obj[item.value].queryType,
            value: tempValue,
          }
        }
        if (isDateSplit) {
          if (
            obj[item.value].fieldType === 'LocalDateTime' &&
            obj[item.value].queryType === 'BETWEEN'
          ) {
            let dateArr = splitArrFn(item.searchDefaultValue)
            if (dateArr && dateArr.length) {
              item.searchDefaultValueGreater = dateArr[0] || ''
              item.searchDefaultValueLesser = dateArr[1] || ''
            } else {
              item.searchDefaultValueGreater = ''
              item.searchDefaultValueLesser = ''
            }
            item.isDateSplit = isDateSplit
            item.show = false
            item.isPreferenceShow = true
            item.isPreferenceControl = true
            let first = item.value + 'Greater'
            let last = item.value + 'Lesser'
            queryMap[first] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[0] || '' : '',
            }
            queryMap[last] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[1] || '' : '',
            }
            if (obj[item.value] && obj[item.value]['searchLevel'] < 1) {
              queryMap[first] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
              queryMap[last] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
            }
            queryMap[item.value] = {
              queryType: obj[item.value].queryType,
              value: '',
            }
            let options = {
              [first]: {
                label: '开始' + obj[item.value].label,
                value: first,
                componentType: 'dateTime',
                hidden: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
                defaultTime: new Date(2000, 1, 1, 0, 0, 0),
                isPreferenceShow: false,
                isPreferenceControl: true,
              },
              [last]: {
                label: '结束' + obj[item.value].label,
                value: last,
                componentType: 'dateTime',
                hidden: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
                defaultTime: new Date(2000, 1, 1, 23, 59, 59),
                isPreferenceShow: false,
                isPreferenceControl: true,
              },
            }
            arr.push(options[first], options[last])
          } else if (
            obj[item.value].fieldType === 'LocalDate' &&
            obj[item.value].queryType === 'BETWEEN'
          ) {
            let dateArr = splitArrFn(item.searchDefaultValue)
            if (dateArr && dateArr.length) {
              item.searchDefaultValueGreater = dateArr[0] || ''
              item.searchDefaultValueLesser = dateArr[1] || ''
            } else {
              item.searchDefaultValueGreater = ''
              item.searchDefaultValueLesser = ''
            }
            item.isDateSplit = isDateSplit
            item.show = false
            item.isPreferenceShow = true
            item.isPreferenceControl = true
            let first = item.value + 'Greater'
            let last = item.value + 'Lesser'
            queryMap[first] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[0] || '' : '',
            }
            queryMap[last] = {
              queryType: obj[item.value].queryType,
              value: dateArr && dateArr.length ? dateArr[1] || '' : '',
            }
            if (obj[item.value] && obj[item.value]['searchLevel'] < 1) {
              queryMap[first] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
              queryMap[last] = {
                queryType: obj[item.value].queryType,
                value: '',
              }
            }
            queryMap[item.value] = {
              queryType: obj[item.value].queryType,
              value: '',
            }
            let options = {
              [first]: {
                label: obj[item.value].label + '开始',
                value: first,
                componentType: 'date',
                hidden: true,
                isPreferenceShow: false,
                isPreferenceControl: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
              },
              [last]: {
                label: obj[item.value].label + '结束',
                value: last,
                componentType: 'date',
                hidden: true,
                isPreferenceShow: false,
                isPreferenceControl: true,
                show: obj[item.value].searchLevel > 0 && !item.permission,
                searchLevel: obj[item.value].searchLevel,
              },
            }
            arr.push(options[first], options[last])
          }
        }

        return item
      }
    })

    let allList = list
    if (arr && arr.length && isDateSplit) {
      allList = list.concat(arr)
    }
    return {
      searchList: sortList(allList, str, level),
      queryMap: queryMap,
    }
  },
  //设置表格列 str排序字段，level升将序控制, isGroup是否返回分组option
  setFieldList(
    fieldList,
    obj,
    isGroup = false,
    str = 'showLevel',
    level = 'asc'
  ) {
    let groupSelectInfoOptions = []
    let keysArr = Object.keys(obj)
    let list = []
    if (fieldList && fieldList.filter.length) {
      list = fieldList.filter((item) => {
        let newValue = item.asValue ? item.asValue : item.value
        if (keysArr.length && keysArr.includes(item.value)) {
          item.hidden = !(
            obj[item.value].isBack === '0' &&
            obj[item.value].showLevel > 0 &&
            !item.permission
          )
          item.label = obj[item.value].label
          item.showLevel = obj[item.value].showLevel
          item.sortable = obj[item.value].sortControllerType > 0
          item.sortControllerType = obj[item.value].sortControllerType
          item.sortLevel = obj[item.value].sortLevel
          item.groupLevel = obj[item.value].groupLevel
          item.minWidth = obj[item.value].formWidth
          if (item.width) {
            item.width = ''
          }
          if (
            obj[item.value].fieldType === 'LocalDateTime' ||
            obj[item.value].fieldType === 'LocalDate' ||
            obj[item.value].fieldType === 'LocalTime'
          ) {
            item.fieldType = obj[item.value].fieldType
          }
          if (
            isGroup &&
            obj[item.value].isBack === '0' &&
            obj[item.value].showLevel > 0 &&
            obj[item.value].groupLevel > 0
          ) {
            groupSelectInfoOptions.push({
              label: obj[item.value].label,
              value: item.value + '-' + newValue,
              groupLevel: item.groupLevel,
            })
          }
          return item
        }
      })
    }
    if (isGroup) {
      return {
        fieldList: sortList(list, str, level),
        groupOption: sortList(groupSelectInfoOptions, 'groupLevel'),
      }
    } else {
      return sortList(list, str, level)
    }
  },
  //sort后端排序逻辑
  sortChange(column, sortArr, separate = '-') {
    if (column.order === 'descending') {
      let columnProp = column.prop
      let str = `${columnProp}${separate}desc`
      if (sortArr.length) {
        let index = sortArr.findIndex((item) => item.includes(columnProp))
        if (index !== -1) {
          if (!sortArr[index].includes('desc')) {
            sortArr[index] = str
          }
        } else {
          sortArr.push(str)
        }
      } else {
        sortArr.push(str)
      }
    } else if (column.order === 'ascending') {
      let columnProp = column.prop
      let str = `${columnProp}${separate}asc`
      if (sortArr.length) {
        let index = sortArr.findIndex((item) => item.includes(columnProp))
        if (index !== -1) {
          if (!sortArr[index].includes('asc')) {
            sortArr[index] = str
          }
        } else {
          sortArr.push(str)
        }
      } else {
        sortArr.push(str)
      }
    } else {
      let columnProp = column.prop
      if (sortArr.length) {
        let index = sortArr.findIndex((item) => item.includes(columnProp))
        if (index !== -1) {
          sortArr.splice(index, 1)
        }
      }
    }
    return sortArr
  },
  splitArr(str, splitStr = ',') {
    return splitArrFn(str, splitStr)
    // //字符串转数组
    // if (!str) {
    //   return []
    // }
    // str = str.toString()
    // if (str.indexOf(splitStr) !== -1) {
    //   return str.split(splitStr)
    // } else {
    //   return [str]
    // }
  },
  getHumpToHyphen(str, splitStr = '_') {
    ////将驼峰转下划线小写
    return humpToHyphen(str, splitStr)
  },
  async getDepotStorage(
    rows,
    sysGroup,
    map,
    rightApi,
    orderId,
    rightVo,
    str = 'stockAvailableCalcQty',
    id = 'depotStockId',
    ids = 'groupConcatDepotStockIds'
  ) {
    //选择库存产品返回合并  20210629143516000241
    let newMap = new Map()
    let mapValues = [...map.values()]
    if (mapValues.length) {
      mapValues.forEach((row) => {
        row.isChoice = false
        if (row.details && row.details.length) {
          row.details.forEach((item) => {
            item.isChoice = false
          })
        }
      })
    }
    rows.forEach((item) => {
      let key = []
      if (sysGroup.length) {
        sysGroup.forEach((row) => {
          let obj = {}
          obj.columnName = row.columnName
          obj.asTbName = row.asTbName
          obj.value = item[row.key]
          key.push(obj)
        })
      }
      item.key = JSON.stringify(key)
      newMap.set(item.key, item)
    })
    let newMap1 = new Map()
    for (let [key, value] of newMap) {
      if (map.has(key)) {
        let mergeDetail = map.get(key)
        mergeDetail.isChoice = value.isChoice
        let unitConvertCoefficient = mergeDetail.unitConvertCoefficient || 1
        let detail = value.details[0]
        if (mergeDetail.details && mergeDetail.details.length) {
          let details = mergeDetail.details
          let largeUnitQty = 0
          let smallUnitQty = 0
          let calcQty = 0
          let sumAmount = 0
          let index = details.findIndex(
            (item) => setKey(item, id) === setKey(detail, id)
          )
          if (index === -1) {
            details.unshift(detail)
            details.forEach((item) => {
              calcQty = accAddFn(item.calcQty, calcQty)
              item.sumAmount = accDivFn(
                accMulFn(item.calcQty, item.price),
                unitConvertCoefficient
              )
              sumAmount = accAddFn(item.sumAmount, sumAmount)
            })
          } else {
            details.forEach((item) => {
              let key = setKey(item, id)
              if (key === setKey(detail, id)) {
                if (item.codeType === 4) {
                  let num = SubtrFn(item[str], item.calcQty)
                  if (num >= unitConvertCoefficient) {
                    item.calcQty = accAddFn(
                      unitConvertCoefficient,
                      item.calcQty
                    )
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.calcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.calcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.calcQty
                      item.smallUnitQty = 0
                    }
                  } else if (num > 0 && num < unitConvertCoefficient) {
                    item.calcQty = accAddFn(num, item.calcQty)
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.calcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.calcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.calcQty
                      item.smallUnitQty = 0
                    }
                  }
                  item.qty = accDivFn(item.calcQty, unitConvertCoefficient)
                  item.sumAmount = accDivFn(
                    accMulFn(item.calcQty, item.price),
                    unitConvertCoefficient
                  )
                } else if (item.codeType === 2 || item.codeType === 3) {
                  item = detail
                }
              }
              calcQty = accAddFn(item.calcQty || 0, calcQty)
              sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
              largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
              smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
            })
          }
          mergeDetail[ids] = mergeDetail.details
            .map((item) => item[id])
            .toString()
          mergeDetail.groupSize = mergeDetail.details.length
          mergeDetail.qty = accDivFn(calcQty, unitConvertCoefficient)
          mergeDetail.largeUnitQty = largeUnitQty
          mergeDetail.smallUnitQty = smallUnitQty
          mergeDetail.sumAmount = sumAmount
          mergeDetail.calcQty = calcQty
        } else {
          if (orderId) {
            let rightQuery = {
              id: {
                queryType: 'IN',
                queryCategory: 'AND',
                value: mergeDetail.groupConcatIds,
              },
              orderId: {
                queryType: 'EQUALS',
                queryCategory: 'AND',
                value: orderId,
              },
            }
            await getIndividualRight(rightApi, rightQuery, rightVo).then(
              (res) => {
                if (res.length) {
                  mergeDetail.details = res
                  let largeUnitQty = 0
                  let smallUnitQty = 0
                  let calcQty = 0
                  let sumAmount = 0
                  let index = res.findIndex(
                    (item) => setKey(item, id) === setKey(detail, id)
                  )
                  if (index === -1) {
                    mergeDetail.details.unshift(detail)
                    mergeDetail.details.forEach((item) => {
                      calcQty = accAddFn(item.calcQty, calcQty)
                      item.sumAmount = accDivFn(
                        accMulFn(item.calcQty, item.price),
                        unitConvertCoefficient
                      )
                      sumAmount = accAddFn(item.sumAmount, sumAmount)
                    })
                  } else {
                    mergeDetail.details.forEach((item) => {
                      let key = setKey(item, id)
                      if (key === setKey(detail, id)) {
                        if (item.codeType === 4) {
                          let num = SubtrFn(item[str], item.calcQty)
                          if (num >= unitConvertCoefficient) {
                            item.calcQty = accAddFn(
                              unitConvertCoefficient,
                              item.calcQty
                            )
                            if (item.qtyOperateMode === 2) {
                              item.largeUnitQty = parseInt(
                                item.calcQty / unitConvertCoefficient
                              )
                              item.smallUnitQty = parseInt(
                                item.calcQty % unitConvertCoefficient
                              )
                            } else if (
                              item.qtyOperateMode === 0 ||
                              item.qtyOperateMode === 1
                            ) {
                              item.largeUnitQty = item.calcQty
                              item.smallUnitQty = 0
                            }
                          } else if (num > 0 && num < unitConvertCoefficient) {
                            item.calcQty = accAddFn(num, item.calcQty)
                            if (item.qtyOperateMode === 2) {
                              item.largeUnitQty = parseInt(
                                item.calcQty / unitConvertCoefficient
                              )
                              item.smallUnitQty = parseInt(
                                item.calcQty % unitConvertCoefficient
                              )
                            } else if (
                              item.qtyOperateMode === 0 ||
                              item.qtyOperateMode === 1
                            ) {
                              item.largeUnitQty = item.calcQty
                              item.smallUnitQty = 0
                            }
                          }
                          item.qty = accDivFn(
                            item.calcQty,
                            unitConvertCoefficient
                          )
                          item.sumAmount = accDivFn(
                            accMulFn(item.calcQty, item.price),
                            unitConvertCoefficient
                          )
                        } else if (item.codeType === 2 || item.codeType === 3) {
                          item = detail
                        }
                      }
                      calcQty = accAddFn(item.calcQty || 0, calcQty)
                      sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
                      largeUnitQty = accAddFn(
                        item.largeUnitQty || 0,
                        largeUnitQty
                      )
                      smallUnitQty = accAddFn(
                        item.smallUnitQty || 0,
                        smallUnitQty
                      )
                    })
                  }
                  mergeDetail[ids] = mergeDetail.details
                    .map((item) => item[id])
                    .toString()
                  mergeDetail.groupSize = mergeDetail.details.length
                  mergeDetail.qty = accDivFn(calcQty, unitConvertCoefficient)
                  mergeDetail.largeUnitQty = largeUnitQty
                  mergeDetail.smallUnitQty = smallUnitQty
                  mergeDetail.sumAmount = sumAmount
                  mergeDetail.calcQty = calcQty
                }
              }
            )
          } else {
            mergeDetail.details = value.details
            let largeUnitQty = 0
            let smallUnitQty = 0
            let calcQty = 0
            let sumAmount = 0
            mergeDetail.details.forEach((item) => {
              let key = setKey(item, id)
              if (key === setKey(detail, id)) {
                if (item.codeType === 4) {
                  let num = SubtrFn(item[str], item.calcQty)
                  if (num >= unitConvertCoefficient) {
                    item.calcQty = accAddFn(
                      unitConvertCoefficient,
                      item.calcQty
                    )
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.calcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.calcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.calcQty
                      item.smallUnitQty = 0
                    }
                  } else if (num > 0 && num < unitConvertCoefficient) {
                    item.calcQty = accAddFn(num, item.calcQty)
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.calcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.calcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.calcQty
                      item.smallUnitQty = 0
                    }
                  }
                  item.qty = accDivFn(item.calcQty, unitConvertCoefficient)
                  item.sumAmount = accDivFn(
                    accMulFn(item.calcQty, item.price),
                    unitConvertCoefficient
                  )
                } else if (item.codeType === 2 || item.codeType === 3) {
                  item = detail
                }
              }
              calcQty = accAddFn(item.calcQty || 0, calcQty)
              sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
              largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
              smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
            })
            mergeDetail[ids] = mergeDetail.details
              .map((item) => item[id])
              .toString()
            mergeDetail.groupSize = mergeDetail.details.length
            mergeDetail.qty = accDivFn(calcQty, unitConvertCoefficient)
            mergeDetail.largeUnitQty = largeUnitQty
            mergeDetail.smallUnitQty = smallUnitQty
            mergeDetail.sumAmount = sumAmount
            mergeDetail.calcQty = calcQty
          }
        }
      } else {
        let unitConvertCoefficient = value.unitConvertCoefficient || 1
        let largeUnitQty = 0
        let smallUnitQty = 0
        let calcQty = 0
        let sumAmount = 0
        value.details.forEach((item) => {
          calcQty = accAddFn(item.calcQty || 0, calcQty)
          sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
          largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
          smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
        })
        value[ids] = value.details.map((item) => item[id]).toString()
        value.groupSize = value.details.length
        value.qty = accDivFn(calcQty, unitConvertCoefficient)
        value.sumAmount = sumAmount
        value.largeUnitQty = largeUnitQty
        value.smallUnitQty = smallUnitQty
        value.calcQty = calcQty
        newMap1.set(key, value)
      }
    }
    let newArrs = map.size > 0 ? [...newMap1].concat([...map]) : [...newMap1]
    return new Map(newArrs)
  },
  async getDepotStorageRevoke(
    rows,
    sysGroup,
    map,
    rightApi,
    orderId,
    rightVo,
    str = 'stockAvailableCalcQty',
    id = 'depotStockId'
  ) {
    //选择库存产品返回合并  20210629143516000241
    let newMap = new Map()
    let mapValues = [...map.values()]
    if (mapValues.length) {
      mapValues.forEach((row) => {
        row.isChoice = false
        if (row.details && row.details.length) {
          row.details.forEach((item) => {
            item.isChoice = false
          })
        }
      })
    }
    rows.forEach((item) => {
      let key = []
      if (sysGroup.length) {
        sysGroup.forEach((row) => {
          let obj = {}
          obj.columnName = row.columnName
          obj.asTbName = row.asTbName
          obj.value = item[row.key]
          key.push(obj)
        })
      }
      item.key = JSON.stringify(key)
      newMap.set(item.key, item)
    })
    let newMap1 = new Map()
    for (let [key, value] of newMap) {
      if (map.has(key)) {
        let mergeDetail = map.get(key)
        mergeDetail.isChoice = value.isChoice
        let unitConvertCoefficient = mergeDetail.unitConvertCoefficient || 1
        let detail = value.details[0]
        if (mergeDetail.details && mergeDetail.details.length) {
          let details = mergeDetail.details
          let largeUnitQty = 0
          let smallUnitQty = 0
          let invalidCalcQty = 0
          let sumAmount = 0
          let index = details.findIndex(
            (item) => setKey(item, id) === setKey(detail, id)
          )
          if (index === -1) {
            details.unshift(detail)
            details.forEach((item) => {
              invalidCalcQty = accAddFn(item.invalidCalcQty, invalidCalcQty)
              item.sumAmount = accDivFn(
                accMulFn(item.invalidCalcQty, item.price),
                unitConvertCoefficient
              )
              sumAmount = accAddFn(item.sumAmount, sumAmount)
            })
          } else {
            details.forEach((item) => {
              let key = setKey(item, id)
              if (key === setKey(detail, id)) {
                if (item.codeType === 4) {
                  let num = SubtrFn(item[str], item.invalidCalcQty)
                  if (num >= unitConvertCoefficient) {
                    item.invalidCalcQty = accAddFn(
                      unitConvertCoefficient,
                      item.invalidCalcQty
                    )
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.invalidCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.invalidCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.invalidCalcQty
                      item.smallUnitQty = 0
                    }
                  } else if (num > 0 && num < unitConvertCoefficient) {
                    item.invalidCalcQty = accAddFn(num, item.invalidCalcQty)
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.invalidCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.invalidCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.invalidCalcQty
                      item.smallUnitQty = 0
                    }
                  }
                  item.invalidQty = accDivFn(
                    item.invalidCalcQty,
                    unitConvertCoefficient
                  )
                  item.sumAmount = accDivFn(
                    accMulFn(item.invalidCalcQty, item.price),
                    unitConvertCoefficient
                  )
                } else if (item.codeType === 2 || item.codeType === 3) {
                  item = detail
                }
              }
              invalidCalcQty = accAddFn(
                item.invalidCalcQty || 0,
                invalidCalcQty
              )
              sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
              largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
              smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
            })
          }
          mergeDetail.groupConcatIds = mergeDetail.details
            .map((item) => item[id])
            .toString()
          mergeDetail.groupSize = mergeDetail.details.length
          mergeDetail.invalidQty = accDivFn(
            invalidCalcQty,
            unitConvertCoefficient
          )
          mergeDetail.largeUnitQty = largeUnitQty
          mergeDetail.smallUnitQty = smallUnitQty
          mergeDetail.sumAmount = sumAmount
          mergeDetail.invalidCalcQty = invalidCalcQty
        } else {
          if (orderId) {
            let rightQuery = {
              id: {
                queryType: 'IN',
                queryCategory: 'AND',
                value: mergeDetail.groupConcatIds,
              },
              orderId: {
                queryType: 'EQUALS',
                queryCategory: 'AND',
                value: orderId,
              },
            }
            await getIndividualRight(rightApi, rightQuery, rightVo).then(
              (res) => {
                if (res.length) {
                  mergeDetail.details = res
                  let largeUnitQty = 0
                  let smallUnitQty = 0
                  let invalidCalcQty = 0
                  let sumAmount = 0
                  let index = res.findIndex(
                    (item) => setKey(item, id) === setKey(detail, id)
                  )
                  if (index === -1) {
                    mergeDetail.details.unshift(detail)
                    mergeDetail.details.forEach((item) => {
                      invalidCalcQty = accAddFn(
                        item.invalidCalcQty,
                        invalidCalcQty
                      )
                      item.sumAmount = accDivFn(
                        accMulFn(item.invalidCalcQty, item.price),
                        unitConvertCoefficient
                      )
                      sumAmount = accAddFn(item.sumAmount, sumAmount)
                    })
                  } else {
                    mergeDetail.details.forEach((item) => {
                      let key = setKey(item, id)
                      if (key === setKey(detail, id)) {
                        if (item.codeType === 4) {
                          let num = SubtrFn(item[str], item.invalidCalcQty)
                          if (num >= unitConvertCoefficient) {
                            item.invalidCalcQty = accAddFn(
                              unitConvertCoefficient,
                              item.invalidCalcQty
                            )
                            if (item.qtyOperateMode === 2) {
                              item.largeUnitQty = parseInt(
                                item.invalidCalcQty / unitConvertCoefficient
                              )
                              item.smallUnitQty = parseInt(
                                item.invalidCalcQty % unitConvertCoefficient
                              )
                            } else if (
                              item.qtyOperateMode === 0 ||
                              item.qtyOperateMode === 1
                            ) {
                              item.largeUnitQty = item.invalidCalcQty
                              item.smallUnitQty = 0
                            }
                          } else if (num > 0 && num < unitConvertCoefficient) {
                            item.invalidCalcQty = accAddFn(
                              num,
                              item.invalidCalcQty
                            )
                            if (item.qtyOperateMode === 2) {
                              item.largeUnitQty = parseInt(
                                item.invalidCalcQty / unitConvertCoefficient
                              )
                              item.smallUnitQty = parseInt(
                                item.invalidCalcQty % unitConvertCoefficient
                              )
                            } else if (
                              item.qtyOperateMode === 0 ||
                              item.qtyOperateMode === 1
                            ) {
                              item.largeUnitQty = item.invalidCalcQty
                              item.smallUnitQty = 0
                            }
                          }
                          item.invalidQty = accDivFn(
                            item.invalidCalcQty,
                            unitConvertCoefficient
                          )
                          item.sumAmount = accDivFn(
                            accMulFn(item.invalidCalcQty, item.price),
                            unitConvertCoefficient
                          )
                        } else if (item.codeType === 2 || item.codeType === 3) {
                          item = detail
                        }
                      }
                      invalidCalcQty = accAddFn(
                        item.invalidCalcQty || 0,
                        invalidCalcQty
                      )
                      sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
                      largeUnitQty = accAddFn(
                        item.largeUnitQty || 0,
                        largeUnitQty
                      )
                      smallUnitQty = accAddFn(
                        item.smallUnitQty || 0,
                        smallUnitQty
                      )
                    })
                  }
                  mergeDetail.groupConcatIds = mergeDetail.details
                    .map((item) => item[id])
                    .toString()
                  mergeDetail.groupSize = mergeDetail.details.length
                  mergeDetail.invalidQty = accDivFn(
                    invalidCalcQty,
                    unitConvertCoefficient
                  )
                  mergeDetail.largeUnitQty = largeUnitQty
                  mergeDetail.smallUnitQty = smallUnitQty
                  mergeDetail.sumAmount = sumAmount
                  mergeDetail.invalidCalcQty = invalidCalcQty
                }
              }
            )
          } else {
            mergeDetail.details = value.details
            let largeUnitQty = 0
            let smallUnitQty = 0
            let invalidCalcQty = 0
            let sumAmount = 0
            mergeDetail.details.forEach((item) => {
              let key = setKey(item, id)
              if (key === setKey(detail, id)) {
                if (item.codeType === 4) {
                  let num = SubtrFn(item[str], item.invalidCalcQty)
                  if (num >= unitConvertCoefficient) {
                    item.invalidCalcQty = accAddFn(
                      unitConvertCoefficient,
                      item.invalidCalcQty
                    )
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.invalidCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.invalidCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.invalidCalcQty
                      item.smallUnitQty = 0
                    }
                  } else if (num > 0 && num < unitConvertCoefficient) {
                    item.invalidCalcQty = accAddFn(num, item.invalidCalcQty)
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.invalidCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.invalidCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.invalidCalcQty
                      item.smallUnitQty = 0
                    }
                  }
                  item.invalidQty = accDivFn(
                    item.invalidCalcQty,
                    unitConvertCoefficient
                  )
                  item.sumAmount = accDivFn(
                    accMulFn(item.invalidCalcQty, item.price),
                    unitConvertCoefficient
                  )
                } else if (item.codeType === 2 || item.codeType === 3) {
                  item = detail
                }
              }
              invalidCalcQty = accAddFn(
                item.invalidCalcQty || 0,
                invalidCalcQty
              )
              sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
              largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
              smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
            })
            mergeDetail.groupConcatIds = mergeDetail.details
              .map((item) => item[id])
              .toString()
            mergeDetail.groupSize = mergeDetail.details.length
            mergeDetail.invalidQty = accDivFn(
              invalidCalcQty,
              unitConvertCoefficient
            )
            mergeDetail.largeUnitQty = largeUnitQty
            mergeDetail.smallUnitQty = smallUnitQty
            mergeDetail.sumAmount = sumAmount
            mergeDetail.invalidCalcQty = invalidCalcQty
          }
        }
      } else {
        let unitConvertCoefficient = value.unitConvertCoefficient || 1
        let largeUnitQty = 0
        let smallUnitQty = 0
        let invalidCalcQty = 0
        let sumAmount = 0
        value.details.forEach((item) => {
          invalidCalcQty = accAddFn(item.invalidCalcQty || 0, invalidCalcQty)
          sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
          largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
          smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
        })
        value.groupConcatIds = value.details.map((item) => item[id]).toString()
        value.groupSize = value.details.length
        value.invalidQty = accDivFn(invalidCalcQty, unitConvertCoefficient)
        value.sumAmount = sumAmount
        value.largeUnitQty = largeUnitQty
        value.smallUnitQty = smallUnitQty
        value.invalidCalcQty = invalidCalcQty
        newMap1.set(key, value)
      }
    }
    let newArrs = map.size > 0 ? [...newMap1].concat([...map]) : [...newMap1]
    return new Map(newArrs)
  },
  async getDepotStoragePutShelf(
    rows,
    sysGroup,
    map,
    rightApi,
    orderId,
    rightVo,
    str = 'stockAvailableCalcQty',
    id = 'depotStockId'
  ) {
    //选择库存产品返回合并  20210629143516000241
    let newMap = new Map()
    let mapValues = [...map.values()]
    if (mapValues.length) {
      mapValues.forEach((row) => {
        row.isChoice = false
        if (row.details && row.details.length) {
          row.details.forEach((item) => {
            item.isChoice = false
          })
        }
      })
    }
    rows.forEach((item) => {
      let key = []
      if (sysGroup.length) {
        sysGroup.forEach((row) => {
          let obj = {}
          obj.columnName = row.columnName
          obj.asTbName = row.asTbName
          obj.value = item[row.key]
          key.push(obj)
        })
      }
      item.key = JSON.stringify(key)
      newMap.set(item.key, item)
    })
    let newMap1 = new Map()
    for (let [key, value] of newMap) {
      if (map.has(key)) {
        let mergeDetail = map.get(key)
        mergeDetail.isChoice = value.isChoice
        let unitConvertCoefficient = mergeDetail.unitConvertCoefficient || 1
        let detail = value.details[0]
        if (mergeDetail.details && mergeDetail.details.length) {
          let details = mergeDetail.details
          let largeUnitQty = 0
          let smallUnitQty = 0
          let putCalcQty = 0
          let sumAmount = 0
          let index = details.findIndex(
            (item) => setKey(item, id) === setKey(detail, id)
          )
          if (index === -1) {
            details.unshift(detail)
            details.forEach((item) => {
              putCalcQty = accAddFn(item.putCalcQty, putCalcQty)
              item.sumAmount = accDivFn(
                accMulFn(item.putCalcQty, item.price),
                unitConvertCoefficient
              )
              sumAmount = accAddFn(item.sumAmount, sumAmount)
            })
          } else {
            details.forEach((item) => {
              let key = setKey(item, id)
              if (key === setKey(detail, id)) {
                if (item.codeType === 4) {
                  let num = SubtrFn(item[str], item.putCalcQty)
                  if (num >= unitConvertCoefficient) {
                    item.putCalcQty = accAddFn(
                      unitConvertCoefficient,
                      item.putCalcQty
                    )
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.putCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.putCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.putCalcQty
                      item.smallUnitQty = 0
                    }
                  } else if (num > 0 && num < unitConvertCoefficient) {
                    item.putCalcQty = accAddFn(num, item.putCalcQty)
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.putCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.putCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.putCalcQty
                      item.smallUnitQty = 0
                    }
                  }
                  item.putQty = accDivFn(
                    item.putCalcQty,
                    unitConvertCoefficient
                  )
                  item.sumAmount = accDivFn(
                    accMulFn(item.putCalcQty, item.price),
                    unitConvertCoefficient
                  )
                } else if (item.codeType === 2 || item.codeType === 3) {
                  item = detail
                }
              }
              putCalcQty = accAddFn(item.putCalcQty || 0, putCalcQty)
              sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
              largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
              smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
            })
          }
          mergeDetail.groupConcatIds = mergeDetail.details
            .map((item) => item[id])
            .toString()
          mergeDetail.groupSize = mergeDetail.details.length
          mergeDetail.putQty = accDivFn(putCalcQty, unitConvertCoefficient)
          mergeDetail.largeUnitQty = largeUnitQty
          mergeDetail.smallUnitQty = smallUnitQty
          mergeDetail.sumAmount = sumAmount
          mergeDetail.putCalcQty = putCalcQty
        } else {
          if (orderId) {
            let rightQuery = {
              id: {
                queryType: 'IN',
                queryCategory: 'AND',
                value: mergeDetail.groupConcatIds,
              },
              orderId: {
                queryType: 'EQUALS',
                queryCategory: 'AND',
                value: orderId,
              },
            }
            await getIndividualRight(rightApi, rightQuery, rightVo).then(
              (res) => {
                if (res.length) {
                  mergeDetail.details = res
                  let largeUnitQty = 0
                  let smallUnitQty = 0
                  let putCalcQty = 0
                  let sumAmount = 0
                  let index = res.findIndex(
                    (item) => setKey(item, id) === setKey(detail, id)
                  )
                  if (index === -1) {
                    mergeDetail.details.unshift(detail)
                    mergeDetail.details.forEach((item) => {
                      putCalcQty = accAddFn(item.putCalcQty, putCalcQty)
                      item.sumAmount = accDivFn(
                        accMulFn(item.putCalcQty, item.price),
                        unitConvertCoefficient
                      )
                      sumAmount = accAddFn(item.sumAmount, sumAmount)
                    })
                  } else {
                    mergeDetail.details.forEach((item) => {
                      let key = setKey(item, id)
                      if (key === setKey(detail, id)) {
                        if (item.codeType === 4) {
                          let num = SubtrFn(item[str], item.putCalcQty)
                          if (num >= unitConvertCoefficient) {
                            item.putCalcQty = accAddFn(
                              unitConvertCoefficient,
                              item.putCalcQty
                            )
                            if (item.qtyOperateMode === 2) {
                              item.largeUnitQty = parseInt(
                                item.putCalcQty / unitConvertCoefficient
                              )
                              item.smallUnitQty = parseInt(
                                item.putCalcQty % unitConvertCoefficient
                              )
                            } else if (
                              item.qtyOperateMode === 0 ||
                              item.qtyOperateMode === 1
                            ) {
                              item.largeUnitQty = item.putCalcQty
                              item.smallUnitQty = 0
                            }
                          } else if (num > 0 && num < unitConvertCoefficient) {
                            item.putCalcQty = accAddFn(num, item.putCalcQty)
                            if (item.qtyOperateMode === 2) {
                              item.largeUnitQty = parseInt(
                                item.putCalcQty / unitConvertCoefficient
                              )
                              item.smallUnitQty = parseInt(
                                item.putCalcQty % unitConvertCoefficient
                              )
                            } else if (
                              item.qtyOperateMode === 0 ||
                              item.qtyOperateMode === 1
                            ) {
                              item.largeUnitQty = item.putCalcQty
                              item.smallUnitQty = 0
                            }
                          }
                          item.putQty = accDivFn(
                            item.putCalcQty,
                            unitConvertCoefficient
                          )
                          item.sumAmount = accDivFn(
                            accMulFn(item.putCalcQty, item.price),
                            unitConvertCoefficient
                          )
                        } else if (item.codeType === 2 || item.codeType === 3) {
                          item = detail
                        }
                      }
                      putCalcQty = accAddFn(item.putCalcQty || 0, putCalcQty)
                      sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
                      largeUnitQty = accAddFn(
                        item.largeUnitQty || 0,
                        largeUnitQty
                      )
                      smallUnitQty = accAddFn(
                        item.smallUnitQty || 0,
                        smallUnitQty
                      )
                    })
                  }
                  mergeDetail.groupConcatIds = mergeDetail.details
                    .map((item) => item[id])
                    .toString()
                  mergeDetail.groupSize = mergeDetail.details.length
                  mergeDetail.putQty = accDivFn(
                    putCalcQty,
                    unitConvertCoefficient
                  )
                  mergeDetail.largeUnitQty = largeUnitQty
                  mergeDetail.smallUnitQty = smallUnitQty
                  mergeDetail.sumAmount = sumAmount
                  mergeDetail.putCalcQty = putCalcQty
                }
              }
            )
          } else {
            mergeDetail.details = value.details
            let largeUnitQty = 0
            let smallUnitQty = 0
            let putCalcQty = 0
            let sumAmount = 0
            mergeDetail.details.forEach((item) => {
              let key = setKey(item, id)
              if (key === setKey(detail, id)) {
                if (item.codeType === 4) {
                  let num = SubtrFn(item[str], item.putCalcQty)
                  if (num >= unitConvertCoefficient) {
                    item.putCalcQty = accAddFn(
                      unitConvertCoefficient,
                      item.putCalcQty
                    )
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.putCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.putCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.putCalcQty
                      item.smallUnitQty = 0
                    }
                  } else if (num > 0 && num < unitConvertCoefficient) {
                    item.putCalcQty = accAddFn(num, item.putCalcQty)
                    if (item.qtyOperateMode === 2) {
                      item.largeUnitQty = parseInt(
                        item.putCalcQty / unitConvertCoefficient
                      )
                      item.smallUnitQty = parseInt(
                        item.putCalcQty % unitConvertCoefficient
                      )
                    } else if (
                      item.qtyOperateMode === 0 ||
                      item.qtyOperateMode === 1
                    ) {
                      item.largeUnitQty = item.putCalcQty
                      item.smallUnitQty = 0
                    }
                  }
                  item.putQty = accDivFn(
                    item.putCalcQty,
                    unitConvertCoefficient
                  )
                  item.sumAmount = accDivFn(
                    accMulFn(item.putCalcQty, item.price),
                    unitConvertCoefficient
                  )
                } else if (item.codeType === 2 || item.codeType === 3) {
                  item = detail
                }
              }
              putCalcQty = accAddFn(item.putCalcQty || 0, putCalcQty)
              sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
              largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
              smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
            })
            mergeDetail.groupConcatIds = mergeDetail.details
              .map((item) => item[id])
              .toString()
            mergeDetail.groupSize = mergeDetail.details.length
            mergeDetail.putQty = accDivFn(putCalcQty, unitConvertCoefficient)
            mergeDetail.largeUnitQty = largeUnitQty
            mergeDetail.smallUnitQty = smallUnitQty
            mergeDetail.sumAmount = sumAmount
            mergeDetail.putCalcQty = putCalcQty
          }
        }
      } else {
        let unitConvertCoefficient = value.unitConvertCoefficient || 1
        let largeUnitQty = 0
        let smallUnitQty = 0
        let putCalcQty = 0
        let sumAmount = 0
        value.details.forEach((item) => {
          putCalcQty = accAddFn(item.putCalcQty || 0, putCalcQty)
          sumAmount = accAddFn(item.sumAmount || 0, sumAmount)
          largeUnitQty = accAddFn(item.largeUnitQty || 0, largeUnitQty)
          smallUnitQty = accAddFn(item.smallUnitQty || 0, smallUnitQty)
        })
        value.groupConcatIds = value.details.map((item) => item[id]).toString()
        value.groupSize = value.details.length
        value.putQty = accDivFn(putCalcQty, unitConvertCoefficient)
        value.sumAmount = sumAmount
        value.largeUnitQty = largeUnitQty
        value.smallUnitQty = smallUnitQty
        value.putCalcQty = putCalcQty
        newMap1.set(key, value)
      }
    }
    let newArrs = map.size > 0 ? [...newMap1].concat([...map]) : [...newMap1]
    return new Map(newArrs)
  },
  generateProductKey(products) {
    //设置key,唯一标识
    products = products.constructor === Array ? products : [products]
    return products.map((item) => {
      const key =
        item.depotStockId +
        '&' +
        item.productId +
        '&' +
        item.batchNumber +
        '&' +
        item.validityDate +
        '&' +
        item.productionDate +
        '&' +
        item.price +
        '&' +
        item.qrCode +
        '&' +
        item.uniqueCode +
        '&' +
        item.factorySubCode +
        '&' +
        item.factoryMainCode
      item.key = key
      return item
    })
  },
  async confirmRes(
    str = '扫到其他产品, 将切换数据，是否要保存当前操作数据?',
    confirmText,
    cancelText
  ) {
    //个体操作弹窗切换提示
    let confirmRes = ''
    await ElMessageBox.confirm(str, '提示', {
      confirmButtonText: confirmText ? confirmText : '确定',
      cancelButtonText: cancelText ? cancelText : '取消',
      type: 'warning',
    })
      .then(() => {
        confirmRes = 'confirm'
      })
      .catch(() => {
        confirmRes = ''
      })
    return confirmRes
  },
  getPrintTemp(data) {
    //获取打印模板数据
    let obj = _.cloneDeep(data)
    let params = {
      title: obj.name,
      width: obj.width,
      height: obj.height,
      pageWidth: obj.pageWidth,
      pageHeight: obj.pageHeight,
      horizontally: obj.horizontally,
      tempItems: JSON.parse(obj.templateContent),
    }
    return params
  },
  getUid() {
    return new Date().getTime() + (1 + Math.random())
  },
  filterBlacklist(arr, str = 'details') {
    //过滤黑名单,blacklist
    let deepArr = _.cloneDeep(arr)
    let newArr = deepArr.map((row) => {
      let result = _.omit(row, blacklist)
      if (result[str] && result[str].length) {
        result[str] = result[str].map((item) => {
          let detailsResult = _.omit(item, blacklist)
          return detailsResult
        })
      }
      return result
    })
    return newArr
  },
  initLayout(proxy, data) {
    const { loading } = data
    loading.value = true
    const iframe = document.querySelector('#iframe')
    // 处理兼容行问题
    if (iframe.attachEvent) {
      iframe.attachEvent('onload', function () {
        // iframe加载完毕以后执行操作
        loading.value = false
      })
    } else {
      iframe.onload = function () {
        // iframe加载完毕以后执行操作
        loading.value = false
      }
    }
  },
  // 合并表格方法
  spanMethod(list, keys, row, col) {
    // 注意: keys字段列表要按表格排列的顺序排列,如果后续字段不再需要进行行合并,可以省略后面的字段,如果中间某字段要跳过合并,要用空字符串顶位
    if (col >= keys.length || !keys[col]) {
      // 根据传入的字段列表,判断不需要合并的列
      return [1, 1]
    } else {
      //使用try-catch,如果方法错误返回错误信息
      try {
        let _keys = keys.slice(0, col + 1) //截取需要用到判断的字段名
        // 判断是否从本行开始合并
        let merge = _keys.some((item) => {
          if (row == 0) {
            return true
          }
          if (item) {
            // 置空操作是为防止当数据返回为 '',undefined,null时也需要进行合并
            if (!list[row][item] && list[row][item] !== 0) {
              list[row][item] = ''
            }
            if (!list[row - 1][item] && list[row - 1][item] !== 0) {
              list[row - 1][item] = ''
            }
          }
          // 如果当前行所需要判断合并的字段中有一个跟前一条数据不一样,本条数据即为合并的起点,第一条数据直接为合并起点
          return list[row][item] != list[row - 1][item]
        })
        // 如果本条数据是合并起点,获取需要合并的数据条数
        if (merge) {
          let _list = list.slice(row) //截取从本条数据开始的列表
          // 获取合并行数
          let _lineNum = _list.findIndex((item, ind) => {
            //同merge判断,找到合并的终点
            return (
              ind &&
              _keys.some((ele) => {
                if (ele) {
                  // 置空操作是为防止当数据返回为 '',undefined,null时也需要进行合并
                  if (!item[ele] && item[ele] !== 0) {
                    item[ele] = ''
                  }
                  if (!_list[0][ele] && _list[0][ele] !== 0) {
                    _list[0][ele] = ''
                  }
                }
                return item[ele] != _list[0][ele]
              })
            )
          })
          // 合并行数为-1时,输出_list的长度,否则输出_lineNum
          return [_lineNum === -1 ? _list.length : _lineNum, 1]
        } else {
          // 否则,返回[0,0],即本条数据被合并
          return [0, 0]
        }
      } catch (err) {
        // 打印报错
        console.error('spanMethodFunc error:', err)
      }
    }
  },
  // 设置不同分辨率table表格每列宽度
  setFieldListColWidth(fieldList, bigWidth, smallWidth) {
    let pixelWidth = window.screen.width * window.devicePixelRatio || 1920
    let keyWidthObj = {}
    if (pixelWidth < 1400) {
      keyWidthObj = smallWidth
    } else {
      keyWidthObj = bigWidth
    }
    fieldList.forEach((item) => {
      if (keyWidthObj[item.value]) {
        item.minWidth = keyWidthObj[item.value]
        item.width = ''
      }
    })
  },
  getIsOtherOrg() {
    const _query = getQueryParams()
    if(_query.businessOrgId && _query.businessGroupId) {
      return true
    } else {
      return false
    }
  },
  getSubsysAndUrl(){
    let routeStore = localStorage.getItem('routeStore')
    let userInfoStore = localStorage.getItem('userInfoStore')
    let localUrl = window.parent.location.href
    if(localUrl.includes('?')){
      let localUrlArr = splitArrFn(localUrl, '?')
      localUrl = localUrlArr[0]
    }
    let herfArr = splitArrFn(localUrl, 'microApp/')
    let subArr = splitArrFn(herfArr[1], '/')
    let sub = subArr[0]
    if(subArr[0] === 'spdBase'){
      sub = 'basicServer'
    }
    let isSubSys = false
    let systemName = -2
    if(userInfoStore && userInfoStore !== null && userInfoStore !== undefined && userInfoStore !== 'null' && userInfoStore !== 'undefined'){
      let obj = JSON.parse(userInfoStore)
      let subSystemDTOS = obj?.userAndPermissionInfo?.subSystemDTOS
      if(subSystemDTOS && subSystemDTOS.length){
        subSystemDTOS.map(item => {
          if(item.routeKey === sub){
            isSubSys = true
            systemName = encodeURIComponent(item.systemName)
          }
        })
      }
    }
    let sliceUrl = subArr.slice(1);
    let url = -2
    if(sliceUrl && sliceUrl.length){
      url = '/' + sliceUrl.join('/')
    }
    if(isSubSys ){
      if(sub === 'spd'){
        if( routeStore && routeStore !== null && routeStore !== undefined && routeStore !== 'null' && routeStore !== 'undefined'){
          let routers = routeStore?.allSpdRoutes
          if(routers && routers.length){
            if(url != -2){
              let item = findChildren(routers, url)
              if(item && item.id){
                return {
                  systemCode: item.parentMicroName,
                  systemName: systemName,
                  routeCode: encodeURIComponent(url)
                }
              }
            }

          }
        }
      }else{
        if(url != -2){
          return {
            systemCode: sub,
            systemName: systemName,
            routeCode: encodeURIComponent(url)
          }
        }

      }
    }
    return {
      systemCode: -2,
      systemName: systemName,
      routeCode: encodeURIComponent(url)
    }
  }
}

function getQueryParams() {
  const params = new URLSearchParams(window.parent.location.search)
  return Object.fromEntries(params.entries())
}

function setKey(item, id) {
  let key =
    item[id] +
    '&' +
    item.productId +
    '&' +
    item.batchNumber +
    '&' +
    item.validityDate +
    '&' +
    item.productionDate +
    '&' +
    item.price +
    '&' +
    item.qrCode +
    '&' +
    item.uniqueCode +
    '&' +
    item.factorySubCode +
    '&' +
    item.factoryMainCode
  return key
}
//解决精度+
function accAddFn(a, b) {
  return parseFloat(math.add(math.bignumber(a), math.bignumber(b)))
}
//解决精度-
function SubtrFn(arg1, arg2) {
  return parseFloat(math.subtract(math.bignumber(arg1), math.bignumber(arg2)))
}
//解决精度 *
function accMulFn(arg1, arg2) {
  return parseFloat(math.multiply(math.bignumber(arg1), math.bignumber(arg2)))
}
//解决精度 /
function accDivFn(arg1, arg2) {
  return parseFloat(math.divide(math.bignumber(arg1), math.bignumber(arg2)))
}
function humpToHyphen(str = '', splitStr = '_') {
  //将驼峰转下划线小写
  if (str == '') {
    // 字符串是空的
    return 'str is empty'
  }
  if (typeof str.toLowerCase() !== 'string') {
    //必须是字符串类型，其他的都不要
    return 'incorrect character type'
  }
  //其他条件暂时不添加限制了，比如大驼峰先转换成小驼峰再处理，只能是字符串和下划线，等等其他，自行添加

  let reg = new RegExp('[A-Z]', 'g')

  return str.replace(reg, function (match, offset, ss) {
    //match 匹配到的字符，offset 偏移量-下标，ss 原字符
    return splitStr + match.toLowerCase()
  })
}

function format_number(num, len, type) {
  //num数字，len保留精度，type保留策略
  len = len > 0 && len <= 20 ? len : 2
  let result = _.cloneDeep(parseFloat(num))
  if (type == 1) {
    //ceil进一
    if (result < 0) {
      result = -math.ceil(Math.abs(result), len).toFixed(len)
    } else {
      result = math.ceil(result, len).toFixed(len)
    }
  } else if (type == 0) {
    //floor取整
    result = math.floor(result, len).toFixed(len)
  } else if (type == 2) {
    //round四舍五入
    result = math.round(result, len).toFixed(len)
  }
  return result
}

function sortList(arr, str, level = 'asc') {
  let obj = arr.sort((a, b) => {
    if (level === 'asc') {
      return a[str] - b[str]
    } else {
      return b[str] - a[str]
    }
  })
  return obj
}

function getIndividualRight(rightApi, rightQuery, rightVo) {
  return new Promise((resolve, reject) => {
    let param = {
      customizeUserVO: rightVo,
      queryMap: {
        ...rightQuery,
      },
      queryParams: {},
    }
    rightApi(param).then((resp) => {
      if (resp && resp.success) {
        let data = resp.data
        data.forEach((item) => {
          item.isChoice = false
        })
        resolve(data)
      } else {
        reject()
      }
    })
  })
}

function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str)
      if (typeof obj == 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
function splitArrFn(str, splitStr = ',') {
  //字符串转数组
  if (!str) {
    return []
  }
  str = str.toString()
  if (str.indexOf(splitStr) !== -1) {
    return str.split(splitStr)
  } else {
    return [str]
  }
}
