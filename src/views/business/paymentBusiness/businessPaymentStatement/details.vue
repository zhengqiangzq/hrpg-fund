<script setup>
import {getCurrentInstance, onMounted, reactive, ref, computed} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyTabs from "@/components/ModifyPage/ModifyTabs.vue";
import ModifyTab from "@/components/ModifyPage/ModifyTab.vue";
import ModifyVxeTable from "@/components/ModifyPage/ModifyVxeTable.vue";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import {doPrint} from "@/utils/exportUtil";
import {useChangeLogDrawer} from "@/hooks/useChangeLogDrawer";
import moment from "moment";
import Modify from './modify'
import EleGallery from '@/components/UploadImg/eleGallery.vue'
import {
  allDetailBusinessPaymentStatement,
  oneBusinessPaymentStatement
} from "@/api/business/businessPaymentStatement";
import ModifyBasicInformation from "@/components/ModifyPage/ModifyBasicInformation.vue";
import {useWujieTurnPage} from "@/hooks/useWujieTurnPage";
import {jumpToDetails} from "@/hooks/jumpDetails";

const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'businessPaymentStatement'
const store = useStore()
const API = {
  one: oneBusinessPaymentStatement,
  detail: allDetailBusinessPaymentStatement
}
const emit = defineEmits(['returnModify'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: '',
  },
  flowFormType: {
    type: String,
    default: '',
  },
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
const affairTableInfo = reactive({
  query: {
    orderType: 4202,
    orderId: props.id,
    businessKey: '',
    businessType: 'fundsPaymentOrder',
    sort: 'operate_time desc',
  },
})
const { openChangeLogDrawer } = useChangeLogDrawer()
const formInfo = reactive({
  title: '付款信息',
  fieldList: [
    { label: '机构名称', value: 'orgName', show: proxy.$fn.getIsOtherOrg() },
    { label: '单据号', value: 'orderNo' },
    { label: '业务日期', value: 'orderTime', formatter: (row) => moment(row.orderTime).format('YYYY-MM-DD') },
    { label: '经办人', value: 'createUserName' },
    { label: '职能部门', value: 'createUserDeptName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '现金账户', value: 'cashAccountName' },
    { label: '银行账户', value: 'bankAccountName' },
    { label: '附件张数', value: 'attachCount' },
    { label: '是否网银', value: 'netPayName' },
    { label: '网银开通状态', value: 'netBankOpenStatusName' },
    { label: '收付款类型', value: 'typeValue' },
    { label: '付款金额', value: 'money', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '关联合同', value: 'isRelateContractName' },
    { label: '合同编号', value: 'contractNos', type: 'slot', show: computed(() => formInfo.data.isRelateContract === '1') },
    { label: '合同名称', value: 'contractNames', show: computed(() => formInfo.data.isRelateContract === '1') },
    { label: '单据状态', value: 'statusValue' },
    { label: '单据状态', value: 'statusValue' },
    { label: '结算状态', value: 'settlementStatusValue' },
    { label: '付款事由', value: 'remark', width: '100%' },
    { label: '付款说明', value: 'payRemark', width: '100%' },
  ],
  data: {}
})
const tableInfo = reactive({
  btnList: [],
  checkBox: false,
  fieldList: [
    { label: '请款单号', value: 'payOrderNo', type: 'slot' },
    { label: '摘要', value: 'remark' },
    { label: '收支项目', value: 'itemName' },
    { label: '交易日期', value: 'tradeTime', align: 'center', formatter: (row) => moment(row.tradeTime).format('YYYY-MM-DD') },
    { label: '金额', value: 'money', align: 'right', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '交易对象类型', value: 'tradeTypeValue' },
    { label: '交易对象', value: 'tradeObjectName' },
    { label: '卡类型', value: 'staffCardTypeValue' },
    { label: '交易对象银行类别', value: 'bankDocTypeName', width: 170 },
    { label: '交易对象开户行', value: 'bankDocName', width: 160 },
    { label: '交易对象联行号', value: 'interBankNum', width: 160 },
    { label: '交易对象户名', value: 'tradeBankAccountName' },
    { label: '交易对象银行账号', value: 'accNum', width: 170 },
    { label: '票据号', value: 'payBillNum' },
    { label: '汇票类型', value: 'billTypeName' },
    { label: '支付状态', value: 'payStatusValue' },
    { label: '业务来源', value: 'businessSourceValue' },
    { label: '业务类型', value: 'businessType' },
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
    activeTab.value = '2'
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
    activeTab.value = '1'
    affairTableInfo.query.businessKey = res.data.orderNo
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

function handlePrint() {
  doPrint({
    name: '资金管理业务结算单打印模版.ureport.xml',
    params: {
      id: props.id || props.orderId,
      orderId: props.id || props.orderId,
      orderNo: formInfo.data.orderNo,
      orderOrg: formInfo.data.orgId,
      orderGroup: formInfo.data.groupId,
      key: formInfo.data.orderNo,
      type: 'fundsPaymentOrder',
      createUserName: formInfo.data.createUserName
    },
    printCount: true,
    data: {},
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
const { turnMessagePage } = useWujieTurnPage()
function turnToContractDetail(contractInfo) {
  const typeUrl = {
    1: '/contract/contractEntry/paymentContract',
    2: '/contract/contractEntry/collectionContract',
    3: '/contract/contractEntry/nonEconomicContract'
  }
  if(!contractInfo.contractIds) return;
  turnMessagePage({
    urlType: 'detail',
    businessId: contractInfo.contractIds,
    detailUrl: typeUrl[contractInfo.contractType],
    doNotSwitch: true
  })
}
function turnToDetail(row) {
  if(!row.payOrderNo) return true
  jumpToDetails(row)
}

</script>

<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" :affairTableInfo="affairTableInfo" :flowFormType="flowFormType" no-full-button flex v-model:visible="showDialog" :title="title" :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="
              !flowFormType &&
              $permission(`${PERMISSION_CODE}:update`) &&
              (formInfo.data.status == '1' || formInfo.data.status == 4)
            "
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="openModify"
      >编辑</el-button
      >
      <el-button
          v-if="
              !!flowFormType && !disabled
            "
          class="el-button el-button--medium filter-button"
          @click="openChangeLogDrawer(id)"
      >修改记录</el-button
      >
      <el-button
          v-if="$permission(`${PERMISSION_CODE}:print`) && formInfo.data.status !== '1'"
          type="primary"
          class="el-button el-button--medium filter-button"
          @click="handlePrint"
      >打印</el-button>
    </template>
    <ModifyBasicInformation :info="formInfo">
      <template #basic-contractNos>
        <template v-for="(contract, index) in formInfo.data.contractNos?.split(',')"
                  :key="index">
                  <span class="slip-edit"
                        @click="turnToContractDetail({
                          contractIds: formInfo.data.contractIds.split(',')[index],
                          contractType: formInfo.data.contractType
                        })">{{ contract }}</span>
          <span v-if="index < formInfo.data.contractNos?.split(',').length - 1">,</span>
        </template>
      </template>
    </ModifyBasicInformation>
    <ModifyTabs title="明细信息" v-model="activeTab">
      <ModifyTab label="付款信息" name="1">
        <ModifyVxeTable no-title isDynamic :table-info="tableInfo" :checkbox="false">
          <template #col-payOrderNo="{row}">
            <span class="slip-edit"
                  @click="turnToDetail(row)">{{ row.payOrderNo || '-' }}</span>
          </template>
        </ModifyVxeTable>
      </ModifyTab>
      <ModifyTab label="附件管理" name="2">
        <ModifyBasicInformation :info="fileFormInfo" no-title>
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
