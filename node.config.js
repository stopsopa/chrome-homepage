import tab from "./lib/tab.ts";

const testPatterns = ["**/*.parallel.test.*", "**/*.serial.test.*"];

if (process.env.GET_PATTERNS === "1") {
  process.stdout.write(testPatterns.join(" "));
  process.exit(0);
}

const noCoverage = process.env.NO_COVERAGE === "true";

/**
 * set CONCURRENCY=1
 * or
 * CONCURRENCY=0
 * to fallback to defaul 10 defined below
 *
 * Anyway for each test file CONCURRENCY have to be defined
 */
let concurrency = (function (def) {
  const c = process?.env?.CONCURRENCY;

  let value = def;

  if (typeof c === "string") {
    if (/^\d+$/.test(c)) {
      value = parseInt(c, 10);
    } else {
      throw new Error(`node.config.js error: invalid CONCURRENCY value: ${c}`);
    }
  }

  if (value === 0) {
    value = def;
  }

  return value;
})(10);

const config = {
  $schema: "https://nodejs.org/dist/v24.13.0/docs/node-config-schema.json",
  nodeOptions: {
    warnings: false,
  },
  testRunner: {
    "test-concurrency": concurrency,
    "experimental-test-coverage": !noCoverage,
    // "test-coverage-lines": 80, // Disabled: causes partial runs in coverage.sh to fail thresholds prematurely

    // "test-coverage-exclude": ["concurrencyCheck.ts", "node-suppress-warning.js", "ts-resolver.js", "**/*.serial.test.*", "**/*.parallel.test.*"],
    // this doesn't work, use .c8rc.json to ignore stuff from coverage
  },
};

process.stdout.write(`
${tab(JSON.stringify(config, null, 2))}

`);
