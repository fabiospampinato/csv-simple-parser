
/* IMPORT */

import benchmark from 'benchloop';
import fs from 'node:fs';
import parse from '../dist/index.js';

/* HELPERS */

const FIXTURE_CSV = fs.readFileSync ( 'tasks/sample.csv', 'utf8' );
const FIXTURE_QUOTE = fs.readFileSync ( 'tasks/sample.quote', 'utf8' );

/* MAIN */

benchmark.config ({
  iterations: 2
});

benchmark ({
  name: 'csv.array',
  fn: () => {
    parse ( FIXTURE_CSV );
  }
});

benchmark ({
  name: 'csv.array.infer',
  fn: () => {
    parse ( FIXTURE_CSV, { infer: true } );
  }
});

benchmark ({
  name: 'csv.header',
  fn: () => {
    parse ( FIXTURE_CSV, { header: true } );
  }
});

benchmark ({
  name: 'csv.header.infer',
  fn: () => {
    parse ( FIXTURE_CSV, { header: true, infer: true } );
  }
});

benchmark ({
  name: 'quote.array',
  fn: () => {
    parse ( FIXTURE_QUOTE, { quote: "'" } );
  }
});

benchmark ({
  name: 'quote.array.infer',
  fn: () => {
    parse ( FIXTURE_QUOTE, { quote: "'", infer: true } );
  }
});

benchmark ({
  name: 'quote.header',
  fn: () => {
    parse ( FIXTURE_QUOTE, { quote: "'", header: true } );
  }
});

benchmark ({
  name: 'quote.header.infer',
  fn: () => {
    parse ( FIXTURE_QUOTE, { quote: "'", header: true, infer: true } );
  }
});

benchmark.summary ();
