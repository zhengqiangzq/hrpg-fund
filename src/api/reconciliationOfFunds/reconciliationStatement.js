import request from '@/utils/request'

export function allReconciliationStatement(params) {
    return request({
        url: `/compare/fundsCompareAccount/balanceAdjust`,
        method: 'get',
        params,
        btnCode: 'reconciliationStatement:list'
    })
}
export function exportReconciliationStatement(params) {
    return request({
        url: '/compare/fundsCompareAccount/exportBalanceAdjustExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'reconciliationStatement:export'
    })
}