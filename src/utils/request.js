import axios from 'axios'
import store from '@/store'
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'
import { blobValidate } from '@/utils/slp'
import { saveAs } from 'file-saver'
import util from '@/common/js/utils'

const host = import.meta.env.VITE_APP_BASE_API

const baseURL = host
//请求默认配置
axios.defaults.timeout = '300000'
axios.withCredentials = true
axios.host = host
axios.defaults.baseURL = baseURL
axios.onlineRequest = 0

const loadingScreen = (num, fn) => {
  //关闭加载动画
  if (num < 1) {
    fn.close()
  }
}

let loadingInstance = ''

function getQueryParams() {
  const params = new URLSearchParams(window.parent.location.search)
  return Object.fromEntries(params.entries())
}
axios.interceptors.request.use(
  (config) => {
    axios.onlineRequest += 1
    let token = getToken()
    const queryParams = getQueryParams()
    let subsysAndUrl = util.getSubsysAndUrl()
    if (!config.notShowLoading) {
      loadingInstance = ElLoading.service({
        lock: true,
        background: 'rgba(255, 255, 255, 0.1)',
        text: '请稍候...',
        target: '.loading-area', // 设置加载动画区域
      }) //发生请求时打开加载动画
    }
    config.headers = {
      'Content-Type': config['Content-Type'] || 'application/json;charset=utf-8',
      'business-org-id': queryParams.businessOrgId || null,
      'business-group-id': queryParams.businessGroupId || null,
      'btnCode': config.btnCode ? config.btnCode : -2,
      'reqType': 'PC',
      'systemName': subsysAndUrl?.systemName || -2,
      'systemCode': subsysAndUrl?.systemCode || -2,
      'routeCode': subsysAndUrl?.routeCode ? subsysAndUrl.routeCode : -2,
    }
    // 不设置超时时间
    if (config.data?.noTimeout) {
      delete config.timeout
    }
    if (token) {
      config.headers['x-auth-token'] = token
      config.headers['Authorization'] = token
    }
    return config
  },
  (error) => {
    console.error(error)
    Promise.reject(error)
  }
)
axios.interceptors.response.use(
  (response) => {
    return new Promise(function (resolve, reject) {
      loadingScreen((axios.onlineRequest -= 1), loadingInstance)
      const resData = response.headers ? response.data : response
      if (resData.code === 800) {
        if (window.__POWERED_BY_WUJIE__) {
          window.$wujie?.bus.$emit('microAppLogout', 'subApp', resData.msg)
        }
        return
      }
      if (
        response.headers &&
        response.headers['content-type']?.indexOf('octet-stream') !== -1
      ) {
        resolve(response)
      } else if (response.request?.responseType === 'blob') {
        fileToJson(resData)
          .then((res) => {
            if (res.success) {
              resolve(resData)
            } else if (res.msg) {
              ElMessage.error({
                message: res.msg,
                duration: 3000,
                showClose: true,
              })
            } else {
              if (resData && resData.size) {
                resolve(resData)
              } else if (resData && !resData.size) {
                ElMessage.error({
                  message: '系统错误请联系管理员！！',
                  showClose: true,
                  duration: 3000,
                })
              } else {
                resolve(resData)
              }
            }
          })
          .catch((err) => {
            ElMessage.error({
              message: res.msg,
              duration: 3000,
              showClose: true,
            })
          })
      } else if (resData) {
        if (resData.code !== 200 && resData.code) {
          ElMessage.error({
            duration: 3000,
            showClose: true,
            message: resData.msg,
          })
        }
        if (resData.pageInfo) {
          resData.pageNo = resData.pageInfo.pageNo
        }
        if (resData.curPage) {
          resData.pageNo = resData.curPage
        }
        if (!resData.hasOwnProperty('success')) {
          resData.success = true
        }
        let result = {
          ...resData,
          ...(resData?.pageInfo ? resData.pageInfo : {}),
        }
        resolve(result)
      } else {
        if (resData.msgType === 'messageBox') {
          ElMessageBox.confirm(resData.msg, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            dangerouslyUseHTMLString: true,
            type: 'warning',
          })
            .then(() => {
              resolve(resData)
            })
            .catch(() => {
              resolve()
            })
        } else if (resData.msg) {
          resolve(resData)
          ElMessage.error({
            message: resData.msg,
            duration: 3000,
            showClose: true,
          })
        } else {
          resolve(resData)
        }
      }
    })
  },
  (error) => {
    axios.onlineRequest = 0
    loadingScreen(axios.onlineRequest, loadingInstance)
    if (error.message) {
      if (error.response) {
        let status = error.response
        if (status.status === 401) {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        }
        if (status.status === 404) {
          ElMessage.error({
            message: '请求地址出错',
            showClose: true,
            duration: 3000,
          })
        } else {
          ElMessage.error({
            message: status.data.msg,
            showClose: true,
            duration: 3000,
          })
        }
      } else {
        ElMessage.error({
          message: error.message,
          showClose: true,
          duration: 3000,
        })
      }
    }
    return Promise.reject(error.response?.data || {})
  }
)

export default axios
// 通用下载方法
export function download(url, params, filename) {
  // downloadLoadingInstance = ElLoading.service({
  //   text: '正在下载数据，请稍候',
  //   background: 'rgba(0, 0, 0, 0.7)',
  // })
  return axios
    .post(url, params, {
      // 注释掉transformRequest和headers的原因是用户管理导入需要用到不同的格式传参
      // transformRequest: [
      //   (params) => {
      //     return tansParams(params)
      //   },
      // ],
      // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
    })
    .then(async (data) => {
      const tempData = await blobValidate(data)
      if (typeof tempData === 'boolean') {
        const blob = new Blob([data])
        saveAs(blob, filename)
      } else {
        // 未设置状态码则默认成功状态
        const code = tempData.code || 200
        // 获取错误信息
        const msg =
          tempData.msg ||
          errorCode[code] ||
          data.data.msg ||
          errorCode['default']
        if (code === 401) {
          ElMessageBox.confirm(
            '登录状态已过期或权限发生变更，您可以继续留在该页面，或者重新登录',
            '系统提示',
            {
              confirmButtonText: '重新登录',
              showClose: false,
              closeOnClickModal: false,
              showCancelButton: false,
              type: 'warning',
            }
          ).then(() => {
            store.dispatch('user/logout').then(() => {
              location.href = '/dashboard'
            })
          })
          return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
        } else if (code === 500) {
          ElMessage({
            message: msg,
            type: 'error',
          })
          return Promise.reject(new Error(msg))
        } else if (code !== 200) {
          ElMessage.error(msg || '下载文件出现错误，请联系管理员！')
          return Promise.reject('error')
        }
      }
    })
}

function fileToJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (res) => {
      const { result } = res.target // 得到字符串
      if (isJSON_test(result)) {
        const data = JSON.parse(result) // 解析成json对象
        resolve(data)
      } else {
        resolve(result)
      }
    } // 成功回调
    reader.onerror = (err) => {
      reject(err)
    } // 失败回调
    reader.readAsText(new Blob([file]), 'utf-8') // 按照utf-8编码解析
  })
}
function isJSON_test(str) {
  if (typeof str == 'string') {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }
}
