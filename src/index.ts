
/* IMPORT */

import detectEOL from 'detect-eol';
import {identity, infer} from './utils';
import type {Options} from './types';

/* MAIN */

//TODO: Support opt-in comments

const parseBase = ( input: string, options: Options & Pick<Required<Options>, 'transform'> ): void => {

  /* CONSTANTS */

  const CR = 13; // \r
  const LF = 10; // \n
  const DELIMITER = options.delimiter?.charCodeAt ( 0 ) ?? 44; // ,
  const QUOTE = options.quote?.charCodeAt ( 0 ) ?? 34; // "
  const OPTIMISTIC = options.optimistic ?? true;
  const TRANSFORM = options.transform;

  const DELIMITER_STR = String.fromCharCode ( DELIMITER ); // ,
  const QUOTE_STR = String.fromCharCode ( QUOTE ); // "
  const DOUBLE_QUOTE_STR = `${QUOTE_STR}${QUOTE_STR}`; // ""
  const NEWLINE_STR = detectEOL ( input, { fallback: '\n', window: 0 } ); // \r\n, \n, \r

  const STATE_IN_CELL = 1;
  const STATE_AFTER_CELL = 2;
  const STATE_AFTER_DELIMITER = 3;

  /* STATE */

  let state: 1 | 2 | 3 = STATE_AFTER_DELIMITER;
  let cellStartIndex = 0;
  let cellUnquoted = false;
  let cellEscaped = false;
  let columns = 0; // Expected number of columns, 0 if not yet known
  let x = 0;
  let y = 0;

  /* PARSER */

  for ( let i = 0, l = input.length; i < l; i++ ) {

    const code = input.charCodeAt ( i );

    if ( code === QUOTE ) {

      if ( state === STATE_AFTER_DELIMITER ) { // Quoted cell start

        let skipped = false;

        if ( OPTIMISTIC && columns ) { // Optimistic skip to end attempt, once we know the number of columns

          let cellEndIndex = -1;
          let j = i;

          while ( true ) {

            cellEndIndex = input.indexOf ( QUOTE_STR, j + 1 );

            if ( cellEndIndex < 0 ) break; // No delimiter

            const next = ( i < l - 1 ) ? input.charCodeAt ( cellEndIndex + 1 ) : -1;

            if ( next === QUOTE ) { // Escaped delimiter

              j = cellEndIndex + 1;
              cellEscaped = true;

            } else { // Unescaped delimiter

              break;

            }

          }

          if ( cellEndIndex > 0 ) { // Successful optimistic skip to end

            const isLast = ( y === columns - 1 );
            const value = input.slice ( i + 1, cellEndIndex );
            const valueUnescaped = cellEscaped ? value.replaceAll ( DOUBLE_QUOTE_STR, QUOTE_STR ) : value;

            TRANSFORM ( valueUnescaped, x, y, true );

            skipped = true;
            x = isLast ? x + 1 : x;
            y = isLast ? 0 : y + 1;
            i = cellEndIndex + DELIMITER_STR.length - 1;
            state = STATE_AFTER_CELL;
            cellUnquoted = false;
            cellEscaped = false;

          }

        }

        if ( !skipped ) { // No optimistic skip to end

          state = STATE_IN_CELL;
          cellStartIndex = i + 1;
          cellUnquoted = false;
          cellEscaped = false;

        }

      } else if ( state === STATE_IN_CELL && !cellUnquoted ) { // Escape or Quoted cell end

        const codeNext = ( i < l - 1 ) ? input.charCodeAt ( i + 1 ) : -1;

        if ( codeNext === QUOTE ) { // Escape

          cellEscaped = true;
          i += 1;

        } else { // Quoted cell end

          const value = input.slice ( cellStartIndex, i );
          const valueUnescaped = cellEscaped ? value.replaceAll ( DOUBLE_QUOTE_STR, QUOTE_STR ) : value;

          TRANSFORM ( valueUnescaped, x, y, true );

          state = STATE_AFTER_CELL;
          cellUnquoted = false;
          cellEscaped = false;
          y += 1;

        }

      } else { // Unexpected quote

        throw new Error ( `Unexpected quote at index ${i}` );

      }

    } else if ( code === CR || code === LF ) {

      if ( state === STATE_IN_CELL && cellUnquoted ) { // Unquoted cell end

        const value = input.slice ( cellStartIndex, i );

        TRANSFORM ( value, x, y, false );

        state = STATE_AFTER_CELL;
        y += 1;
        cellUnquoted = false;
        cellEscaped = false;

      }

      if ( state === STATE_AFTER_DELIMITER ) { // Empty cell

        TRANSFORM ( '', x, y, false );

        y += 1;

      }

      if ( state === STATE_AFTER_CELL || state === STATE_AFTER_DELIMITER ) { // New row

        if ( code === CR ) { // To seemlessly support CR/LF/CRLF
          const codeNext = ( i < l - 1 ) ? input.charCodeAt ( i + 1 ) : -1;
          if ( codeNext === LF ) {
            i += 1;
          }
        }

        columns ||= y;
        state = STATE_AFTER_DELIMITER;
        x += 1;
        y = 0;

      } else if ( state !== STATE_IN_CELL || cellUnquoted ) { // Unexpected newline

        throw new Error ( `Unexpected newline at index ${i}` );

      }

    } else if ( code === DELIMITER ) {

      if ( state === STATE_AFTER_CELL ) { // Delimiter

        state = STATE_AFTER_DELIMITER;

      } else if ( state === STATE_IN_CELL && cellUnquoted ) { // Unquoted cell end

        const value = input.slice ( cellStartIndex, i );

        TRANSFORM ( value, x, y, false );

        state = STATE_AFTER_DELIMITER;
        y += 1;
        cellUnquoted = false;
        cellEscaped = false;

      } else if ( state === STATE_AFTER_DELIMITER ) { // Empty cell

        TRANSFORM ( '', x, y, false );

        y += 1;

      } else if ( state !== STATE_IN_CELL || cellUnquoted ) { // Unexpected delimiter

        throw new Error ( `Unexpected delimiter at index ${i}` );

      }

    } else if ( state === STATE_AFTER_DELIMITER ) { // Unquoted cell start

      let skipped = false;

      if ( OPTIMISTIC && columns ) { // Optimistic skip to end attempt, once we know the number of columns

        const isLast = ( y === columns - 1 );
        const delimiter = isLast ? NEWLINE_STR : DELIMITER_STR;
        const cellEndIndex = input.indexOf ( delimiter, i + 1 );

        if ( cellEndIndex > 0 ) { // Successful optimistic skip to end

          const value = input.slice ( i, cellEndIndex );

          TRANSFORM ( value, x, y, false );

          skipped = true;
          x = isLast ? x + 1 : x;
          y = isLast ? 0 : y + 1;
          i = cellEndIndex + delimiter.length - 1;
          state = STATE_AFTER_DELIMITER;
          cellUnquoted = false;
          cellEscaped = false;

        }

      }

      if ( !skipped ) { // No optimistic skip to end

        state = STATE_IN_CELL;
        cellStartIndex = i;
        cellUnquoted = true;
        cellEscaped = false;

      }

    }

  }

  if ( state === STATE_IN_CELL && cellUnquoted ) { // Unquoted cell end

    const value = input.slice ( cellStartIndex, input.length );

    TRANSFORM ( value, x, y, false );

  } else if ( state === STATE_AFTER_DELIMITER && input.length ) { // Empty cell

    TRANSFORM ( '', x, y, false );

  } else if ( state === STATE_IN_CELL ) { // Unexpected final state

    throw new Error ( 'Unexpected end of input' );

  }

};

