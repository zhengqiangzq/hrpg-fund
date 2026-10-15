<template>
  <div class="list" v-if="source">
    <!-- 预览图 -->
    <div v-for="(source, index) of computedSources" :key="index">
      <div class="down-file-wrapp">
        <div class="down-file" @click="handlePreview(source)">
          {{ index+1 + ':' }} {{ source.name }}
        </div>
        <div class="down-file-remove" @click="downFiles(source)">
          <el-icon>
            <Download />
          </el-icon>
        </div>
        <div class="down-file-remove" @click="handleRemove(index)" v-if="removeFn && !source.noDelete">
          <el-icon>
            <Delete />
          </el-icon>
        </div>
      </div>

    </div>
    <ele-gallery-dialog v-if="showDialog" ref="dialog" @close="close" />
  </div>
</template>

<script setup name="eleGallery">
import eleGalleryDialog from './eleGalleryDialog'
import { exportExcel } from "@/api/pub.js"
import {api as viewerApi} from "v-viewer"
import "viewerjs/dist/viewer.css"
const { proxy } = getCurrentInstance()
const props = defineProps({
  // 源
  source: [String, Array, Object],
  title:{
    type: String,
    default: ''
  },
  // 删除函数
  removeFn: Function
})
const showDialog = ref(false)
const computedSources = computed(() => {
  const sources = props.source
  if (typeof sources === 'string') {
    // 传入参数为 string
    return [getStringSource(sources)]
  } else if (sources instanceof Array) {
    // 传入参数为 array, 数据里面既可以有string 又可以有 object
    const res = []
    sources.forEach((item) => {
      if (item instanceof Object) {
        res.push(getObjectSource(item))
      } else if (typeof item === 'string') {
        //针对历史错误数据做出特殊处理
        if (item === 'null') {
          return
        }
        if (item.endsWith('null')) {
          item = item.substring(0, item.indexOf('null'))
        }
        res.push(getStringSource(item))
      } else {
        // console.warn('数组元素错误', sources, item)
      }
    })
    return res
  } else if (sources instanceof Object) {
    // 传入参数为 object
    return [getObjectSource(sources)]
  } else {
    return []
  }
})

// 点击查看
function handlePreview(data) {
  let type = data.url.split('.')[data.url.split('.').length - 1]
  const imageFileType = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'bmp', 'webp']
  if (imageFileType.includes(type)) {
    let arr = []
    computedSources.value.map(item => {
      let _type = item.url.split('.')[data.url.split('.').length - 1]
      if (imageFileType.includes(_type)) {
        arr.push(item.thumb)
      }
    })
    let initialViewIndex = arr.findIndex(item => item === data.thumb)
    viewerApi({
      options: {
        initialViewIndex: initialViewIndex,
        zIndex: 999999999
      },
      images: arr
    })
  } else {
    showDialog.value = true
    let timer = setTimeout(() => {
      proxy.$refs.dialog.startPreview(data.thumb, data.name, type, data.url)
      clearTimeout(timer)
    }, 100)
  }
}

function handleRemove(index) {
  props.removeFn(index)
}

// 获取字符串形式来源
function getStringSource(src) {
  let thumb = import.meta.env.VITE_APP_FILE_URL + src
  return {
    src: import.meta.env.VITE_APP_FILE_URL + src,
    thumb: thumb,
    url: src
  }
}

// 获取对象形式来源
function getObjectSource(source) {
  if (typeof source === 'object') {
    source.thumb = import.meta.env.VITE_APP_FILE_URL + source.filePath
    return {
      name: source.name,
      src: import.meta.env.VITE_APP_FILE_URL + source.filePath,
      thumb: source.thumb,
      url: source.filePath,
      noDelete: source.noDelete
    }
  } else if (typeof source === 'string') {
    source.thumb = import.meta.env.VITE_APP_FILE_URL + source[0]
    return {
      src: import.meta.env.VITE_APP_FILE_URL + source[0],
      thumb: source.thumb,
      url: source[0]
    }
  }
}

function downFiles(file) {
  exportExcel({fileName: file.url}).then(res => {
    if (res) {
      proxy.$fn.parseExcel(res, file.name, '')
    }
  })
}

function close() {
  showDialog.value = false
}
</script>

<style scoped lang="scss">
.list {
  // display: flex;
  // flex-direction: row;
  // flex-wrap: wrap;
}

.down-file-wrapp {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-right: 10px;
}

.down-file-wrapp:hover .down-file-remove {
  display: inline-block;
}

.down-file-remove {
  display: none;
  padding-left: 8px;
  cursor: pointer;
}

.down-file {
  color: #165dff;
  cursor: pointer;
  max-width: 500px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 10px;
  box-sizing: border-box;

  :first-child {
    padding-left: 0;
  }
}

.down-file:hover {
  color: #165dff;
}
</style>
