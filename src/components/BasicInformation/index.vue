<template>
  <div>
    <el-form
      v-if="info.data && Object.keys(info.data).length"
      ref="form"
      class="padding"
      :model="info.data"
      :rules="rules"
      :label-width="labelWidth"
      :class="className"
    >
      <el-row style="width: 100%">
        <el-col
          :span="imageField && Object.keys(imageField).length ? 18 : 24"
          :xl="imageField && Object.keys(imageField).length ? 20 : 24"
          class="flex_wrap_start_start pageFormDetail"
        >
          <template v-for="(item, index) in getConfigList()">
            <el-form-item
              v-if="item.need !== 'no'"
              :key="index"
              :label="item.label ? item.label + '：' : ''"
              :prop="item.value"
              :class="item.className"
              :style="{ 'width': getItemWidth(item) }"
              :required="item.required"
            >
              <!-- 审核时标记颜色且鼠标经过需要看到更改之前的值，涉及页面：平台对接 -->

              <template
                #label
                v-if="
                  info.diffData &&
                  (info.diffData[item.diffValue || item.value] ||
                    info.diffData[item.diffValue || item.value] === 0 ||
                    info.diffData[item.diffValue || item.value] === '')
                "
              >
                <el-tooltip
                  placement="top"
                  effect="light"
                  :content="
                    '改动前：' + info.diffData[item.diffValue || item.value]
                  "
                >
                  <span :style="{ color: '#ec808d' }"
                    ><el-icon><View /></el-icon>{{ item.label + '：' }}</span
                  >
                </el-tooltip>
              </template>
              <div
                v-if="item.type === 'text' || !item.type"
                class="basic-text"
                :style="
                  info.diffData &&
                  (info.diffData[item.diffValue || item.value] ||
                    info.diffData[item.diffValue || item.value] === 0 ||
                    info.diffData[item.diffValue || item.value] === '')
                    ? { color: '#ec808d' }
                    : ''
                "
              >
                {{
                  item.formatter
                    ? item.formatter(info.data)
                    : info.data[item.value] === 0
                    ? 0
                    : info.data[item.value] || '-'
                }}
              </div>
              <el-popover
                v-else-if="item.type === 'popover'"
                placement="top-start"
                width="300"
                trigger="click"
                :disabled="info.data[item.value] ? false : true"
                :content="info.data[item.value]"
              >
                <template #reference>
                  <div
                    class="basic-popover"
                    :style="
                      info.diffData &&
                      (info.diffData[item.diffValue || item.value] ||
                        info.diffData[item.diffValue || item.value] === 0 ||
                        info.diffData[item.diffValue || item.value] === '')
                        ? { color: '#ec808d' }
                        : ''
                    "
                  >
                    {{ info.data[item.value] || '-' }}
                  </div>
                </template>
              </el-popover>
              <template v-else-if="item.type === 'slot'">
                <slot :name="'basic-' + item.value" />
              </template>
              <template v-else-if="item.type === 'progress'">
                <el-progress
                  class="progress"
                  :text-inside="true"
                  :stroke-width="16"
                  :percentage="info.data[item.value]"
                  :color="item.color || '#rgb(22, 93, 255)'"
                  :style="{width : item.width || '80%'}"
                ></el-progress>
              </template>
            </el-form-item>
          </template>
        </el-col>
        <el-col
          v-if="imageField && Object.keys(imageField).length"
          :span="6"
          :xl="4"
          class="flex_wrap_start_start"
        >
          <el-form-item
            :key="1 + Math.random()"
            class="image-form-item"
            style="width: 100% !important"
          >
            <p
              v-if="imageField.label"
              style="
                text-align: center;
                font-size: 16px;
                color: #606266;
                margin: 0 auto;
              "
            >
              {{ imageField.label }}
            </p>
            <el-carousel
              v-if="imageField.multipleSheets"
              class="carousel-wrapper"
              :class="!imgList.length ? 'bgimg' : ''"
              :autoplay="false"
              height="150px"
            >
              <template v-if="imgList.length">
                <el-carousel-item
                  v-for="(item, index) in imgList"
                  :key="index"
                  class="carousel-item"
                  @click.native="handleCarousel"
                >
                  <el-image :src="item.url" class="image-style" />
                </el-carousel-item>
              </template>
            </el-carousel>
            <div
              v-else
              class="image-box"
              :class="!imgList.length ? 'bgimg' : ''"
              @click="handleCarousel"
            >
              <el-image
                v-if="imgList.length"
                :src="imgList[0].url"
                class="image-style"
              ></el-image>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span v-else>暂无信息</span>
    <EleGallery
      v-if="dialogInfo.visible"
      v-model:show-dialog="dialogInfo.visible"
      :file-list="imgList"
      :title="imageField.label"
      :multiple-sheets="false"
    />
  </div>
