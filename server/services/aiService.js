class AIService {
  async processMessage(message, currentDashboard) {
    try {
      const text = message.text.toLowerCase();
      
      // Handle dashboard improvements
      if (text.includes('add') || text.includes('create')) {
        if (text.includes('button')) {
          return {
            type: 'add_element',
            response: "I'll add a button to your dashboard.",
            action: {
              command: 'add_element',
              element: {
                id: `button-${Date.now()}`,
                type: 'button',
                label: 'New Button',
                script: {
                  id: `button-script-${Date.now()}`,
                  code: `
                    const button = document.getElementById('button-${Date.now()}');
                    if (button) {
                      button.addEventListener('click', () => {
                        console.log('Button clicked');
                      });
                    }
                  `
                }
              }
            }
          };
        }
        
        if (text.includes('text') || text.includes('input')) {
          return {
            type: 'add_element',
            response: "I'll add a text input field.",
            action: {
              command: 'add_element',
              element: {
                id: `text-${Date.now()}`,
                type: 'text-input',
                label: 'New Input',
                value: '',
                script: {
                  id: `text-script-${Date.now()}`,
                  code: `
                    const input = document.getElementById('text-${Date.now()}');
                    if (input) {
                      input.addEventListener('change', (event) => {
                        console.log('Input changed:', event.target.value);
                      });
                    }
                  `
                }
              }
            }
          };
        }
      }

      // Default response
      return {
        type: 'info',
        response: "I can help you improve your dashboard. Try asking me to add elements like buttons or text inputs.",
        action: null
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        type: 'error',
        response: "I apologize, but I encountered an error processing your request.",
        action: null
      };
    }
  }
}

module.exports = new AIService();