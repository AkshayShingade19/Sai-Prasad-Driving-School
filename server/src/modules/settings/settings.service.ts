import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
  ) {}

  async getSettings() {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create({});
    }
    return settings;
  }

  async updateSettings(updateData: Partial<Settings>) {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create(updateData);
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }
    return settings;
  }

  async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      businessName: settings.businessName,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      pincode: settings.pincode,
      workingHours: settings.workingHours,
      googleMapsEmbedUrl: settings.googleMapsEmbedUrl,
      aboutUs: settings.aboutUs,
      mission: settings.mission,
      testimonials: settings.testimonials,
    };
  }
}
