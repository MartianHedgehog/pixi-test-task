# PIXI Shapes Game

A physics simulation game built with PIXI.js and TypeScript. Interactive shapes with gravity, collisions, and bouncing mechanics.

## Features

- Click to spawn shapes at cursor position
- Click shapes to remove them and change colors of matching shapes
- Adjustable gravity and spawn rate controls
- Shape bouncing and collision mechanics
- Multiple shape types: Triangle, Square, Pentagon, Hexagon, Circle, Ellipse, Complex Random

## Installation

### Prerequisites
- Bun runtime (required for this project)

### Install Bun
```bash
# Install Bun on macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Or on Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Setup

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## How to Play

1. Click anywhere to spawn random shapes
2. Click on shapes to remove them
3. Use + / - buttons to adjust gravity and spawn rate
4. Watch shapes fall and interact with bouncing mechanics

Built with PIXI.js, TypeScript, and MVC architecture.