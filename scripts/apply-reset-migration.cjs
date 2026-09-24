const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Rajnikumari%4088@db.ckwzbaazgbheeeuclbci.supabase.co:5432/postgres'
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL...');

  const sql = fs.readFileSync('supabase/migrations/20260825230000_password_reset_otp.sql', 'utf8');
  await client.query(sql);
  console.log('20260825230000_password_reset_otp.sql applied successfully!');

  const testRes = await client.query("SELECT request_password_reset('ADMIN01') as result;");
  console.log('Test call result:', JSON.stringify(testRes.rows[0].result, null, 2));

  await client.end();
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
