#!/usr/bin/env node
import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Rajnikumari%4088@db.ckwzbaazgbheeeuclbci.supabase.co:5432/postgres';

async function verifyDatabase() {
  console.log('🔍 Checking Supabase PostgreSQL Connection...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL!');

    const res = await client.query('SELECT current_database(), current_user, version();');
    console.log(`✅ Database: ${res.rows[0].current_database} | User: ${res.rows[0].current_user}`);

    const tables = [
      'organizations', 'zones', 'branches', 'stockyards', 'users',
      'master_vehicle_models', 'checklist_templates', 'checklist_categories', 'checklist_items',
      'vehicles', 'bookings', 'challan_invoices', 'repair_tickets', 'pdi_certificates'
    ];

    for (const t of tables) {
      const countRes = await client.query(`SELECT count(*) FROM ${t}`);
      console.log(`   - ${t.padEnd(25)}: ${countRes.rows[0].count} records`);
    }

    await client.end();
    console.log('\n🎉 Supabase Database is ready and verified!\n');
  } catch (err) {
    console.error('❌ Database verification failed:', err.message);
    process.exit(1);
  }
}

verifyDatabase();
