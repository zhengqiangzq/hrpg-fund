<template>
  <div>
    <el-upload
      v-if="!disabled"
      v-model:file-list="fileList"
      v-show="isShowUpload"
      :action="action"
      :headers="myHeaders"
      :show-file-list="false"
      :style="{
        marginBottom: multiple && computedValues.length ? marginBottom : '0px',
      }"
      :disabled="uploading"
      :multiple="multiple"
      :limit="limit"
      :before-upload="handleBeforeUpload"
      :on-change="handleChange"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
    >
      <div
        class="up-btn"
        v-loading.body="uploading"
      >
        <el-tooltip
          class="box-item"
          effect="light"
          width="300px"
        >
          <template #content>
            <div v-if="isShowTip" class="el-upload__tip">
              只能上传
              <b style="color: #f56c6c">{{
                fileType ? fileType.join(' / ') : '图片'
              }}</b>
              格式文件且为文件白名单支持的格式，且大小不超过
              <b style="color: #f56c6c">{{ fileSize }}Mb</b>
              <pre v-if="customAppendTip">{{ customAppendTip }}</pre>
            </div>
          </template>
          <el-button type="primary">点击上传</el-button>
        </el-tooltip>
      </div>
    </el-upload>
    <ele-gallery
      :lazy="lazy"
      :remove-fn="disabled ? null : handleRemove"
      :source="displayFiles"
    />
  </div>
</template>

<script setup name="uploadImg">
import EleGallery from './eleGallery'
// import { fileRemoveList } from '@/api/base'
import { useStore } from 'vuex'
const { proxy } = getCurrentInstance()
const emits = defineEmits()
const store = useStore()
const props = defineProps({
  // 上传地址 (同官网)
  action: {
    type: String,
    required: true,
  },
  value: {
    type: Array,
    default: function () {
      return []
    },
  },
  // 是否支持多选文件 (同官网)
  multiple: {
    type: Boolean,
    default: false,
  },
  // 响应处理函数
  responseFn: Function,
  // 支持上传的文件类型
  fileType: {
    type: Array,
    default() {
      return ['png', 'jpg', 'jpeg', 'pdf']
    },
  },
  fileSize: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
  },
  isShowTip: { type: Boolean, default: true },
  marginBottom: { type: String, default: '5px' },
  customAppendTip: { type: String },
  disabled: { type: Boolean, default: false },
  isButton: { type: Boolean, default: true },
  title: {
    type: String, default: ''
  }
})
// 兼容招标  目前只有招标会传入size
const fileSize = ref(
  props.fileSize || proxy.$store.state.permission.systemConfig.max_file_size
)
const uploading = ref(false)
const lazy = ref(true)
// const isShowTip = ref(true)
const myHeaders = ref({
  Authorization: '',
})
// 是否从未成功上传
const isNoUploadSuccess = ref(true)
const editFormUrlList = ref([])
// 本次会话新上传的附件(filePath / 字符串): 删除时直接从列表移除, 不标记 del
const newUploadFilePaths = ref([])
const fileList = ref([])
const successNum = ref(0)
const pendingFiles = ref(0)

