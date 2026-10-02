import bcrypt from "bcrypt";

const getSaltRounds = (): number => {
  const rounds = process.env.BCRYPT_SALT_ROUNDS;
  if (rounds) {
    const parsed = parseInt(rounds, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return 12; // secure default
};

/** Hash a plaintext password with bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, getSaltRounds());
}

/** Compare a plaintext password against a bcrypt hash. */
export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/** Hash a refresh token for secure database storage. */
export async function hashRefreshToken(token: string): Promise<string> {
  return bcrypt.hash(token, getSaltRounds());
}

/** Compare a plaintext refresh token against its stored hash. */
export async function compareRefreshToken(
  token: string,
  hashedToken: string,
): Promise<boolean> {
  return bcrypt.compare(token, hashedToken);
}