</template>

<script setup name="BasicInformation">
const EleGallery = defineAsyncComponent(() =>
  import('@/components/UploadImg/eleGallery')
)
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
  info: {
    type: Object,
    default: function () {
      return {
        data: {},
        fieldList: {},
      }
    },
  },
  imageField: {
    type: Object,
    default: function () {
      return {}
    },
  },
  className: {
    type: String,
    default: 'paddingBox order-model-formBox flex_wrap_start_start',
  },
  // label宽度
  labelWidth: {
    type: String,
    default: '150px',
  },
  // 验证规则
  rules: {
    type: Object,
    default: function () {
      return {}
    },
  },
  refObj: {
    type: Object,
    default: function () {
      return {}
    },
  },
})
const imgList = ref([])
const dialogInfo = ref({
  visible: false,
  title: '查看图片',
})
watch(
  () => props.info.data,
  () => {
    // 将form实例返回到父级
    if (props.imageField && Object.keys(props.imageField).length) {
      let arr = props.info.data[props.imageField.value] || []
      if (arr.length) {
        imgList.value = arr.map((item) => {
          if (typeof item === 'string') {
            item = {
              name: item,
              url: import.meta.env.VITE_APP_FILE_URL + item,
            }
          }
          item.uid = item.uid || new Date().getTime() + (1 + Math.random())
          return item
        })
      } else {
        imgList.value = []
      }
    }
  },
  {
    deep: true,
  }
)

onMounted(() => {
  // 将form实例返回到父级
  emits('update:refObj', proxy.$refs.form)
})

function getConfigList() {
  let fieldList = props.info.fieldList.filter(
    (item) =>
      !item.hasOwnProperty('show') || (item.hasOwnProperty('show') && item.show)
  )
  setTimeout(() => {
    proxy.$store.dispatch('app/togglePageTable')
    proxy.$store.dispatch('app/toggleOpenFilter')
  }, 0)
  return fieldList
}

function getItemWidth(item) {
  if(item.width) {
    return item.width + '!important'
  }
}

function handleCarousel() {
  if (!imgList.value.length) {
    return
  }
  dialogInfo.value.visible = true
}
</script>

<style scoped lang="scss">
.order-model-formBox div.el-form-item:not(.not-br) {
  margin-right: 10px;
}
.padding {
  padding: 0 !important;
}
.el-form-item {
  margin-bottom: 0 !important;
}
.basic-text {
  word-break: break-all;
  line-height: 1;
}
.progress {
  padding-top: 5px;
  width: 80%;
}
:deep(.image-form-item) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
  .el-form-item__content {
    margin-left: 0 !important;
    max-width: 225px;
    min-width: 200px;
  }
}
.carousel-wrapper {
  margin-bottom: 10px;
  width: 100%;
  background-color: #ebeef5;
}
.carousel-item {
  display: flex;
  align-items: center;
  justify-content: center;
  .image-style {
    background: #ffffff;
    max-height: 150px;
    max-width: 100%;
  }
}
.image-box {
  width: 148px;
  height: 148px;
  border: 1px dashed #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: #ebeef5;
  margin: 0 auto;
  .image-style {
    background: #ffffff;
    max-height: 148px;
    max-width: 148px;
  }
}
.bgimg {
  background-image: url(../../assets/image/no-img.png);
  background-repeat: no-repeat;
  background-size: 40px 40px;
  background-position: 50% 50%;
}
.basic-popover {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
}
</style>
