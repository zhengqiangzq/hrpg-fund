function changeStr(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
export default function installComponent(app) {
  // vite代替webpack require.context写法进行遍历组件 globEager同步，glob异步
  const files = import.meta.glob('./*/index.vue', { eager: true })
  for (const k in files) {
    const componentName = changeStr(
      k
        .replace(/^\.\//, '')
        .replace(/\.\w+$/, '')
        .replace('/index', '')
    )
    app.component(componentName, files[k].default)
  }
}
