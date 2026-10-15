import request from '@/utils/request'

export function pageOnlinePayment(params) {
    return request({
        url: '/link/settlement/selectOnlinePage',
        method: 'get',
        params,
        btnCode: 'onlinePayment:list'
    })
}
export function payOnlinePayment(data) {
    return request({
        url: '/link/settlement/bmpPay',
        method: 'post',
        data,
        btnCode: 'onlinePayment:pay'
    })
}
export function exportOnlinePayment(data) {
    return request({
        url: '/link/settlement/online/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'onlinePayment:export'
    })
}