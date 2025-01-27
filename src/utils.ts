
/* MAIN */

const infer = ( value: string, isExplicitlyQuoted: boolean ): unknown => {

  if ( isExplicitlyQuoted ) return value;

  if ( value === '' || value === 'null' || value === 'NULL' ) return null;

  if ( value === 'false' || value === 'FALSE' ) return false;

  if ( value === 'true' || value === 'TRUE' ) return true;

  const number = Number ( value );

  if ( number !== number || number === Infinity || number === -Infinity ) return value;

  return number;

};

const isFunction = ( value: unknown ): value is Function => {

  return typeof value === 'function';

};

/* EXPORT */

export {infer, isFunction};
