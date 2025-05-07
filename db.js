const { XataClient } = require('@xata.io/client');

// Initialize Xata client
const xata = new XataClient({
  apiKey: 'xau_WRxpN60kT7cEqyx22FLMcH7tp7vkmwDr0',
  databaseURL: 'https://Infinity-Free-Fire-s-workspace-ntm0uo.us-east-1.xata.sh/db/webnovelvault:main'
});

module.exports = xata;