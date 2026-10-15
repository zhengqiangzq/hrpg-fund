import request from '@/utils/request'

export function pagePayrollRequisition(params) {
    return request({
        url: '/business/payOutOrder/page',
        method: 'get',
        params,
        btnCode: 'payrollRequisition:list'
    })
}

export function confirmPayrollRequisition(data) {
    return request({
        url: '/business/payOutOrder/settlementStatus',
        method: 'post',
        data,
        btnCode: 'payrollRequisition:confirm'
    })
}

export function cancelPayrollRequisition(data) {
    return request({
        url: '/business/payOutOrder/cancelSettlementStatus',
        method: 'post',
        data,
        btnCode: 'payrollRequisition:confirm'
    })
}

export function allPayrollRequisitionDetail(params) {
    return request({
        url: '/business/payOutOrderDetail/all',
        method: 'get',
        params,
        btnCode: 'payrollRequisition:list'
    })
}

export function exportPayrollRequisition(data) {
    return request({
        url: '/business/payOutOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'payrollRequisition:export'
    })
}