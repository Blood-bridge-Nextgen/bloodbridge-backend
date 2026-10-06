export type RequestWithUser<T extends Record<string, unknown>> = {
  user: {
    _id: string;
  } & T;
};
