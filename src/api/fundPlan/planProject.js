import request from '@/utils/request'

export function pagePlanProject(data) {
  return request({
    url: '/fundsPlanItem/queryList',
    method: 'post',
    data,
    btnCode: 'planProject:list'
  })
}

export function addPlanProject(data) {
  return request({
    url: '/fundsPlanItem/insert',
    method: 'post',
    data,
    btnCode: 'planProject:add'
  })
}

export function updatePlanProject(data) {
  return request({
    url: '/fundsPlanItem/update',
    method: 'post',
    data,
    btnCode: 'planProject:update'
  })
}

export function PlanProjectDetail(id) {
  return request({
    url: '/fundsPlanItem/'+ id,
    method: 'get',
    btnCode: 'planProject:list'
  })
}

export function deletePlanProject(data) {
  return request({
    url: '/fundsPlanItem/byDelete',
    method: 'post',
    data,
    btnCode: 'planProject:byDelete'
  })
}

export function fundsPlanItemenable(data) {
  return request({
    url: '/fundsPlanItem/enable',
    method: 'post',
    data,
    btnCode: 'planProject:enable'
  })
}

export function fundsPlanItemdisEnable(data) {
  return request({
    url: '/fundsPlanItem/disEnable',
    method: 'post',
    data,
    btnCode: 'planProject:disable'
  })
}

export function fundsPlanItemformulaCheck(data) {
  return request({
    url: '/fundsPlanItem/formulaCheck',
    method: 'post',
    data,
    btnCode: 'planProject:list'
  })
}

export function exportPlanProject(data) {
  return request({
    url: '/fundsPlanItem/excel',
    method: 'post',
    data,
    responseType: 'blob',
    btnCode: 'planProject:export'
  })
}
