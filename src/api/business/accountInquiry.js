import request from '@/utils/request'

export function allAccountBalance(params) {
    return request({
        url: '/account/accountBalance',
        method: 'get',
        params,
        btnCode: 'accountBalanceStatement:list'
    })
}
export function exportAccountBalance(data) {
    return request({
        url: '/account/accountBalance/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountBalanceStatement:export'
    })
}
export function allBalance(params) {
    return request({
        url: '/account/balance',
        method: 'get',
        params,
        btnCode: 'accountBalanceInquiry:list'
    })
}
export function exportBalance(data) {
    return request({
        url: '/account/balance/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountBalanceInquiry:export'
    })
}
export function allAccountDetail(params) {
    return request({
        url: '/account/accountDetail',
        method: 'get',
        params,
        btnCode: 'accountDetailStatement:list'
    })
}
export function exportAccountDetail(data) {
    return request({
        url: '/account/accountDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountDetailStatement:export'
    })
}
export function pageProcessQuery(params) {
    return request({
        url: '/account/processQuery',
        method: 'get',
        params,
        btnCode: 'businessQueryInProcess:list'
    })
}
export function exportProcessQuery(data) {
    return request({
        url: '/account/processQuery/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'businessQueryInProcess:export'
    })
}