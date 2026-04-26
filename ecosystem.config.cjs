module.exports = {
  apps: [
    {
      name: 'whale-alerter',
      script: 'src/index.js',
      instances: 1,
      autorestart: true,
      max_restarts: 50,
      restart_delay: 5000,
      watch: false,
      env: { NODE_ENV: 'production' },
    },
  ],
};
