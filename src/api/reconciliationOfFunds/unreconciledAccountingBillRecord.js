import request from "@/utils/request";

export function queryUnreconciledAccountingBillRecord(data) {
    return request({
        url: '/record/billRecordCompare/queryUnreconciledAccountingBillRecord',
        method: 'post',
        data,
        btnCode: 'unreconciledAccountingBillRecord:list'
    })
}

export function exportUnreconciledAccountingBillRecord(data) {
    return request({
        url: '/record/billRecordCompare/exportUnreconciledAccountingBillRecord',
        method: 'post',
        data,
        btnCode: 'unreconciledAccountingBillRecord:export',
        responseType: 'blob'
    })
}