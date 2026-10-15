import request from '@/utils/request'

const basicHost = import.meta.env.VITE_APP_BASIC_API

//登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data,
  })
}


//登录回调信息
export function loginCallbackBasic() {
  return request({
    url: '/login/spd/callback',
    method: 'get',
  })
}

//退出
export function logout(data) {
  return request({
    url: '/user/logout',
    method: 'post',
  })
}

//获取当前登录用户信息
export function getCurrentUser() {
  return request({
    url: '/pub/currentUser',
    method: 'get',
  })
}

//修改密码
export function updatePassword(data) {
  return request({
    url: '/pub/updatePassword',
    method: 'post',
    data,
  })
}

//导出Excel模板
export function exportTemplateExcel(type) {
  return request({
    url: basicHost + `/file/download`,
    method: 'get',
    params: {
      fileName: 'template/' + type + '.xlsx',
    },
    responseType: 'blob',
  })
}


//获取当版本
export function getPubVersion() {
  return request({
    url: '/pub/spd/version',
    method: 'get',
    isNotTokent: true,
    showLoading: true,
  })
}

//登录-当前登录用户是否需要修改密码
export function isChangePassword() {
  return request({
    url: '/pub/isChangePassword',
    method: 'get',
  })
}

//单点登录
export function singleLogin(data) {
  return request({
    url: '/pub/single',
    method: 'post',
    data,
  })
}
export function getDocIsPdfUrl(data) {
  return request({
    url: basicHost +  `/file/pdfPreview`,
    method: 'post',
    data,
    transformRequest: [
      function (data, headers) {
        return data
      }
    ]
  })
}

//导出Excel模板
export function exportExcel(params, btnCode) {
  return request({
    url: basicHost + `/file/download`,
    method: 'get',
    params,
    responseType: 'blob',
    btnCode
  })
}
