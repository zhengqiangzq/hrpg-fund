import request from '@/utils/request'

// 我的申请分页查询
export function getTaskPage(params) {
  return request({
    url: '/flow/task/apply/page',
    method: 'get',
    params,
  })
}

// 查询分类
export function getFlowCategoryTree() {
  return request({
    url: '/flowCategory/tree',
    method: 'get',
  })
}

// 待办事项分页查询
export function getTodoPage(params) {
  return request({
    url: '/flow/task/todo/page',
    method: 'get',
    params,
  })
}

// 已办事项分页查询
export function getFinishPage(params) {
  return request({
    url: '/flow/task/finish/page',
    method: 'get',
    params,
  })
}