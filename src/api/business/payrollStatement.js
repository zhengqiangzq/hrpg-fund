import request from '@/utils/request'

export function pagePayrollStatement(params) {
    return request({
        url: '/business/payrollOrder/page',
        method: 'get',
        params,
        btnCode: 'payrollStatement:list'
    })
}export function pageDetailListPayrollStatement(params) {
    return request({
        url: '/business/payrollOrder/selectDetailPage',
        method: 'get',
        params,
        btnCode: 'payrollStatement:list'
    })
}
export function onePayrollStatement(id) {
    return request({
        url: `/business/payrollOrder/${id}`,
        method: 'get',
        btnCode: 'payrollStatement:list'
    })
}
export function allDetailPayrollStatement(params) {
    return request({
        url: '/business/payrollOrderDetail/all',
        method: 'get',
        params,
        btnCode: 'payrollStatement:list'
    })
}
export function addPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/add',
        method: 'post',
        data,
        btnCode: 'payrollStatement:add'
    })
}
export function modifyPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/modify',
        method: 'post',
        data,
        btnCode: 'payrollStatement:add'
    })
}
export function updatePayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/update',
        method: 'post',
        data,
        btnCode: 'payrollStatement:update'
    })
}
export function deletePayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/byDelete',
        method: 'post',
        data,
        btnCode: 'payrollStatement:delete'
    })
}
export function submitPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/submit',
        method: 'post',
        data,
        btnCode: 'payrollStatement:submit'
    })
}
export function revokePayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/revoke',
        method: 'post',
        data,
        btnCode: 'payrollStatement:revoke'
    })
}
export function invalidPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/invalid',
        method: 'post',
        data,
        btnCode: 'payrollStatement:invalid'
    })
}
export function approvedPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/approved',
        method: 'post',
        data,
        btnCode: 'payrollStatement:approved'
    })
}
export function rejectPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/reject',
        method: 'post',
        data,
        btnCode: 'payrollStatement:reject'
    })
}
export function refusePayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/refuse',
        method: 'post',
        data,
        btnCode: 'payrollStatement:refuse'
    })
}
export function exportPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'payrollStatement:export'
    })
}
export function exportDetailPayrollStatement(data) {
    return request({
        url: '/business/payrollOrderDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'payrollStatement:export'
    })
}
export function exportDetailListPayrollStatement(data) {
    return request({
        url: '/business/payrollOrder/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'payrollStatement:export'
    })
}
