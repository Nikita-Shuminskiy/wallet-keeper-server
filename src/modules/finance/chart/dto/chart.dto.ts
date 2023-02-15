import {Transform} from "class-transformer";
import {toMongoObjectId} from "../../../../common/helpers/handlers/userIdHandler";


export class getChartDataDto {
    dateStart?: string;
    dateEnd?: string;
    showChart: 'income' | 'spend';
    isMobile?: boolean
    typeChart?: 'line' | 'pie'
    @Transform(toMongoObjectId)
    walletId: string;
}
