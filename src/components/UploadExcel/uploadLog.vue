<template>
    <page-dialog :title="dialogInfo.title" v-model:visible="shows" :width="dialogInfo.width">
        <!-- 条件栏 -->
        <page-filter v-model:query="filterInfo.query" :filter-list="filterInfo.list">
            <template v-slot:filter-operateUserName>
                <!-- <span style="display: inline-block; width: 120px; text-align: right;">操作人：</span> -->
                <el-input v-model="operateUserName" type="input" :disabled="true" class="not-mongolia"
                    placeholder="请选择人员">
                    <template #append>
                        <el-icon @click="openUserList">
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </template>
        </page-filter>
        <dialog-table :refresh="tableInfo.refresh" :init-curpage="tableInfo.initCurpage" v-model:data="tableInfo.data"
            :api="tableInfo.api" :listen-height="false" v-model:query="filterInfo.query"
            :field-list="tableInfo.fieldList" :handle="tableInfo.handle" :highlight-row="highlightRow"
            :check-box="checkBox">
            <template v-slot:col-sourceName="scope">
                <span v-if="scope.row.sourceName" class="slip-edit" @click="download(scope.row, 'sourceFile', scope.row.sourceName)">{{ scope.row.sourceName
                    }}</span>
                <span v-else>-</span>
            </template>
            <template v-slot:col-resultName="scope">
                <span v-if="scope.row.resultName" class="slip-edit" @click="download(scope.row, 'resultFile', scope.row.resultName)">{{ scope.row.resultName
                    }}</span>
                <span v-else>-</span>
            </template>
        </dialog-table>
    </page-dialog>
  <select-data ref="selectorRef" />
</template>

<script setup>
import { getExcelImportRecordPage, excelImportRecordResume, excelImportRecordInterrupt, delExcelImportRecord } from '@/api/base.js'
import { exportExcel } from "@/api/pub.js"
import {useSelectData} from "@/hooks/useSelectData";
const emits = defineEmits()
const { proxy } = getCurrentInstance()
const props = defineProps({
    highlightRow: {
        type: Boolean,
        default: false,
    },
    checkBox: {
        type: Boolean,
        default: false,
    },
    api: {
        type: Function,
        default: getExcelImportRecordPage,
    },
    showDialog: {
        type: Boolean,
    },
    query: {
        type: Object,
        default: function () {
            return {}
        },
    },

})
const { selectorInfo, selectorRef } = useSelectData()
// 过滤相关配置
const filterInfo = ref({
    query: {
        sort: 'create_time desc',
        ...props.query,
    },
    list: [
        // {
        //     type: 'select-model',
        //     label: '业务类型',
        //     value: 'type',
        //     code: 'excel_type',
        //     event: search,
        // },
        {
            type: 'input',
            label: '任务号',
            value: 'orderNoLike',
            event: search,
        },
        {
            type: 'select-model',
            label: '导入方式',
            value: 'syncType',
            code: 'excel_sync_type',
            event: search,
        },
        {
            type: 'select-model',
            label: '导入策略',
            value: 'importType',
            code: 'excel_import_type',
            event: search,
        },
        {
            type: 'select-model',
            label: '状态',
            value: 'status',
            code: 'excel_import_record_status',
            event: search,
        },
        {
            type: 'slot',
            label: '操作人',
            value: 'operateUserName',
            showLabel: true
        },
        { type: 'button', label: '查询', event: search },
        { type: 'button', label: '重置', event: rest },
    ],
})
const operateUserName = ref('')
// 表格相关
const tableInfo = ref({
    refresh: 1,
    initCurpage: 1,
    data: [],
    api: undefined,
    fieldList: [
        { label: '业务类型', value: 'typeValue' },
        { label: '任务号', value: 'orderNo', width: '155px' },
        { label: '导入方式', value: 'syncTypeValue' },
        { label: '导入策略', value: 'importTypeValue' },
        { label: '状态', value: 'statusValue' },
        { label: '开始时间', value: 'startTime' },
        { label: '结束时间', value: 'endTime' },
        { label: '总条数', value: 'totalRecord' },
        { label: '成功条数', value: 'successRecord' },
        { label: '失败条数', value: 'errorRecord' },
        { label: '操作人', value: 'operateUserName' },
        { label: '导入源文件', value: 'sourceName', type: 'slot' },
        { label: '导入结果文件', value: 'resultName', type: 'slot' },
    ],
    handle: {
        fixed: 'right',
        label: '操作',
        width: '100',
        btList: [
            {
                label: '中止',
                event: stop,
                show: true,
                ifRender: (row) => {
                    return row.syncType === '2' && row.status === '1'
                }
            },
            {
                label: '继续',
                event: initiate,
                show: true,
                ifRender: (row) => {
                    return row.syncType === '2' && row.status === '2'
                }
            },
            {
                label: '删除',
                event: remove,
                show: true,
                ifRender: (row) => {
                    return row.status === '3' || row.status === '2'
                }
            },
        ]
    }
})
// 弹窗相关
const dialogInfo = ref({
    title: '导入日志',
    width: '90%'
})
const shows = computed({
    get() {
        return props.showDialog
    },
    set(newValue) {
        emits('update:showDialog', newValue) // 更新父组件shows
    },
})
watch(
    () => props.showDialog,
    (val) => {
        if (val) {
            proxy.$nextTick(() => {
                getList()
            })
        }
    }
)
// 获取列表
function getList() {
    tableInfo.value.api = props.api
    tableInfo.value.refresh = Math.random()
}
function search() {
    tableInfo.value.api = props.api
    tableInfo.value.initCurpage = Math.random()
    tableInfo.value.refresh = Math.random()
}
function rest() {
    filterInfo.value.query = {
        sort: 'create_time desc',
        ...props.query,
    }
    operateUserName.value = "";
    search()
}
function openUserList() {
  selectorInfo.title = '操作人'
  selectorInfo.type = 'users'
  selectorInfo.query = {
    type: "normal",
    userType: '1',
    status: undefined,
  }
  selectorInfo.callback = (row) => {
    if (row) {
      filterInfo.value.query["operateUser"] = row.id;
      operateUserName.value = row.name;
    } else {
      filterInfo.value.query["operateUser"] = "";
      operateUserName.value = "";
    }
  }
  selectorInfo.visible = true
}

function stop(row) {
    excelImportRecordInterrupt(row.id).then(res => {
        if (res && res.success) {
            getList()
        }
    })
}
function initiate(row) {
    excelImportRecordResume(row.id).then(res => {
        if (res && res.success) {
            getList()
        }
    })
}
function remove(row) {
    proxy
        .$confirm('删除后将改变数据,是否继续？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
        .then(() => {
            delExcelImportRecord([row.id]).then((res) => {
                if (res && res.success) {
                    getList()
                }
            })
        })
}
function download(row, str, name) {
    exportExcel({fileName: row[str]}).then(res => {
        if(res){
            proxy.$fn.parseExcel(res, name)
        }
    })
}
onMounted(() => {
    proxy.$nextTick(() => {
        getList()
    })
})
</script>

<style scoped lang="scss"></style>
