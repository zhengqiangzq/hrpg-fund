import request from '@/utils/request'

const prePath = ''

const basicHost = import.meta.env.VITE_APP_BASIC_API

// 用户列表
export function getUserList(data,btnCode) {
  return request({
    url: basicHost + '/user/list',
    method: 'post',
    data,
    btnCode,
  })
}
