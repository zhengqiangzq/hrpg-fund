import request from '@/utils/request'

export function allAccountBook(params) {
    return request({
        url: '/finance/getFinancialAccountBook',
        method: 'get',
        params
    })
}
export function pageAccountingSubject(params) {
    return request({
        url: '/finance/getFinancialAccountByFundsCompareAccountType',
        method: 'get',
        params
    })
}
export function pageAccassItem(params) {
    return request({
        url: '/finance/getFinancialAccassByAccountId',
        method: 'get',
        params
    })
}
export function pageVoucherType(params) {
    return request({
        url: '/finance/getFinancialVoucherType',
        method: 'get',
        params
    })
}
export function pageGetAccountAssistFile(params) {
    return request({
        url: '/finance/getAccountAssistFile',
        method: 'get',
        params
    })
}
