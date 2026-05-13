import pg from 'pg';

const {Pool} = pg;

const databaseUrl = new URL(process.env.DATABASE_URL);
const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(databaseUrl.hostname);
databaseUrl.searchParams.delete('sslmode');

const sslMode = process.env.PGSSLMODE || (isLocalHost ? 'disable' : 'require');
const sslRejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED === 'true';
const ssl = sslMode === 'disable' ? false : {rejectUnauthorized: sslRejectUnauthorized};

const pool = new Pool({
	connectionString: databaseUrl.toString(),
	ssl,
});

async function withClient(work) {
	const client = await pool.connect();
	try {
		return await work(client);
	} finally {
		client.release();
	}
}

export {pool, withClient};