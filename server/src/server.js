import express from 'express';
import { Server } from 'socket.io';
import { Engine } from '../../core/src/Engine';
import { DashboardBuilder } from '../../core/src/utils/DashboardBuilder';

const app = express();
const server = app.listen(3000);
const io = new Server(server, {
  cors: { origin: '*' }
});

const engine = new Engine();
const builder = new DashboardBuilder(engine);

io.on('connection', (socket) => {
  socket.on('create-formula', (formula) => {
    builder.createFormula(formula);
    io.emit('state-update', engine.state);
  });

  socket.on('update-value', ({ id, value }) => {
    const element = engine.getElement(id);
    if (element) {
      element.setProperty('value', value);
    }
  });
});