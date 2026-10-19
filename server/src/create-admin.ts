/**
 * Creates or updates an admin (owner) account.
 *
 * Run on Render (after the first deploy) via the Render Shell:
 *   npm run create-admin -- --email owner@example.com --password "YourStrongPass"
 *
 * Or with environment variables:
 *   ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD="YourStrongPass" npm run create-admin
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { User, UserDocument } from './modules/users/schemas/user.schema';
import { Role } from './modules/auth/roles.enum';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) return process.argv[index + 1];
  return undefined;
}

async function run() {
  const email = (arg('email') || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = arg('password') || process.env.ADMIN_PASSWORD || '';
  const name = arg('name') || process.env.ADMIN_NAME || 'Owner';

  if (!email || !password) {
    console.error('Usage: npm run create-admin -- --email <email> --password "<password>" [--name "Owner"]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const hashed = await bcrypt.hash(password, 12);

    const existing = await userModel.findOne({ email });
    if (existing) {
      existing.password = hashed;
      existing.role = Role.ADMIN;
      existing.isActive = true;
      if (name) existing.name = name;
      await existing.save();
      console.log(`Admin account updated: ${email}`);
    } else {
      await userModel.create({
        name,
        email,
        password: hashed,
        role: Role.ADMIN,
        isActive: true,
        phone: '',
      });
      console.log(`Admin account created: ${email}`);
    }
  } finally {
    await app.close();
  }
}

void run().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
