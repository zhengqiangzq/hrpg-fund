import request from '@/utils/request'

export function listAccountMinBalanceWarning(params) {
    return request({
        url: '/initial/bankAccount/minBalanceWarn',
        method: 'get',
        params,
        btnCode: 'accountMinBalanceWarning:list'
    })
}
export function exportAccountMinBalanceWarning(params) {
    return request({
        url: '/initial/bankAccount/exportMinBalanceWarnExcel',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'accountMinBalanceWarning:export'
    })
}