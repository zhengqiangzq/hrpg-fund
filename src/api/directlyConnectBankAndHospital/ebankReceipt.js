import request from '@/utils/request'

export function pageEbankReceipt(params) {
    return request({
        url: '/link/ebankReceipt/page',
        method: 'get',
        params,
        btnCode: 'ebankReceipt:list'
    })
}

export function oneEbankReceipt(id) {
    return request({
        url: `/link/ebankReceipt/${id}`,
        method: 'get',
    })
}

export function ebankReceiptStatusQuery(id) {
    return request({
        url: `/link/ebankReceipt/receipt/statusQuery/${id}`,
        method: 'get',
    })
}


export function downloadEbankReceipt(data) {
    return request({
        url: '/link/ebankReceipt/receipt/download',
        method: 'post',
        data,
        btnCode: 'ebankReceipt:download'
    })
}
export function exportEbankReceipt(data) {
    return request({
        url: '/link/ebankReceipt/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'ebankReceipt:export'
    })
}
