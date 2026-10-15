import request from '@/utils/request'

export function pageNotReachedUnit(data) {
    return request({
        url: '/record/accountingBillRecord/query/begin',
        method: 'post',
        data,
        btnCode: 'notReachedUnit:list'
    })
}
export function addNotReachedUnit(data) {
    return request({
        url: '/record/accountingBillRecord/save/begin',
        method: 'post',
        data,
        btnCode: 'notReachedUnit:add'
    })
}
export function updateNotReachedUnit(data) {
    return request({
        url: '/record/accountingBillRecord/update/begin',
        method: 'post',
        data,
        btnCode: 'notReachedUnit:update'
    })
}
export function deleteNotReachedUnit(data) {
    return request({
        url: '/record/accountingBillRecord/begin',
        method: 'post',
        data,
        btnCode: 'notReachedUnit:delete'
    })
}
export function confirmNotReachedUnit(data) {
    return request({
        url: '/record/accountingBillRecord/confirm/begin',
        method: 'post',
        data,
        btnCode: 'notReachedUnit:confirm'
    })
}
export function cancelNotReachedUnit(data) {
    return request({
        url: '/record/accountingBillRecord/cancel/begin',
        method: 'post',
        data,
        btnCode: 'notReachedUnit:confirm'
    })
}
export function exportNotReachedUnit(data) {
    return request({
        url: '/record/accountingBillRecord/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'notReachedUnit:export'
    })
}
