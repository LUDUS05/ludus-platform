/*
  One-time maintenance script to fix `url` index on the `pages` collection.
  Usage (locally):
    NODE_ENV=production node server/scripts/reindex-pages-url.js
  Make sure MONGODB_URI is available in the environment.
*/

const mongoose = require('mongoose');
const Page = require('../src/models/Page');

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('Set MONGODB_URI environment variable before running this script.');
    process.exit(1);
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const collection = mongoose.connection.collection('pages');

  try {
    const indexes = await collection.indexes();
    console.log('Existing indexes:', indexes.map(i => i.name));

    // Drop any index on `url` (we will recreate it as sparse unique)
    const urlIndex = indexes.find(i => i.key && i.key.url === 1);
    if (urlIndex) {
      console.log('Dropping existing url index:', urlIndex.name);
      await collection.dropIndex(urlIndex.name);
    }

    // Create sparse unique index
    console.log('Creating sparse unique index on url');
    await collection.createIndex({ url: 1 }, { unique: true, sparse: true });

    console.log('Reindex completed successfully');
  } catch (err) {
    console.error('Error while reindexing:', err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main();
