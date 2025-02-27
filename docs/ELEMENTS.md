# Elements

## Building Blocks

Serra dashboards are composed of various elements that work together to create interactive and dynamic interfaces. Here's a comprehensive guide to the available elements:

### Dashboard

A Dashboard is the fundamental container in Serra. It serves as a workspace where you can:
- Organize and arrange other elements
- Execute scripts and automation
- Create modular sections of your application

### Display

The Display element is a versatile component that:
- Shows dynamic values and content
- Updates in real-time through WebSocket connections
- Supports various data types and formats

### Number

The Number element is specialized for numerical data:
- Displays numerical values with precision control
- Supports optional formatting (e.g., currency, percentages)
- Can include units and custom formatting

### Dashboard Link

Dashboard Links enable navigation between different dashboards:
- Creates seamless connections between different views
- Supports parameterized navigation
- Enables modular dashboard design

## Scripting Integration

### Element Access

Elements can be accessed and manipulated through scripts:
```javascript
// Example of accessing elements by ID
const display = getElementById('myDisplay');
display.setValue('New Value');
```

### Socket Communication

Real-time updates are handled through WebSocket connections:
- Automatic data synchronization
- Event-driven updates
- Bidirectional communication

## Best Practices

1. Use meaningful IDs for elements to make scripting easier
2. Group related elements within dedicated dashboards
3. Implement error handling in scripts
4. Use appropriate element types for different data types