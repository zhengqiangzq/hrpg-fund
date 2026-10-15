import {reactive} from "vue";

export function useAttachUpload() {
    const fileFormInfo = reactive({
        title: '附件信息',
        fieldList: [
            {
                label: "",
                value: "filePathList",
                type: "slot",
                className: "not-br",
            },
        ],
        data: {
            filePathList: [],
        },
        fileUrlRules: {},
        fileAction: `${import.meta.env.VITE_APP_BASE_API}${import.meta.env.VITE_APP_BASIC_API}/file/minio/upload/funds`,
        fileType: ["docx", "pdf", "doc", "xls", "xlsx", "png", "jpg", "jpeg"],
    })
    return {
        fileFormInfo
    }
}
