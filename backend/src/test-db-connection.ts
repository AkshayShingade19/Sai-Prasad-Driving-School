/**
 * Tests a MongoDB connection string before deploying.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/test-db-connection.ts
 *   npx ts-node -r tsconfig-paths/register src/test-db-connection.ts "mongodb+srv://..."
 *
 * Or set MONGODB_URI and run without arguments.
 */
import { connect, type Connection } from 'mongoose';

const uri =
  process.argv[2] || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sai_prasad_driving_school';

function mask(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

async function run() {
  console.log('Testing connection to:', mask(uri));
  console.log('');

  const started = Date.now();

  try {
    const connection = (await connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    })) as unknown as Connection;

    console.log('Connection SUCCESSFUL in', Date.now() - started, 'ms');
    console.log('Host:', connection.host);
    console.log('Database:', connection.name);
    console.log('');

    const collections = await connection.db!.listCollections().toArray();
    console.log(
      'Collections (%d):',
      collections.length,
      collections.length ? '' : '(empty — fresh database, run the seed to populate it)',
    );
    collections.forEach((c) => console.log('  -', c.name));

    await connection.close();
    console.log('');
    console.log('OK — you can use this MONGODB_URI in Render.');
    process.exit(0);
  } catch (error: any) {
    console.error('Connection FAILED:', error.message);
    console.error('');

    const msg = String(error.message);
    if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
      console.error('Likely cause: wrong username or password.');
      console.error('  - The username must match your Atlas "Database Access" user.');
      console.error('  - If the password contains @ : / ? # [ ] % it MUST be URL-encoded.');
    } else if (msg.includes('ECONNREFUSED') || msg.includes('getaddrinfo')) {
      console.error('Likely cause: wrong host, or DNS cannot resolve the SRV record.');
    } else if (msg.includes('timeout') || msg.includes('Server selection')) {
      console.error('Likely cause: Atlas "Network Access" is not open to 0.0.0.0/0.');
    }

    process.exit(1);
  }
}

void run();
