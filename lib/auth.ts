import { compare, hash } from "bcrypt";

const saltRound = 10;

export const hashPassword = async (value: string) => {
  const hashedPassword = await hash(value, saltRound);
  return hashedPassword;
};

export const matchPassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = compare(password, hashedPassword);
  return isMatch;
};
