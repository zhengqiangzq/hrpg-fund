import request from '@/utils/request'

export function pageCashiersJournal(data) {
    return request({
        url: '/record/cashBillRecord/query',
        method: 'post',
        data,
        btnCode: 'cashiersJournal:list'
    })
}
export function addCashiersJournal(data) {
    return request({
        url: '/record/cashBillRecord/save',
        method: 'post',
        data,
        btnCode: 'cashiersJournal:add'
    })
}
export function updateCashiersJournal(data) {
    return request({
        url: '/record/cashBillRecord/update',
        method: 'post',
        data,
        btnCode: 'cashiersJournal:update'
    })
}
export function deleteCashiersJournal(data) {
    return request({
        url: '/record/cashBillRecord',
        method: 'post',
        data,
        btnCode: 'cashiersJournal:delete'
    })
}
export function confirmCashiersJournal(data) {
    return request({
        url: '/record/cashBillRecord/confirm',
        method: 'post',
        data,
        btnCode: 'cashiersJournal:confirm'
    })
}
export function cancelCashiersJournal(data) {
    return request({
        url: '/record/cashBillRecord/cancel',
        method: 'post',
        data,
        btnCode: 'cashiersJournal:confirm'
    })
}
export function collectCashiersJournal(params) {
    return request({
        url: '/record/cashBillRecord/merge',
        method: 'get',
        params,
        btnCode: 'cashiersJournal:collect'
    })
}
export function exportCashiersJournal(data) {
    return request({
        url: '/record/cashBillRecord/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'cashiersJournal:export'
    })
}