export class CommandProcessor {
  constructor() {
    // Direct command handlers
    this.commands = new Map([
      ['start', () => this.engine?.start()],
      ['stop', () => this.engine?.stop()],
      ['list', () => this.listElements()],
      ['create', (args) => this.createElement(args)],
      ['delete', (args) => this.deleteElement(args)]
    ]);
  }

  setEngine(engine) {
    this.engine = engine;
  }

  async process(command) {
    const handler = this.commands.get(command.type);
    if (!handler) {
      throw new Error(`Unknown command: ${command.type}`);
    }
    return await handler(command.args);
  }

  // Command implementations
  listElements() {
    return this.engine?.getElements() || [];
  }

  createElement(args) {
    return this.engine?.createElement(args.id, args.type);
  }

  deleteElement(args) {
    // Element deletion handled by engine
    return true;
  }
}