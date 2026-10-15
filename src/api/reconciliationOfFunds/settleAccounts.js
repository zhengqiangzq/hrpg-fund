import request from '@/utils/request'

export function listSettleAccounts(params) {
    return request({
        url: '/compare/closeBillCompare/queryList',
        method: 'get',
        params,
        btnCode: 'settleAccounts:list'
    })
}
export function closeSettleAccounts(data) {
    return request({
        url: `/compare/closeBillCompare/monthClose/${data.id}`,
        method: 'post',
        btnCode: 'settleAccounts:confirm'
    })
}
export function reCloseSettleAccounts(data) {
    return request({
        url: `/compare/closeBillCompare/monthAntiClose/${data.id}`,
        method: 'post',
        btnCode: 'settleAccounts:confirm'
    })
}
export function closeCheckSettleAccounts(data) {
    return request({
        url: `/compare/closeBillCompare/monthCloseValidate/${data.id}`,
        method: 'post',
        btnCode: 'settleAccounts:confirm'
    })
}
export function reCloseCheckSettleAccounts(data) {
    return request({
        url: `/compare/closeBillCompare/antiCloseCheck/${data.id}`,
        method: 'post',
        btnCode: 'settleAccounts:confirm'
    })
}