import request from '@/utils/request'

export function listBankAccountJournal(params) {
    return request({
        url: '/account/bankAccountStatisticalReport',
        method: 'get',
        params,
        btnCode: 'bankAccountJournal:list'
    })
}
export function exportBankAccountJournal(params) {
    return request({
        url: '/account/exportBankAccountStatisticalReport',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'bankAccountJournal:export'
    })
}