import request from '@/utils/request'

export function pageAccountBalance(params) {
    return request({
        url: '/link/bankAccount/page',
        method: 'get',
        params,
        btnCode: 'accountBalance:list'
    })
}

export function downloadAccountBalance(data) {
    return request({
        url: '/link/bankAccount/bmpBalanceDownload',
        method: 'post',
        data,
        btnCode: 'accountBalance:download'
    })
}
export function exportAccountBalance(data) {
    return request({
        url: '/link/bankAccount/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'accountBalance:export'
    })
}