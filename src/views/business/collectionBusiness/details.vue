<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {
  oneCollectionBusiness,
  allDetailCollectionBusiness,
} from "@/api/business/collectionBusiness";
import ModifyTabs from "@/components/ModifyPage/ModifyTabs.vue";
import ModifyTab from "@/components/ModifyPage/ModifyTab.vue";
import ModifyTable from "@/components/ModifyPage/ModifyTable.vue";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import moment from "moment";
import Modify from './modify'
import EleGallery from '@/components/UploadImg/eleGallery.vue'
import ModifyBasicInformation from "@/components/ModifyPage/ModifyBasicInformation.vue";

const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'collectionBusiness'
const store = useStore()
const API = {
  one: oneCollectionBusiness,
  detail: allDetailCollectionBusiness
}
const emit = defineEmits(['returnModify'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  id: '',
  flowFormType: ''
})

const pageBtn = ref([
])
const pageRef = ref()
const showDialog = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    // 更新父组件visible
    emit('update:visible', newValue)
  },
})
const formInfo = reactive({
  title: '收款信息',
  fieldList: [
    { label: '单据号', value: 'orderNo' },
    { label: '业务日期', value: 'orderTime', formatter: (row) => moment(row.orderTime).format('YYYY-MM-DD') },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '单位现金账户', value: 'cashAccountName' },
    { label: '单位银行账户', value: 'bankAccountName' },
    { label: '收付款类型', value: 'typeValue' },
    { label: '收款金额', value: 'money', formatter: (val) => proxy.$fn.TripartiteMethod(val.money) },
    { label: '单据状态', value: 'confirmStatusValue' },
    { label: '备注', value: 'remark' },
  ],
  data: {}
})
const tableInfo = reactive({
  btnList: [],
  checkBox: false,
  fieldList: [
    { label: '摘要', value: 'remark' },
    { label: '收支项目', value: 'itemName' },
    { label: '收款日期', value: 'tradeTime', align: 'center', formatter: (row) => moment(row.tradeTime).format('YYYY-MM-DD') },
    { label: '收款金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '交易对象户名', value: 'tradeObjectAccountName' },
    { label: '交易对象开户行', value: 'tradeObjectOpeningBank' },
    { label: '交易对象账号', value: 'tradeObjectNum' },
    { label: '是否归集', value: 'isCollectionValue' },
  ],
  summaryFieldList: [
    { value: 'money', formatter: proxy.$fn.TripartiteMethod },
  ],
  data: [],
  sectionRows: []
})

const modifyInfo = reactive({
  id: null,
  title: '修改收款业务',
  visible: false
})

const activeTab = ref('1')
const { fileFormInfo } = useAttachUpload()

onMounted(() => {
  if (props.id) {
    reloadPageData()
  }
})

function reloadPageData() {
  getMain()
  getDetail()
  getAttach()
}

function openModify() {
  modifyInfo.id = props.id
  modifyInfo.visible = true
}

function getMain() {
  API.one(props.id).then(res => {
    formInfo.data = res.data
    settleMethodEffect(res.data.cash)
  })
}

function getDetail() {
  API.detail({ orderId: props.id }).then(res => {
    if (res.success) {
      tableInfo.data = res.data
    }
  })
}

function getAttach() {
  annexUploadAll({ relativeId: props.id }).then(res => {
    fileFormInfo.data.filePathList = res.data
  })
}

function settleMethodEffect(cash) {
  formInfo.fieldList.find(it => 'cashAccountName'=== it.value).show = cash == 1
  formInfo.fieldList.find(it => 'bankAccountName' === it.value).show = cash == 0
  tableInfo.data.forEach(it => {
    it.settlementMethod = formInfo.data.settlementMethod
    it.settlementMethodName = formInfo.data.settlementMethodName
  })
}
</script>

<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" no-full-button flex v-model:visible="showDialog" :title="title" :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="
              $permission(`${PERMISSION_CODE}:update`) &&
              formInfo.data.confirmStatus != '1'
            "
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="openModify"
      >编辑</el-button
      >
    </template>
    <ModifyBasicInformation :info="formInfo"></ModifyBasicInformation>
    <ModifyTabs title="明细信息" v-model="activeTab">
      <ModifyTab label="收款信息" name="1">
        <ModifyTable no-title isDynamic :table-info="tableInfo" :checkbox="false">
        </ModifyTable>
      </ModifyTab>
      <ModifyTab label="附件管理" name="2">
        <ModifyBasicInformation :info="fileFormInfo">
          <template #basic-filePathList>
            <div>
              <EleGallery
                  v-if="
                    fileFormInfo.data.filePathList &&
                    fileFormInfo.data.filePathList.length
                  "
                  :lazy="true"
                  :size="150"
                  :source="fileFormInfo.data.filePathList"
                  title="附件"
              />
              <span v-else>-</span>
            </div>
          </template>
        </ModifyBasicInformation>
      </ModifyTab>
    </ModifyTabs>
  </ModifyPage>
  <Modify
      v-if="modifyInfo.visible"
      v-model:visible="modifyInfo.visible"
      :id="modifyInfo.id"
      :batch="modifyInfo.batch"
      :title="modifyInfo.title"
      @returnModify="reloadPageData"
  />
</template>

<style scoped lang="scss">

</style>
