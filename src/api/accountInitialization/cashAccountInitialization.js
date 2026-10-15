import request from '@/utils/request'

export function pageCashAccountInitialization(params) {
    return request({
        url: '/initial/cashAccount/page',
        method: 'get',
        params,
        btnCode: 'cashAccountInitialization:list'
    })
}
export function oneCashAccountInitialization(id) {
    return request({
        url: `/initial/cashAccount/${id}`,
        method: 'get',
        btnCode: 'cashAccountInitialization:list'
    })
}
export function addCashAccountInitialization(data) {
    return request({
        url: '/initial/cashAccount',
        method: 'post',
        data,
        btnCode: 'cashAccountInitialization:add'
    })
}
export function updateCashAccountInitialization(data) {
    return request({
        url: '/initial/cashAccount/byPost',
        method: 'post',
        data,
        btnCode: 'cashAccountInitialization:update'
    })
}
export function deleteCashAccountInitialization(data) {
    return request({
        url: '/initial/cashAccount/byDelete',
        method: 'post',
        data,
        btnCode: 'cashAccountInitialization:delete'
    })
}
export function confirmCashAccountInitialization(flag, data) {
    return request({
        url: flag === 'cancel' ? '/initial/cashAccount/cancelConfirm' : '/initial/cashAccount/confirm',
        method: 'post',
        data,
        btnCode: 'cashAccountInitialization:confirm'
    })
}
export function enableCashAccountInitialization(flag, data) {
    return request({
        url: flag === 'disabled' ? '/initial/cashAccount/disable' : '/initial/cashAccount/enable',
        method: 'post',
        data,
        btnCode: 'cashAccountInitialization:enable'
    })
}
export function exportCashAccountInitialization(data) {
    return request({
        url: '/initial/cashAccount/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'cashAccountInitialization:export'
    })
}