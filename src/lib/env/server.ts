import "server-only";

const REQUIRED_SERVER_VARS = [
  "RESEND_API_KEY",
  "RESEND_FROM",
  "OPENROUTER_API_KEY",
] as const;

type ServerEnvVar = (typeof REQUIRED_SERVER_VARS)[number];

export function getRequiredServerEnv(name: ServerEnvVar): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}
