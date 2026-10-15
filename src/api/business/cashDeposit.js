import request from '@/utils/request'

export function pageCashDeposit(params) {
    return request({
        url: '/business/cashDepositOrder/page',
        method: 'get',
        params,
        btnCode: 'cashDeposit:list'
    })
}
export function oneCashDeposit(id) {
    return request({
        url: `/business/cashDepositOrder/${id}`,
        method: 'get',
        btnCode: 'cashDeposit:list'
    })
}
export function addCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/add',
        method: 'post',
        data,
        btnCode: 'cashDeposit:add'
    })
}
export function modifyCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/modify',
        method: 'post',
        data,
        btnCode: 'cashDeposit:add'
    })
}
export function updateCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/update',
        method: 'post',
        data,
        btnCode: 'cashDeposit:update'
    })
}
export function deleteCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/byDelete',
        method: 'post',
        data,
        btnCode: 'cashDeposit:delete'
    })
}
export function submitCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/submit',
        method: 'post',
        data,
        btnCode: 'cashDeposit:submit'
    })
}
export function revokeCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/revoke',
        method: 'post',
        data,
        btnCode: 'cashDeposit:revoke'
    })
}
export function invalidCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/invalid',
        method: 'post',
        data,
        btnCode: 'cashDeposit:invalid'
    })
}
export function confirmCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/settlementStatus',
        method: 'post',
        data,
        btnCode: 'cashDeposit:confirm'
    })
}
export function approvedCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/approved',
        method: 'post',
        data,
        btnCode: 'cashDeposit:approved'
    })
}
export function rejectCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/reject',
        method: 'post',
        data,
        btnCode: 'cashDeposit:reject'
    })
}
export function refuseCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/refuse',
        method: 'post',
        data,
        btnCode: 'cashDeposit:refuse'
    })
}
export function cancelCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/cancelSettlementStatus',
        method: 'post',
        data,
        btnCode: 'cashDeposit:confirm'
    })
}
export function exportCashDeposit(data) {
    return request({
        url: '/business/cashDepositOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'cashDeposit:export'
    })
}
