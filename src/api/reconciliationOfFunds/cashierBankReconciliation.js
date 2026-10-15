import request from '@/utils/request'

const _suffix = '/cash/bank'

export function queryCashierBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/query' + _suffix,
        method: 'post',
        data
    })
}
export function autoCompareCashierBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/autoCompare' + _suffix,
        method: 'post',
        data
    })
}
export function cancelCompareCashierBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/cancelCompare' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}
export function saveCompareCashierBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/save' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}
export function checkCompareCashierBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/check' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}