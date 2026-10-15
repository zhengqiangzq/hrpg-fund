import request from '@/utils/request'

export function pageBankTransfer(params) {
    return request({
        url: '/business/bankOrder/page',
        method: 'get',
        params,
        btnCode: 'bankTransfer:list'
    })
}
export function oneBankTransfer(id) {
    return request({
        url: `/business/bankOrder/${id}`,
        method: 'get',
        btnCode: 'bankTransfer:list'
    })
}
export function addBankTransfer(data) {
    return request({
        url: '/business/bankOrder/add',
        method: 'post',
        data,
        btnCode: 'bankTransfer:add'
    })
}
export function modifyBankTransfer(data) {
    return request({
        url: '/business/bankOrder/modify',
        method: 'post',
        data,
        btnCode: 'bankTransfer:add'
    })
}
export function updateBankTransfer(data) {
    return request({
        url: '/business/bankOrder/update',
        method: 'post',
        data,
        btnCode: 'bankTransfer:update'
    })
}
export function deleteBankTransfer(data) {
    return request({
        url: '/business/bankOrder/byDelete',
        method: 'post',
        data,
        btnCode: 'bankTransfer:delete'
    })
}
export function submitBankTransfer(data) {
    return request({
        url: '/business/bankOrder/submit',
        method: 'post',
        data,
        btnCode: 'bankTransfer:submit'
    })
}
export function revokeBankTransfer(data) {
    return request({
        url: '/business/bankOrder/revoke',
        method: 'post',
        data,
        btnCode: 'bankTransfer:revoke'
    })
}
export function approvedBankTransfer(data) {
    return request({
        url: '/business/bankOrder/approved',
        method: 'post',
        data,
        btnCode: 'bankTransfer:approved'
    })
}
export function rejectBankTransfer(data) {
    return request({
        url: '/business/bankOrder/reject',
        method: 'post',
        data,
        btnCode: 'bankTransfer:reject'
    })
}
export function refuseBankTransfer(data) {
    return request({
        url: '/business/bankOrder/refuse',
        method: 'post',
        data,
        btnCode: 'bankTransfer:refuse'
    })
}
export function invalidBankTransfer(data) {
    return request({
        url: '/business/bankOrder/invalid',
        method: 'post',
        data,
        btnCode: 'bankTransfer:invalid'
    })
}
export function exportBankTransfer(data) {
    return request({
        url: '/business/bankOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'bankTransfer:export'
    })
}
