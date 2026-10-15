import request from '@/utils/request'

export function fundsPlanPreparePage(params) {
  return request({
    url: '/fundsPlanPrepare/page',
    method: 'get',
    params,
    btnCode: 'planPreparation:list'
  })
}
export function fundsPlanPrepareDetailPage(data) {
  return request({
    url: '/fundsPlanPrepare/queryPrepareDetail',
    method: 'post',
    data,
    btnCode: 'planPreparation:list'
  })
}

export function fundsPlanPrepareinsert(data) {
  return request({
    url: '/fundsPlanPrepare/insert',
    method: 'post',
    data,
    btnCode: 'planPreparation:add'
  })
}

export function fundsPlanPrepareupdate(data) {
  return request({
    url: '/fundsPlanPrepare/update',
    method: 'post',
    data,
    btnCode: 'planPreparation:update'
  })
}

export function fundsPlanPreparedelete(data) {
  return request({
    url: '/fundsPlanPrepare/byDelete',
    method: 'post',
    data,
    btnCode: 'planPreparation:delete'
  })
}

export function fundsPlanPreparedetail(params) {
  return request({
    url: '/fundsPlanPrepare/queryDetailByPrepareId',
    method: 'get',
    params,
    btnCode: 'planPreparation:list'
  })
}

export function fundsPlanPrepareOrder(data) {
  return request({
    url: '/fundsPlanPrepare/queryBusinessPayOutOrder',
    method: 'post',
    data,
    btnCode: 'planPreparation:list'
  })
}

export function fundsPlanPreparesure(data) {
  return request({
    url: '/fundsPlanPrepare/sure',
    method: 'post',
    data,
    btnCode: 'planPreparation:confirm'
  })
}

export function fundsPlanPrepareunSure(data) {
  return request({
    url: '/fundsPlanPrepare/unSure',
    method: 'post',
    data,
    btnCode: 'planPreparation:unconfirm'
  })
}

export function fundsPlanPreparelinkedCalculation(data) {
  return request({
    url: '/fundsPlanPrepare/linkedCalculation',
    method: 'post',
    data,
    btnCode: 'planPreparation:list'
  })
}

export function fundsPlanPrepareexport(data) {
  return request({
    url: '/fundsPlanPrepare/excelList',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode: 'planPreparation:export'
  })
}

export function fundsPlanPrepareexcelDetailList(data) {
  return request({
    url: '/fundsPlanPrepare/excelDetailList',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode: 'planPreparation:export'
  })
}
