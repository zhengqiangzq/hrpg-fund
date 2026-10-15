import request from '@/utils/request'

export function allSystemInitialization(params) {
    return request({
        url: '/startConfig/all',
        method: 'get',
        params,
        btnCode: 'systemInitialization:list'
    })
}
export function updateTimeSystemInitialization(data) {
    return request({
        url: '/startConfig/initStartTime',
        method: 'post',
        data,
        btnCode: 'systemInitialization:update'
    })
}