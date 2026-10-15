import { createApp } from 'vue'

import Cookies from 'js-cookie'

import App from './App'
import store from './store'
import router from './router'
import request from '@/utils/request'
import ElementPlus from 'element-plus'
// import 'element-plus/theme-chalk/index.css'
import locale from 'element-plus/es/locale/lang/zh-cn' // 中文语言
import prototype from '@/common/js/prototype' // 挂载在原型上的方法
// 用于缓存项目中使用iframe的菜单缓存
// 注册所有流程表单组件，便于审批动态回显
import { installFlow } from '@/utils/flowable.js'
import GridLayout from 'vue-grid-layout'
// css

// 判断taken和用户信息进行页面重定向拦截
import '@/utils/error-log' // error log
import { initPermission } from './permission'
import '@/utils/sign'
//import './permission'
import VxeTable from 'vxe-table'
import 'vxe-table/lib/style.css'

import * as Icons from '@element-plus/icons-vue' // 引入所有图标，并命名为 Icons
// svg图标
import 'virtual:svg-icons-register'
// src/components全局遍历注册组件方法,不再需要每个页面进行import导入和注册
import components from '@/components'
import i18n from './lang'

const app = createApp(App)

// 通过遍历的方式注册所有 svg组件
for (let i in Icons) {
  app.component(i, Icons[i])
}

// 全局方法挂载
app.config.globalProperties.$request = request
app.use(i18n)
app.use(router)
app.use(store)
app.use(components)
app.use(prototype)
app.use(initPermission)
app.use(GridLayout)
app.use(installFlow)
app.use(VxeTable)

// 使用element-plus 并且设置全局的大小
app.use(ElementPlus, {
  locale: locale,
  size: Cookies.get('size') || 'default',
})

app.mount('#app')
