<template>
  <div>
    <el-radio-group
      v-model="radioList.radioData"
      @change="selectChange"
      :disabled="disabled"
    >
      <el-radio
        v-for="item in radioList.options"
        :key="item.code"
        :label="item.code"
        >{{ item.name }}</el-radio
      >
    </el-radio-group>
  </div>
</template>
<script setup name="ModelRadio">
const { proxy } = getCurrentInstance()
const props = defineProps(['modelValue', 'typeCode', 'disabled', 'checkDefault'])
const emit = defineEmits(['returnBack', 'change', 'update:modelValue'])

const radioList = reactive({
  options: [],
  radioData: '',
  defaultValue: '',
})
const state = reactive({
  selectValue: '',
})
watch(
  () => props.modelValue,
  (val) => {
    if (val || val === '0') {
      radioList.radioData = val
    } else {
      state.selectValue = radioList.defaultValue
      emit('update:modelValue', radioList.defaultValue)
      emit('returnBack', radioList.defaultValue)
    }
  },
  {
    immediate: true,
    deep: true,
  }
)

onMounted(() => {
  getOptions()
})

function selectChange(data) {
  emit('update:modelValue', data)
  emit('returnBack', data)
  emit('change', data)
}
function getOptions() {
  let result =
    proxy.$fn.deepClone(proxy.$store.state.permission.dict[props.typeCode]) ||
    []
  result.forEach((item) => {
    try {
      item.code = item.code
    } catch (err) {
      item.code = item.code
    }
  })
  radioList.options = result
  if (props.modelValue || props.modelValue === '0') {
    radioList.radioData = props.modelValue
  } else {
    if (props.checkDefault !== false) {
      for (let item of result) {
        if (item.isDefault === '1' || item.isDefault === 1) {
          radioList.defaultValue = item.code
          radioList.radioData = item.code
          emit('update:modelValue', item.code)
          emit('returnBack', item.code)
          break
        }
      }
    }
  }
}
</script>

<style scoped></style>
