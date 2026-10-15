const state = {
  visitedViews: [],
  cachedViews: [],
  isCloseDesign: false,
}

const mutations = {
  ADD_VISITED_VIEW: (state, view) => {
    let currentView = null
    let hasView = state.visitedViews.some((v) => {
      currentView = v
      return decodeURIComponent(v.path) === decodeURIComponent(view.path)
    })
    if (hasView) {
      let index = state.visitedViews.findIndex((element) => {
        return (
          decodeURIComponent(element.path) ===
          decodeURIComponent(currentView.path)
        )
      })
      if (index !== -1) {
        state.visitedViews.splice(
          index,
          1,
          Object.assign({}, view, {
            title: view.meta
              ? view.meta.title || view.meta.name || 'no-name'
              : view.name,
          })
        )
      }
      return
    }
    state.visitedViews.push(
      Object.assign({}, view, {
        title: view.meta
          ? view.meta.title || view.meta.name || 'no-name'
          : view.name,
      })
    )
    const tempBool = state.visitedViews.some(
      (item) => item.name === 'Dashboard'
    )
    if (!tempBool) {
      state.visitedViews.unshift({
        path: '/dashboard',
        name: 'Dashboard',
        title: '控制台',
        fullPath: '/dashboard',
        meta: {
          title: '控制台',
          icon: 'dashboard',
          affix: true,
        },
      })
    }
  },
  ADD_CACHED_VIEW: (state, view) => {
    const isOtherOrg = view.query?.businessOrgId && view.query?.businessGroupId
    if (state.cachedViews.includes(view.label) && !isOtherOrg) return
    if (!view.meta?.noCache) {
      view.label && state.cachedViews.push(view.label)
      const tempBool = state.cachedViews.some((item) => item === 'Dashboard')
      if (!tempBool) {
        state.cachedViews.unshift('Dashboard')
      }
    }
  },
  DEL_VISITED_VIEW: (state, view) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.label === view.label) {
        state.visitedViews.splice(i, 1)
        break
      }
    }
  },
  DEL_CACHED_VIEW: (state, view) => {
    const index = state.cachedViews.indexOf(view.label)
    index > -1 && state.cachedViews.splice(index, 1)
  },
  // 此处view为组件name
  // DEL_CACHED_VIEW: (state, view) => {
  //     for (const i of state.cachedViews) {
  //         if (i === view) {
  //             const index = state.cachedViews.indexOf(i)
  //             state.cachedViews.splice(index, 1)
  //             break
  //         }
  //     }
  // },

  DEL_OTHERS_VISITED_VIEWS: (state, view) => {
    state.visitedViews = state.visitedViews.filter((v) => {
      return v.meta.affix || v.path === view.path
    })
  },
  DEL_OTHERS_CACHED_VIEWS: (state, view) => {
    const index = state.cachedViews.indexOf(view.label)
    if (index > -1) {
      state.cachedViews = state.cachedViews.slice(index, index + 1)
    } else {
      // if index = -1, there is no cached tags
      state.cachedViews = []
    }
  },
  // DEL_OTHERS_CACHED_VIEWS: (state, view) => {
  //     for (const i of state.cachedViews) {
  //         if (i === view.label) {
  //             const index = state.cachedViews.indexOf(i)
  //             state.cachedViews = state.cachedViews.slice(index, index + 1)
  //             break
  //         }
  //     }
  // },

  DEL_ALL_VISITED_VIEWS: (state) => {
    // keep affix tags
    const affixTags = state.visitedViews.filter((tag) => tag.meta.affix)
    state.visitedViews = affixTags
  },
  DEL_ALL_CACHED_VIEWS: (state) => {
    state.cachedViews = []
  },

  UPDATE_VISITED_VIEW: (state, view) => {
    for (let v of state.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  },
  UPDATE_ISCLOSEDESIGN: (state, payload) => {
    state.isCloseDesign = payload
  },
}

const actions = {
  addView({ dispatch }, view) {
    dispatch('addVisitedView', view)
    dispatch('addCachedView', view)
  },
  addVisitedView({ commit }, view) {
    commit('ADD_VISITED_VIEW', view)
  },
  addCachedView({ commit }, view) {
    commit('ADD_CACHED_VIEW', view)
  },

  delView({ dispatch, state }, view) {
    return new Promise((resolve) => {
      dispatch('delVisitedView', view)
      dispatch('delCachedView', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews],
      })
    })
  },
  delVisitedView({ commit, state }, view) {
    return new Promise((resolve) => {
      commit('DEL_VISITED_VIEW', view)
      resolve([...state.visitedViews])
    })
  },
  delCachedView({ commit, state }, view) {
    return new Promise((resolve) => {
      commit('DEL_CACHED_VIEW', view)
      resolve([...state.cachedViews])
    })
  },

  delOthersViews({ dispatch, state }, view) {
    return new Promise((resolve) => {
      dispatch('delOthersVisitedViews', view)
      dispatch('delOthersCachedViews', view)
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews],
      })
    })
  },
  delOthersVisitedViews({ commit, state }, view) {
    return new Promise((resolve) => {
      commit('DEL_OTHERS_VISITED_VIEWS', view)
      resolve([...state.visitedViews])
    })
  },
  delOthersCachedViews({ commit, state }, view) {
    return new Promise((resolve) => {
      commit('DEL_OTHERS_CACHED_VIEWS', view)
      resolve([...state.cachedViews])
    })
  },

  delAllViews({ dispatch, state }) {
    return new Promise((resolve) => {
      dispatch('delAllVisitedViews')
      dispatch('delAllCachedViews')
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews],
      })
    })
  },
  delAllVisitedViews({ commit, state }) {
    return new Promise((resolve) => {
      commit('DEL_ALL_VISITED_VIEWS')
      resolve([...state.visitedViews])
    })
  },
  delAllCachedViews({ commit, state }) {
    return new Promise((resolve) => {
      commit('DEL_ALL_CACHED_VIEWS')
      resolve([...state.cachedViews])
    })
  },

  updateVisitedView({ commit }, view) {
    commit('UPDATE_VISITED_VIEW', view)
  },
  updateIsCloseDesign({ commit }, payload) {
    commit('UPDATE_ISCLOSEDESIGN', payload)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
