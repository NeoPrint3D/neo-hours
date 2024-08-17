function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function convertToCamelCase<T extends object>(
  obj: T
): { [K in keyof T as CamelCase<K & string>]: T[K] } {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [toCamelCase(key), value])
  ) as { [K in keyof T as CamelCase<K & string>]: T[K] };
}

// Type helper
type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;
