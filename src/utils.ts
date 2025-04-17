export type Normalize<T> = T extends Record<string, unknown>
  ? { [K in keyof T]: Normalize<T[K]> }
  : T;
