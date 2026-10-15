import request from '@/utils/request'

const _suffix = '/accounting/bank'

export function queryUnitBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/query' + _suffix,
        method: 'post',
        data
    })
}
export function autoCompareUnitBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/autoCompare' + _suffix,
        method: 'post',
        data
    })
}
export function cancelCompareUnitBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/cancelCompare' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}
export function saveCompareUnitBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/save' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}
export function checkCompareUnitBankReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/check' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}