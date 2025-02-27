import { ExportFormat, exportConfig } from '../../core/src/utils/ExportUtils.js';

describe('ExportUtils', () => {
  const sampleData = {
    id: 'test-dashboard',
    type: 'dashboard',
    content: {
      elements: {
        counter1: { type: 'counter', value: 0 },
        counter2: { type: 'counter', value: 10 }
      },
      resources: {
        styles: {
          theme: { id: 'default-theme' },
          layout: { id: 'grid-layout' }
        }
      }
    }
  };

  test('exports in JSON format', () => {
    const result = exportConfig(sampleData, ExportFormat.JSON);
    expect(JSON.parse(result)).toEqual(sampleData);
  });

  test('exports in human-readable format', () => {
    const result = exportConfig(sampleData, ExportFormat.HUMAN);
    expect(result).toContain('// Dashboard: test-dashboard');
    expect(result).toContain('// Resource Definitions:');
    const jsonPart = result.split('\n').filter(line => !line.startsWith('//')).join('\n');
    expect(JSON.parse(jsonPart)).toEqual(sampleData);
  });

  test('exports in AI format', () => {
    const result = exportConfig(sampleData, ExportFormat.AI);
    const parsed = JSON.parse(result);
    expect(parsed._meta).toBeDefined();
    expect(parsed._meta.format).toBe('ai');
    expect(parsed._meta.version).toBe('1.0');
  });

  test('exports in debug format', () => {
    const result = exportConfig(sampleData, ExportFormat.DEBUG);
    const parsed = JSON.parse(result);
    expect(parsed._meta).toBeDefined();
    expect(parsed._meta.format).toBe('debug');
    expect(parsed._meta.elementCount).toBe(2);
    expect(parsed._meta.resourceCount).toBe(2);
    expect(parsed.data).toEqual(sampleData);
  });
});

describe('ExportUtils - Complex Dashboard', () => {
  const complexDashboard = {
    id: 'monitoring-dashboard',
    type: 'dashboard',
    content: {
      elements: {
        cpuChart: {
          type: 'line-chart',
          label: 'CPU Usage',
          value: [45, 62, 78, 55, 42],
          config: {
            min: 0,
            max: 100,
            unit: '%'
          }
        },
        memoryUsage: {
          type: 'gauge',
          label: 'Memory Usage',
          value: 72.5,
          config: {
            warning: 75,
            critical: 90
          }
        },
        alertThreshold: {
          type: 'slider',
          label: 'Alert Threshold',
          value: 85,
          config: {
            min: 50,
            max: 95,
            step: 5
          }
        },
        systemStatus: {
          type: 'status',
          label: 'System Status',
          value: 'healthy',
          config: {
            states: ['healthy', 'warning', 'critical']
          }
        }
      },
      resources: {
        styles: {
          theme: { id: 'dark-theme' },
          layout: { id: 'monitoring-layout' }
        },
        scripts: {
          alerts: { id: 'alert-handler' },
          updates: { id: 'real-time-updates' }
        }
      }
    }
  };

  test('exports complex dashboard in JSON format', () => {
    const result = exportConfig(complexDashboard, ExportFormat.JSON);
    expect(JSON.parse(result)).toEqual(complexDashboard);
  });

  test('exports complex dashboard in human-readable format', () => {
    const result = exportConfig(complexDashboard, ExportFormat.HUMAN);
    expect(result).toContain('// Dashboard: monitoring-dashboard');
    expect(result).toContain('// Resource Definitions:');
    expect(result).toContain('dark-theme');
    expect(result).toContain('monitoring-layout');
    const jsonPart = result.split('\n').filter(line => !line.startsWith('//')).join('\n');
    expect(JSON.parse(jsonPart)).toEqual(complexDashboard);
  });

  test('exports complex dashboard in AI format', () => {
    const result = exportConfig(complexDashboard, ExportFormat.AI);
    const parsed = JSON.parse(result);
    expect(parsed._meta).toBeDefined();
    expect(parsed._meta.format).toBe('ai');
    expect(parsed._meta.version).toBe('1.0');
    expect(parsed.content.elements.cpuChart.value).toEqual([45, 62, 78, 55, 42]);
  });

  test('exports complex dashboard in debug format', () => {
    const result = exportConfig(complexDashboard, ExportFormat.DEBUG);
    const parsed = JSON.parse(result);
    expect(parsed._meta).toBeDefined();
    expect(parsed._meta.format).toBe('debug');
    expect(parsed._meta.elementCount).toBe(4);
    expect(parsed._meta.resourceCount).toBe(4);
    expect(parsed.data).toEqual(complexDashboard);
  });

  test('exports complex dashboard in CSV format', () => {
    const result = exportConfig(complexDashboard, ExportFormat.CSV);
    const lines = result.split('\n');
    expect(lines[0]).toBe('Element ID,Type,Value,Label');
    expect(lines).toHaveLength(5); // Header + 4 elements
    expect(lines[1]).toContain('cpuChart');
    expect(lines[1]).toContain('line-chart');
    expect(lines[2]).toContain('memoryUsage');
    expect(lines[2]).toContain('72.5');
  });

  test('exports complex dashboard in structured format', () => {
    const result = exportConfig(complexDashboard, ExportFormat.STRUCTURED);
    expect(result).toContain('Dashboard: monitoring-dashboard');
    expect(result).toContain('[line-chart] cpuChart');
    expect(result).toContain('Label: CPU Usage');
    expect(result).toContain('Resources:');
    expect(result).toContain('styles:');
    expect(result).toContain('scripts:');
  });
});