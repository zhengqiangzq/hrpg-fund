import { constantRoutes } from '@/router'
import {getPermissionCodes} from '@/api/base'
import _ from 'lodash'
import localForage from 'localforage'
import {dictMapByCodes, getCoreSystemConfigAll} from "@/api/core";
import menuCode from '@/common/menuCode'
let modules = import.meta.glob('../../views/**/*.vue')

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes) {
  const res = []
  if (routes.length <= 0) {
    return
  }
  routes.forEach((item) => {
    if (item.code !== 'dashboard') {
      if (item.path) {
        let component =
            modules[/* @vite-ignore */ `../../views${item.path}/index.vue`]
        let tmp = {
          path: item.path.split('?')[0],
          name: item.label || item.name,
          component,
          meta: {
            title: item.name,
            icon: item.icon,
          },
        }
        res.push(tmp)
      }
      if (item.children && item.children.length) {
        filterAsyncRoutes(item.children).forEach((item) => {
          res.push(item)
        })
        return
      }
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: [],
  permissionCodes: [],
  dict: {},
  systemConfig: {},
  defaultMenus: [],
  allControl: [],
}

const mutations = {
  SET_ADD_ROUTES: (state, routes) => {
    state.addRoutes = constantRoutes.concat(routes)
  },
  SET_ROUTES: (state, routes) => {
    state.routes = routes
  },
  RESET_ROUTES: (state) => {
    state.addRoutes = []
    state.routes = []
    state.permissionCodes = []
  },
  SET_PERMISSIONS_CODES: (state, permissions) => {
    state.permissionCodes = permissions
  },
  SET_DICT: (state, data) => {
    state.dict = data
  },
  SET_All_Control: (state, data) => {
    state.allControl = data
  },
  SYSTEM_CONFIG: (state, data) => {
    state.systemConfig = data
  },
  SET_Menus: (state, data) => {
    state.defaultMenus = data
  },
}
const actions = {
  generateRoutes({ dispatch, commit }) {
    return new Promise((resolve, reject) => {
      let accessedRoutes = []

      _getMenusTreeWithResources()
      function _getMenusTreeWithResources() {
        const _data = JSON.parse(localStorage.getItem('routeStore'))
            ?.allSystemMenuMap['/funds']
        let menuArr = _data.map((element) => {
          element.path = element.path.split('?')[0]
          return element
        })
        commit('SET_Menus', menuArr)
        let cloneData = _.cloneDeep(_data)
        cloneData = cloneData.filter(
            (item) => item.code !== 'app' && item.code !== 'pda'
        )
        let arr = []
        accessedRoutes = filterAsyncRoutes(cloneData) || []
        arr = arr.concat(cloneData)
        constantRoutes[0].children =
            constantRoutes[0].children.concat(accessedRoutes)
        dispatch('getDictMap')
        commit('SET_ADD_ROUTES', constantRoutes)
        commit('SET_ROUTES', arr)
        resolve(constantRoutes)
      }
    })
  },
  //获取用户按钮权限集合
  getUserPermissionCodes({ commit }) {
    return new Promise((resolve, reject) => {
      localForage.getItem('systemResourceInfo').then((val) => {
        commit('SET_PERMISSIONS_CODES', val)
        resolve(val)
      })
    })
  },
  getDictMap({ commit }) {
    if (window.__POWERED_BY_WUJIE__) {
      let dictMap = window.$wujie?.props?.dictMap
      if (dictMap) {
        setDictMap(dictMap)
      } else {
        _getDictMap()
      }
    } else {
      _getDictMap()
    }
    function _getDictMap() {
      localForage.getItem('dictMap').then((val) => {
        commit('SET_DICT', val)
      })
    }
    function setDictMap(dictMap) {
      commit('SET_DICT', dictMap)
    }
  },
  // 跨组织-获取用户按钮权限集合
  getUserPermissionCodesOtherOrg({ commit }) {
    return new Promise((resolve, reject) => {
      getPermissionCodes({
        menuType: '2',
      }).then((res) => {
        commit('SET_PERMISSIONS_CODES', res.data)
        resolve()
      })
    })
  },
  // 跨组织-获取字典
  getDictMapOtherOrg({ commit }) {
    return new Promise((resolve, reject) => {
      const _obj = getObjByPath()
      let _dictArr = []
      if (_obj && _obj.dictArr?.length) {
        _dictArr = _obj.dictArr
      }
      dictMapByCodes(_dictArr).then((res) => {
        commit('SET_DICT', res.data)
        resolve()
      })
    })
  },
  // 跨组织-获取系统配置
  getCoreSystemConfigOtherOrg({ commit }) {
    return new Promise((resolve, reject) => {
      getCoreSystemConfigAll().then((res) => {
        setSystemConfig(res.data, commit)
        resolve()
      })
    })
  },
  resetRoutes({ commit }) {
    commit('RESET_ROUTES')
  },
  getCoreSystemConfig({ commit }) {
    /*
    .    数量操作模式 qty_operate_mode：0整数模式，2自动算出小数，1手动输入小数
    .    个体操作扫码切换提示保存当前操作 individual_scan_chang：0不提示，1提示
    .    价格精度保留策略 price_retention_strategy：0取整，1进一，2四舍五入
    .    数量展示精度保留策略 qty_show_retention_strategy： 0取整，1进一，2四舍五入
    .    数量计算精度保留策略 qty_calc_retention_strategy： 0取整，1进一，2四舍五入
    .    数量计算精度 qty_calc_precision
    .    数量展示精度 qty_show_precision
    .    价格精度 price_precision
    .    条码类型 code_type：1无码，2系统唯一码，3原厂码，4批次码
    .    系统名称 system_name：系统名称
    .    供应商预期到货天数(天) expect_delivery_day：供应商预期到货天数(天)
    */
    return new Promise((resolve, reject) => {
      localForage.getItem('systemInfo').then((data) => {
        let obj = {}
        data?.forEach((item) => {
          if (item.value.indexOf(',') !== -1) {
            obj[item.systemConfigCode] = item.value
          } else if (
              item.systemConfigCode === 'system_name' ||
              item.systemConfigCode === 'websocket_ip_port' ||
              item.systemConfigCode === 'connect_purchase_platform_system'
          ) {
            obj[item.systemConfigCode] = item.value
          } else {
            obj[item.systemConfigCode] = isNaN(item.value)
                ? item.value
                : Number(item.value)
          }
        })
        commit('SYSTEM_CONFIG', obj)
        resolve(obj)
      })
    })
  },
  getControl({ commit }) {
    localForage.getItem('baseDataControl').then((val) => {
      commit('SET_All_Control', val)
    })
  },
}

function setSystemConfig(data, commit) {
  /*
    .    数量操作模式 qty_operate_mode：0整数模式，2自动算出小数，1手动输入小数
    .    个体操作扫码切换提示保存当前操作 individual_scan_chang：0不提示，1提示
    .    价格精度保留策略 price_retention_strategy：0取整，1进一，2四舍五入
    .    数量展示精度保留策略 qty_show_retention_strategy： 0取整，1进一，2四舍五入
    .    数量计算精度保留策略 qty_calc_retention_strategy： 0取整，1进一，2四舍五入
    .    数量计算精度 qty_calc_precision
    .    数量展示精度 qty_show_precision
    .    价格精度 price_precision
    .    条码类型 code_type：1无码，2系统唯一码，3原厂码，4批次码
    .    系统名称 system_name：系统名称
    .    供应商预期到货天数(天) expect_delivery_day：供应商预期到货天数(天)
    */
  let obj = {}
  data?.forEach((item) => {
    if (item.value.indexOf(',') !== -1) {
      obj[item.systemConfigCode] = item.value
    } else if (
        item.systemConfigCode === 'system_name' ||
        item.systemConfigCode === 'websocket_ip_port' ||
        item.systemConfigCode === 'connect_purchase_platform_system'
    ) {
      obj[item.systemConfigCode] = item.value
    } else {
      obj[item.systemConfigCode] = isNaN(item.value)
          ? item.value
          : Number(item.value)
    }
  })
  commit('SYSTEM_CONFIG', obj)
}

function getObjByPath() {
  const _path = window.parent.location.href.split('/microApp')[1]?.split('?')[0]
  const _query = getQueryParams()
  const _obj = menuCode[_path] || menuCode[_query.backRouter] || null
  return _obj
}
function getQueryParams() {
  const params = new URLSearchParams(window.parent.location.search)
  return Object.fromEntries(params.entries())
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
