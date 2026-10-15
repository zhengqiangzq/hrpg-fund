<template>
  <page-dialog
    :title="dialogInfo.title"
    v-model:visible="shows"
    :width="width"
    :bt-loading="dialogInfo.btLoading"
    :isAfterClose="true"
    @reset="handleClose"
  >
    <page-filter
      v-if="btnType === '1' && showFilter"
      v-model:query="filterInfo.query"
      :filter-list="filterInfo.list"
      :listTypeInfo="filterInfo.options"
    />
    <el-upload
      v-if="btnType === '1'"
      v-model:file-list="fileList"
      ref="uploadRef"
      drag
      :action="uploadInfo.action"
      :headers="uploadInfo.headers"
      :data="uploadInfo.data"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :multiple="multiple"
      :auto-upload="false"
      :limit="limit"
      :on-exceed="onExceed"
      :before-upload="beforeupload"
      :before-remove="beforeRemove"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或 <em>点击上传</em>
      </div>
    </el-upload>

    <div v-if="btnType === '1'" class="msg">{{ msg }}</div>
    <!-- <div class="tips">
      <img src="/src/assets/image/notice.png" width="14px" height="14px" alt="">:
      <span>单次上传只能上传一个文件</span>
    </div>	 -->
    <BasicInformation
      v-if="btnType === '2'"
      :info="infoList"
      :labelWidth="infoList.labelWidth">
        <template v-slot:basic-totalRecord>
          <span>
            {{ infoList.data.totalRecord  }}
          </span>
        </template>
        <template v-slot:basic-successRecord>
          <span>
            {{ infoList.data.successRecord  }}
          </span>
        </template>
        <template v-slot:basic-errorRecord>
          <span>
            {{ infoList.data.errorRecord  }}
          </span>
        </template>
        <template v-slot:basic-sourceName>
          <span
            v-if="infoList.data.sourceUrl"
            class="slip-edit"
            @click="downLoad(infoList.data.sourceUrl, infoList.data.sourceName)"
          >
            {{ infoList.data.sourceName || '-' }}
          </span>
          <span v-else>-</span>
        </template>
        <template v-slot:basic-resultName>
          <span
            v-if="infoList.data.resultUrl"
            class="slip-edit"
            @click="downLoad(infoList.data.resultUrl, infoList.data.resultName)"
          >
            {{ infoList.data.resultName || '-' }}
          </span>
          <span v-else>-</span>
        </template>
    </BasicInformation>
    <BasicInformation
      v-if="btnType === '3'"
      :info="infoList3"
      :labelWidth="infoList3.labelWidth">
    </BasicInformation>
    <div v-if="btnType === '3'">提示：数据异步导入中，请稍后在导入日志中查看导入结果。</div>
    <div class="footer-btn" :class="btnType=== '3' ? 'footer-btn-end' : ''">
      <el-button v-if="btnType === '1'" type="primary" :disabled="!fileList.length" @click="importFile">导入</el-button>
      <el-button v-if="btnType === '1'" :disabled="!fileList.length" @click="backendImportFile">后台导入</el-button>
      <el-button v-if="btnType === '2'" type="primary" @click="stop" :disabled="canStop">中断</el-button>
      <el-button v-if="btnType === '2'" @click="initiate" :disabled="canInitiate">继续</el-button>
      <el-button @click="handleClose">取消</el-button>
    </div>
  </page-dialog>
</template>

<script setup name="UploadExcel">
import axios from 'axios'
import {
  excelImportRecordInitImportRecord,
  excelImportRecordGetCacheInfo,
  excelImportRecordInterrupt,
  excelImportRecordClose,
  excelImportRecordResume,
  excelImportRecordUpdateStatus
 } from "@/api/base"
import {getCurrentInstance, onMounted} from "vue";
import { exportExcel } from "@/api/pub.js"
import { getToken } from '@/utils/auth'
const emits = defineEmits()
const { proxy } = getCurrentInstance()

