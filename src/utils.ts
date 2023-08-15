
/* MAIN */

const identity = <T> ( value: T ): T => {

  return value;

};

const infer = ( value: unknown ): unknown => {

  if ( typeof value !== 'string' ) return value;

  if ( !value.length ) return value;

  if ( value === 'null' || value === 'NULL' ) return null;

  const number = Number ( value );

  if ( isNaN ( number ) ) return value;

  return number;

};

/* EXPORT */

export {identity, infer};
