import request from '@/utils/request'
import qs from 'qs'

const basicHost = import.meta.env.VITE_APP_BASIC_API

// 根据菜单code获取报表名称
export function getMenunameByCode(menuCode) {
  return request({
    url: basicHost + '/menu/report/reportName/' + menuCode,
    method: 'get',
  })
}

export function doPrintData(data) {
  let query = ''
  if (data.query) {
    query = qs.stringify(data.query)
    delete data.query
  }
  return request({
    url: basicHost + `/ureport/pdf/show?_u=${data._u}&token=${data.token}&${query}`,
    method: 'post',
    data,
    responseType: 'blob'
  })
}
