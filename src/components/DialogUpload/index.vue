<template>
  <div>
    <page-dialog
      :title="dialogInfo.title"
      v-model:visible="shows"
      :width="dialogInfo.width"
      :bt-loading="dialogInfo.btLoading"
      :bt-list="dialogInfo.btList"
    >
      <UploadImg
        v-model:value="filePathList"
        multiple
        :limit="20"
        :action="action"
        :list-type="'picture'"
        :file-type="fileType"
        :response-fn="handleResponse"
        :show-name="true"
        :showRules="true"
        :rulesText="rulesText"
      />
    </page-dialog>
  </div>
</template>
<script setup name="DialogUpload">
import PageDialog from '../PageDialog/index'
import UploadImg from '../UploadImg/index'
import axios from 'axios'

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false,
  },
  saveEmpty: {
    type: Boolean,
    default: false,
  },
  api: {
    type: Function,
    default: function () {
      return undefined
    },
  },
  vaildateApi: {
    type: Function,
    default: function () {
      return undefined
    },
  },
  isVaildate: {
    // 是否校验
    type: Boolean,
    default: true,
  },
  isSave: {
    //是否在弹窗内保存
    type: Boolean,
    default: true,
  },
  fileType: {
    type: Array,
    default: function () {
      return ['png', 'jpg', 'jpeg']
    },
  },
  rulesText: String,
})

const emit = defineEmits(['update', 'callback', 'reset'])
const dialogInfo = reactive({
  title: '选择图片',
  btLoading: false,
  btList: [
    { label: '关闭', event: handleClose, show: true },
    {
      label: '保存',
      type: 'primary',
      disabled: !props.saveEmpty,
      event: submit,
      show: true,
    },
  ],
})
const filePathList = ref([])
const action = ref(axios.defaults.baseURL + '/file/minio/upload/basic')

const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emit('update:showDialog', newValue) // 更新父组件shows
  },
})
watch(
  () => filePathList.value,
  (val) => {
    dialogInfo.btList[1].disabled = !val.length
  },
  {
    deep: true,
  }
)

function submit() {
  if (props.isSave) {
    if (props.isVaildate) {
      props.vaildateApi(filePathList.value).then((res) => {
        if (res.success && res) {
          save()
        }
      })
    } else {
      save()
    }
  } else {
    emit('callback', filePathList.value)
  }
}
function save() {
  props.api(filePathList.value).then((res) => {
    if (res && res.success) {
      handleClose()
      emit('callback', filePathList.value)
    }
  })
}
function handleResponse(response, file) {
  return file
}
function handleClose() {
  shows.value = false
  emit('reset')
}
</script>
<style lang="scss" scoped></style>
