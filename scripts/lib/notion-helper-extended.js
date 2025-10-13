#!/usr/bin/env node

/**
 * Extended Notion Helper
 * Provides advanced functionality for workspace automation
 */

const { Client } = require('@notionhq/client');
const { NotionHelper } = require('../notion-client');

class NotionHelperExtended extends NotionHelper {
  constructor(options = {}) {
    super(options);
    const token = options.token || process.env.NOTION_TOKEN;
    this.client = new Client({ auth: token });
  }

  /**
   * Create a database with full configuration including views
   */
  async createDatabase({ title, parentId, properties, icon = null, cover = null }) {
    try {
      const databaseData = {
        parent: parentId ? { type: 'page_id', page_id: parentId } : { type: 'workspace', workspace: true },
        title: [{ text: { content: title } }],
        properties: properties
      };

      if (icon) databaseData.icon = icon;
      if (cover) databaseData.cover = cover;

      const database = await this.client.databases.create(databaseData);
      console.log(`   ✅ Database created: ${title} (${database.id})`);
      return database;
    } catch (error) {
      console.error(`   ❌ Failed to create database ${title}:`, error.message);
      throw error;
    }
  }

  /**
   * Update database properties
   */
  async updateDatabase(databaseId, updates) {
    try {
      const database = await this.client.databases.update({
        database_id: this._normalizeId(databaseId),
        ...updates
      });
      console.log(`   ✅ Database updated: ${databaseId}`);
      return database;
    } catch (error) {
      console.error(`   ❌ Failed to update database ${databaseId}:`, error.message);
      throw error;
    }
  }

  /**
   * Create a page with rich content
   */
  async createPage({ title, parentId, content = null, properties = null, icon = null, cover = null }) {
    try {
      const pageData = {
        parent: parentId ? { page_id: parentId } : { workspace: true },
        properties: properties || {
          title: {
            title: [{ text: { content: title } }]
          }
        }
      };

      if (icon) pageData.icon = icon;
      if (cover) pageData.cover = cover;

      const page = await this.client.pages.create(pageData);

      // Add content blocks if provided
      if (content) {
        await this.appendBlocks(page.id, content);
      }

      console.log(`   ✅ Page created: ${title} (${page.id})`);
      return page;
    } catch (error) {
      console.error(`   ❌ Failed to create page ${title}:`, error.message);
      throw error;
    }
  }

  /**
   * Append blocks to a page or block
   */
  async appendBlocks(blockId, blocks) {
    try {
      // Split blocks into chunks of 100 (Notion API limit)
      const chunks = this._chunkArray(blocks, 100);
      
      for (const chunk of chunks) {
        await this.client.blocks.children.append({
          block_id: this._normalizeId(blockId),
          children: chunk
        });
      }
      
      return true;
    } catch (error) {
      console.error(`   ❌ Failed to append blocks:`, error.message);
      throw error;
    }
  }

  /**
   * Query database with filters and sorting
   */
  async queryDatabase(databaseId, options = {}) {
    try {
      const { filter, sorts, pageSize = 100 } = options;
      let allResults = [];
      let cursor = undefined;

      do {
        const response = await this.client.databases.query({
          database_id: this._normalizeId(databaseId),
          filter: filter,
          sorts: sorts,
          page_size: pageSize,
          start_cursor: cursor
        });

        allResults = allResults.concat(response.results);
        cursor = response.has_more ? response.next_cursor : undefined;
      } while (cursor);

      return allResults;
    } catch (error) {
      console.error(`   ❌ Failed to query database:`, error.message);
      throw error;
    }
  }

  /**
   * Create a database page entry
   */
  async createDatabaseEntry(databaseId, properties) {
    try {
      const page = await this.client.pages.create({
        parent: { database_id: this._normalizeId(databaseId) },
        properties: properties
      });
      return page;
    } catch (error) {
      console.error(`   ❌ Failed to create database entry:`, error.message);
      throw error;
    }
  }

  /**
   * Update a page's properties
   */
  async updatePage(pageId, properties) {
    try {
      const page = await this.client.pages.update({
        page_id: this._normalizeId(pageId),
        properties: properties
      });
      return page;
    } catch (error) {
      console.error(`   ❌ Failed to update page:`, error.message);
      throw error;
    }
  }

  /**
   * Search with advanced options
   */
  async search(query, options = {}) {
    try {
      const { filter, sort, pageSize = 100 } = options;
      let allResults = [];
      let cursor = undefined;

      do {
        const response = await this.client.search({
          query: query,
          filter: filter,
          sort: sort,
          page_size: pageSize,
          start_cursor: cursor
        });

        allResults = allResults.concat(response.results);
        cursor = response.has_more ? response.next_cursor : undefined;
      } while (cursor);

      return allResults;
    } catch (error) {
      console.error(`   ❌ Failed to search:`, error.message);
      throw error;
    }
  }

