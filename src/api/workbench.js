import request from '@/utils/request'

const prePath = '/workbench'
//首页数据
export function getDashboardChartStatistics(data) {
    return request({
        url: '/dashboardChartStatistics/queryData',
        method: 'post',
        data,
        notShowLoading: true,
    })
}
