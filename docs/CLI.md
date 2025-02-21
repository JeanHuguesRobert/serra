---
title: Serre CLI Reference
description: Command line interface for the Serre freeform spreadsheet system
---

# Serre CLI Reference

## Element Classes
| Class | Description |
|-------|-------------|
| `Cell` | Basic value holder, can be input and/or output |
| `Formula` | Contains JavaScript computation logic, connects cells |
| `Container` | Groups related elements together |
| `Terminal` | Display-only element for visualization |
| `Sensor` | Input-only element, typically for external data |
| `Actuator` | Output-only element, for external actions |
| `Dashboard` | Top-level container for organizing elements |

## Core Primitives

### Node Management
| Primitive | Description |
|-----------|-------------|
| `addNode <id> <class>` | Create a new node of specified class |
| `removeNode <id>` | Remove a node and its connections |
| `getNode <id>` | Get node information |

### Stream Operations
| Primitive | Description |
|-----------|-------------|
| `pipe <sourceId> <targetId>` | Connect nodes with a stream |
| `unpipe <sourceId> <targetId>` | Disconnect nodes |
| `inject <nodeId> <code>` | Inject JavaScript behavior into node |
| `mutate <nodeId> <value>` | Update node value |

### Graph Operations
| Primitive | Description |
|-----------|-------------|
| `getUpstream <nodeId>` | Get nodes that feed into this node |
| `getDownstream <nodeId>` | Get nodes that this node feeds into |
| `merge <nodeIds[]> <targetId>` | Combine multiple streams into one |
| `split <sourceId> <targetIds[]>` | Split one stream to multiple targets |

### State Control
| Primitive | Description |
|-----------|-------------|
| `freeze <nodeId>` | Temporarily stop propagation |
| `unfreeze <nodeId>` | Resume propagation |
| `snapshot <name>` | Save current graph state |
| `restore <name>` | Restore saved graph state |

### Observation
| Primitive | Description |
|-----------|-------------|
| `observe <nodeId>` | Start watching node changes |
| `unobserve <nodeId>` | Stop watching node changes |
| `tap <nodeId> <code>` | Add side-effect without affecting stream |

## High-Level Commands

### Dashboard Management
| Command | Description |
|---------|-------------|
| `create-dashboard <name>` | Create a new dashboard |
| `use <dashboard>` | Set current dashboard context |
| `list-dashboards` | Show available dashboards |

### Cell Operations
| Command | Description |
|---------|-------------|
| `create-cell <name>` | Create a new cell |
| `set <cellId> <value>` | Set a cell's value |
| `watch <cellId>` | Watch cell value changes |

### Formula Operations
| Command | Description |
|---------|-------------|
| `create-formula` | Create a formula relationship using JavaScript |
| `link-cells` | Create direct cell relationships |

### Data Management
| Command | Description |
|---------|-------------|
| `import <source>` | Import data from external source |
| `export <target>` | Export dashboard data |

## Examples

### Using Primitives
```bash
# Create a simple sum relationship
addNode "A" "Cell"
addNode "B" "Cell"
addNode "X" "Formula"
inject "X" "
  const a$ = engine.getStream('A');
  const b$ = engine.getStream('B');
  combineLatest([a$, b$]).pipe(
    map(([a, b]) => a + b)
  ).subscribe(stream$);
"
```
## Examples
```bash
# Create and use a dashboard
create-dashboard "AI Greenhouse"
use "AI Greenhouse"

# Create cells and formulas
create-formula {
  forward: {
    inputs: ['Temperature', 'Humidity'],
    output: 'GrowthIndex',
    compute: '(temp, hum) => temp * hum / 100'
  }
}

# Set and watch values
set Temperature 25
watch GrowthIndex
```

## Viewing This Documentation
You can view this documentation with:
```bash
# Using VS Code
code c:\tweesic\serre\docs\CLI.md

# Preview in VS Code
# Press Ctrl+Shift+V or click the preview icon in the top-right corner
```