const props = defineProps({
  title: {
    type: String,
    default: '导入'
  },
  showDialog: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  showFilter: {
    type: Boolean,
    default: true
  },
  // 导入参数
  importParams: {
    type: Object,
    default: {}
  },
  // 过滤不存在的下拉数据
  selectCode: {
    type: Array,
    default: []
  },
  initType: {
    type: String,
    default: '1' //  1导入，2 同步详情(点击导入)，3异步详情(点击后台导入)
  },
  type: {
    type: String,
    default: ''
    //1物资，2药品
  },
  btnCode: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '640px'
  },
  action: {
    type: String,
    default: ''
  },
  limit: {
    type: Number,
    default: 1
  },
  fileType: {
    type: Array,
    default: () => {
      return ['xlsx']
    }
  }
});
const fileList = ref([])
const uploadRef = ref(null)
const filterInfo = ref({
  query: {
    importType: '1',
    syncType: '',
    type: props.type
  },
  options: {
    imTypes: []
  },
  list: [
    {
      type: 'select-model',
      label: '编码重复时',
      value: 'importType',
      code: 'excel_import_type',
      clearable: false
    },
  ],
})
let timer = ref(null)
const canStop = ref(false)
const canInitiate = ref(true)
const closeTimeout = ref(false)
const isUploadError = ref(false)
const msg = ref('')
const btnType = ref(props.initType)
const uploadInfo = ref({
  action: axios.defaults.baseURL + props.action,
  headers: {
    Authorization: getToken(),
    'x-auth-token': getToken(),
  },
  data: {
    excelRecordId: ''
  }
})
const isCloseReQuest = ref(true)
const dialogInfo = ref({
  btLoading: false,
  title: props.title,
  btList: [
    // { label: '导入', event: importFile, show: btnType.value === '1' },
    // { label: '后台导入', event: backendImportFile, show: btnType.value === '1' },
    // { label: '中止', event: stop, show: btnType.value === '2' },
    // { label: '继续', event: initiate, show: btnType.value === '2' },
    // { label: '关闭', event: handleClose, show: true },
  ],
})
const infoList = ref({
  data: {},
  fieldList: [
    { label: '任务号', value: 'orderNo', type: 'text', className: 'not-br' },
    { label: '进度', value: 'progress', type: 'progress', color: '#46bd9b', className: 'not-br', width: '100%' },
    { label: '总条数', value: 'totalRecord', type: 'slot', className: 'not-br' },
    { label: '成功条数', value: 'successRecord', type: 'slot', className: 'not-br' },
    { label: '失败条数', value: 'errorRecord', type: 'slot', className: 'not-br' },
    { label: '源文件', value: 'sourceName', type: 'slot', className: 'not-br' },
    { label: '结果文件', value: 'resultName', type: 'slot', className: 'not-br' },
  ],
  labelWidth: '100px',
})
const orderNo = ref('')
const infoList3 = ref({
  data: {},
  fieldList: [
    { label: '任务号', value: 'orderNo', type: 'text' },
  ],
  labelWidth: '64px',
})
const shows = computed({
  get() {
    return props.showDialog
  },
  set(newValue) {
    emits('update:showDialog', newValue) // 更新父组件shows
  },
})
onMounted(() => {
  // 过滤
  if(props.selectCode.length > 0) {
    const imTypes = proxy.$store.state.permission.dict['excel_import_type']?.filter(it => !props.selectCode.includes(it.code))
    filterInfo.value.options.imTypes = imTypes.map((it) => {
      return {
        key: it.name,
        value: it.code,
      }
    })
    filterInfo.value.list[0].type = 'select'
    filterInfo.value.list[0].list = 'imTypes'
  }
  filterInfo.value.query = {
    ...filterInfo.value.query,
    ...props.importParams
  }

})
onUnmounted(() => {
  closeTimeout.value = true
  timer.value = null


});
//导入
function importFile(){
 let flag = beforeProductUpload(fileList.value[0])
 if(flag){

  // btnType.value = '2'
  // dialogInfo.value.title = '导入详情'
  //  uploadRef.value?.submit()
  filterInfo.value.query.syncType = '1'
  initImportRecord('2')

 }
}
function onExceed(files){
  if(files.length){
    proxy.$message.warning({
      message: '单次只能上传一个文件！',
      duration: 3000,
      showClose: true,
    })
  }
}
//后台导入
function backendImportFile(){
  let flag = beforeProductUpload(fileList.value[0])
 if(flag){
  // btnType.value = '3'
  // dialogInfo.value.title = '导入详情'
  filterInfo.value.query.syncType = '2'
  initImportRecord('3')
  //  uploadRef.value?.submit()

 }
}
function initImportRecord(str){
  let params = {
    ...filterInfo.value.query,
    fileName: fileList.value[0].name
  }
  excelImportRecordInitImportRecord(params, props.btnCode).then(res => {
    if(res && res.success){
      uploadInfo.value.data.excelRecordId = res.data.id
      btnType.value = str
      dialogInfo.value.title = '导入详情'
      infoList.value.data.orderNo = res.data.orderNo
      infoList3.value.data.orderNo = res.data.orderNo
      orderNo.value = res.data.orderNo
      uploadRef.value?.submit()
      if(str === '2'){
        fetchData(res.data.id)
      }
    }
  })
}
function fetchData(id){
  excelImportRecordGetCacheInfo(id).then((res) => {
    if(res && res.success){
      let sumTotal = proxy.$fn.accAdd(res.data?.successRecord || 0, res.data?.errorRecord || 0)
      let accDivNum = proxy.$fn.accDiv(sumTotal || 0, res.data?.totalRecord || 0)
      let progress = proxy.$fn.accMul(parseFloat(accDivNum <= 0 ? 0 : accDivNum.toFixed(2)), 100)
      infoList.value.data = res.data
      infoList.value.data.progress = progress || 0
      infoList.value.data.orderNo = orderNo.value
      canInitiate.value = res.data.continueFlag === '1'
      canStop.value = (!res.data.continueFlag || res.data.continueFlag === '0')
      isCloseReQuest.value = true
      if((sumTotal !== res.data?.totalRecord) || (res.data?.totalRecord === 0 && res.data?.successRecord === 0  && res.data?.errorRecord === 0)){
        timer.value = setTimeout( async() => {
            await (timer.value && clearTimeout(timer.value))
            if(!closeTimeout.value){
              await fetchData(id)
            }
        },5000)
      }else{
        closeTimeout.value = true
      }
      if(isUploadError.value || (sumTotal === res.data?.totalRecord) && (res.data?.totalRecord !== 0 || res.data?.successRecord !== 0  || res.data?.errorRecord !== 0)){
        canStop.value = true
        canInitiate.value = true
        isCloseReQuest.value = false
      }
    }else{
      closeTimeout.value = true
      isCloseReQuest.value = false
      updateStatue()
    }
  }).catch(() => {
    closeTimeout.value = true
    isCloseReQuest.value = false
    updateStatue()
  })
}
async function downLoad(url, name){
  exportExcel({fileName: url}).then(res => {
      if(res){
        proxy.$fn.parseExcel(res, name)
      }
  })
}

