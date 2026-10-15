import request from '@/utils/request'

export function pageReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/page',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:list'
    })
}
export function pageDistinctReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/queryCompareAccountListNotFnPage',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:list'
    })
}
export function addReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/save',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:add'
    })
}
export function updateReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/update',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:update'
    })
}
export function updateReconciliationAccountGetById(params) {
    return request({
        url: '/compare/fundsCompareAccount/getById',
        method: 'get',
        params,
        btnCode: 'reconciliationAccountSetting:update'
    })
}
export function deleteReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/del',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:delete'
    })
}
export function enableReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/enable',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:enable'
    })
}
export function disableReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/disable',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:enable'
    })
}
export function checkoutReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/checkout',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:confirm'
    })
}
export function uncheckoutReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/uncheckout',
        method: 'post',
        data,
        btnCode: 'reconciliationAccountSetting:confirm'
    })
}
export function exportReconciliationAccountSetting(data) {
    return request({
        url: '/compare/fundsCompareAccount/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'reconciliationAccountSetting:export'
    })
}
