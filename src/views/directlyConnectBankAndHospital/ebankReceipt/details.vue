<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import {useAttachUpload} from "@/hooks/useAttachUpload";
import {annexUploadAll} from "@/api/base";
import moment from "moment";
import ModifyBasicInformation from "@/components/ModifyPage/ModifyBasicInformation.vue";
import {oneEbankReceipt} from "@/api/directlyConnectBankAndHospital/ebankReceipt";
import ModifyTab from "@/components/ModifyPage/ModifyTab.vue";
import EleGallery from "@/components/UploadImg/eleGallery.vue";

const { proxy } = getCurrentInstance();
const API = {
  one: oneEbankReceipt
}
const emit = defineEmits(['returnModify'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '银行回单详情',
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
  title: '基本信息',
  fieldList: [
    { label: '回单单号', value: 'receiptNo' },
    { label: '回单日期', value: 'tranDateStr' },
    { label: '账户信息', value: 'bankAccountName' },
    { label: '柜员交易号', value: 'tranNo' },
    { label: '交易流水号', value: 'transSerialNum' },
    { label: '结算单号', value: 'orderNo' },
    { label: '对方名称', value: 'tradeObjectName' },
    { label: '对方账号', value: 'tradeObjectAccNum' },
    { label: '收款金额', value: 'collectionAmount', formatter: (val) => proxy.$fn.TripartiteMethod(val.collectionAmount) },
    { label: '付款金额', value: 'paymentAmount', formatter: (val) => proxy.$fn.TripartiteMethod(val.paymentAmount) },
  ],
  data: {}
})

const { fileFormInfo } = useAttachUpload()
fileFormInfo.title = '附件'
fileFormInfo.labelWidth = '0'

onMounted(() => {
  if (props.id) {
    reloadPageData()
  }
})

function reloadPageData() {
  getMain()
  getAttach()
}

function getMain() {
  API.one(props.id).then(res => {
    formInfo.data = res.data
  })
}

function getAttach() {
  annexUploadAll({ relativeId: props.id }).then(res => {
    fileFormInfo.data.filePathList = res.data
  })
}
</script>

<template>
  <ModifyPage ref="pageRef" :flowFormType="flowFormType" no-full-button flex v-model:visible="showDialog" :title="title" :btnList="pageBtn">
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
</template>

<style scoped lang="scss">

</style>
