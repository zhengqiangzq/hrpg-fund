import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus')
      ? !!+Cookies.get('sidebarStatus')
      : true,
    withoutAnimation: false,
  },
  device: 'desktop',
  size: Cookies.get('size') || 'default',
  showUploadList: false,
  openFilter: false,
  // pageTable高度变化
  pageTableHeightStatus: false,
}

const mutations = {
  TOGGLE_SIDEBAR: (state) => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    // 收起左侧菜单重新计算table自适应高度（menu无动画完成回调，settimeout动画执行完成后触发重置table高度）
    setTimeout(() => {
      state.openFilter = !state.openFilter
      state.pageTableHeightStatus = !state.pageTableHeightStatus
    }, 350)
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  },
  TOGGLE_UPLOADLIST: (state, staus) => {
    state.showUploadList = staus
  },
  TOGGLE_OPENFILTER: (state) => {
    state.openFilter = !state.openFilter
  },
  TOGGLE_PAGETABLE: (state) => {
    state.pageTableHeightStatus = !state.pageTableHeightStatus
  },
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  },
  toggleOpenFilter({ commit }) {
    commit('TOGGLE_OPENFILTER')
  },
  togglePageTable({ commit }) {
    commit('TOGGLE_PAGETABLE')
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
