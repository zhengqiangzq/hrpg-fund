import request from '@/utils/request'


//  ---------------------  收费项目关系  ---------------------------
// 列表
export function itemfeeRelation(params) {
    return request({
        url: '/item/feeRelation',
        method: 'get',
        params,
    })
}


//新增
export function itemfeeRelationadd(data) {
    return request({
        url: '/item/feeRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function itemfeeRelationupdate(data) {
    return request({
        url: '/item/feeRelation/update',
        method: 'post',
        data
    })
}

//删除
export function itemfeeRelationdel(data) {
    return request({
        url: '/item/feeRelation/del',
        method: 'post',
        data
    })
}


// 计算
export function itemfeeRelationcollection(id) {
    return request({
        url: '/item/feeRelation/collection/' + id,
        method: 'get',
    })
}

// 导出
export function itemfeeRelationexportExcel(params) {
    return request({
        url: '/item/feeRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

//   ---------------------  科室作业关系  ---------------------------

// 列表
export function itemdeptWorkRelation(params) {
    return request({
        url: '/item/deptWorkRelation',
        method: 'get',
        params,
    })
}


//新增
export function itemdeptWorkRelationadd(data) {
    return request({
        url: '/item/deptWorkRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function itemdeptWorkRelationupdate(data) {
    return request({
        url: '/item/deptWorkRelation/update',
        method: 'post',
        data
    })
}

//删除
export function itemdeptWorkRelationdel(data) {
    return request({
        url: '/item/deptWorkRelation/del',
        method: 'post',
        data
    })
}

// 导出
export function itemdeptWorkRelationexportExcel(params) {
    return request({
        url: '/item/deptWorkRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}








