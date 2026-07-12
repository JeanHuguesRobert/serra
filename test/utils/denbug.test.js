// Test suite for denbug.js

const denbug = require('../../core/src/utils/denbug.js').default;

// Mock console methods
const originalConsole = { ...console };

beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(console, {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        assert: jest.fn()
    });
    denbug.__reset__();
});

afterEach(() => {
    denbug.deintercept();
    Object.assign(console, originalConsole);
});

describe('denbug', () => {
    test('should enable and disable domains', () => {
        denbug.enable('test');
        expect(denbug.enabled('test')).toBe(true);
        denbug.disable('test');
        expect(denbug.enabled('test')).toBe(false);
    });

    test('should log messages when domain is enabled', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        
        debugFn('message');
        expect(denbug.traces()).toEqual(expect.arrayContaining([
            expect.objectContaining({ domain: 'test', args: ['message'] })
        ]));
    });

    test('should not log messages when domain is disabled', () => {
        denbug.disable('test');
        const debugFn = denbug.domain('test');
        debugFn('message');
        expect(console.log).not.toHaveBeenCalled();
    });

    test('should add trace when domain is enabled', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn('message');
        const traces = denbug.traces();
        expect(traces.length).toBe(1);
        expect(traces[0].domain).toBe('test');
    });

    test('should not add trace when domain is disabled', () => {
        denbug.disable('test');
        const debugFn = denbug.domain('test');
        debugFn('message');
        const traces = denbug.traces();
        expect(traces.length).toBe(0);
    });

    test('should filter traces by domain', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn('message');
        const filtered = denbug.filter(denbug.traces(), { pattern: 'test' });
        expect(filtered.length).toBe(1);
        expect(filtered[0].domain).toBe('test');
    });

    test('should filter traces by time range', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn('message');
        const now = Date.now();
        const filtered = denbug.filter(denbug.traces(), { from: now - 1000, to: now + 1000 });
        expect(filtered.length).toBe(1);
    });

    test('should save and load state', () => {
        denbug.enable('test');
        const saved = denbug.save();
        denbug.disable('test');
        denbug.load(saved);
        expect(denbug.enabled('test')).toBe(true);
    });

    test('should intercept console methods', () => {
        denbug.intercept();
        console.log('message');
        const traces = denbug.traces();
        expect(traces.length).toBe(1);
        expect(traces[0].domain).toBe('log');
        denbug.deintercept();
    });

    test('should handle structured traces', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn({ structured: { key: 'value' } });
        const traces = denbug.traces();
        expect(traces.length).toBe(1);
        expect(traces[0].structured).toEqual({ key: 'value' });
    });

    test('should filter structured traces', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn({ structured: { key: 'value' } });
        const filtered = denbug.filterStructuredTraces(denbug.traces(), 'key', 'value');
        expect(filtered.length).toBe(1);
        expect(filtered[0].structured).toEqual({ key: 'value' });
    });

    test('should decode trace', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn('message');
        const trace = denbug.traces()[0];
        const decoded = denbug.decode(trace);
        expect(decoded.domain).toBe('test');
        expect(decoded.args).toEqual(['message']);
    });

    test('should clear traces', () => {
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn('message');
        denbug.clear();
        const traces = denbug.traces();
        expect(traces.length).toBe(0);
    });

    test('should subscribe and publish events', () => {
        const subscriber = jest.fn();
        denbug.subscribe(subscriber);
        denbug.publish('event', 'data');
        expect(subscriber).toHaveBeenCalledWith('event', 'data');
    });

    test('should attach flag to domain', () => {
        const setter = jest.fn();
        denbug.domain('test').flag(setter);
        denbug.enable('test');
        expect(setter).toHaveBeenCalledWith(true);
    });

    test('should handle demand assertions', () => {
        const demand = denbug.demand('test');
        expect(() => demand(true)).not.toThrow();
        expect(() => demand(false)).toThrow('Assertion failed');
    });

    test('should configure maxTraces', () => {
        denbug.configure({ maxTraces: 1 });
        denbug.enable('test');
        const debugFn = denbug.domain('test');
        debugFn('message1');
        debugFn('message2');
        const traces = denbug.traces();
        expect(traces.length).toBe(1);
    });

    test('should reset state', () => {
        denbug.enable('test');
        denbug.__reset__();
        expect(denbug.enabled('test')).toBe(false);
    });

    test('should set contracts enabled', () => {
        denbug.setContractsEnabled(true);
        expect(() => denbug.demand('test')(true)).not.toThrow();
        expect(() => denbug.demand('test')(false)).toThrow('Assertion failed');
    });
});

describe('denbug or() and and()', () => {
    beforeEach(() => {
        denbug.__reset__();
    });

    test('should enable domains matching the filter', () => {
        denbug.domain('test:one');
        denbug.domain('test:two');
        denbug.or('test:*');
        expect(denbug.enabled('test:one')).toBe(true);
        expect(denbug.enabled('test:two')).toBe(true);
    });

    test('should disable domains matching the filter', () => {
        denbug.domain('test:one');
        denbug.domain('test:two');
        denbug.enable('test:*');
        denbug.and('test:*');
        expect(denbug.enabled('test:one')).toBe(false);
        expect(denbug.enabled('test:two')).toBe(false);
    });

    test('should throw error for non-string filter in or()', () => {
        expect(() => denbug.or(123)).toThrow('or expects a string filter');
    });

    test('should throw error for non-string filter in and()', () => {
        expect(() => denbug.and(123)).toThrow('and expects a string filter');
    });
});

