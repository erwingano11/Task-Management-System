module.exports = {
  apps: [
    {
      name: "wms-backend",
      script: "server.js",
      cwd: "/var/www/Task-Management-System/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
