import request from '@/utils/request'

export function listCashAccountJournal(params) {
    return request({
        url: '/account/cashAccountStatisticalReport',
        method: 'get',
        params,
        btnCode: 'cashAccountJournal:list'
    })
}
export function exportCashAccountJournal(params) {
    return request({
        url: '/account/exportCashAccountStatisticalReport',
        method: 'get',
        params,
        responseType: 'blob',
        btnCode: 'cashAccountJournal:export'
    })
}