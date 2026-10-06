# Production deployment notes

The API is Node.js/Express, not PHP. PHP-FPM worker settings do not apply. PM2 cluster mode starts one API worker per CPU by default; Nginx keeps client connections and proxies API traffic to those workers. Do not set `innodb_buffer_pool_size` from total RAM blindly when app and database share a VPS. Keep 30-50% for the OS, Node workers, and connection buffers; 4G is a starting example, not a universal value.

## Database

The Prisma schema now targets MySQL using `DATABASE_URL`. Take a verified backup of existing SQLite data before migration, create a MySQL database/user, then run:

```sh
npm install
npm run prisma:generate
npm run prisma:migrate --workspace=apps/api -- --name mysql_production
npm run build:all
```

Review the generated migration and rehearse the data transfer on a copy of the SQLite database. `prisma migrate` creates schema migrations; it does not copy existing SQLite records into MySQL. Never run `setup:db` in production because it pushes schema and seeds demo accounts.

## Sizing for 300 concurrent users

300 connected users are not the same as 300 simultaneous database queries. Start with a 4-vCPU/8-16-GB application VPS and a separate 4-vCPU/16-GB database VPS, then benchmark the real workflows and size from p95 latency, CPU, memory, DB connections, and slow-query logs. Set `API_INSTANCES` based on available CPU/memory instead of assuming unlimited workers. Configure MySQL `max_connections` for the sum of API worker pools plus admin/maintenance clients; Prisma manages its own pool per process, so watch aggregate connections. Redis is not currently wired into this application; introduce it only with explicit cache keys, TTLs, invalidation, and privacy review for patient data. Appointment availability must never rely on a stale cache.

Nginx can serve the static patient portal and proxy `/api/` to the API. Put TLS termination and firewall rules in front of this example, replace `clinic.example.com`, and set `CORS_ORIGIN` to the real portal origin. Keep secrets outside source control.

The API endpoints for patients, appointments, prescriptions, labs, and medical history accept `page` and `pageSize`; they return `{ data, page, pageSize, hasMore }`. The current portal UI still expects arrays, so update the client callers before deploying this API response change to an existing installation.
