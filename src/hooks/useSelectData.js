import {reactive, ref, watch} from "vue";
import {dataTemplate} from './selectDataTemplate'
import cloneDeep from "lodash/cloneDeep";

export function useSelectData() {
    const selectorInfo = reactive({})
    const selectorRef = ref()
    function show() {
        const info = cloneDeep(dataTemplate[selectorInfo.type] || {})
        const query = Object.assign(info.query || {}, selectorInfo.query || {})
        selectorRef.value.show({
            ...Object.assign(info, selectorInfo),
            query,
            onClose: () => selectorInfo.visible = false
        })
    }
    function hide() {
        selectorRef.value.hide()
        Object.keys(selectorInfo).forEach(key => delete selectorInfo[key])
    }
    watch(() => selectorInfo.visible, (visible) => {
        if (visible) {
            show()
        } else {
            hide()
        }
    })
    return {
        selectorInfo,
        selectorRef
    }
}
