import request from '@/utils/request'

export function pageOutsideStaff(params) {
    return request({
        url: '/base/outsideStaff/page',
        method: 'get',
        params,
        btnCode: 'outsideStaff:list'
    })
}

export function oneOutsideStaff(id) {
    return request({
        url: `/base/outsideStaff/${id}`,
        method: 'get',
        btnCode: 'outsideStaff:list'
    })
}

export function addOutsideStaff(data) {
    return request({
        url: '/base/outsideStaff',
        method: 'post',
        data,
        btnCode: 'outsideStaff:add'
    })
}

export function updateOutsideStaff(data) {
    return request({
        url: '/base/outsideStaff/byPost',
        method: 'post',
        data,
        btnCode: 'outsideStaff:update'
    })
}

export function deleteOutsideStaff(data) {
    return request({
        url: '/base/outsideStaff/byDelete',
        method: 'post',
        data,
        btnCode: 'outsideStaff:delete'
    })
}

export function exportOutsideStaff(data) {
    return request({
        url: '/base/outsideStaff/excel',
        method: 'post',
        data,
        responseType: 'blob',
        btnCode: 'outsideStaff:export'
    })
}