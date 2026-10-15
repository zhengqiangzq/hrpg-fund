import request from '@/utils/request'

export function downloadOnlineBankingPaymentInstructionStatusSheet(data) {
    return request({
        url: '/link/settlement/bmpPayStatusDownload',
        method: 'post',
        data,
        btnCode: 'onlineBankingPaymentInstructionStatusSheet:download'
    })
}

export function confirmBankingPaymentInstructionStatusSheet(data) {
    return request({
        url: '/link/settlement/bmpPayStatusConfirm',
        method: 'post',
        data,
        btnCode: 'onlineBankingPaymentInstructionStatusSheet:confirm'
    })
}