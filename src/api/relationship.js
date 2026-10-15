import request from '@/utils/request'


//  ---------------------  薪资项目关系  ---------------------------
// 列表
export function payrollItemRelationpage(data) {
    return request({
        url: '/payrollItemRelation/page',
        method: 'post',
        data,
    })
}


//新增
export function payrollItemRelationadd(data) {
    return request({
        url: '/payrollItemRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function payrollItemRelationupdate(data) {
    return request({
        url: '/payrollItemRelation/update',
        method: 'post',
        data
    })
}

//删除
export function payrollItemRelationdelete(data) {
    return request({
        url: '/payrollItemRelation/delete',
        method: 'post',
        data
    })
}


// 导出
export function payrollItemRelationexportExcel(params) {
    return request({
        url: '/payrollItemRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}


//  ---------------------  财务分类关系  ---------------------------
// 列表
export function proCategoryItemRelationpage(data) {
    return request({
        url: '/proCategoryItemRelation/page',
        method: 'post',
        data,
    })
}


//新增
export function proCategoryItemRelationadd(data) {
    return request({
        url: '/proCategoryItemRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function proCategoryItemRelationupdate(data) {
    return request({
        url: '/proCategoryItemRelation/update',
        method: 'post',
        data
    })
}

//删除
export function proCategoryItemRelationdelete(data) {
    return request({
        url: '/proCategoryItemRelation/delete',
        method: 'post',
        data
    })
}


// 导出
export function proCategoryItemRelationexportExcel(params) {
    return request({
        url: '/proCategoryItemRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}



//  ---------------------  药品分类关系  ---------------------------
// 列表
export function drugCategoryItemRelationpage(data) {
    return request({
        url: '/drugCategoryItemRelation/page',
        method: 'post',
        data,
    })
}


//新增
export function drugCategoryItemRelationadd(data) {
    return request({
        url: '/drugCategoryItemRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function drugCategoryItemRelationupdate(data) {
    return request({
        url: '/drugCategoryItemRelation/update',
        method: 'post',
        data
    })
}

//删除
export function drugCategoryItemRelationdelete(data) {
    return request({
        url: '/drugCategoryItemRelation/delete',
        method: 'post',
        data
    })
}


// 导出
export function drugCategoryItemRelationexportExcel(params) {
    return request({
        url: '/drugCategoryItemRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

//  ---------------------  资产分类关系  ---------------------------
// 列表
export function assetsCategoryItemRelationpage(data) {
    return request({
        url: '/assetsCategoryItemRelation/page',
        method: 'post',
        data,
    })
}


//新增
export function assetsCategoryItemRelationadd(data) {
    return request({
        url: '/assetsCategoryItemRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function assetsCategoryItemRelationupdate(data) {
    return request({
        url: '/assetsCategoryItemRelation/update',
        method: 'post',
        data
    })
}

//删除
export function assetsCategoryItemRelationdelete(data) {
    return request({
        url: '/assetsCategoryItemRelation/delete',
        method: 'post',
        data
    })
}


// 导出
export function assetsCategoryItemRelationexportExcel(params) {
    return request({
        url: '/assetsCategoryItemRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

//  ---------------------  收费物资关系  ---------------------------
// 列表
export function chargeProductRelationpage(data) {
    return request({
        url: '/chargeProductRelation/page',
        method: 'post',
        data,
    })
}


//新增
export function chargeProductRelationadd(data) {
    return request({
        url: '/chargeProductRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function chargeProductRelationupdate(data) {
    return request({
        url: '/chargeProductRelation/update',
        method: 'post',
        data
    })
}

//删除
export function chargeProductRelationdelete(data) {
    return request({
        url: '/chargeProductRelation/delete',
        method: 'post',
        data
    })
}


// 导出
export function chargeProductRelationexportExcel(params) {
    return request({
        url: '/chargeProductRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

//  ---------------------  收费药品关系  ---------------------------
// 列表
export function chargeDrugRelationpage(data) {
    return request({
        url: '/chargeDrugRelation/page',
        method: 'post',
        data,
    })
}


//新增
export function chargeDrugRelationadd(data) {
    return request({
        url: '/chargeDrugRelation/add',
        method: 'post',
        data
    })
}


//编辑
export function chargeDrugRelationupdate(data) {
    return request({
        url: '/chargeDrugRelation/update',
        method: 'post',
        data
    })
}

//删除
export function chargeDrugRelationdelete(data) {
    return request({
        url: '/chargeDrugRelation/delete',
        method: 'post',
        data
    })
}


// 导出
export function chargeDrugRelationexportExcel(params) {
    return request({
        url: '/chargeDrugRelation/exportExcel',
        method: 'get',
        params,
        responseType: 'blob'
    })
}



