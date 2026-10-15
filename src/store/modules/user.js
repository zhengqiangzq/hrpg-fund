import { getToken, setToken, removeToken } from '@/utils/auth'
import {
  login,
  getCurrentUser,
  singleLogin,
  logout as _logout,
} from '@/api/pub'
import { getShoppingCartCount, getScheduleTaskList } from '@/api/core'
import Cookies from 'js-cookie'
import router, { resetRouter } from '@/router'
import { aesEncrypt } from '@/utils/aes-util.js'

const state = {
  token: getToken(),
  userInfo: Cookies.get('userInfo') ? JSON.parse(Cookies.get('userInfo')) : '',
  wsInfo: {},
  shoppingCartCount: 0,
  todoTaskCount: 0,
  todoTaskList: [],
  materialResourceAuth: localStorage.getItem('userInfoStore')
    ? JSON.parse(localStorage.getItem('userInfoStore')).userAndPermissionInfo
        ?.userInfoDTO?.materialResourceType
    : '',
}

const getters = {}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    if (!token) {
      Cookies.remove('userInfo')
    }
  },
  SET_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo
    Cookies.set('userInfo', JSON.stringify(userInfo) || '')
  },
  SET_WSINFO: (state, wsInfo) => {
    state.wsInfo = wsInfo
  },
  SET_SHOPPING_CART_COUNT: (state, data) => {
    state.shoppingCartCount = data
  },
  SET_REFRESH_TODO: (state, data) => {
    state.todoTaskCount = data
  },
  SET_REFRESH_TODO_LIST: (state, data) => {
    state.todoTaskList = data
  },
}

const actions = {
  single({ commit }, state) {
    return new Promise((resolve, reject) => {
      singleLogin({ token: state })
        .then((response) => {
          const { data } = response
          commit('SET_TOKEN', data.token)
          commit('SET_USER_INFO', data)
          //setToken(data.token)
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  login({ commit }, userInfo) {
    const { username, password } = userInfo
    // const encryptPassword = aesEncrypt(password, username.trim())
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password.toString() })
        .then((response) => {
          sessionStorage.setItem('openMessageUnread', true)
          const { data } = response
          commit('SET_TOKEN', data.userInfoDTO.token)
          commit('SET_USER_INFO', data.userInfoDTO)
          // setToken(data.userInfoDTO.token)
          resolve(data.userInfoDTO)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getCurrentUser(state.token)
        .then((response) => {
          const { data } = response
          if (!data) {
            reject('请重新登陆！')
          }
          commit('SET_USER_INFO', data)
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  getShoppingCartCounts({ commit }) {
    getShoppingCartCount().then((res) => {
      if (res && res.success) {
        commit('SET_SHOPPING_CART_COUNT', res.data)
      }
    })
  },
  refreshTodoList({ commit }, count) {
    let params = {
      pageSize: 5,
      pageNo: 1,
      sort: 'arrival_time desc',
    }
    getScheduleTaskList(params).then((res) => {
      if (res && res.success) {
        commit('SET_REFRESH_TODO', res.total || 0)
        if (res.data && res.data.length) {
          commit('SET_REFRESH_TODO_LIST', res.data.slice(0, 5))
        } else {
          commit('SET_REFRESH_TODO_LIST', [])
        }
      } else {
        commit('SET_REFRESH_TODO_LIST', [])
      }
    })
  },
  async logout({ commit }) {
    await _logout()
    sessionStorage.clear()
    localStorage.clear()
    commit('SET_TOKEN', '')
    removeToken()
    resetRouter()
  },
  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      commit('SET_TOKEN', '')
      // commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },
  // dynamically modify permissions
  changeRoles({ commit, dispatch }) {
    return new Promise(async (resolve) => {
      await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', null, {
        root: true,
      })
      dispatch('permission/getUserPermissionCodes', null, { root: true })
      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      await dispatch('tabsView/delAllViews', null, { root: true })

      resolve()
    })
  },
  setWsInfo({ commit }, wsInfo) {
    console.log(wsInfo)
    commit('SET_WSINFO', wsInfo)
  },
  setMicroUserInfo({ commit }, userInfo) {
    commit('SET_TOKEN', userInfo.token)
    commit('SET_USER_INFO', userInfo)
    // setToken(userInfo.token)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
