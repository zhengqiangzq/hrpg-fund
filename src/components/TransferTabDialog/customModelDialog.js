import {getCurrentInstance, render, h} from "vue";
import transferTabDialog from './index.vue'

/**
 * 兼容「固定值」与「取值函数」两种写法
 * 传函数时会在点击按钮的瞬间执行，保证取到页面最新的查询条件 / 勾选数据 / 分页信息
 */
function resolveOption(value, fallback) {
    return typeof value === 'function' ? (value() ?? fallback) : (value ?? fallback)
}

export default function (options = {
    PERMISSION_CODE: '', // 权限编码
    title: '',
    bizType: '',  // 页面  code
    apiExport: '',  // 自定义导出  页面接口
    categoryId: '',  // 左边tree Id
    idIn: '',    // 勾选数据  id（多个 id  转为字符串 逗号隔开）
    page: {},    // 分页（可传对象或返回对象的函数）
    disabled: false,
    query: {} // 额外参数（可传对象或返回对象的函数，如 () => filterInfo.copyQuery）
}) {
    const {
        PERMISSION_CODE = '',
        title = '',
        bizType = '',
        apiExport = '',
        categoryId = '',
        idIn = '',
        page = {},
        disabled = false,
        query = {},
    } = options

    const { proxy, appContext } = getCurrentInstance()

    // 动态挂载弹窗，关闭时销毁
    function openDialog(dialogProps) {
        const div = document.createElement('div')
        div.className = 'upload-excel-container'
        document.body.appendChild(div)

        const vUploadExcel = h(transferTabDialog, {
            showDialog: true,
            title,
            disabled,
            bizType,
            'onUpdate:showDialog' (value) {
                render(null, div)
                div.remove()
            },
            ...dialogProps,
        })
        // 添加vue上下文
        vUploadExcel.appContext = appContext
        render(vUploadExcel, div)
    }

    // 自定义导入模板
    function custUploadTemp(type, btnCode){
        openDialog({
            title: '自定义导入模板',
            operationType: type,
            btnCode,
            query: { ...resolveOption(query, {}) },
        })
    }

    // 自定义导出
    function custExport(type, btnCode){
        // 点击瞬间再取值：查询条件、勾选数据、分页均来自页面当前状态
        const searchParams = {
            typeId: resolveOption(categoryId, ''),
            ...resolveOption(query, {}),
            ...resolveOption(page, {}),
            idIn: resolveOption(idIn, ''),
        }
        console.log('111111111111', searchParams)
        openDialog({
            title: '自定义导出',
            operationType: type,
            btnCode,
            apiExport,
            query: searchParams,
        })
    }

    const customBtns = [
        {
            type: 'button',
            label: `自定义导入模板`,
            event: () => custUploadTemp('IMPORT', `${PERMISSION_CODE}:custImport`),
            show: proxy.$permission(`${PERMISSION_CODE}:custImport`),
        },
        {
            type: 'button',
            label: '自定义导出',
            event: () => custExport('EXPORT', `${PERMISSION_CODE}:custExport`),
            show: proxy.$permission(`${PERMISSION_CODE}:export`),
        },
    ]

    return {
        customBtns,
    }
}
