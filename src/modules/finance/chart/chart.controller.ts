import {Controller, Get, HttpException, HttpStatus, Query, UseGuards} from '@nestjs/common';
import {SpendingService} from "../spending/spending.service";
import {ChartService} from "./chart.service";
import {getChartDataDto} from "./dto/chart.dto";
import {AuthGuard} from "../../../common/guards/auth.guard";
import {User} from "../../../common/decarators/user.decarator";
import * as moment from 'moment';
import {ReplenishmentService} from "../replenishment/replenishment.service";


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
        const paramsForSearchSpending = {
            createdAt: {
                $gte: new Date(Date.parse(queryParams.dateStart)),
                $lt: new Date(Date.parse(queryParams.dateEnd))
            },
            userId,
            walletId: queryParams.walletId
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
                        dateStart: queryParams.dateStart,
                        dateEnd: queryParams.dateEnd
                    },
                    showChart: queryParams?.showChart
                }
            }
        } else {
            return await this.chartService.getChartDataset(allHistory)
        }
    }

}
