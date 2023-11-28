import {Controller, Get, Put, Body} from '@nestjs/common';
import {SettingsService} from './settings.service';
import {SettingsModel} from "../../models/wallet.model";
import {UsersService} from "../user/users.service";
import {JWTService} from "../authentication/services/jwt.service";
import {UserPassService} from "../authentication/services/user-pass.service";
import {AuthModelService} from "../authentication/services/auth-model.service";
import {AuthService} from "../authentication/services/auth.service";

@Controller('settings')
export class SettingsController {
    constructor(private settingsService: SettingsService
    ) {
    }

    @Get()
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Put()
    async updateSettings(@Body() updateData: Partial<SettingsModel>) {
        return this.settingsService.updateSettings(updateData);
    }
}
