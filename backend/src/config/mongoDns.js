const dns = require("dns");

/**
 * If `querySrv ECONNREFUSED` fails for mongodb+srv://, the system DNS resolver may
 * block or mishandle SRV lookups. Set MONGO_DNS_SERVERS=8.8.8.8,8.8.4.4 in .env
 * so this Node process uses public DNS for MongoDB only.
 */
function applyMongoDnsFromEnv() {
  const raw = process.env.MONGO_DNS_SERVERS;
  if (!raw || !String(raw).trim()) return;
  const servers = String(raw)
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length === 0) return;
  dns.setServers(servers);
}

module.exports = { applyMongoDnsFromEnv };
