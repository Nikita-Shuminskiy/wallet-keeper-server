import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {SettingsModel} from "../../models/wallet.model";

@Injectable()
export class SettingsService {
    constructor(@InjectModel(SettingsModel.name) private settingsModel: Model<SettingsModel>) {
    }

    async getSettings() {
        return this.settingsModel.findOne().exec();
    }

    async updateSettings(updateData: Partial<SettingsModel>) {
        let existingSettings = await this.settingsModel.findOne().exec();

        if (!existingSettings) {
            existingSettings = new this.settingsModel();
        }

        Object.assign(existingSettings, updateData);

        return existingSettings.save();
    }
}
