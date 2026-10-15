import request from '@/utils/request'

export function allBalanceCheck(params) {
    return request({
        url: `/compare/fundsCompareAccount/beginBalanceVerify`,
        method: 'get',
        params,
        btnCode: 'balanceCheck:list'
    })
}
export function exportBalanceCheck(params) {
    return request({
        url: '/compare/fundsCompareAccount/exportBeginBalanceVerifyExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'balanceCheck:export'
    })
}