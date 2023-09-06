
/* IMPORT */

import benchmark from 'benchloop';
import fs from 'node:fs';
import parse from '../dist/index.js';

/* HELPERS */

const SAMPLE_EARTHQUAKES = fs.readFileSync ( 'tasks/sample_earthquakes.csv', 'utf8' );
const SAMPLE_HPI = fs.readFileSync ( 'tasks/sample_hpi.csv', 'utf8' );
const SAMPLE_TIME_SERIES = fs.readFileSync ( 'tasks/sample_time_series.csv', 'utf8' );
const SAMPLE_USZIP = fs.readFileSync ( 'tasks/sample_uszip.csv', 'utf8' );

/* MAIN */

benchmark.config ({
  iterations: 1
});

for ( const [name, SAMPLE] of [['earthquakes', SAMPLE_EARTHQUAKES], ['hpi', SAMPLE_HPI], ['time_series', SAMPLE_TIME_SERIES], ['uszip', SAMPLE_USZIP]] ) {

  benchmark ({
    name: `${name}.array`,
    fn: () => {
      parse ( SAMPLE );
    }
  });

  benchmark ({
    name: `${name}.array.infer`,
    fn: () => {
      parse ( SAMPLE, { infer: true } );
    }
  });

  benchmark ({
    name: `${name}.header`,
    fn: () => {
      parse ( SAMPLE, { header: true } );
    }
  });

  benchmark ({
    name: `${name}.header.infer`,
    fn: () => {
      parse ( SAMPLE, { header: true, infer: true } );
    }
  });

}

benchmark.summary ();
