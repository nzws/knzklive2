const requiredEnvs = [
  'DATABASE_URL',
  'USER_TOKEN_PUBLIC_KEY',
  'USER_TOKEN_PRIVATE_KEY',
  'DEFAULT_FRONT_DOMAIN',
  'SERVER_ENDPOINT'
];

const notFoundEnvs = requiredEnvs.filter(env => !process.env[env]);
if (notFoundEnvs.length > 0) {
  throw new Error(`${notFoundEnvs.join(', ')} is required`);
}
