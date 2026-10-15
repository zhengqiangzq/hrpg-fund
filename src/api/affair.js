import request from '@/utils/request'

const prePath = '/affair'

//单据流水
export function orderAffairAll(params) {
  params.sort = 'operate_time desc,id desc'
  return request({
    url: prePath + '/orderAffairs/all',
    method: 'get',
    params,
  })
}

export function orderSpdAffairAll(params) {
  params.sort = 'operate_time desc,id desc'
  return request({
    url: '/spd' + prePath + '/orderAffairs/all',
    method: 'get',
    params,
  })
}

//单据流水
export function orderOpAffairAll(params) {
  params.sort = 'operate_time desc,id desc'
  return request({
    url: prePath + '/orderOperateAffairs/all',
    method: 'get',
    params,
  })
}
