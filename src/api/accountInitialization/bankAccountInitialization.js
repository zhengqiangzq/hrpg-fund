import request from '@/utils/request'

export function pageBankAccountInitialization(params) {
    return request({
        url: '/initial/bankAccount/page',
        method: 'get',
        params,
        btnCode: 'bankAccountInitialization:list'
    })
}
export function oneBankAccountInitialization(id) {
    return request({
        url: `/initial/bankAccount/${id}`,
        method: 'get',
        btnCode: 'bankAccountInitialization:list'
    })
}
export function addBankAccountInitialization(data) {
    return request({
        url: '/initial/bankAccount',
        method: 'post',
        data,
        btnCode: 'bankAccountInitialization:add'
    })
}
export function updateBankAccountInitialization(data) {
    return request({
        url: '/initial/bankAccount/byPost',
        method: 'post',
        data,
        btnCode: 'bankAccountInitialization:update'
    })
}
export function deleteBankAccountInitialization(data) {
    return request({
        url: '/initial/bankAccount/byDelete',
        method: 'post',
        data,
        btnCode: 'bankAccountInitialization:delete'
    })
}
export function confirmBankAccountInitialization(flag, data) {
    return request({
        url: flag === 'cancel' ? '/initial/bankAccount/cancelConfirm' : '/initial/bankAccount/confirm',
        method: 'post',
        data,
        btnCode: 'bankAccountInitialization:confirm'
    })
}
export function enableBankAccountInitialization(flag, data) {
    return request({
        url: flag === 'disabled' ? '/initial/bankAccount/disable' : '/initial/bankAccount/enable',
        method: 'post',
        data,
        btnCode: 'bankAccountInitialization:enable'
    })
}
export function exportBankAccountInitialization(data) {
    return request({
        url: '/initial/bankAccount/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'bankAccountInitialization:export'
    })
}