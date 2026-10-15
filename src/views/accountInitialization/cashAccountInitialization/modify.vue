<script setup>
import {getCurrentInstance, reactive, ref} from "vue";
import ModifyPage from "@/components/ModifyPage/ModifyPage.vue";
import ModifyForm from "@/components/ModifyPage/ModifyForm.vue";
import {useSelectData} from "@/hooks/useSelectData";
import {
  addCashAccountInitialization, oneCashAccountInitialization,
  updateCashAccountInitialization
} from "@/api/accountInitialization/cashAccountInitialization";

const { proxy } = getCurrentInstance();
const API = {
  one: oneCashAccountInitialization,
  add: addCashAccountInitialization,
  batchAdd: null,
  update: updateCashAccountInitialization
}

const emit = defineEmits()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  batch: false,
  id: '',
  flowFormType: ''
})
const pageBtn = ref([
  { label: '保存并新增', event: saveAndAdd, show: props.batch }
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
  modifyFormRef: null,
  title: '现金账户初始账',
  labelWidth: '120px',
  listType: {
  },
  fieldList: [
    { label: '现金账户编码', value: 'cashAccountCode', type: 'slot' },
    { label: '现金账户名称', value: 'cashAccountName', type: 'input', disabled: true },
    { label: '期初余额', value: 'openingMoney', type: 'money' },
    { label: '备注', value: 'remark', type: 'textarea' },
  ],
  rules: {
    cashAccountCode: [{ required: true, message: '请选择现金账户', trigger: 'change' }],
    openingMoney: [{ required: true, message: '请输入期初余额', trigger: 'blur' }],
  },
  data: {}
})

const { selectorInfo, selectorRef } = useSelectData()


onMounted(() => {
  if (props.id) {
    getMain()
  }
})

function getMain() {
  API.one(props.id).then(res => {
    formInfo.data = res.data
  })
}

function saveAndAdd() {
  pageRef.value.validate().then(res => {
    save(null, false)
  }).catch(err => {
    save(err)
  })
}
const save = (err, close = true) => {
  if (err) return
  const api = props.id ? API.update : props.batch ? API.batchAdd : API.add
  api({
    ...formInfo.data,
  }).then(({ code }) => {
    if (code === 200) {
      proxy.$message.success('保存成功')
      if (!close) {
        formInfo.data = {}
        return
      }
      showDialog.value = false
      emit('returnModify', true)
    }
  })
}

function selectCashAccount() {
  selectorInfo.type = 'baseCashAccount'
  selectorInfo.query = {}
  selectorInfo.callback = (row) => {
    formInfo.data.cashAccountId = row.id
    formInfo.data.cashAccountCode = row.code
    formInfo.data.cashAccountName = row.name
  }
  selectorInfo.visible = true
}
</script>

<template>
  <ModifyPage ref="pageRef" v-model:visible="showDialog" :title="title" :btnList="pageBtn" @save="save">
    <ModifyForm :form-info="formInfo" :listTypeInfo="formInfo.listType">
      <template #form-cashAccountCode>
        <el-input
            v-model="formInfo.data.cashAccountCode"
            style="width: 100%"
            class="not-mongolia"
            type="input"
            :required="true"
            :disabled="true"
            placeholder="请选择现金账户"
        >
          <template #append>
            <el-icon @click="selectCashAccount"
            ><Search
            /></el-icon>
          </template>
        </el-input>
      </template>
    </ModifyForm>
  </ModifyPage>
  <select-data ref="selectorRef" />
</template>

<style scoped lang="scss">

</style>