  /**
   * Get all blocks from a page
   */
  async getBlocks(blockId) {
    try {
      let allBlocks = [];
      let cursor = undefined;

      do {
        const response = await this.client.blocks.children.list({
          block_id: this._normalizeId(blockId),
          start_cursor: cursor
        });

        allBlocks = allBlocks.concat(response.results);
        cursor = response.has_more ? response.next_cursor : undefined;
      } while (cursor);

      return allBlocks;
    } catch (error) {
      console.error(`   ❌ Failed to get blocks:`, error.message);
      throw error;
    }
  }

  /**
   * Delete a block
   */
  async deleteBlock(blockId) {
    try {
      await this.client.blocks.delete({
        block_id: this._normalizeId(blockId)
      });
      return true;
    } catch (error) {
      console.error(`   ❌ Failed to delete block:`, error.message);
      throw error;
    }
  }

  /**
   * Parse markdown to Notion blocks
   */
  parseMarkdownToBlocks(markdown) {
    const lines = markdown.split('\n');
    const blocks = [];
    let currentList = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim() === '') {
        currentList = null;
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        currentList = null;
        blocks.push({
          type: 'heading_1',
          heading_1: {
            rich_text: [{ text: { content: line.substring(2) } }]
          }
        });
      } else if (line.startsWith('## ')) {
        currentList = null;
        blocks.push({
          type: 'heading_2',
          heading_2: {
            rich_text: [{ text: { content: line.substring(3) } }]
          }
        });
      } else if (line.startsWith('### ')) {
        currentList = null;
        blocks.push({
          type: 'heading_3',
          heading_3: {
            rich_text: [{ text: { content: line.substring(4) } }]
          }
        });
      }
      // Bulleted list
      else if (line.startsWith('- ')) {
        currentList = 'bulleted';
        blocks.push({
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ text: { content: line.substring(2) } }]
          }
        });
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        currentList = 'numbered';
        const content = line.replace(/^\d+\.\s/, '');
        blocks.push({
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [{ text: { content: content } }]
          }
        });
      }
      // Checkbox
      else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        currentList = null;
        const checked = line.startsWith('- [x] ');
        const content = line.substring(6);
        blocks.push({
          type: 'to_do',
          to_do: {
            rich_text: [{ text: { content: content } }],
            checked: checked
          }
        });
      }
      // Code block
      else if (line.startsWith('```')) {
        currentList = null;
        const language = line.substring(3).trim() || 'plain text';
        let codeContent = '';
        i++;
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeContent += lines[i] + '\n';
          i++;
        }
        
        blocks.push({
          type: 'code',
          code: {
            rich_text: [{ text: { content: codeContent.trim() } }],
            language: language
          }
        });
      }
      // Divider
      else if (line.startsWith('---')) {
        currentList = null;
        blocks.push({
          type: 'divider',
          divider: {}
        });
      }
      // Quote
      else if (line.startsWith('> ')) {
        currentList = null;
        blocks.push({
          type: 'quote',
          quote: {
            rich_text: [{ text: { content: line.substring(2) } }]
          }
        });
      }
      // Regular paragraph
      else {
        if (currentList) continue; // Skip if part of a list
        blocks.push({
          type: 'paragraph',
          paragraph: {
            rich_text: [{ text: { content: line } }]
          }
        });
      }
    }

    return blocks;
  }

  /**
   * Retry logic for rate limiting
   */
  async withRetry(fn, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        if (error.code === 'rate_limited' || error.message.includes('rate limit')) {
          const waitTime = delay * Math.pow(2, attempt - 1);
          console.log(`   ⏳ Rate limited, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await this._sleep(waitTime);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Helper: Sleep function
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper: Chunk array
   */
  _chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Helper: Build rich text from string
   */
  buildRichText(text, options = {}) {
    const richText = {
      type: 'text',
      text: {
        content: text
      }
    };

    if (options.link) {
      richText.text.link = { url: options.link };
    }

    if (options.bold) richText.annotations = { ...richText.annotations, bold: true };
    if (options.italic) richText.annotations = { ...richText.annotations, italic: true };
    if (options.strikethrough) richText.annotations = { ...richText.annotations, strikethrough: true };
    if (options.underline) richText.annotations = { ...richText.annotations, underline: true };
    if (options.code) richText.annotations = { ...richText.annotations, code: true };
    if (options.color) richText.annotations = { ...richText.annotations, color: options.color };

    return richText;
  }
}

module.exports = { NotionHelperExtended };

