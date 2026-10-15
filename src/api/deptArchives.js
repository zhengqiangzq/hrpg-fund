import request from '@/utils/request'

// 查询科室档案树
export function treeDeptArchives(params) {
    return request({
        url: '/section/tree',
        method: 'get',
        params
    })
}