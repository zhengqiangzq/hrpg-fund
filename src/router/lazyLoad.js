export default (vuename) => () =>
  defineAsyncComponent(() =>
    import(/* @vite-ignore */ `/src/views${vuename}/index.vue`)
  )
