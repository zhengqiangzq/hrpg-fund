import request from '@/utils/request'
const prePath = '/initial/AccountControlRule'

export function accountControlRulePage(params) {
    return request({
        url: prePath + '/page',
        method: 'get',
        params,
        btnCode: params.btnCode
    })
}
export function accountControlRuleadd(data, btnCode) {
    return request({
        url: prePath + `/${data.accountType}/insert`,
        method: 'post',
        data,
        btnCode: btnCode
    })
}
export function accountControlRuleUpdate(data, btnCode) {
    return request({
        url: prePath + `/${data.accountType}/update`,
        method: 'post',
        data,
        btnCode: btnCode
    })
}
export function accountControlRuleDelete(data, btnCode) {
    return request({
        url: prePath,
        method: 'delete',
        data,
        btnCode: btnCode
    })
}
export function accountControlRuleExcel(data) {
    return request({
        url: prePath + `/${data.accountType}/excel`,
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: data.accountType === 1 ? `cashAccountRulesn:export` : `bankAccountRulesn:export`
    })
}
