import request from '@/utils/request'

export function pageBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/query/after',
        method: 'post',
        data,
        btnCode: 'bankStatement:list'
    })
}
export function addBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/save/after',
        method: 'post',
        data,
        btnCode: 'bankStatement:add'
    })
}
export function downloadBMPBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/bmpDownload',
        method: 'post',
        data,
        btnCode: 'bankStatement:download'
    })
}
export function updateBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/update/after',
        method: 'post',
        data,
        btnCode: 'bankStatement:update'
    })
}
export function deleteBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/after',
        method: 'post',
        data,
        btnCode: 'bankStatement:delete'
    })
}
export function confirmBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/confirm/after',
        method: 'post',
        data,
        btnCode: 'bankStatement:confirm'
    })
}
export function cancelBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/cancel/after',
        method: 'post',
        data,
        btnCode: 'bankStatement:confirm'
    })
}

export function bankBillRecordDownload(data) {
    return request({
        url: '/record/bankBillRecord/bmpDownload',
        method: 'post',
        data,
        btnCode: 'bankStatement:confirm'
    })
}
export function exportBankStatement(data) {
    return request({
        url: '/record/bankBillRecord/exportExcel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'bankStatement:export'
    })
}
