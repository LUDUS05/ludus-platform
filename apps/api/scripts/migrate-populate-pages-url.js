/*
  Migration script to populate the persisted `url` field for existing pages.
  - Populates `url` for documents where it's missing/null/empty.
  - Normalizes `url` so it equals `/pages/${slug}` when it differs.

  Usage (PowerShell):
    $env:MONGODB_URI = 'your-connection-string'; node server/scripts/migrate-populate-pages-url.js

  Run this once against a backup or a maintenance window.
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

  try {
    // 1) Populate missing/null/empty url fields
    const missingSelector = { $or: [{ url: { $exists: false } }, { url: null }, { url: '' }] };
    const missingCount = await Page.countDocuments(missingSelector);
    console.log('Pages with missing/null/empty url:', missingCount);

    if (missingCount > 0) {
      const pages = await Page.find(missingSelector).select('_id slug');
      const ops = pages.map(p => ({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { url: `/pages/${p.slug}` } }
        }
      }));

      if (ops.length) {
        const result = await Page.bulkWrite(ops);
        console.log('Populated url on missing documents:', result.modifiedCount || result.nModified || result.matchedCount);
      }
    }

    // 2) Normalize mismatched urls (if url !== `/pages/${slug}`)
    const allPages = await Page.find({}).select('_id slug url');
    const mismatched = allPages.filter(p => {
      const expected = `/pages/${p.slug}`;
      return (!p.url && expected) || (p.url && p.url !== expected);
    });

    console.log('Pages with mismatched url count:', mismatched.length);
    if (mismatched.length > 0) {
      const ops = mismatched.map(p => ({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: { url: `/pages/${p.slug}` } }
        }
      }));
      const result = await Page.bulkWrite(ops);
      console.log('Normalized url on mismatched documents:', result.modifiedCount || result.nModified || result.matchedCount);
    }

    console.log('Migration complete. Verify indexes using the reindex script if necessary.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main();
