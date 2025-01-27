
/* HELPERS */

type InferFunction = {
  ( value: string, isExplicitlyQuoted: boolean ): unknown
};

type TransformFunction = {
  ( value: string, x: number, y: number, isExplicitlyQuoted: boolean ): void
};

/* MAIN */

type Options = {
  delimiter?: string,
  quote?: string,
  header?: boolean,
  infer?: InferFunction | boolean,
  optimistic?: boolean
};

type ParseOptions = Options & {
  transform: TransformFunction
};

/* EXPORT */

export type {InferFunction, TransformFunction};
export type {Options, ParseOptions};
