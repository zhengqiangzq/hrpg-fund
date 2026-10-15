import request from '@/utils/request'

export function pageUnitJournal(data) {
    return request({
        url: '/record/accountingBillRecord/query/after',
        method: 'post',
        data,
        btnCode: 'unitJournal:list'
    })
}
export function addUnitJournal(data) {
    return request({
        url: '/record/accountingBillRecord/save/after',
        method: 'post',
        data,
        btnCode: 'unitJournal:add'
    })
}
export function updateUnitJournal(data) {
    return request({
        url: '/record/accountingBillRecord/update/after',
        method: 'post',
        data,
        btnCode: 'unitJournal:update'
    })
}
export function deleteUnitJournal(data) {
    return request({
        url: '/record/accountingBillRecord/after',
        method: 'post',
        data,
        btnCode: 'unitJournal:delete'
    })
}
export function confirmUnitJournal(data) {
    return request({
        url: '/record/accountingBillRecord/confirm/after',
        method: 'post',
        data,
        btnCode: 'unitJournal:confirm'
    })
}
export function cancelUnitJournal(data) {
    return request({
        url: '/record/accountingBillRecord/cancel/after',
        method: 'post',
        data,
        btnCode: 'unitJournal:confirm'
    })
}
export function mergeUnitJournal(params) {
    return request({
        url: '/record/accountingBillRecord/merge',
        method: 'get',
        params,
        btnCode: 'unitJournal:confirm'
    })
}
export function exportUnitJournal(data) {
    return request({
        url: '/record/accountingBillRecord/exportExcel/after',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'unitJournal:export'
    })
}