import request from '@/utils/request'

export function pageNotesPayableManagement(data) {
    return request({
        url: '/cheque/payableCheque/query/after',
        method: 'post',
        data,
        btnCode: 'notesPayableManagement:list'
    })
}
export function pageNotesPayable(data) {
    return request({
        url: '/cheque/payableCheque/query',
        method: 'post',
        data,
        btnCode: 'notesPayableManagement:list'
    })
}
export function addNotesPayableManagement(data) {
    return request({
        url: '/cheque/payableCheque/save/after',
        method: 'post',
        data,
        btnCode: 'notesPayableManagement:add'
    })
}
export function updateNotesPayableManagement(data) {
    return request({
        url: '/cheque/payableCheque/update/after',
        method: 'post',
        data,
        btnCode: 'notesPayableManagement:update'
    })
}
export function deleteNotesPayableManagement(data) {
    return request({
        url: '/cheque/payableCheque/after',
        method: 'post',
        data,
        btnCode: 'notesPayableManagement:delete'
    })
}
export function confirmNotesPayableManagement(data) {
    return request({
        url: '/cheque/payableCheque/confirm/after',
        method: 'post',
        data,
        btnCode: 'notesPayableManagement:confirm'
    })
}
export function cancelNotesPayableManagement(data) {
    return request({
        url: '/cheque/payableCheque/cancel/after',
        method: 'post',
        data,
        btnCode: 'notesPayableManagement:confirm'
    })
}
export function exportNotesPayableManagement(data) {
    return request({
        url: '/cheque/payableCheque/exportExcel/after',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'notesPayableManagement:export'
    })
}