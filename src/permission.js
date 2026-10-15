import router from '@/router'
import store from '@/store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import getPageTitle from '@/utils/get-page-title'
import { getToken } from '@/utils/auth'

NProgress.configure({
  showSpinner: false,
})

const whiteList = ['/login', '/oa'] // no redirect whitelist

export function initPermission(app) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    //addReportRouter(app, to)
    // set page title
    document.title = getPageTitle(to.meta.title)
    // determine whether the user has logged in
    const hasToken = getToken()
    if (hasToken) {
      if (to.path === '/login') {
        next()
        NProgress.done()
      } else {
        await store.dispatch('permission/getControl')
        const hasRoles =
            store.state.permission.addRoutes &&
            store.state.permission.addRoutes.length > 0
        console.log(hasRoles)
        if (hasRoles) {
          const _query = await getQueryParams()
          if (to.path.includes('/redirect/')) {
            next()
            return
          }
          if (_query.businessOrgId && _query.businessGroupId) {
            store.dispatch('permission/getDictMapOtherOrg')
            store.dispatch('permission/getUserPermissionCodesOtherOrg')
            await store.dispatch('permission/getCoreSystemConfigOtherOrg')
          } else {
            store.dispatch('permission/getDictMap')
            store.dispatch('permission/getUserPermissionCodes')
            await store.dispatch('permission/getCoreSystemConfig')
          }
          next()
        } else {
          try {
            // generate accessible routes map based on roles
            const accessRoutes = await store.dispatch(
                'permission/generateRoutes'
            )
            await store.dispatch('permission/getUserPermissionCodes')
            await store.dispatch('permission/getCoreSystemConfig')
            console.log(121)
            console.log(accessRoutes)
            // dynamically add accessible routes
            accessRoutes.forEach((route) => {
              router.addRoute(route)
            })
            console.log(to)
            // hack method to ensure that addRoutes is complete
            // set the replace: true, so the navigation will not leave a history record
            next({
              ...to,
              replace: true,
            })
          } catch (error) {
            console.log(error)
            console.log(45454545)
            // remove token and go to login page to re-login
            await store.dispatch('user/resetToken')
            ElMessage.error(error || 'Has Error')
            logout(next, to)
            NProgress.done()
          }
        }
      }
    } else {
      /* has no token*/
      if (whiteList.indexOf(to.path) !== -1) {
        // in the free login whitelist, go directly
        next()
      } else {
        // other pages that do not have permission to access are redirected to the login page.
        logout(next, to)
        NProgress.done()
      }
    }
  })

  router.afterEach(() => {
    // finish progress bar
    sessionStorage.removeItem('storeRowId')
    NProgress.done()
  })
}
function logout(next, to) {
  if (window.__POWERED_BY_WUJIE__) {
    window.$wujie?.bus.$emit('microAppLogout')
  } else {
    next(`/login?redirect=${to.path}`)
  }
}

function getQueryParams() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const params = new URLSearchParams(window.parent.location.search)
      resolve(Object.fromEntries(params.entries()))
    }, 0)
  })
}