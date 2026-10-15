import {ElLoading} from "element-plus";
import {useStore} from "vuex";
import {getCurrentInstance, reactive} from "vue";
import axios from "axios";
import {exportTemplateExcel} from "@/api/pub";
export function useUpload(apis = { export: null, download: null }, templateName, uploadPath, success, btnCode) {
    const store = useStore()
    const API = apis
    const TEMPLATE_NAME = templateName
    const UPLOAD_PATH = uploadPath
    const { proxy } = getCurrentInstance()
    const subsysAndUrl = proxy.$fn.getSubsysAndUrl()
    const uploadInfo = reactive({
        action: axios.defaults.baseURL + UPLOAD_PATH,
        headers: {
            Authorization: store.state.user.token,
            'x-auth-token': store.state.user.token,
            'btnCode': btnCode || -2,
            'reqType': 'PC',
            'systemName': subsysAndUrl?.systemName || -2,
            'systemCode': subsysAndUrl?.systemCode || -2,
            'routeCode': subsysAndUrl?.routeCode || -2,
        },
        loading: {},
    })
// 下载模板
    function downloadTemplate(name) {
        const api = API.download ?? exportTemplateExcel
        api(TEMPLATE_NAME).then((res) => {
            if (res) {
                proxy.$fn.parseExcel(res, `${name || TEMPLATE_NAME}.xlsx`)
            }
        })
    }

    function beforeUpload(file) {
        //发生请求时打开加载动画
        uploadInfo.loading = ElLoading.service({
            fullscreen: true,
            background: 'rgba(255,255,255,.4)',
        })
        let fileType = ['xlsx']
        let fileSize = store.state.permission.systemConfig.max_file_size
        let isFileType = fileType.some(
            (type) => file.name.split('.')[file.name.split('.').length - 1] === type
        )
        const isLt = file.size / 1024 / 1024 < fileSize
        if (!isFileType) {
            proxy.$message.error({
                message: `文件格式不正确, 请上传 ${fileType.join(' / ')} 格式文件!`,
                showClose: true,
                duration: 3500,
            })
            uploadInfo.loading.close()
            return false
        }
        if (!isLt) {
            proxy.$message.error({
                message: `上传文件大小不能超过 ${fileSize} MB!`,
                showClose: true,
                duration: 3500,
            })
            uploadInfo.loading.close()
            return false
        }
        return isFileType && isLt
    }

    function uploadSuccess(resp) {
        uploadInfo.loading.close()
        if (resp && resp.success) {
            proxy.$message.success({
                duration: 3000,
                showClose: true,
                message: resp.msg,
            })
            success && success(resp)
        } else {
            proxy.$message.error({
                message: resp.msg,
                duration: 3000,
                showClose: true,
            })
        }
    }
    function uploadError(err) {
        if (err) {
            proxy.$message.error({
                message: JSON.parse(err.message).msg || '系统错误',
                duration: 3000,
                showClose: true,
            })
        }
        uploadInfo.loading.close()
    }

// 导出数据
    function exportData(query = {}) {
        API.export(query).then((resp) => {
            if (resp) {
                proxy.$fn.parseExcel(resp)
            }
        })
    }
    return {
        uploadInfo,
        downloadTemplate,
        beforeUpload,
        uploadSuccess,
        uploadError,
        exportData
    }
}
