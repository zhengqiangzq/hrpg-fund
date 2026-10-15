<template>
  <el-select
      v-model="selectValue"
      :multiple="multiple"
      :collapse-tags="collapseTags"
      placeholder=""
      filterable
      :clearable="clearable"
      :disabled="disabled"
      :style="{ width: width }"
      :filter-method="filterMethod"
      @change="selectChange"
      @clear="handleClear"
  >
    <el-option
        v-for="item in filteredOptions"
        :key="item.code"
        :disabled="item.disabled"
        :label="item.name"
        :value="item.code"
    />
  </el-select>
  <!-- {{ optionsList }} -->
</template>
<script setup name="SelectModel">
import pinyin from 'js-pinyin'
const emits = defineEmits(['update:modelValue', 'change'])
const { proxy } = getCurrentInstance()
const store = useStore()
const props = defineProps({
  typeCode: {
    type: String,
    default: '',
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  size: {
    type: String,
    default: 'small',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '',
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  clearType: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  checkDefault: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  customOptions: {
    type: Array,
  },
  optionDisabled: {
    type: Array,
    default: () => {
      return []
    },
  },
  onlyShowOption: {
    type: Array,
    default: () => {
      return []
    },
  },
  collapseTags: {
    type: Boolean,
    default: true,
  },
})
const options = ref([])
const selectValue = ref(props.multiple ? [] : '')
const defaultValue = ref('')
const filteredOptions = ref([])
const changeData = computed(() => {
  return {
    optionDisabled: props.optionDisabled,
    options: options.value,
  }
})
// const optionsList = computed(() => {
//   getOptions(proxy.$store.state.permission.dict[props.typeCode] || [])
//   return ''
// })

watch(
  () => store.state.permission.dict[props.typeCode],
  (val) => {
    if (!val) {
      getOptions(props.customOptions ?? [])
    } else {
      getOptions(
        proxy.$fn.deepClone(
          proxy.$store.state.permission.dict[props.typeCode]
        ) || []
      )
    }
  },
  {
    immediate: true,
    deep: true,
  }
)
watch(
  () => props.onlyShowOption,
  (val) => {
    getOptions(
      proxy.$fn.deepClone(proxy.$store.state.permission.dict[props.typeCode]) ||
        []
    )
  }
)
watch(
  () => props.typeCode,
  (val) => {
    getOptions(
      proxy.$fn.deepClone(proxy.$store.state.permission.dict[props.typeCode]) ||
        []
    )
  }
)
watch(
  () => props.clearType,
  (val) => {
    // selectValue.value = ''
  }
)
watch(
  () => props.modelValue,
  (val) => {
    let value
    if (props.modelValue === -2 || props.modelValue === '-2') {
      value = ''
    } else {
      value =
        proxy.modelValue === 0
          ? '0'
          : typeof val === 'number'
          ? val.toString()
          : val
    }
    if (value) {
      if (props.multiple) {
        selectValue.value = proxy.$fn
          .splitArr(value)
          .map((item) => item.toString())
      } else {
        selectValue.value = value
      }
    } else {
      let defaultValueStr =
        typeof defaultValue.value === 'number' ? val.toString() : val
      if (props.clearable !== true) {
        if (props.multiple) {
          selectValue.value = proxy.$fn
            .splitArr(defaultValueStr)
            .map((item) => item.toString())
          emits('update:modelValue', defaultValue.value.toString())
        } else {
          selectValue.value = defaultValueStr
          emits('update:modelValue', defaultValue.value)
        }
      } else {
        selectValue.value = value
        emits('update:modelValue', '')
      }
    }
  },
  {
    deep: true,
    immediate: true,
  }
)
watch(
  () => changeData.value,
  (val) => {
    let optionDisabled = val.optionDisabled
    let options = val.options
    if (options.length && optionDisabled.length) {
      options.forEach((item) => {
        if (props.optionDisabled.includes(item.code)) {
          item.disabled = true
        }
      })
    }
  },
  {
    deep: true,
  }
)
watch(
  () => selectValue.value,
  (val) => {
    if (Array.isArray(val)) {
      emits('update:modelValue', val.toString())
    }
  }
)
// 初始化时设置filteredOptions等于所有options
watch(
    () => options.value,
    (newOptions) => {
      filteredOptions.value = [...newOptions];
    },
    { immediate: true }
);

function selectChange(data) {
  let str = data?.toString()
  emits('update:modelValue', str)
  // setTimeout(() => {
  emits('change', str)
  // }, 0)
}
function getOptions(dict) {
  proxy.$nextTick(() => {
    let data = dict.filter((item) => {
      if (item.status) {
        return item
      }
    })
    if (props.onlyShowOption.length && Array.isArray(data)) {
      data = data.filter((item) => props.onlyShowOption.includes(item.code))
    }
    options.value = data || []
    let _modelValue
    if (props.modelValue === -2 || props.modelValue === '-2') {
      _modelValue = ''
    } else {
      _modelValue =
        props.modelValue === 0
          ? '0'
          : typeof props.modelValue === 'number'
          ? props.modelValue.toString()
          : props.modelValue
    }
    if (_modelValue) {
      if (props.multiple) {
        selectValue.value =
          _modelValue.indexOf(',') != -1
            ? props.modelValue.split(',')
            : [props.modelValue.toString()]
      } else {
        selectValue.value = _modelValue
      }
      // let isEnable = false //停用
      // let modelValueCopy = proxy.$fn.deepClone(String(props.modelValue))
      // let modelValueArr = []
      // options.value.forEach((item) => {
      //   if (modelValueCopy.includes(String(item.code))) {
      //     isEnable = true //启用
      //     modelValueArr.push(item.code)
      //   }
      // })
      // if (!isEnable) {
      //   selectValue.value = ''
      // } else {
      //   selectValue.value = String(modelValueArr)
      // }
    } else {
      if (props.checkDefault) {
        for (let item of data) {
          if (item.isDefault === '1' || item.isDefault === 1) {
            defaultValue.value = item.code
            selectValue.value = item.code
            // 避免没有同步校验页面
            emits('update:modelValue', item.code)
            break
          }
        }
      }
    }
  })
}

// 自定义过滤方法
function filterMethod(query) {
  if (!query) {
    filteredOptions.value = [...options.value];
    return;
  }
  const queryString = query.toLowerCase();
  pinyin.setOptions({ checkPolyphone: false, charCase: 1 })
  filteredOptions.value = options.value.filter(item => {
    const label = item.name.toLowerCase();
    const pyFirst = pinyin.getCamelChars(label).toLowerCase(); // 获取首字母
    return (
        label.includes(queryString) ||
        pyFirst.includes(queryString)
    );
  });
}
// 处理清空选择的情况
function handleClear() {
  filteredOptions.value = [...options.value];
}
/* export default {
  model: {
    prop: 'modelValue',
    event: 'returnBack',
  },
} */
</script>

<style scoped>
:deep(.el-select__wrapper) {
  min-height: 26px;
}
</style>
