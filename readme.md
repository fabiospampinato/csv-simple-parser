# CSV Simple Parser

A simple, fast and configurable CSV parser.

## Install

```sh
npm install --save csv-simple-parser
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

{ // Parse a CSV string, inferring number types and null types automatically, and boolean types with a custom transform function
  const csv = 'Name,Surname,Age,Pirate,Parent\n"John",Doe,50,1,null\nJane,"Doe",50,0,NULL';
  const transform = ( value, x, y, quoted ) => quoted ? value : value === '0' ? false : value === '1' ? true : value;
  const options = { header: true, infer: true, transform };
  const result = parse ( csv, options ); // => [{ Name: 'John', Surname: 'Doe', Age: 50, Pirate: true, Parent: null }, { Name: 'Jane', Surname: 'Doe', Age: 50, Pirate: false, Parent: null }]
}

{ // Parse a CSV-like string, with custom delimiters and quotes
  const csv = "Name|Surname\n'John'|Doe\nJane|'Doe'";
  const options = { delimiter: '|', quote: "'" };
  const result = parse ( csv, options ); // => [{ Name: 'John', Surname: 'Doe' }, { Name: 'Jane', Surname: 'Doe' }]
}
```

## License

MIT © Fabio Spampinato
