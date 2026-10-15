import defaultSettings from '@/settings'
import Cookies from 'js-cookie'
const { tagsView, fixedHeader, sidebarLogo } = defaultSettings

const state = {
  toPage: '',
  isCollapse: false, //测导航是否展开
  sidebarLogo: sidebarLogo,
  tagsView: tagsView,
  fixedHeader: fixedHeader,
  screen: document.body.clientWidth > 1000 ? 3 : 1, //屏幕大小
  innerHeight: document.body.clientHeight,
  icon_spread: 'layui-icon-shrink-right', //侧导航收缩图标Class
  app_status: '', //侧导航AppClass赋值
  themType:
    (() => {
      const themType = window.localStorage.getItem('themType') || 'skin_black'
      const getSize = Cookies.get('size') || 'default'
      if (getSize === 'default') {
        document.body.className = themType
        document.body.className += ' fontSizeDefault'
      } else if (getSize === 'large') {
        document.body.className = themType
        document.body.className += ' fontSizeMedium'
      } else if (getSize === 'small') {
        document.body.className = themType
        document.body.className += ' fontSizeSmall'
      } else if (getSize === 'mini') {
        document.body.className = themType
        document.body.className += ' fontSizeMini'
      }
      return window.localStorage.getItem('themType')
    })() ||
    (() => {
      document.body.className = 'skin_black'
      const getSize = Cookies.get('size') || 'default'
      if (getSize === 'default') {
        document.body.className += ' fontSizeDefault'
      } else if (getSize === 'large') {
        document.body.className += ' fontSizeMedium'
      } else if (getSize === 'small') {
        document.body.className += ' fontSizeSmall'
      } else if (getSize === 'mini') {
        document.body.className += ' fontSizeMini'
      }
      return 'skin_black'
    })(),
  notReadCount: 0, //当前登录人未读消息数
}

const mutations = {
  UPDATE_MENU_STATUS: (state, view) => {
    state.icon_spread = view
      ? 'layui-icon-shrink-right'
      : 'layui-icon-spread-left'
    if (view) {
      if (state.screen < 2) {
        state.isCollapse = false
        state.app_status = ''
      } else {
        state.app_status = ''
        state.isCollapse = false
      }
    } else {
      if (state.screen < 2) {
        state.isCollapse = false
        state.app_status = 'layadmin-side-spread-sm'
      } else {
        state.app_status = 'layadmin-side-shrink'
        state.isCollapse = true
      }
    }
  },
  UPDATE_THEM: (state, view) => {
    window.localStorage.setItem('themType', view)
    document.body.className = view
    state.themType = view
  },
  UPDATE_SCREEN: (state, view) => {
    state.screen = view
  },
  UPDATE_BODY_HEIGHT: (state, view) => {
    state.innerHeight = view
  },
  UPDATE_To_PAGE: (state, view) => {
    state.toPage = view
  },
  UPDATE_NOT_READ_COUNT: (state, view) => {
    if (!view) {
      state.notReadCount = 0
    } else {
      state.notReadCount = view
    }
  },
}

const actions = {
  updateMenuStatus({ commit }, view) {
    commit('UPDATE_MENU_STATUS', view)
  },
  themSelect({ commit }, view) {
    commit('UPDATE_THEM', view)
  },
  updateScreen({ commit }, view) {
    commit('UPDATE_SCREEN', view)
  },
  updateBodyHeight({ commit }, view) {
    commit('UPDATE_BODY_HEIGHT', view)
  },
  toPage({ commit }, view) {
    commit('UPDATE_To_PAGE', view)
  },
  notReadCount({ commit }, view) {
    commit('UPDATE_NOT_READ_COUNT', view)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
