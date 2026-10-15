import ChangeLogDrawer from '@/components/ChangeLogDrawer/index.vue'
import {getCurrentInstance, render} from "vue";

export function useChangeLogDrawer() {
    const { proxy, appContext } = getCurrentInstance()
    function openChangeLogDrawer(orderId) {
        const div = document.createElement('div')
        div.className = 'change-log-container'
        document.body.appendChild(div)
        const vChangeLogDrawer = h(ChangeLogDrawer, {
            id: orderId,
            onClose() {
                render(null, div)
                div.remove()
            }
        })
        vChangeLogDrawer.appContext = appContext
        render(vChangeLogDrawer, div)
    }

    return {
        openChangeLogDrawer
    }
}
