class NaturalLanguageProcessor {
  constructor() {
    this.commandPatterns = {
      'dashboard.switch': [
        { pattern: /switch to (first|root|yours)/i, argKey: 'dashboardId' },
        { pattern: /show dashboard (first|root|yours)/i, argKey: 'dashboardId' }
      ],
      'dashboard.create': [
        { pattern: /create\s+(?:a\s+)?(?:new\s+)?dashboard(?:\s+called|\s+named)?\s+["']?([\w-]+)["']?/i, argKey: 'dashboardId' }
      ],
      'dashboard.delete': [
        { pattern: /delete\s+(?:the\s+)?dashboard\s+["']?([\w-]+)["']?/i, argKey: 'dashboardId' }
      ],
      'element.create': [
        {
          pattern: /(?:add|create)\s+(?:a\s+)?(?:new\s+)?button/i,
          createArgs: () => ({
            type: 'button',
            id: `current.button-${Date.now()}`,
            label: 'New Button'
          })
        },
        {
          pattern: /(?:add|create)\s+(?:a\s+)?(?:new\s+)?(?:text\s+)?input/i,
          createArgs: () => ({
            type: 'text-input',
            id: `current.input-${Date.now()}`,
            label: 'New Input'
          })
        }
      ],
      'element.update': [
        {
          pattern: /(?:update|change|set)\s+(.+?)\s+(?:to|value|label)\s+["']?([^"']+)["']?/i,
          createArgs: (matches) => {
            const [, elementDesc, newValue] = matches;
            const timestamp = Date.now();
            const elementId = elementDesc.includes('button') ? `current.button-${timestamp}` : 
                            elementDesc.includes('input') ? `current.input-${timestamp}` : null;
            return elementId ? { id: elementId, label: newValue } : null;
          }
        }
      ],
      'element.delete': [
        {
          pattern: /(?:delete|remove)\s+(.+)/i,
          createArgs: (matches) => {
            const [, elementDesc] = matches;
            const elementId = elementDesc.includes('button') ? 'button' : 
                            elementDesc.includes('input') ? 'input' : null;
            return elementId ? { elementId } : null;
          }
        }
      ],
      'dashboard.refresh': [
        { pattern: /(?:refresh|reload)(?:\s+dashboard)?/i }
      ]
    };
  }

  parseCommand(text) {
    text = text.toLowerCase();
    
    for (const [command, patterns] of Object.entries(this.commandPatterns)) {
      for (const pattern of patterns) {
        const matches = text.match(pattern.pattern);
        if (matches) {
          let args = {};
          
          if (pattern.createArgs) {
            args = pattern.createArgs(matches);
            if (!args) continue;
          } else if (pattern.argKey && matches[1]) {
            args[pattern.argKey] = matches[1].toLowerCase();
          }

          return { command, args };
        }
      }
    }

    return null;
  }
}

export { NaturalLanguageProcessor };