const parseArrays = ( input: string, options: Options ): unknown[][] => {

  const INFER = !!options.infer;
  const TRANSFORM = options.transform || identity;
  const ROWS: unknown[][] = [];

  let row: unknown[] = [];
  let rowLength: number = 0;

  parseBase ( input, {
    ...options,
    transform: ( value, x, y, quoted ) => {
      if ( !y ) {
        if ( x === 1 ) {
          rowLength = row.length;
        }
        row = new Array ( rowLength ); // Pre-allocating a correctly-sized array, except for the first row
        ROWS.push ( row );
      }
      if ( INFER && value.length && !quoted ) {
        row[y] = infer ( TRANSFORM ( value, x, y, quoted ) );
      } else {
        row[y] = TRANSFORM ( value, x, y, quoted );
      }
    }
  });

  return ROWS;

};

const parseObjects = ( input: string, options: Options ): Record<string, unknown>[] => {

  const INFER = !!options.infer;
  const TRANSFORM = options.transform || identity;
  const HEADERS: string[] = [];
  const ROWS: Record<string, unknown>[] = [];

  let row: Record<string, unknown> = {};

  parseBase ( input, {
    ...options,
    transform: ( value, x, y, quoted ) => {
      if ( !x ) {
        HEADERS.push ( value );
      } else {
        if ( !y ) {
          row = {}; //TODO: Pre-allocate a correctly-spaced object, somehow, possibly without generating a function at runtime
          ROWS.push ( row );
        }
        if ( INFER && value.length && !quoted ) {
          row[HEADERS[y]] = infer ( TRANSFORM ( value, x, y, quoted ) );
        } else {
          row[HEADERS[y]] = TRANSFORM ( value, x, y, quoted );
        }
      }
    }
  });

  return ROWS;

};

const parse = ( input: string, options: Options = {} ): unknown[][] | Record<string, unknown>[] => {

  if ( options.header ) {

    return parseObjects ( input, options );

  } else {

    return parseArrays ( input, options );

  }

};

/* EXPORT */

export default parse;
export type {Options};
