import request from '@/utils/request'

export function FundsPlanExecuteFlagpage(data) {
    return request({
        url: '/fundsPlanExecuteFlag/queryPageList',
        method: 'post',
        data,
        btnCode: 'executionMark:list'
    })
}
export function FundsPlanExecuteFlagexecuteFlag(data) {
    return request({
        url: '/fundsPlanExecuteFlag/executeFlag',
        method: 'post',
        data,
        btnCode: 'executionMark:mark'
    })
}
export function FundsPlanExecuteFlagrunAnalysisQuery(data) {
    return request({
        url: '/fundsPlanExecuteFlag/runAnalysisQuery',
        method: 'post',
        data,
        btnCode: 'executionMark:mark'
    })
}

export function fundsPlanPrepareexportExecuteFlag(data) {
    return request({
        url: '/fundsPlanExecuteFlag/exportExecuteFlag',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'executionMark:export'
    })
}

export function fundsPlanExecuteFlagexportAnalysis(data) {
    return request({
        url: '/fundsPlanExecuteFlag/exportAnalysis',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'executionMark:export'
    })
}
