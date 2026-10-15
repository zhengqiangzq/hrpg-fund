import request from '@/utils/request'

export function pageInitialNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/query/begin',
        method: 'post',
        data,
        btnCode: 'initialNotesPayable:list'
    })
}
export function addInitialNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/save/begin',
        method: 'post',
        data,
        btnCode: 'initialNotesPayable:add'
    })
}
export function updateInitialNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/update/begin',
        method: 'post',
        data,
        btnCode: 'initialNotesPayable:update'
    })
}
export function deleteInitialNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/begin',
        method: 'post',
        data,
        btnCode: 'initialNotesPayable:delete'
    })
}
export function confirmInitialNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/confirm/begin',
        method: 'post',
        data,
        btnCode: 'initialNotesPayable:confirm'
    })
}
export function cancelInitialNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/cancel/begin',
        method: 'post',
        data,
        btnCode: 'initialNotesPayable:confirm'
    })
}
export function exportInitialNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/exportExcel/begin',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'initialNotesPayable:export'
    })
}