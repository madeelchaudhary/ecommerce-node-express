import Tokens from "csrf";

const tokens = new Tokens();

async function generateSecret() {
  const csrfSecret = await tokens.secret();
  return csrfSecret;
}

export const getSecret = generateSecret();

export default tokens;
