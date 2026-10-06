module.exports = {
  apps: [
    {
      name: "mena-clinic-api",
      script: "apps/api/dist/server.js",
      instances: process.env.API_INSTANCES || "max",
      exec_mode: "cluster",
      wait_ready: false,
      listen_timeout: 10_000,
      kill_timeout: 10_000,
      max_memory_restart: "700M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
