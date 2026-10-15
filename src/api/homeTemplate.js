import request from '@/utils/request'

const prePath = '/dashboard'

// 获取个人模板
export function getTemplateOrderUser(params) {
  return request({
    url: prePath + '/template/selectUserTemplate',
    method: 'get',
    params,
  })
}
