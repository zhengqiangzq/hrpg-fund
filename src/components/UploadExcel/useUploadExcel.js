import {getCurrentInstance, render, h, reactive} from "vue";
import UploadExcel from './index.vue'
import UploadLog from './uploadLog.vue'

// 业务数据导入编码
const BUSINESS_DATA_CODE = [
    14001, 14002, 14003, 14004, 14005, 14006, 14007, 14008, 14009, 14010,
    14011, 14012, 14013, 14014, 14015
]

export default function (options = {
    PERMISSION_CODE: '', // 权限编码
    BUTTON_CODE: 'import', // 按钮编码
    allocationDataType: '', // 分配管控编码
    type: '', // 导入类型
    action: '', // 导入地址
    showFilter: true, // 是否显示表单
    params: {} // 额外参数，注意参数重名，导致type被覆盖
}) {

    options.BUTTON_CODE = options.BUTTON_CODE ?? 'import'
    // 若未传入则采用基础数据展示，业务数据隐藏
    options.showFilter = options.showFilter ?? !BUSINESS_DATA_CODE.includes(Number(options.type))

    const { proxy, appContext } = getCurrentInstance()

    const uploadExcelInfo = reactive({
        params: {
            businessParams: '',
            ...options.params,
        }
    })
    const uploadLogInfo = reactive({
        query: {
            type: options.type,
            ...options.params,
        }
    })
    // 打开上传弹窗
    function uploadTest(){
        const div = document.createElement('div')
        div.className = 'upload-excel-container'
        document.body.appendChild(div)

        const vUploadExcel = h(UploadExcel, {
            showDialog: true,
            type: options.type,
            showFilter: options.showFilter,
            importParams: uploadExcelInfo.params,
            btnCode: `${options.PERMISSION_CODE}:${options.BUTTON_CODE}`,
            action: options.action,
            'onUpdate:showDialog' (value) {
                render(null, div)
                div.remove()
            }
        })
        // 添加vue上下文
        vUploadExcel.appContext = appContext
        render(vUploadExcel, div)
    }
    // 打开上传日志
    function uploadLog(){
        const div = document.createElement('div')
        div.className = 'upload-log-container'
        document.body.appendChild(div)

        const vUploadLog = h(UploadLog, {
            showDialog: true,
            query: uploadLogInfo.query,
            'onUpdate:showDialog' (value) {
                render(null, div)
                div.remove()
            }
        })
        // 添加vue上下文
        vUploadLog.appContext = appContext
        render(vUploadLog, div)
    }

    const uploadExcelBtns = [
        {
            type: 'button',
            label: `导入`,
            event: uploadTest,
            show: proxy.$permission(`${options.PERMISSION_CODE}:${options.BUTTON_CODE}`) && (options.allocationDataType ? proxy.$getBtnControl(options.allocationDataType) : !0),
        },
        {
            type: 'button',
            label: '导入日志',
            event: uploadLog,
            show: proxy.$permission(`${options.PERMISSION_CODE}:${options.BUTTON_CODE}`),
        },
    ]

    return {
        uploadExcelBtns,
    }
}
