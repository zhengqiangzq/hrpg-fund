import request from '@/utils/request'

export function pageBillType(params) {
    return request({
        url: '/cheque/type/page',
        method: 'get',
        params,
        btnCode: 'billType:list'
    })
}
export function allBillType(params) {
    return request({
        url: '/cheque/type/all',
        method: 'get',
        params,
        btnCode: 'billType:list'
    })
}
export function oneBillType(id) {
    return request({
        url: `/cheque/type/${id}`,
        method: 'get',
        btnCode: 'billType:list'
    })
}
export function addBillType(data) {
    return request({
        url: '/cheque/type',
        method: 'post',
        data,
        btnCode: 'billType:add'
    })
}
export function updateBillType(data) {
    return request({
        url: '/cheque/type/byPost',
        method: 'post',
        data,
        btnCode: 'billType:update'
    })
}
export function deleteBillType(data) {
    return request({
        url: '/cheque/type/byDelete',
        method: 'post',
        data,
        btnCode: 'billType:delete'
    })
}

export function enableBillType(data) {
    return request({
        url: '/cheque/type/enable',
        method: 'post',
        data,
        btnCode: 'billType:enable'
    })
}


export function disableBillType(data) {
    return request({
        url: '/cheque/type/disable',
        method: 'post',
        data,
        btnCode: 'billType:disable'
    })
}

export function chequetypeexcel(data) {
    return request({
        url: '/cheque/type/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'cashDeposit:export'
    })
}
