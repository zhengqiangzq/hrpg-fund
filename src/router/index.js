// createWebHistory使用histroy模式，需要后端进行配置，会有一个好看的URL路径
// createWebHashHistory使用hash模式，有一个#号
import {
  createWebHashHistory,
  createWebHistory,
  createRouter,
} from 'vue-router'
import { reportRouter } from './report'
export const Layout = () => import('@/layout/index.vue')
// export const Layout = defineAsyncComponent(() => import('@/layout/index.vue'))
import useStore from '@/store'

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    //redirect: '/dashboard',
    children: [
      {
        name: 'myApplyDetails',
        path: 'flow/myApplyDetails',
        component: () => import('@/views/task/flowDetails/index'),
        meta: {
          title: '申请详情',
        },
        hidden: false,
      },
      {
        name: 'myPendingDetails',
        path: 'flow/myPendingDetails',
        component: () => import('@/views/task/flowDetails/index'),
        meta: {
          title: '待办详情',
        },
        children: [
          {
            path: ':name',
            component: () => import('@/views/task/flowDetails/index'),
            name: 'myPendingDetail',
            meta: { title: '待办详情' },
          },
        ],
        hidden: true,
      },
      {
        name: 'myFinishedDetails',
        path: 'flow/myFinishedDetails',
        component: () => import('@/views/task/flowDetails/index'),
        meta: {
          title: '已办详情',
        },
        hidden: true,
        children: [
          {
            path: ':name',
            component: () => import('@/views/task/flowDetails/index'),
            name: 'myFinishedDetail',
            meta: { title: '已办详情' },
          },
        ],
      },
      {
        name: 'allPendingTask',
        path: 'allPendingTask',
        component: () => import('@/views/allPendingTask'),
        meta: {
          title: '全部待办',
        },
        hidden: false,
      },
    ],
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index'),
      },
    ],
  },
  {
    path: '/404',
    component: () => import('@/views/error/404'),
    hidden: true,
  },
  {
    path: '/401',
    component: () => import('@/views/error/401'),
    hidden: true,
  },
  ...reportRouter,
  {
    path: '/:catchAll(.*)',
    component: () => import('@/views/error/404'),
    hidden: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  //scrollBehavior: () => ({ left: 0, top: 0 })
})

// 重置路由
export function resetRouter() {
  useStore.state.permission.routes.forEach((route) => {
    const name = route.name
    if (name && router.hasRoute(name)) {
      router.removeRoute(name)
    }
  })
}
export default router