//中止
function stop(){
  canInitiate.value = true
  canStop.value = true
  if (timer.value) clearTimeout(timer.value)
  timer.value = null
  excelImportRecordInterrupt(uploadInfo.value.data.excelRecordId).then(res => {
    if(res && res.success){
      canInitiate.value = false
      closeTimeout.value = true
    } else {
      canStop.value = false
    }
  }).catch(err => {
    canStop.value = false
  })
}
//继续
function initiate(){
  canInitiate.value = true
  canStop.value = true
  closeTimeout.value = false
  excelImportRecordResume(uploadInfo.value.data.excelRecordId,'').then(res => {
    if(!(res && res.success)){
      canInitiate.value = false
      if(timer.value){
        closeTimeout.value = true
      }
    } else {
      canStop.value = false
      fetchData(uploadInfo.value.data.excelRecordId)
    }
  }).catch(() => {
    canInitiate.value = false
    if(timer.value){
      closeTimeout.value = true
    }
  })
}
//关闭
function handleClose(){
  if(btnType.value === '2' && isCloseReQuest.value){
    excelImportRecordClose(uploadInfo.value.data.excelRecordId).then(res => {
      if(res && res.success){
        shows.value = false
      }
    })
    return
  }
  shows.value = false
}
function beforeRemove(){
  msg.value = ''
}
function beforeProductUpload(file) {
  //发生请求时打开加载动画
  let fileSize = proxy.$store.state.permission.systemConfig.max_file_size
  let isFileType = props.fileType.some(
    (type) => file.name.split('.')[file.name.split('.').length - 1] === type
  )
  const isLt = file.size / 1024 / 1024 < fileSize
  if (!isFileType) {
    msg.value = `文件格式不正确, 请上传 ${props.fileType.join(' / ')} 格式文件!`
    return false
  }
  if (!isLt) {
    msg.value = `上传文件大小不能超过 ${fileSize} MB!`
    return false
  }
  return isFileType && isLt
}
function uploadSuccess(resp) {
  if (!(resp && resp.success)) {
    proxy.$message.error({
      message: resp.msg,
      duration: 0,
      showClose: true,
    })
    closeTimeout.value = true
    canInitiate.value = true
    canStop.value = true
    isUploadError.value = true
    updateStatue()
  }
}
function uploadError(err) {
  if (err) {
    const message = JSON.parse(err.message || '{}')
    proxy.$message.error({
      message: message.msg || '系统错误',
      duration: 3000,
      showClose: true,
    })
    closeTimeout.value = true
    canInitiate.value = true
    canStop.value = true
    isUploadError.value = true
    updateStatue()
  }
}
function updateStatue(){
  let params = {
    id: uploadInfo.value.data.excelRecordId,
    status: '3'
  }
  excelImportRecordUpdateStatus(params).then(res => {})
}
</script>

<style scoped lang="scss">
  .footer-btn{
    box-sizing: border-box;
    padding-top: 20px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .footer-btn-end{
    justify-content: flex-end;
    padding-right: 0px;
    box-sizing: border-box;
  }
  .msg{
    font-size: 12px;
    color: #f56c6c;
  }
</style>
