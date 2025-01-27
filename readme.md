# CSV Simple Parser

A simple, fast and configurable CSV parser.

## Install

```sh
npm install csv-simple-parser
```

## Usage

```ts
import parse from 'csv-simple-parser';

{ // Parse a CSV string, as an array of arrays of strings
  const csv = 'Name,Surname\n"John",Doe\nJane,"Doe"';
  const result = parse ( csv ); // => [['Name', 'Surname'], ['John', 'Doe'], ['Jane', 'Doe']]
}

{ // Parse a CSV string, as an array of objects, considering the first row the headers row
  const csv = 'Name,Surname\n"John",Doe\nJane,"Doe"';
  const options = { header: true };
  const result = parse ( csv, options ); // => [{ Name: 'John', Surname: 'Doe' }, { Name: 'Jane', Surname: 'Doe' }]
}

{ // Parse a CSV string, as an array of objects, inferring number/null/boolean types automatically
  const csv = 'Name,Surname,Age,Pirate,Parent\n"John",Doe,50,true,null\nJane,"Doe",50,FALSE,NULL';
  const options = { header: true, infer: true };
  const result = parse ( csv, options ); // => [{ Name: 'John', Surname: 'Doe', Age: 50, Pirate: true, Parent: null }, { Name: 'Jane', Surname: 'Doe', Age: 50, Pirate: false, Parent: null }]
}

{ // Parse a CSV string, as an array of objects, using a custom infer function
  // The default infer function is here: https://github.com/fabiospampinato/csv-simple-parser/blob/master/src/utils.ts
  const csv = 'Name,Surname,Age,Pirate,Parent\n"John",Doe,50,"1",1\nJane,"Doe",50,"0",0';
  const infer = ( value, isExplicitlyQuoted ) => isExplicitlyQuoted ? value : value === '0' ? false : value === '1' ? true : value;
  const options = { header: true, infer };
  const result = parse ( csv, options ); // => [{ Name: 'John', Surname: 'Doe', Age: '50', Pirate: '1', Parent: true }, { Name: 'Jane', Surname: 'Doe', Age: 50, '0': false, Parent: false }]
}

{ // Parse a CSV-like string, with custom delimiters and quotes
  const csv = "Name|Surname\n'John'|Doe\nJane|'Doe'";
  const options = { header: true, delimiter: '|', quote: "'" };
  const result = parse ( csv, options ); // => [{ Name: 'John', Surname: 'Doe' }, { Name: 'Jane', Surname: 'Doe' }]
}

{ // Parse a potentially malformed CSV-like string, which could have inconsistent newlines
  const csv = 'Name,Surname\r\n"John",Doe\nJane,"Doe"';
  const options = { optimistic: false };
  const result = parse ( csv ); // => [['Name', 'Surname'], ['John', 'Doe'], ['Jane', 'Doe']]
}
```

## License

MIT © Fabio Spampinato
