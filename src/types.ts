
/* MAIN */

type Options = {
  delimiter?: string,
  quote?: string,
  header?: boolean,
  infer?: boolean,
  transform?: ( value: string, x: number, y: number, quoted: boolean ) => void
};

/* EXPORT */

export type {Options};
