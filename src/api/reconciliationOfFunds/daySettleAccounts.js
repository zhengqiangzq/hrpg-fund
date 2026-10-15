import request from '@/utils/request'

export function listDaySettleAccounts(params) {
    return request({
        url: `/compare/dayCloseBillCompare/queryList/${params.accountingPeriodId}`,
        method: 'get',
        btnCode: 'daySettleAccounts:list'
    })
}
export function closeDaySettleAccounts(data) {
    return request({
        url: `/compare/dayCloseBillCompare/dayClose/${data.id}`,
        method: 'post',
        btnCode: 'daySettleAccounts:confirm'
    })
}
export function reCloseDaySettleAccounts(data) {
    return request({
        url: `/compare/dayCloseBillCompare/dayAntiClose/${data.id}`,
        method: 'post',
        btnCode: 'daySettleAccounts:confirm'
    })
}
export function closeCheckDaySettleAccounts(data) {
    return request({
        url: `/compare/dayCloseBillCompare/dayCloseValidate/${data.id}`,
        method: 'post',
        btnCode: 'daySettleAccounts:confirm'
    })
}
export function reCloseCheckDaySettleAccounts(data) {
    return request({
        url: `/compare/dayCloseBillCompare/antiCloseCheck/${data.id}`,
        method: 'post',
        btnCode: 'daySettleAccounts:confirm'
    })
}