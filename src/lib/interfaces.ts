export interface ResourceInterface<T> {
  item: object;
  toJson(): T | Promise<T>;
  extractObject(data?: object): T | Promise<T>;
}
