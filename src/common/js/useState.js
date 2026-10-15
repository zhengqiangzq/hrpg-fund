import { computed } from 'vue'
import { mapState,mapGetters, useStore } from 'vuex'
//处理mapState
export function useState(mapper) {
  // 拿到store独享
  const store = useStore()

  // 获取到对应的对象的functions: {name: function, age: function}
  const storeStateFns = mapState(mapper)

  // 对数据进行转换
  const storeState = {}
  Object.keys(storeStateFns).forEach(fnKey => {
    const fn = storeStateFns[fnKey].bind({$store: store})
    storeState[fnKey] = computed(fn)
  })

  return storeState
}
//处理mapGetter
export function useGetter(mapper) {
  // 拿到store独享
  const store = useStore()
  const storeStateFns = mapGetters(mapper)
  //把一个个数据转换成ref对象
  const storeState = {}
  Object.keys(storeStateFns).forEach(funKey=>{
    const fn = storeStateFns[funKey].bind({$store:store})
    storeState[funKey]=computed(fn)
  })
  return storeState
}