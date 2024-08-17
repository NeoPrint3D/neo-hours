import { alphabet, generateRandomString } from "oslo/crypto";

export const createId = (prefix?: string) =>
  `${prefix || ""}_${generateRandomString(21, alphabet("0-9", "a-z", "A-Z"))}`;
