import request from '@/utils/request'

export function pagePaymentAndSettlement(params) {
    return request({
        url: '/link/settlement/selectPage',
        method: 'get',
        params,
        btnCode: 'paymentAndSettlement:list'
    })
}
export function pageDetailPaymentAndSettlement(params) {
    return request({
        url: '/link/settlement/selectDetailPage',
        method: 'get',
        params,
        btnCode: 'paymentAndSettlement:list'
    })
}
export function signPaymentAndSettlement(data) {
    return request({
        url: '/link/settlement/sign',
        method: 'post',
        data,
        btnCode: 'paymentAndSettlement:sign'
    })
}
export function cancelSignPaymentAndSettlement(data) {
    return request({
        url: '/link/settlement/cancelSign',
        method: 'post',
        data,
        btnCode: 'paymentAndSettlement:sign'
    })
}
export function settlementPaymentAndSettlement(data) {
    return request({
        url: '/link/settlement/settlementStatus',
        method: 'post',
        data,
        btnCode: 'paymentAndSettlement:confirm'
    })
}
export function cancelSettlementPaymentAndSettlement(data) {
    return request({
        url: '/link/settlement/cancelSettlementStatus',
        method: 'post',
        data,
        btnCode: 'paymentAndSettlement:confirm'
    })
}
export function exportPaymentAndSettlement(data) {
    return request({
        url: '/link/settlement/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'paymentAndSettlement:export'
    })
}
export function exportDetailPaymentAndSettlement(data) {
    return request({
        url: '/link/settlement/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'paymentAndSettlement:export'
    })
}