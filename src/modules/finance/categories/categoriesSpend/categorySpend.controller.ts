import {Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards} from '@nestjs/common';
import {User} from "../../../../common/decarators/user.decarator";
import {CategorySpendService} from "./categorySpend.service";
import {ICategory} from "../../../../models/wallet.model";
import {CategorySpendModel} from "../../../../models/categorySpend.model";
import {AddCategorySpendDto} from "./dto/categoryIncome.dto";
import {AuthGuard} from "../../../authentication/guards/auth.guard";


@Controller('categories-spend')
@UseGuards(AuthGuard)
export class CategorySpendController {

    constructor(
        private categorySpendService: CategorySpendService,
    ) {
    }


    @Post()
    async addCategorySpend(@Body() {categorySpend}: AddCategorySpendDto, @User('_id') userId: string): Promise<ICategory | null> {
        const checkCategory = await this.categorySpendService.findCategorySpends(categorySpend.value, userId)
        if (checkCategory) {
            throw new HttpException('Категория уже существует', HttpStatus.BAD_REQUEST);
        }
        const category = await this.categorySpendService.addCategory({category: categorySpend, userId: userId})
        if (!category) {
            throw new HttpException('Ошибка, попробуйте позже', HttpStatus.BAD_REQUEST);
        }
        return category
    }

    @Get()
    async getCategoriesISpend(@User('_id') userId: string): Promise<CategorySpendModel[] | null> {
        const category = await this.categorySpendService.getCategories(userId)
        if (!category) {
            throw new HttpException('Ошибка, попробуйте позже', HttpStatus.BAD_REQUEST);
        }
        return category
    }
}
