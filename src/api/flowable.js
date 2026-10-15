import request from '@/utils/request'

const basicHost = import.meta.env.VITE_APP_BASIC_API

// 获取流程图当前节点审批信息
export function getCurrentItem(params) {
  return request({
    url: basicHost + '/flowOperation/selectByProcessInstanceIdAndTaskId',
    method: 'get',
    params: params,
  })
}
// 除第一节点外获得操作按钮
export function getViewRuntimeTaskInfo(params) {
  return request({
    url: basicHost + '/flowOperation/viewRuntimeTaskInfo',
    method: 'get',
    params: params,
  })
}
// 保存非第一节点
export function submitUserTask(params) {
  return request({
    url: basicHost + '/flowOperation/submitUserTask',
    method: 'post',
    data: params,
  })
}
// 获取表单ID，通过表单ID请求对应的表单
export function getBusinessKeyByProcessInstance(params) {
  return request({
    url: basicHost + '/flowOperation/selectBusinessDataId',
    method: 'get',
    params: params,
  })
}
// 获取流程图接口
export function getProcessBpmn(params) {
  return request({
    url: basicHost + '/flowOperation/viewProcessBpmn',
    method: 'get',
    params: params,
  })
}
// 获取流程图状态
export function viewHighlightFlowData(params) {
  return request({
    url: basicHost + '/flowOperation/viewHighlightFlowData',
    method: 'get',
    params: params,
  })
}
// 获取流程图审批记录 processInstanceId: d129fbdf-dc95-11ec-993a-fa163ecf322e
export function listFlowTaskComment(params) {
  return request({
    url: basicHost + '/flowOperation/listFlowTaskComment',
    method: 'get',
    params: params,
  })
}
// 获取展示表单
export function getFormComponent(params) {
  return request({
    url: basicHost + '/flow/task/selectRouter',
    method: 'get',
    params: params,
  })
}
// 获取已审批节点
export function getProcessAllTasks(params) {
  return request({
    url: basicHost + '/flowOperation/selectProcessTasks',
    method: 'get',
    params: params,
  })
}
// 业务ID获取流程数据
export function getBusinessKeyById(params) {
  return request({
    url: basicHost + '/flowOperation/selectByBusinessKey',
    method: 'get',
    params: params,
  })
}
