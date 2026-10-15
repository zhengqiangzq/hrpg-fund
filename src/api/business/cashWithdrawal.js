import request from '@/utils/request'

export function pageCashWithdrawal(params) {
    return request({
        url: '/business/cashDrawOrder/page',
        method: 'get',
        params,
        btnCode: 'cashWithdrawal:list'
    })
}
export function oneCashWithdrawal(id) {
    return request({
        url: `/business/cashDrawOrder/${id}`,
        method: 'get',
        btnCode: 'cashWithdrawal:list'
    })
}
export function addCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/add',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:add'
    })
}
export function modifyCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/modify',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:add'
    })
}
export function updateCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/update',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:update'
    })
}
export function deleteCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/byDelete',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:delete'
    })
}
export function submitCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/submit',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:submit'
    })
}
export function revokeCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/revoke',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:revoke'
    })
}
export function invalidCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/invalid',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:invalid'
    })
}
export function approvedCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/approved',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:approved'
    })
}
export function rejectCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/reject',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:reject'
    })
}
export function refuseCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/refuse',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:refuse'
    })
}
export function confirmCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/settlementStatus',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:confirm'
    })
}
export function cancelCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/cancelSettlementStatus',
        method: 'post',
        data,
        btnCode: 'cashWithdrawal:confirm'
    })
}
export function exportCashWithdrawal(data) {
    return request({
        url: '/business/cashDrawOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'cashWithdrawal:export'
    })
}
