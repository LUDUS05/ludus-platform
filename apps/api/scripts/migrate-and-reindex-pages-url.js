/*
  Safe migration + reindex script for `pages.url`.

  Features:
  - Detects pages with missing/null/empty `url` and pages where `url` != `/pages/${slug}`.
  - Backs up the full document JSON for all affected pages to `server/scripts/backups/`.
  - When run with `--yes` (or `--apply`) it will populate/normalize `url` and then
    drop/recreate the `url` index as { unique: true, sparse: true }.
  - If run without `--yes`, it will only report what would be done (safe dry-run).

  Usage (PowerShell):
    # Dry-run (report only)
    node server/scripts/migrate-and-reindex-pages-url.js

    # Apply changes (backup -> update url fields -> reindex)
    $env:MONGODB_URI = 'your-connection-string'
    node server/scripts/migrate-and-reindex-pages-url.js --yes

  Important: Run this against a backup or in a maintenance window for production.
*/

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Page = require('../src/models/Page');

async function main() {
  const argv = process.argv.slice(2);
  const shouldApply = argv.includes('--yes') || argv.includes('--apply');

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('Error: Set MONGODB_URI environment variable before running this script.');
    process.exit(1);
  }

  console.log('[migrate-and-reindex] Connecting to MongoDB...');
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    // 1) Find pages with missing/null/empty url
    const missingSelector = { $or: [{ url: { $exists: false } }, { url: null }, { url: '' }] };
    const missingCount = await Page.countDocuments(missingSelector);

    // 2) Find pages where url !== `/pages/${slug}`
    const allPages = await Page.find({}).select('_id slug url').lean();
    const mismatched = allPages.filter(p => {
      const expected = `/pages/${p.slug}`;
      return (!p.url && expected) || (p.url && p.url !== expected);
    });

    console.log(`[migrate-and-reindex] Pages with missing/null/empty url: ${missingCount}`);
    console.log(`[migrate-and-reindex] Pages with mismatched url (url !== /pages/{slug}): ${mismatched.length}`);

    const affectedIds = new Set();
    if (missingCount > 0) {
      const missingDocs = await Page.find(missingSelector).select('_id').lean();
      missingDocs.forEach(d => affectedIds.add(String(d._id)));
    }
    mismatched.forEach(d => affectedIds.add(String(d._id)));

    console.log(`[migrate-and-reindex] Total affected documents: ${affectedIds.size}`);

    if (affectedIds.size === 0 && !shouldApply) {
      console.log('[migrate-and-reindex] Nothing to do. Exiting.');
      await mongoose.disconnect();
      return;
    }

    // Backup affected documents
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `pages-url-backup-${timestamp}.json`);

    const affectedArray = Array.from(affectedIds);
    if (affectedArray.length > 0) {
      console.log('[migrate-and-reindex] Backing up affected documents to', backupPath);
      const docs = await Page.find({ _id: { $in: affectedArray } }).lean();
      fs.writeFileSync(backupPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: docs.length, docs }, null, 2));
      console.log(`[migrate-and-reindex] Backed up ${docs.length} documents`);
    }

    if (!shouldApply) {
      console.log('\n[migrate-and-reindex] Dry-run complete. To perform changes, re-run with `--yes` or `--apply`.');
      console.log('[migrate-and-reindex] Backup available at:', backupPath);
      await mongoose.disconnect();
      return;
    }

    // Apply updates: set url = `/pages/${slug}` for affected docs
    console.log('[migrate-and-reindex] Applying url normalization to affected documents...');
    const pagesToUpdate = await Page.find({ _id: { $in: affectedArray } }).select('_id slug').lean();
    const ops = pagesToUpdate.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { url: `/pages/${p.slug}` } }
      }
    }));

    if (ops.length > 0) {
      const bulkRes = await Page.bulkWrite(ops, { ordered: false });
      console.log('[migrate-and-reindex] Bulk update result:', bulkRes && (bulkRes.modifiedCount || bulkRes.nModified || bulkRes.matchedCount));
    } else {
      console.log('[migrate-and-reindex] No documents to update.');
    }

    // Reindex: drop any existing url index and create sparse unique index
    console.log('[migrate-and-reindex] Recreating url index (unique + sparse)...');
    const collection = mongoose.connection.collection('pages');
    const indexes = await collection.indexes();
    const urlIndex = indexes.find(i => i.key && i.key.url === 1);
    if (urlIndex) {
      console.log('[migrate-and-reindex] Dropping existing url index:', urlIndex.name);
      try {
        await collection.dropIndex(urlIndex.name);
      } catch (err) {
        console.error('[migrate-and-reindex] Warning: failed to drop existing url index:', err.message || err);
      }
    }

    try {
      await collection.createIndex({ url: 1 }, { unique: true, sparse: true });
      console.log('[migrate-and-reindex] Created sparse unique index on url');
    } catch (err) {
      console.error('[migrate-and-reindex] Error creating url index:', err);
      console.error('[migrate-and-reindex] If this is a duplicate-key error due to remaining nulls, inspect the backup and offending documents before retrying.');
      throw err;
    }

    console.log('[migrate-and-reindex] Migration + reindex completed successfully.');
    console.log('[migrate-and-reindex] Backup file:', backupPath);

    await mongoose.disconnect();
  } catch (err) {
    console.error('[migrate-and-reindex] Fatal error:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(2);
  }
}

main();
