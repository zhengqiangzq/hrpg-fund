/*
 * @Author: huagen.yin huagen.yin@scasia-core.com
 * @Date: 2023-10-17 09:22:26
 * @LastEditors: huagen.yin huagen.yin@scasia-core.com
 * @LastEditTime: 2023-12-26 13:51:59
 * @FilePath: \base-web-spd\src\common\js\dateOperation.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { getCurrentFiscalPeriod } from '@/api/core'
import { formatDate } from '@/utils/index'

// 设置禁用会计区间之外时间
export function setDisableTime(target, _disStartDate, _disEndDate) {
  target.forEach((element) => {
    if (element.value === 'businessDate') {
      element['TimePickerOptions'] = {
        disabledDate(time) {
          let _time = formatDate(new Date(time), 'YYYY-MM-DD')
          return _time > _disEndDate.value || _time < _disStartDate.value
        },
      }
    }
  })
}
// 获取业务日期
export async function _getCurrentFiscalPeriod(
  target,
  _proxy,
  disStartDate,
  disEndDate,
  str
) {
  // 默认业务日期未当前日期
  let dateOperation = formatDate(new Date(), 'YYYY-MM-DD')
  let param = _proxy.$route?.path.includes('/drug/') ? 3 : 1
  if(str){
    param = str
  }
  let resp = await getCurrentFiscalPeriod(param)
  // 存在会计区间
  if (resp && resp.success && resp.data) {
    return handelCurrentFiscalPeriod(
      dateOperation,
      resp.data,
      disStartDate,
      disEndDate
    )
  } else {
    _proxy.$message({
      type: 'error',
      duration: 3500,
      message: '未开启会计期间，请先开启会计期间!',
      showClose: true,
    })
    // 不存在会计区间删除时间选择禁用（可以自由选择时间）
    const businessDateObj = target.filter((element) => {
      return element.value === 'businessDate'
    })
    delete businessDateObj.TimePickerOptions
    return dateOperation
  }
}
// 处理返回业务日期
function handelCurrentFiscalPeriod(
  dateOperation,
  data,
  _disStartDate,
  _disEndDate
) {
  const startDate = data.startDate
  const endDate = data.endDate
  _disStartDate.value = data.startDate
  _disEndDate.value = data.endDate
  // 如果当前时间在当前会计区间对应的时间内，取当前时间(默认取当前时间)
  let result = dateOperation
  // 如果当前时间小于当前会计区间的开始时间，取当前会计区间的开始时间
  if (dateOperation < startDate) {
    result = startDate
  }
  // 如果当前时间大于当前会计区间的开始时间，取当前会计区间的结束时间
  if (dateOperation > endDate) {
    result = endDate
  }
  return result
}
