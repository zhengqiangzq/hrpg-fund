import request from '@/utils/request'

export function pageCollectionBusiness(params) {
    return request({
        url: '/business/collectionOrder/page',
        method: 'get',
        params,
        btnCode: 'collectionBusiness:list'
    })
}
export function pageDetailListCollectionBusiness(params) {
    return request({
        url: '/business/collectionOrder/selectDetailPage',
        method: 'get',
        params,
        btnCode: 'collectionBusiness:list'
    })
}
export function allDetailCollectionBusiness(params) {
    return request({
        url: `/business/collectionOrderDetail/all`,
        method: 'get',
        params,
        btnCode: 'collectionBusiness:list'
    })
}
export function oneCollectionBusiness(id) {
    return request({
        url: `/business/collectionOrder/${id}`,
        method: 'get',
        btnCode: 'collectionBusiness:list'
    })
}
export function addCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrder/add',
        method: 'post',
        data,
        btnCode: 'collectionBusiness:add'
    })
}
export function updateCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrder/update',
        method: 'post',
        data,
        btnCode: 'collectionBusiness:update'
    })
}
export function deleteCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrder/byDelete',
        method: 'post',
        data,
        btnCode: 'collectionBusiness:delete'
    })
}
export function confirmCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrder/confirm',
        method: 'post',
        data,
        btnCode: 'collectionBusiness:confirm'
    })
}
export function cancelCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrder/cancelConfirm',
        method: 'post',
        data,
        btnCode: 'collectionBusiness:confirm'
    })
}
export function exportCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrder/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'collectionBusiness:export'
    })
}
export function exportDetailCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrderDetail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'collectionBusiness:export'
    })
}
export function exportDetailListCollectionBusiness(data) {
    return request({
        url: '/business/collectionOrder/detail/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'collectionBusiness:export'
    })
}