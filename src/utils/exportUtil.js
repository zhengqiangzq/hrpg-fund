import { ElMessage } from 'element-plus'
import { getMenunameByCode } from '@/api/report.js'
import qs from 'qs'
import { getToken } from '@/utils/auth'
import { doPrintData } from '@/api/report'
import { Session } from '@/utils/storage.js'

// 预览
export function doPreview(menuName) {
  // 获取菜单xml名称
  getMenunameByCode(menuName).then((res) => {
    const url = `/ureport/pdf/show?_u=slip-${res.data}`
    const iframe = window.frames['_print_pdf_frame']
    var a = document.getElementById('_print_pdf_frame')
    var iframeLoad = function () {
      iframe.window.focus()
      iframe.window.print()
    }
    if (!a.addEventListener) {
      a.attachEvent('onload', iframeLoad)
    }
    a.addEventListener('load', iframeLoad, true)
    iframe.window.focus()
    iframe.location.href = url
  })
}
// 打印
export function doPrint(obj) {
  let {
    name,
    params = {},
    callback,
    printCount,
    data = {},
    createGroupId,
    createOrgId,
  } = obj
  let _data = { ...params, ...data }
  let query = qs.stringify(params)
  // 传post数据
  try {
    doPrintData({
      _u: `${name}`,
      token: getToken(),
      orgId: Session.get('setting').orgId,
      groupId: Session.get('setting').groupId,
      query: params,
      createGroupId,
      createOrgId,
      ..._data,
    })
      .then((res) => {
        isPrint(res)
      })
      .catch((error) => {
        console.log(error)
      })
  } catch (error) {
    console.log(error)
  }
  function isPrint(res) {
    let url =
      window.location.origin +
      `/ureport/pdf/show?_u=${name}&token=${getToken()}&${query}`
    console.log('打印url==>', url)
    // 获取菜单xml名称
    if (res) {
      let blob = new Blob([res], {
        type: 'application/pdf',
      })
      url = URL.createObjectURL(blob)
    }
    printWithUrl(url)
    callback && callback()
  }
}

export function printWithUrl(url) {
  // 设置iframe样式
  let frameKey = 'fremekey-print-base'
  // 如果存在则删除
  if (window.parent.document.getElementById(frameKey)) {
    window.parent.document.body.removeChild(
      window.parent.document.getElementById(frameKey)
    )
  }
  let _iframe = window.parent.document.createElement('iframe')
  _iframe.setAttribute('id', frameKey)
  _iframe.setAttribute('name', frameKey)
  _iframe.setAttribute(
    'style',
    'position:absolute;width:0px;height:0px;left:-500px;top:-500px;'
  )
  window.parent.document.body.appendChild(_iframe)
  const iframe = window.parent.frames[frameKey]
  let fileFrameDom = window.parent.document.getElementById(frameKey)
  let iframeLoadErrow = function () {
    ElMessage.warning('打印失败，请联系管理员')
  }
  let iframeLoad = function (e) {
    try {
      iframe.window.focus()
      iframe.window.print()
    } catch (error) {
      console.log(error)
      iframeLoadErrow()
    }
  }
  if (!fileFrameDom.addEventListener) {
    fileFrameDom.attachEvent('onload', iframeLoad)
  }
  fileFrameDom.addEventListener('load', iframeLoad, true)
  iframe.window.addEventListener('error', iframeLoadErrow, true)
  iframe.window.focus()
  console.log(url)
  iframe.location.href = url
}
