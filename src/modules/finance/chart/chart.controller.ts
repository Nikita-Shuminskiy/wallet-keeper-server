import {Controller, Get, HttpException, HttpStatus, Query, UseGuards} from '@nestjs/common';
import {SpendingService} from "../spending/spending.service";
import {ChartService} from "./chart.service";
import {getChartDataDto} from "./dto/chart.dto";
import {User} from "../../../common/decarators/user.decarator";
import {ReplenishmentService} from "../replenishment/replenishment.service";
import * as moments from 'moment';
import {WalletService} from "../wallet/wallet.service";
import {AuthGuard} from "../../authentication/guards/auth.guard";


@Controller('chart')
@UseGuards(AuthGuard)
export class ChartController {
    constructor(
        private spendingService: SpendingService,
        private walletService: WalletService,
        private replenishmentService: ReplenishmentService,
        private chartService: ChartService,
    ) {
    }

    @Get('/getChartData')
    async getChartData(@User('_id') userId: string, @Query() queryParams: getChartDataDto) {
        const dateStart = queryParams?.dateStart ? moments.unix(queryParams?.dateStart).utc(true).toDate() : null
        const dateEnd = queryParams?.dateEnd ? moments.unix(queryParams?.dateEnd).utc(true).toDate() : null
        dateStart?.setHours(3, 0, 0, 0)
        dateEnd?.setHours(26, 59, 0, 0)

        const paramsForSearchOperations = {
            date: {
                $gte: dateStart,
                $lt: dateEnd
            },
            userId,
            walletId: queryParams.walletId
        }
        console.log(paramsForSearchOperations)
        if (!paramsForSearchOperations.date?.$gte) {
            delete paramsForSearchOperations.date.$gte
        }
        if (!paramsForSearchOperations.date?.$lt) {
            delete paramsForSearchOperations.date.$lt
        }
        if ((!paramsForSearchOperations.date?.$gte && !paramsForSearchOperations.date?.$lt)) {
            delete paramsForSearchOperations.date
        }
        const currentWallet = await this.walletService.getWallet(queryParams.walletId, userId)
        const allHistory = queryParams?.showChart === 'income'
            ? await this.replenishmentService.getReplenishmentsByParameters(paramsForSearchOperations)
            : await this.spendingService.getSpendingByParameters(paramsForSearchOperations);

        if (!allHistory) {
            throw new HttpException('userId not correct', HttpStatus.BAD_REQUEST);
        }
        const totalSumOperations = allHistory.reduce((acc, curr) => Math.round(acc + Number(curr?.amount)), 0)
        if (queryParams.isMobile) {
            if (queryParams.typeChart === 'pie') {
                return {
                    chartData: await this.chartService.getChartDatasetForMobilePie(allHistory),
                    date: {
                        dateStart: dateStart ? dateStart : null,
                        dateEnd: dateEnd ? dateEnd : null
                    },
                    showChart: queryParams?.showChart,
                    currentWallet: currentWallet,
                    totalSumOperations: totalSumOperations
                }
            }
        } else {
            return await this.chartService.getChartDataset(allHistory)
        }
    }

}
