import request from '@/utils/request'

export function AccountControlRuleQueryBalanceWarn(data) {
    return request({
        url: '/initial/AccountControlRule/queryBalanceWarn',
        method: 'post',
        data,
        btnCode: 'accountMaxBalanceWarning:list'
    })
}
export function AccountControlRuleQueryBalanceWarnExcel(data) {
    return request({
        url: '/initial/AccountControlRule/exportBalanceWarnExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountMaxBalanceWarning:export'
    })
}
