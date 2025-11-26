import { db } from './src/lib/server/db/index.js';
import { user } from './src/lib/server/db/schema.js';

async function listUsers() {
    const users = await db.select().from(user);
    console.log('All Users:');
    users.forEach(u => {
        console.log(`ID: ${u.id}, Username: ${u.username}, Email (if any): ${u.email || 'N/A'}`);
    });
}

listUsers().catch(console.error).finally(() => process.exit());
