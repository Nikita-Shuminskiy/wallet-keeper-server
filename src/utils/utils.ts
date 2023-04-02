import {SpendingModel} from "../models/spending.model";
import * as moments from "moment/moment";
export const convertToDate = (date: string, hour: number) => {
    return moments(date, "DD/MM/YYYY").set({hour: hour}).utc(true).toDate()
}

const transformToChartDataHandlerForChartPie = (spendingArray: SpendingModel[]) => {
    return spendingArray.reduce((accState: { [key: string]: string }, currItem) => {
        const currCategoryKey = currItem.category
        const currMonth = currItem.createdAt.toLocaleString('default', {month: 'long'});
        if (!accState[currCategoryKey]) {
            accState[currCategoryKey] = <string>{};
        }
        if (accState[currCategoryKey][currMonth]) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            accState[currCategoryKey][currMonth] =
                accState[currCategoryKey][currMonth] + Number(currItem.amount);
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            accState[currCategoryKey][currMonth] = Number(currItem.amount);
        }
        return accState;
    }, {})
}


export {
    transformToChartDataHandlerForChartPie,
}