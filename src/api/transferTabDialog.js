import request from '@/utils/request'
// 获取可导入字段
export function getExportList(params, btnCode) {
    return request({
        url: '/basic/base/excelFieldConfig/fields',
        method: 'get',
        params,
        btnCode,
    })
}
// 模板下载
export function custExcelTemp(data, btnCode) {
    return request({
        url:'/basic/base/excelFieldConfig/template/generate',
        method: 'post',
        data,
        btnCode,
        responseType: 'blob',
    })
}
//导出
export function custExcel(data, btnCode) {
    return request({
        url: 'hr/salaryConfirm/exportExcel',
        method: 'post',
        data,
        btnCode,
        responseType: 'blob',
    })
}

//导入
export function custImport(data, btnCode) {
    return request({
        url: 'hr/salaryConfirm/import/excelRecord',
        method: 'post',
        data,
        btnCode,
        responseType: 'blob',
    })
}
