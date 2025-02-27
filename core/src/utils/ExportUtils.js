import { Element } from '../elements/Element.js';
import { ElementTypes } from '../types/ElementTypes.js';
import { ElementModel } from '../models/ElementModel.js';

/**
 * Formats for exporting engine configurations and dashboard descriptions
 */
export const ExportFormat = {
  JSON: 'json',           // Standard JSON format
  HUMAN: 'human',         // Human-readable format with comments and formatting
  AI: 'ai',              // Condensed format optimized for AI consumption
  DEBUG: 'debug',        // Debug-friendly format with additional metadata
  CSV: 'csv',            // CSV format for external tool integration
  STRUCTURED: 'structured' // Structured text format for better readability
};

/**
 * Converts an engine configuration or dashboard description to the specified format
 * @param {Object} data - The configuration or dashboard data to export
 * @param {string} format - The desired output format (from ExportFormat)
 * @param {Object} options - Additional formatting options
 * @returns {string} The formatted output
 */
export function exportConfig(data, format = ExportFormat.JSON, options = {}) {
  switch (format) {
    case ExportFormat.HUMAN:
      return exportHumanFormat(data, options);
    case ExportFormat.AI:
      return exportAIFormat(data, options);
    case ExportFormat.DEBUG:
      return exportDebugFormat(data, options);
    case ExportFormat.CSV:
      return exportCSVFormat(data, options);
    case ExportFormat.STRUCTURED:
      return exportStructuredFormat(data, options);
    default:
      return JSON.stringify(data, null, 2);
  }
}

/**
 * Exports data in a human-readable format with comments and documentation
 */
function exportHumanFormat(data, options = {}) {
  const output = [];
  
  if (data.type === 'system') {
    output.push('// System Configuration');
    output.push('// Contains system-wide settings and resources');
  } else if (data.id) {
    output.push(`// Dashboard: ${data.id}`);
  }

  if (data.content?.resources) {
    output.push('// Resource Definitions:');
    Object.entries(data.content.resources).forEach(([key, value]) => {
      output.push(`// - ${key}: ${value.id || 'Unnamed resource'}`);
    });
  }

  const jsonStr = JSON.stringify(data, null, 2);
  output.push(jsonStr);
  return output.join('\n');
}

/**
 * Exports data in a format optimized for AI consumption
 */
function exportAIFormat(data, options = {}) {
  // Remove any unnecessary metadata and comments
  const cleanData = JSON.parse(JSON.stringify(data));
  
  // Add AI-specific metadata if needed
  cleanData._meta = {
    format: 'ai',
    version: '1.0',
    timestamp: new Date().toISOString()
  };

  return JSON.stringify(cleanData);
}

/**
 * Exports data in a debug-friendly format with additional metadata
 */
function exportDebugFormat(data, options = {}) {
  const debugData = {
    _meta: {
      format: 'debug',
      timestamp: new Date().toISOString(),
      elementCount: countElements(data),
      resourceCount: countResources(data)
    },
    data: data
  };

  return JSON.stringify(debugData, null, 2);
}

/**
 * Counts the number of elements in the configuration
 */
function countElements(data) {
  let count = 0;
  if (data.elements) {
    count += Object.keys(data.elements).length;
  }
  if (data.content?.elements) {
    count += Object.keys(data.content.elements).length;
  }
  return count;
}

/**
 * Counts the number of resources in the configuration
 */
function countResources(data) {
  let count = 0;
  if (data.content?.resources) {
    Object.values(data.content.resources).forEach(category => {
      count += Object.keys(category).length;
    });
  }
  return count;
}

/**
 * Exports dashboard data in CSV format for external tool integration
 */
function exportCSVFormat(data, options = {}) {
  const rows = ['Element ID,Type,Value,Label'];
  const elements = data.content?.elements || {};

  Object.entries(elements).forEach(([id, element]) => {
    const row = [
      id,
      element.type,
      element.value !== undefined ? element.value : '',
      element.label || ''
    ].map(value => `"${String(value).replace(/"/g, '""')}"`);
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * Exports dashboard data in a structured text format
 */
function formatElementProperties(element) {
  const output = [];
  const properties = element instanceof ElementModel ? Array.from(element.properties.entries()) : Object.entries(element);

  properties.forEach(([key, value]) => {
    if (key !== 'type' && key !== 'id') {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      output.push(`  ${formattedKey}: ${value !== undefined ? value : 'N/A'}`);
    }
  });

  if (element.type === ElementTypes.CONTAINER && element.children) {
    output.push('  Children:');
    element.children.forEach(child => {
      output.push(`    - ${child.id} (${child.type})`);
    });
  }

  return output;
}

function exportStructuredFormat(data, options = {}) {
  const output = [];
  const elements = data.content?.elements || {};

  output.push(`Dashboard: ${data.id}`);
  output.push('='.repeat(40));
  output.push('');

  output.push('Elements:');
  output.push('-'.repeat(20));
  Object.entries(elements).forEach(([id, element]) => {
    output.push(`[${element.type}] ${id}`);
    formatElementProperties(element).forEach(line => output.push(line));
    output.push('');
  });

  if (data.content?.resources) {
    output.push('Resources:');
    output.push('-'.repeat(20));
    Object.entries(data.content.resources).forEach(([type, resources]) => {
      output.push(`${type}:`);
      Object.entries(resources).forEach(([id, resource]) => {
        output.push(`  - ${id}: ${resource.id || 'Unnamed'}`);
      });
    });
  }

  return output.join('\n');
}