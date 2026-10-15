import request from '@/utils/request'

export function treeOutsideStaffClass(params) {
    return request({
        url: '/base/outsideStaffClass/tree',
        method: 'get',
        params,
        btnCode: 'outsideStaffType:list'
    })
}

export function oneOutSideStaffClass(id) {
    return request({
        url: `/base/outsideStaffClass/${id}`,
        method: 'get',
        btnCode: 'outsideStaffType:list'
    })
}

export function addOutsideStaffClass(data) {
    return request({
        url: '/base/outsideStaffClass',
        method: 'post',
        data,
        btnCode: 'outsideStaffType:add'
    })
}

export function updateOutsideStaffClass(data) {
    return request({
        url: '/base/outsideStaffClass/byPost',
        method: 'post',
        data,
        btnCode: 'outsideStaffType:update'
    })
}

export function deleteOutsideStaffClass(data) {
    return request({
        url: '/base/outsideStaffClass/byDelete',
        method: 'post',
        data,
        btnCode: 'outsideStaffType:delete'
    })
}