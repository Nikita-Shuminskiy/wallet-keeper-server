import {Controller, Get, HttpException, HttpStatus, Query, UseGuards} from '@nestjs/common';
import {SpendingService} from "../spending/spending.service";
import {ChartService} from "./chart.service";
import {getChartDataDto} from "./dto/chart.dto";
import {AuthGuard} from "../../../common/guards/auth.guard";
import {User} from "../../../common/decarators/user.decarator";
import {ReplenishmentService} from "../replenishment/replenishment.service";
import {checkIsInvalidDate} from "../../../common/utils/utils";
import moment, * as moments from 'moment';


@Controller('chart')
@UseGuards(AuthGuard)
export class ChartController {
    constructor(
        private spendingService: SpendingService,
        private replenishmentService: ReplenishmentService,
        private chartService: ChartService,
    ) {
    }

    @Get('/getChartData')
    async getChartData(@User('_id') userId: string, @Query() queryParams: getChartDataDto) {
        const covertToDateEnd = moments.unix(queryParams.dateEnd).toDate()
        const covertToDateStart = moments.unix(queryParams.dateStart).toDate()
        const dateStart = queryParams.dateStart ? covertToDateStart : new Date(covertToDateEnd.getFullYear(), 0, 0)
        const dateEnd = queryParams.dateEnd ? covertToDateEnd : new Date(covertToDateStart.getFullYear(), 11, 31)
        dateStart.setHours(0, 0, 0, 0)
        dateEnd.setHours(25, 59, 0, 0)

        const paramsForSearchSpending = {
            date: {
                $gte: dateStart,
                $lt: dateEnd
            },
            userId,
            walletId: queryParams.walletId
        }
        if(checkIsInvalidDate(paramsForSearchSpending.date?.$gte) && checkIsInvalidDate(paramsForSearchSpending.date?.$lt)) {
            delete paramsForSearchSpending.date
        }
        const allHistory = queryParams?.showChart === 'income'
            ? await this.replenishmentService.getReplenishmentsByParameters(paramsForSearchSpending)
            : await this.spendingService.getSpendingByParameters(paramsForSearchSpending);
        if (!allHistory) {
            throw new HttpException('userId not correct', HttpStatus.BAD_REQUEST);
        }
        if (queryParams.isMobile) {
            if (queryParams.typeChart === 'pie') {
                return {
                    chartData: await this.chartService.getChartDatasetForMobilePie(allHistory),
                    date: {
                        dateStart: !checkIsInvalidDate(paramsForSearchSpending.date?.$gte) ? dateStart : null,
                        dateEnd: !checkIsInvalidDate(paramsForSearchSpending.date?.$lt) ? dateEnd : null
                    },
                    showChart: queryParams?.showChart
                }
            }
        } else {
            return await this.chartService.getChartDataset(allHistory)
        }
    }

}
