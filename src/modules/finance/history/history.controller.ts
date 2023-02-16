import {Body, Controller, Delete, Get, HttpException, HttpStatus, Query, UseGuards} from '@nestjs/common';
import {WalletService} from "../wallet/wallet.service";
import {SpendingService} from "../spending/spending.service";
import {SpendingModel} from "../../../models/spending.model";
import {User} from "../../../common/decarators/user.decarator";
import {UserId, WalletId} from "../../../common/dto/common.dto";
import {AuthGuard} from "../../../common/guards/auth.guard";
import * as moments from "moment/moment";
import {checkIsInvalidDate} from "../../../common/utils/utils";
import {ReplenishmentService} from "../replenishment/replenishment.service";
import {getChartDataDto} from "../chart/dto/chart.dto";
import {getHistoryByParamsDto} from "./dto/history.dto";




@Controller('history')
@UseGuards(AuthGuard)
export class HistoryController {

    constructor(
        private walletService: WalletService,
        private replenishmentService: ReplenishmentService,
        private spendingService: SpendingService,
    ) {
    }


    @Get()
    async getHistoryWalletByWalletId(@Query() {walletId}: WalletId): Promise<SpendingModel[] | null> {
        const history = await this.spendingService.getSpendingByParameters({walletId});
        if (!history) {
            throw new HttpException('walletId not correct', HttpStatus.BAD_REQUEST);
        }
        return history
    }
    @Get("last-five-spending")
    async getLastFiveSpendingHistory(@Query() {
        walletId
    }: any, @User('_id') userId: string): Promise<SpendingModel[] | null> {
        const dto = {walletId, userId}
        const spending = await this.spendingService.getSpendingByParameters(dto)
        if (!spending) {
            throw new HttpException('Трат не найдено', HttpStatus.BAD_REQUEST);
        }
        return spending.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1 ).slice(0, 5)
    }
    @Get('allUserHistory')
    async getHistoryWalletByUserId(@User('_id') userId: string,  @Query() queryParams: getHistoryByParamsDto) {
        const covertToDateEnd = moments.unix(queryParams.dateEnd).toDate()
        const covertToDateStart = moments.unix(queryParams.dateStart).toDate()
        const dateStart = queryParams.dateStart ? covertToDateStart : new Date(covertToDateEnd.getFullYear(), 0, 0)
        const dateEnd = queryParams.dateEnd ? covertToDateEnd : new Date(covertToDateStart.getFullYear(), 11, 31)
        dateStart.setHours(0, 0, 0, 0)
        dateEnd.setHours(25, 59, 0, 0)
        const paramsForSearchOperation = {
            date: {
                $gte: dateStart,
                $lt: dateEnd
            },
            userId,
            walletId: queryParams.walletId
        }
        if(checkIsInvalidDate(paramsForSearchOperation.date?.$gte) && checkIsInvalidDate(paramsForSearchOperation.date?.$lt)) {
            delete paramsForSearchOperation.date
        }
        const history = queryParams?.showHistory === 'income'
            ? await this.replenishmentService.getReplenishmentsByParameters(paramsForSearchOperation)
            : await this.spendingService.getSpendingByParameters(paramsForSearchOperation);
        if (!history) {
            throw new HttpException('userId not correct', HttpStatus.BAD_REQUEST);
        }
        return {
            historyData: history,
            date: {
                dateStart: !checkIsInvalidDate(paramsForSearchOperation.date?.$gte) ? dateStart : null,
                dateEnd: !checkIsInvalidDate(paramsForSearchOperation.date?.$lt) ? dateEnd : null
            },
            showChart: queryParams?.showHistory
        }
    }



    @Delete()
    async deleteHistoryWalletByWalletId(@Body() {walletId}: WalletId): Promise<{ deletedCount: number; } | null> {
        const deleteCount = await this.spendingService.deleteSpendingByParams({walletId});
        if (!deleteCount) {
            throw new HttpException('walletId not correct', HttpStatus.BAD_REQUEST);
        }
        return deleteCount
    }

    @Delete('allUserHistory')
    async deleteHistoryWalletByUserId(@User('_id') userId : string): Promise<{ deletedCount: number; } | null> {
        const deleteCount = await this.spendingService.deleteSpendingByParams({userId});
        if (!deleteCount) {
            throw new HttpException('userId not correct', HttpStatus.BAD_REQUEST);
        }
        return deleteCount
    }
}