const computedValues = computed(() => {
  if (props.value) {
    setTimeout(() => {
      proxy.$store.dispatch('app/togglePageTable')
    }, 0)
    if (typeof props.value === 'string') {
      if (isNoUploadSuccess.value) {
        editFormUrlList.value = [props.value]
      }
      return [props.value]
    } else {
      if (isNoUploadSuccess.value) {
        editFormUrlList.value = []
        props.value.forEach((item) => {
          typeof item === 'string'
            ? editFormUrlList.value.push(item)
            : editFormUrlList.value.push(JSON.stringify(item))
        })
      }
      return props.value
    }
  } else {
    return []
  }
})
const displayFiles = computed(() => props.value.filter(it => it.del != 1))
const isShowUpload = computed(() => {
  if (props.multiple) {
    return true
  } else {
    return computedValues.value.length === 0
  }
})
const successFiles = computed(() => {
  return fileList.value.filter((file) => file.status === 'success')
})
const token = computed(() => {
  return proxy.$store.state.user.token
})
function handleBeforeUpload(file) {
  if (props.value && props.value.filter(it => it.del != 1).length >= props.limit) {
    proxy.$message.error({
      message: `最多上传${props.limit}个文件`,
      showClose: true,
      duration: 3500,
    })
    return
  } else {
    let isImg = false
    if (props.fileType) {
      isImg = props.fileType.some(
        (type) => file.name.split('.')[file.name.split('.').length - 1] === type
      )
    } else {
      isImg = file.type.indexOf('image') > -1
    }
    const isLt = file.size / 1024 / 1024 < fileSize.value

    if (!isImg) {
      proxy.$message.error({
        message: `文件格式不正确, 请上传 ${props.fileType.join(
          ' / '
        )} 格式文件!`,
        showClose: true,
        duration: 3500,
      })
      return false
    }

    let file_type_list = store.state.permission.dict['file_type_list']
    if (file_type_list && file_type_list.length) {
      let uploadType = file.name.split('.')[file.name.split('.').length - 1]
      let file_type_list_arr = []
      file_type_list.forEach((item) => {
        file_type_list_arr.push(item.code)
      })
      if (!String(file_type_list_arr).includes(uploadType)) {
        proxy.$message.error({
          message: `文件格式【${uploadType}】非白名单文件类型格式，不支持上传`,
          showClose: true,
          duration: 3500,
        })
        return false
      }
    }

    if (!isLt) {
      proxy.$message.error({
        message: `上传文件大小不能超过 ${fileSize.value} MB!`,
        showClose: true,
        duration: 3500,
      })
      return false
    }
    pendingFiles.value++
    uploading.value = true
    return isImg && isLt
  }
}
function handleChange(file, fileList) {
  fileList.value = fileList
  // 如果文件状态变为非上传中，减少pending计数
  if (file.status !== 'uploading') {
    pendingFiles.value = Math.max(0, pendingFiles.value - 1)
    if (pendingFiles.value === 0) {
      uploading.value = false
    }
  }
}
// 文件个数超出
function handleExceed() {
  proxy.$message.error({
    message: `最多上传${props.limit}个文件`,
    duration: 3500,
    showClose: true,
  })
}
// 上传失败
function handleUploadError(err) {
  if (props.value.length >= props.limit) {
    return
  }
  pendingFiles.value = Math.max(0, pendingFiles.value - 1)
  if (pendingFiles.value === 0) {
    uploading.value = false
  }
  proxy.$message.error({
    message: '上传失败, 请重试',
    duration: 3500,
    showClose: true,
  })
  emits('error', err)
}
// 上传成功回调
function handleUploadSuccess(response, file) {
  if (props.value && props.value.filter(it => it.del == 0).length > props.limit) {
    return
  }

  pendingFiles.value = Math.max(0, pendingFiles.value - 1)
  if (pendingFiles.value === 0) {
    uploading.value = false
  }

  let url = ''
  if (response.success) {
    isNoUploadSuccess.value = false
    proxy.$message.success({
      message: '上传成功',
      duration: 3500,
      showClose: true,
    })
    url = response.data[0]
    if (props.responseFn) {
      url = props.responseFn(response.data[0], file, successFiles.value, response)
    }
    if (url !== null) {
      if (props.multiple) {
        if (Array.isArray(props.value)) {
          if (typeof url === 'string') {
            newUploadFilePaths.value.push(url)
            emits('update:value', [...props.value, url])
            emits('input', [...props.value, url])
          } else {
            url.filePath = url.response.data[0]
            url.del = 0
            props.value.push(url)
            newUploadFilePaths.value.push(url.filePath)

            emits('update:value', props.value)
            emits('input', props.value)
          }
        } else {
          emits('update:value', [url])
          emits('input', [url])
        }
      } else {
        if (Array.isArray(props.value)) {
          if (typeof url === 'string') {
            newUploadFilePaths.value.push(url)
            emits('update:value', [...props.value, url])
            emits('input', [...props.value, url])
          } else {
            url.filePath = url.response.data[0]
            props.value.push(url)
            newUploadFilePaths.value.push(url.filePath)

            emits('update:value', props.value)
            emits('input', props.value)
          }
        } else {
          emits('update:value', [url])
          emits('input', [url])
        }
      }
    }
  } else {
    handleRemove(fileList.value.indexOf(file))
    proxy.$message.error({
      message: response.msg,
      duration: 3500,
      showClose: true,
    })
  }
}
function handleRemove(index) {
  const file = displayFiles.value[index]
  const data = [...computedValues.value]
  const realIndex = data.indexOf(file)
  if (realIndex === -1) return

  const filePath = typeof file === 'string' ? file : file?.filePath
  // 本次新上传的附件: 直接从列表移除
  // 进入表单时就已存在的附件: 标记 del = 1, 保存时交给后端删除
  const isNewUpload = newUploadFilePaths.value.includes(filePath)

  if (!props.multiple && !isNewUpload) {
    // 单文件时保持原有逻辑: 直接清空
    fileList.value = []
    emits('update:value', [])
    emits('input', [])
    return
  }

  if (isNewUpload || typeof file === 'string') {
    // 历史遗留的字符串附件无法携带 del, 同样直接移除
    data.splice(realIndex, 1)
  } else {
    data[realIndex] = { ...file, del: 1 }
  }
  if (file) {
    fileList.value = (fileList.value || []).filter((it) => it.uid !== file.uid)
  }
  emits('update:value', data || [], realIndex)
  emits('input', data || [], realIndex)
}
onMounted(() => {
  myHeaders.value.Authorization = token.value
})
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 150px;
  height: 150px;
  display: block;
}
.up-btn {
  display: flex;
  align-items: center;
}
.el-upload__tip {
  padding-left: 10px;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
}
</style>
