import request from '@/utils/request'

export function pageNotReachedBank(data) {
    return request({
        url: '/record/bankBillRecord/query/begin',
        method: 'post',
        data,
        btnCode: 'notReachedBank:list'
    })
}
export function addNotReachedBank(data) {
    return request({
        url: '/record/bankBillRecord/save/begin',
        method: 'post',
        data,
        btnCode: 'notReachedBank:add'
    })
}
export function updateNotReachedBank(data) {
    return request({
        url: '/record/bankBillRecord/update/begin',
        method: 'post',
        data,
        btnCode: 'notReachedBank:update'
    })
}
export function deleteNotReachedBank(data) {
    return request({
        url: '/record/bankBillRecord/begin',
        method: 'post',
        data,
        btnCode: 'notReachedBank:delete'
    })
}
export function confirmNotReachedBank(data) {
    return request({
        url: '/record/bankBillRecord/confirm/begin',
        method: 'post',
        data,
        btnCode: 'notReachedBank:confirm'
    })
}
export function cancelNotReachedBank(data) {
    return request({
        url: '/record/bankBillRecord/cancel/begin',
        method: 'post',
        data,
        btnCode: 'notReachedBank:confirm'
    })
}
export function exportNotReachedBank(data) {
    return request({
        url: '/record/bankBillRecord/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'notReachedBank:export'
    })
}
