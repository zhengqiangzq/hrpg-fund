import request from '@/utils/request'

export function pageBusinessPaymentStatement(params) {
    return request({
        url: '/business/paymentOrder/page',
        method: 'get',
        params,
        btnCode: 'businessPaymentStatement:list'
    })
}
export function pageDetailListBusinessPaymentStatement(params) {
    return request({
        url: '/business/paymentOrder/selectDetailPage',
        method: 'get',
        params,
        btnCode: 'businessPaymentStatement:list'
    })
}

export function oneBusinessPaymentStatement(id) {
    return request({
        url: `/business/paymentOrder/${id}`,
        method: 'get',
        btnCode: 'businessPaymentStatement:list'
    })
}

export function allDetailBusinessPaymentStatement(params) {
    return request({
        url: '/business/paymentOrderDetail/all',
        method: 'get',
        params,
        btnCode: 'businessPaymentStatement:list'
    })
}

export function addBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/add',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:add'
    })
}

export function modifyBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/modify',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:add'
    })
}

export function updateBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/update',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:update'
    })
}

export function deleteBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/byDelete',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:delete'
    })
}

export function submitBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/submit',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:submit'
    })
}
export function approvedBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/approved',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:approved'
    })
}

export function rejectBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/reject',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:reject'
    })
}

export function refuseBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/refuse',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:refuse'
    })
}

export function revokeBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/revoke',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:revoke'
    })
}

export function invalidBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/invalid',
        method: 'post',
        data,
        btnCode: 'businessPaymentStatement:invalid'
    })
}

export function exportBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'businessPaymentStatement:export'
    })
}
export function exportDetailListBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrder/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'businessPaymentStatement:export'
    })
}

export function exportDetailBusinessPaymentStatement(data) {
    return request({
        url: '/business/paymentOrderDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'businessPaymentStatement:export'
    })
}
