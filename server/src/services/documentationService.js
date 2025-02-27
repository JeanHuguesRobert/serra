import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocumentationService {
  constructor() {
    this.basePath = path.resolve(__dirname, '..', '..', '..');
    this.docsPath = path.join(this.basePath, 'docs');
    console.log('[Docs] Base path set to:', this.basePath);
  }

  getCliHelp() {
    return [
      'Available Commands:\n',
      '/help or ? - Show this help message\n',
      '/create [name] - Create a new dashboard\n',
      '/open [name] - Open an existing dashboard\n',
      '/list - List all available dashboards\n',
      '/add [type] - Add a new element to the current dashboard\n',
      '/connect [source] [target] - Create a connection between elements\n',
      '/delete [id] - Delete an element or connection\n',
      '/save - Save current dashboard\n',
      '/load [name] - Load a saved dashboard\n',
      '/clear - Clear current dashboard\n',
      '/status - Show system status\n'
    ].join('');
  }

  async getReadme() {
    try {
      const readmePath = path.join(this.basePath, 'README.md');
      console.log('[Docs] Reading README from:', readmePath);
      // Return raw markdown content, not wrapped in JSON
      return await fs.promises.readFile(readmePath, 'utf8');
    } catch (error) {
      console.error('[Docs] Error reading README.md:', error);
      throw new Error('Error loading documentation');
    }
  }

  async getDocumentation(filename) {
    try {
      if (filename.toLowerCase() === 'readme.md') {
        return this.getReadme();
      }

      const docPath = path.join(this.docsPath, filename);
      console.log('[Docs] Reading doc from:', docPath);
      
      // Security check: ensure the filename only contains safe characters
      if (!/^[\w-.]+\.md$/.test(filename)) {
        throw new Error('Invalid filename');
      }

      // Security check: ensure the resolved path is within the docs directory
      if (!docPath.startsWith(this.docsPath)) {
        throw new Error('Invalid path');
      }

      // Return raw markdown content
      return await fs.promises.readFile(docPath, 'utf8');
    } catch (error) {
      console.error(`[Docs] Error reading documentation file ${filename}:`, error);
      throw new Error('Error loading documentation');
    }
  }
}