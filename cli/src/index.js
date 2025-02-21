#!/usr/bin/env node
import { program } from 'commander';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api';

program
  .command('create-formula <formula>')
  .description('Create a formula relationship (e.g., "X = A + B")')
  .action(async (formula) => {
    const res = await fetch(`${API_URL}/formula`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formula,
        computations: {
          forward: {
            inputs: ['A', 'B'],
            output: 'X',
            compute: '(a, b) => a + b'
          },
          solveForA: {
            inputs: ['X', 'B'],
            output: 'A',
            compute: '(x, b) => x - b'
          },
          solveForB: {
            inputs: ['X', 'A'],
            output: 'B',
            compute: '(x, a) => x - a'
          }
        }
      })
    });
    console.log(await res.json());
  });

program
  .command('set <elementId> <value>')
  .description('Set element value and trigger computations')
  .action(async (elementId, value) => {
    const res = await fetch(`${API_URL}/value/${elementId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: parseFloat(value) })
    });
    console.log(await res.json());
  });

program
  .command('watch <elementId>')
  .description('Watch element value changes')
  .action(async (elementId) => {
    const ws = new WebSocket(`ws://localhost:3000/watch/${elementId}`);
    ws.on('message', (data) => {
      const { value, trigger } = JSON.parse(data);
      console.log(`${elementId} = ${value} (changed by ${trigger})`);
    });
  });

program.parse(process.argv);