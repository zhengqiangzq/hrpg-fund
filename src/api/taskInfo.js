import request from "@/utils/request"

export function pageTaskInfo(params) {
    return request({
        url: '/bmp/taskInfo/page',
        method: 'get',
        params,
    })
}

export function deleteTaskInfo(data) {
    return request({
        url: '/bmp/taskInfo/byDelete',
        method: 'post',
        data
    })
}