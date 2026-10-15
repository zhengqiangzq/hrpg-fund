import request from '@/utils/request'

const _suffix = '/cash/accounting'

export function queryCashierUnitReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/query' + _suffix,
        method: 'post',
        data
    })
}
export function autoCompareCashierUnitReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/autoCompare' + _suffix,
        method: 'post',
        data
    })
}
export function cancelCompareCashierUnitReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/cancelCompare' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}
export function saveCompareCashierUnitReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/save' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}
export function checkCompareCashierUnitReconciliation(data) {
    return request({
        url: '/record/billRecordCompare/check' + _suffix + `/${data.fundsCompareAccountId}`,
        method: 'post',
        data
    })
}