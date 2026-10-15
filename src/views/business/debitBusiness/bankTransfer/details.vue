<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyTabs from "@/components/ModifyPage/ModifyTabs.vue";
import ModifyTab from "@/components/ModifyPage/ModifyTab.vue";
import {useStore} from "vuex";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import {useChangeLogDrawer} from "@/hooks/useChangeLogDrawer";
import moment from "moment";
import Modify from './modify'
import EleGallery from '@/components/UploadImg/eleGallery.vue'
import {oneBankTransfer} from "@/api/business/bankTransfer";
import ModifyBasicInformation from "@/components/ModifyPage/ModifyBasicInformation.vue";

const { proxy } = getCurrentInstance();
const PERMISSION_CODE = 'bankTransfer'
const store = useStore()
const API = {
  one: oneBankTransfer
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
    orderType: 4205,
    orderId: props.id,
    businessKey: '',
    businessType: 'fundsBankOrder',
    sort: 'operate_time desc',
  },
})
const { openChangeLogDrawer } = useChangeLogDrawer()
const formInfo = reactive({
  title: '收款信息',
  fieldList: [
    { label: '机构名称', value: 'orgName', show: proxy.$fn.getIsOtherOrg() },
    { label: '单据号', value: 'orderNo' },
    { label: '业务日期', value: 'orderTime', formatter: (row) => moment(row.orderTime).format('YYYY-MM-DD') },
    { label: '经办人', value: 'createUserName' },
    { label: '职能部门', value: 'createUserDeptName' },
    { label: '结算方式', value: 'settlementMethodName' },
    { label: '附件张数', value: 'attachCount' },
    { label: '是否网银', value: 'netPayName' },
    { label: '网银开通状态', value: 'netBankOpenStatusName' },
    { label: '转出银行账户', value: 'bankAccountOutName' },
    { label: '转入银行账户', value: 'bankAccountInName' },
    { label: '转账金额', value: 'money', formatter: (row) => proxy.$fn.TripartiteMethod(row.money) },
    { label: '单据状态', value: 'statusValue' },
    { label: '结算状态', value: 'settlementStatusValue' },
    { label: '备注', value: 'remark', width: '100%' },
  ],
  data: {}
})

const modifyInfo = reactive({
  id: null,
  title: '银行划款',
  visible: false
})

const { fileFormInfo } = useAttachUpload()

onMounted(() => {
  if (props.id) {
    reloadPageData()
  }
})

function reloadPageData() {
  getMain()
  getAttach()
}

function openModify() {
  modifyInfo.id = props.id
  modifyInfo.visible = true
}

function getMain() {
  API.one(props.id).then(res => {
    formInfo.data = res.data
    affairTableInfo.query.businessKey = res.data.orderNo
  })
}

function getAttach() {
  annexUploadAll({ relativeId: props.id }).then(res => {
    fileFormInfo.data.filePathList = res.data
  })
}
</script>

<template>
  <ModifyPage v-show="!modifyInfo.visible" ref="pageRef" :affairTableInfo="affairTableInfo" :flowFormType="flowFormType" no-full-button flex v-model:visible="showDialog" :title="title" :btnList="pageBtn">
    <template #full-button>
      <el-button
          v-if="
              !flowFormType &&
              $permission(`${PERMISSION_CODE}:update`) &&
              (formInfo.data.status == '1' || formInfo.data.status == '4')
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
    </template>
    <ModifyBasicInformation :info="formInfo"></ModifyBasicInformation>
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
