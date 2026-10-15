import request from '@/utils/request'

export function pageRegistrationSocialSecurityFund(params) {
    return request({
        url: '/business/socialOrder/page',
        method: 'get',
        params,
        btnCode: 'registrationSocialSecurityFund:list'
    })
}
export function pageDetailListRegistrationSocialSecurityFund(params) {
    return request({
        url: '/business/socialOrder/selectDetailPage',
        method: 'get',
        params,
        btnCode: 'registrationSocialSecurityFund:list'
    })
}
export function allDetailRegistrationSocialSecurityFund(params) {
    return request({
        url: '/business/socialOrderDetail/all',
        method: 'get',
        params,
        btnCode: 'registrationSocialSecurityFund:list'
    })
}
export function oneRegistrationSocialSecurityFund(id) {
    return request({
        url: `/business/socialOrder/${id}`,
        method: 'get',
        btnCode: 'registrationSocialSecurityFund:list'
    })
}
export function addRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrder/add',
        method: 'post',
        data,
        btnCode: 'registrationSocialSecurityFund:add'
    })
}
export function updateRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrder/update',
        method: 'post',
        data,
        btnCode: 'registrationSocialSecurityFund:update'
    })
}
export function deleteRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrder/byDelete',
        method: 'post',
        data,
        btnCode: 'registrationSocialSecurityFund:delete'
    })
}
export function confirmRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrder/settlementStatus',
        method: 'post',
        data,
        btnCode: 'registrationSocialSecurityFund:confirm'
    })
}
export function cancelRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrder/cancelSettlementStatus',
        method: 'post',
        data,
        btnCode: 'registrationSocialSecurityFund:confirm'
    })
}
export function exportRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'registrationSocialSecurityFund:export'
    })
}
export function exportDetailRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrderDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'registrationSocialSecurityFund:export'
    })
}
export function exportDetailListRegistrationSocialSecurityFund(data) {
    return request({
        url: '/business/socialOrder/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'registrationSocialSecurityFund:export'
    })
}