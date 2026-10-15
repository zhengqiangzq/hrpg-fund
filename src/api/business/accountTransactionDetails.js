import request from '@/utils/request'

export function pageAccountTransactionDetails(params) {
    return request({
        url: '/business/accountDetail/page',
        method: 'get',
        params,
        btnCode: 'accountTransactionDetails:list'
    })
}
export function downloadAccountTransactionDetails(data) {
    return request({
        url: '/business/accountDetail/download',
        method: 'post',
        data,
        btnCode: 'accountTransactionDetails:download'
    })
}
export function accountDetailbyDelete(data) {
    return request({
        url: '/business/accountDetail/byDelete',
        method: 'post',
        data,
        btnCode: 'accountTransactionDetails:delete'
    })
}
export function buildAccountTransactionDetails(data) {
    return request({
        url: '/business/accountDetail/addBusinessCollectionOrderVO',
        method: 'post',
        data,
        btnCode: 'accountTransactionDetails:build'
    })
}
export function exportAccountTransactionDetails(data) {
    return request({
        url: '/business/accountDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountTransactionDetails:export'
    })
}
