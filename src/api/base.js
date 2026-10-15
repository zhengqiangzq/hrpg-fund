import request from '@/utils/request'

const prePath = '/base'

const basicHost = import.meta.env.VITE_APP_BASIC_API

//获取带资源的菜单树
export function getMenusTreeWithResources(data) {
  return request({
    url: basicHost + '/resourceInfo/list',
    method: 'post',
    data,
  })
}

//获取用户按钮权限集合
export function getPermissionCodes(params) {
  return request({
    url: basicHost + '/resourceInfo/codes',
    method: 'get',
    params,
  })
}

export function getDeptTree(params) {
  return request({
    url: '/base/coreDept/trees',
    method: 'get',
    params
  })
}

//获取菜单详情
export function showSourceDetail(id) {
  return request({
    url: prePath + '/orders/sequence/queryPath/' + id,
    method: 'get',
  })
}
// 公共附件删除
export function fileRemoveList(data) {
  return request({
    url: basicHost + '/file/removeList',
    method: 'post',
    data,
  })
}
// 获取附件信息
export function annexUploadAll(params) {
  return request({
    url: prePath + '/annexUpload/all',
    method: 'get',
    params,
  })
}

// 分页查询会计期间
export function periodyearList(params) {
    return request({
        url: '/base/accountingPeriod/page',
        method: 'get',
        params,
    })
}
// 匹配日期所在会计期间
export function periodmonthList(params) {
    return request({
        url: '/base/accountingPeriodMonth/page',
        method: 'get',
        params
    })
}

// 匹配日期所在会计期间
export function periodMonthByDate(data) {
    return request({
        url: prePath + '/accountingPeriod/list',
        method: 'post',
        data
    })
}

// 人员
export function pageStaff(params) {
  return request({
    url: '/base/staff/page',
    method: 'get',
    params
  })
}

export function pageBankDoc(params) {
  return request({
    url: '/base/bankDoc/page',
    method: 'get',
    params
  })
}
export function pageCashAccount(params) {
  return request({
    url: '/base/cashAccount/page',
    method: 'get',
    params
  })
}

export function pageBankAccount(params) {
  return request({
    url: '/base/bankAccount/page',
    method: 'get',
    params
  })
}
export function pageSettlementMethod(params) {
  return request({
    url: '/base/settlementMethod/page',
    method: 'get',
    params
  })
}
export function pageInOutItem(params) {
  return request({
    url: '/base/inOutItem/tree',
    method: 'get',
    params
  })
}
export function pageSupplier(params) {
  return request({
    url: '/base/supplier/page',
    method: 'get',
    params
  })
}
export function pageCustomer(params) {
  return request({
    url: '/base/customer/page',
    method: 'get',
    params
  })
}
export function pageOutsideStaff(params) {
  return request({
    url: '/base/outsideStaff/page',
    method: 'get',
    params
  })
}
export function pageAccountingPeriod(params) {
  return request({
    url: '/base/accountingPeriod/page',
    method: 'get',
    params
  })
}
export function pageBankType(params) {
  return request({
    url: '/base/bankDocType/page',
    method: 'get',
    params
  })
}

//上传生成记录
export function excelImportRecordInitImportRecord(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/initImportRecord',
        method: 'post',
        data,
        btnCode,
    })
}
//轮询上传接口
export function excelImportRecordGetCacheInfo(data, btnCode) {
    return request({
        url: prePath + '/excelImportRecord/getCacheInfo',
        method: 'post',
        data,
        btnCode,
        notShowLoading: true,
    })
}
//关闭上传弹窗
export function excelImportRecordClose(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/close',
        method: 'post',
        data,
        btnCode,
    })
}
//中段上传弹窗
export function excelImportRecordInterrupt(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/interrupt',
        method: 'post',
        data,
        btnCode,
    })
}
//继续上传弹窗
export function excelImportRecordResume(data, btnCode, notShowLoading = false) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/resume',
        method: 'post',
        data,
        btnCode,
        notShowLoading: notShowLoading,
    })
}
//上传日志
export function getExcelImportRecordPage(params, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/page',
        method: 'get',
        params,
        btnCode,
    })
}
//上传日志
export function delExcelImportRecord(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/byDelete',
        method: 'post',
        data,
        btnCode,
    })
}
//上传日志
export function excelImportRecordUpdateStatus(data, btnCode) {
    return request({
        url: basicHost + prePath + '/excelImportRecord/updateStatus',
        method: 'post',
        data,
        btnCode,
    })
}

// 分页查询会计期间
export function pagePeriodMonth(params) {
    return request({
        url: prePath + '/accountingPeriodMonth/page',
        method: 'get',
        params
    })
}
