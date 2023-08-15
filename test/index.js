
/* IMPORT */

import {describe} from 'fava';
import parse from '../dist/index.js';

/* MAIN */

describe ( 'CSV Simple Parser', it => {

  /* ARRAY */

  it ( 'supports single line, no value, array', t => {

    t.deepEqual ( parse ( '' ), [] );

  });

  it ( 'supports single line, single value, array', t => {

    t.deepEqual ( parse ( '  ' ), [['  ']] );
    t.deepEqual ( parse ( 'abc' ), [['abc']] );
    t.deepEqual ( parse ( '123' ), [['123']] );
    t.deepEqual ( parse ( '-123' ), [['-123']] );
    t.deepEqual ( parse ( '123.123' ), [['123.123']] );
    t.deepEqual ( parse ( ' \ta\t ' ), [[' \ta\t ']] );
    t.deepEqual ( parse ( '"abc"' ), [['abc']] );
    t.deepEqual ( parse ( '"abc""123"' ), [['abc"123']] );

  });

  it ( 'supports single line, multiple values, array', t => {

    t.deepEqual ( parse ( 'abc,123' ), [['abc', '123']] );
    t.deepEqual ( parse ( ' \tabc,123,-123,"abc","abc""123"' ), [[' \tabc', '123', '-123', 'abc', 'abc"123']] );

  });

  it ( 'supports multiple lines, single values, array', t => {

    t.deepEqual ( parse ( 'abc\n123\n"abc"' ), [['abc'], ['123'], ['abc']] );

  });

  it ( 'supports multiple lines, multiple values, array', t => {

    t.deepEqual ( parse ( 'abc,123\n-123,123.123\n"abc", \ta\t ' ), [['abc', '123'], ['-123', '123.123'], ['abc', ' \ta\t ']] );

  });

  it ( 'supports multiple lines, with any newline, array', t => {

    t.deepEqual ( parse ( 'abc\r123\n"abc"\r\n \tabc\t ' ), [['abc'], ['123'], ['abc'], [' \tabc\t ']] );

  });

  /* OBJECT */

  it ( 'supports single line, no value, header', t => {

    t.deepEqual ( parse ( '', { header: true } ), [] );

  });

  it ( 'supports single line, single value, header', t => {

    t.deepEqual ( parse ( '  ', { header: true } ), [] );
    t.deepEqual ( parse ( 'abc', { header: true } ), [] );
    t.deepEqual ( parse ( '123', { header: true } ), [] );
    t.deepEqual ( parse ( '-123', { header: true } ), [] );
    t.deepEqual ( parse ( '123.123', { header: true } ), [] );
    t.deepEqual ( parse ( ' \ta\t ', { header: true } ), [] );
    t.deepEqual ( parse ( '"abc"', { header: true } ), [] );
    t.deepEqual ( parse ( '"abc""123"', { header: true } ), [] );

  });

  it ( 'supports single line, multiple values, header', t => {

    t.deepEqual ( parse ( 'abc,123', { header: true } ), [] );
    t.deepEqual ( parse ( ' \tabc,123,-123,"abc","abc""123"', { header: true } ), [] );

  });

  it ( 'supports multiple lines, single values, header', t => {

    t.deepEqual ( parse ( 'abc\n123\n"abc"', { header: true } ), [{ 'abc': '123' }, { 'abc': 'abc' }] );

  });

  it ( 'supports multiple lines, multiple values, header', t => {

    t.deepEqual ( parse ( 'abc,123\n-123,123.123\n"abc", \ta\t ', { header: true } ), [{ 'abc': '-123', '123': '123.123' }, { 'abc': 'abc', '123': ' \ta\t ' }] );

  });

  it ( 'supports multiple lines, with any newline, header', t => {

    t.deepEqual ( parse ( 'abc\r123\n"abc"\r\n \tabc\t ', { header: true } ), [{ 'abc': '123' }, { 'abc': 'abc' }, { 'abc': ' \tabc\t ' }] );

  });

  /* OTHERS */

  it ( 'can infer numeric values automatically', t => {

    t.deepEqual ( parse ( '123,-123,123.123,"123","-123","123.123",', { infer: true } ), [[123, -123, 123.123, '123', '-123', '123.123', '']] );
    t.deepEqual ( parse ( 'head\n123\n-123\n123.123\n"123"\n"-123"\n"123.123"\n""', { infer: true, header: true } ), [{ head: 123 }, { head: -123 }, { head: 123.123 }, { head: '123' }, { head: '-123' }, { head: '123.123' }, { head: '' }] );
    t.deepEqual ( parse ( '123n', { infer: true } ), [['123n']] );
    t.deepEqual ( parse ( 'head\n123n', { infer: true, header: true } ), [{ head: '123n' }] );

  });

  it ( 'can infer null values automatically', t => {

    t.deepEqual ( parse ( 'null,NULL,"null","NULL"', { infer: true } ), [[null, null, 'null', 'NULL']] );

  });

  it ( 'can interpolate special characters inside quoted values', t => {

    t.deepEqual ( parse ( '"abc,\'\r\n\`,123"' ), [['abc,\'\r\n\`,123']] );

  });

  it ( 'can support empty quoted values', t => {

    t.deepEqual ( parse ( '""' ), [['']] );
    t.deepEqual ( parse ( '"",""' ), [['', '']] );

  });

  it ( 'can support empty unquoted values', t => {

    t.deepEqual ( parse ( ',' ), [['', '']] );
    t.deepEqual ( parse ( ',,' ), [['', '', '']] );
    t.deepEqual ( parse ( 'foo,' ), [['foo', '']] );
    t.deepEqual ( parse ( ',foo' ), [['', 'foo']] );
    t.deepEqual ( parse ( ',foo,' ), [['', 'foo', '']] );

  });

  it ( 'can support a custom delimiter', t => {

    t.deepEqual ( parse ( 'abc|123' ), [['abc|123']] );
    t.deepEqual ( parse ( 'abc|123', { delimiter: '|' } ), [['abc', '123']] );

  });

  it ( 'can support a custom quote', t => {

    t.deepEqual ( parse ( "'abc','123'" ), [["'abc'", "'123'"]] );
    t.deepEqual ( parse ( "'abc','123'", { quote: "'" } ), [['abc', '123']] );

  });

  it ( 'can support a trailing newline', t => {

    t.deepEqual ( parse ( 'abc,123\n' ), [['abc', '123'], ['', undefined]] ); //TODO: This may be somewhat controversial

  });

  it ( 'can transform values with a custom function', t => {

    const transform = ( value, x, y, quoted ) => quoted ? value : value === '0' ? false : value === '1' ? true : value;

    t.deepEqual ( parse ( '1,"1",0,"0"', { transform } ), [[true, '1', false, '0']] );

  });

  it ( 'can transform inferred numeric values with a custom function too', t => {

    const csv = 'Name,Surname,Age,Pirate\n"John",Doe,50,1\nJane,"Doe",50,0';
    const transform = ( value, x, y, quoted ) => quoted ? value : value === '0' ? false : value === '1' ? true : value;
    const options = { header: true, infer: true, transform };
    const result = parse ( csv, options );

    t.deepEqual ( result, [{ Name: 'John', Surname: 'Doe', Age: 50, Pirate: true }, { Name: 'Jane', Surname: 'Doe', Age: 50, Pirate: false }] );

  });

  it ( 'can detect unclosed quoted values', t => {

    t.throws ( () => parse ( '"' ) );
    t.throws ( () => parse ( '"foo' ) );
    t.throws ( () => parse ( 'foo"' ) );
    t.throws ( () => parse ( '"foo""' ) );
    t.throws ( () => parse ( '""foo"' ) );

  });

});
