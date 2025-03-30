# MagnetCube Web Game

A 3D web-based implementation of the MagnetCube board game, built with React, Three.js, and modern web technologies.

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Git

## Project Structure

```
magnet-cube-web/
├── src/
│   ├── components/
│   │   ├── game/      # Game-specific components
│   │   ├── ui/        # UI components
│   │   └── three/     # Three.js components
│   ├── store/         # Redux store configuration
│   └── main.jsx       # Application entry point
├── public/            # Static assets
├── Dockerfile         # Docker build configuration
├── docker-compose.yml # Docker services configuration
└── nginx.conf         # Nginx server configuration
```

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd magnet-cube-web
```

2. Start the development server:
```bash
docker-compose up dev
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## Available Docker Commands

### Development Mode
```bash
# Start the development server
docker-compose up dev

# Start in detached mode
docker-compose up -d dev

# View logs
docker-compose logs -f dev

# Stop the development server
docker-compose down dev
```

### Production Mode
```bash
# Build and start the production server
docker-compose up prod

# Start in detached mode
docker-compose up -d prod

# View logs
docker-compose logs -f prod

# Stop the production server
docker-compose down prod
```

### General Commands
```bash
# Rebuild containers
docker-compose up --build

# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# View container status
docker-compose ps
```

## Development Workflow

1. The development server runs on port 3000 with hot-reloading enabled
2. Any changes to the source code will automatically trigger a rebuild
3. The development environment includes:
   - Hot module replacement (HMR)
   - Source maps for debugging
   - Development-specific optimizations

## Production Deployment

1. Build and start the production server:
```bash
docker-compose up prod
```

2. The production server will be available at:
```
http://localhost:80
```

3. Production features include:
   - Optimized build
   - Nginx server with gzip compression
   - Static asset caching
   - Client-side routing support

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - If port 3000 or 80 is already in use, modify the ports in docker-compose.yml

2. **Container won't start**
   - Check logs: `docker-compose logs`
   - Ensure all required ports are available
   - Verify Docker daemon is running

3. **Build failures**
   - Clear Docker cache: `docker-compose build --no-cache`
   - Check for syntax errors in source code
   - Verify all dependencies are correctly listed in package.json

### Debugging

1. **View container logs**
```bash
docker-compose logs -f [service-name]
```

2. **Access container shell**
```bash
docker-compose exec [service-name] sh
```

3. **Check container status**
```bash
docker-compose ps
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the maintainers.

# Code Structure and Feature Mapping

## Physics System
```javascript
// Core Physics Implementation
web/src/services/physics/IPhysicsEngine.js        // Physics interface definition
web/src/services/physics/MagneticPhysicsEngine.js // Magnetic physics implementation
web/src/hooks/useCubePhysics.js                   // Physics hook for components

// Physics-Related Components
web/src/components/three/MagneticFieldVisualizer.jsx // Visualizes magnetic fields
web/src/components/three/PhysicsDebugger.jsx         // Debug visualization
```

## Game Logic
```javascript
// Core Game Logic
web/src/services/gameLogic.js          // Main game logic implementation
web/src/services/validation/GameValidator.js // Game rules and validation
web/src/services/actions/ActionHandler.js    // Action handling system

// Game State Management
web/src/store/gameStore.js             // Redux store configuration
web/src/reducers/gameReducer.js        // Game state reducers
web/src/actions/gameActions.js         // Game actions
```

## Event System
```javascript
// Event Infrastructure
web/src/services/eventSystem.js        // Event system implementation
web/src/hooks/useGameEvents.js         // Event hook for components
web/src/constants/eventTypes.js        // Event type definitions

// Event Handlers
web/src/services/eventHandlers/        // Directory containing event handlers
  ├── cubeEvents.js                    // Cube-related events
  ├── playerEvents.js                  // Player-related events
  └── gameEvents.js                    // Game state events
```

## Component Architecture
```javascript
// Presentation Components
web/src/components/three/
  ├── CubePresentation.jsx            // Cube visual component
  ├── GridHelper.jsx                  // Grid visualization
  └── Scene.jsx                       // Main 3D scene

// Container Components
web/src/components/
  ├── CubeContainer.jsx               // Cube logic container
  ├── GameBoard.jsx                   // Game board container
  └── GameControls.jsx                // Game controls container

// Hooks
web/src/hooks/
  ├── useCube.js                      // Cube management
  ├── usePlayer.js                    // Player management
  └── useGameState.js                 // Game state management
```

## State Management
```javascript
// State Machine
web/src/services/stateMachine/
  ├── GameStateMachine.js             // Game state machine
  └── states/                         // State definitions
      ├── SetupState.js
      ├── PlayingState.js
      └── GameOverState.js

// Redux Integration
web/src/store/
  ├── index.js                        // Store configuration
  ├── actions/                        // Redux actions
  └── reducers/                       // Redux reducers
```

## Logging System
```javascript
// Logging Infrastructure
web/src/utils/logger.js               // Logger implementation
web/src/components/LogViewer.jsx      // Log display component
web/src/services/logging/             // Advanced logging features
```

## Configuration
```javascript
// Configuration Files
web/src/config/
  ├── index.js                        // Main configuration
  ├── physics.js                      // Physics configuration
  ├── game.js                         // Game configuration
  └── debug.js                        // Debug configuration
```

## Error Handling
```javascript
// Error Management
web/src/errors/
  ├── GameError.js                    // Custom error types
  ├── ErrorBoundary.jsx              // React error boundary
  └── errorHandlers/                  // Error handlers
      ├── physicsErrors.js
      ├── gameErrors.js
      └── networkErrors.js
```

## Testing
```javascript
// Test Files
web/src/tests/
  ├── physics/                        // Physics tests
  ├── components/                     // Component tests
  ├── game/                          // Game logic tests
  └── integration/                    // Integration tests
```

## Recent Changes by Feature

### Singleton Pattern Refactoring
- `web/src/utils/Singleton.js`
- `web/src/services/physics/MagneticPhysicsEngine.js`
- `web/src/services/gameLogic.js`

### State Management Enhancement
- `web/src/services/stateMachine/`
- `web/src/store/`
- `web/src/hooks/useGameState.js`

### Event System Implementation
- `web/src/services/eventSystem.js`
- `web/src/hooks/useGameEvents.js`
- `web/src/services/eventHandlers/`

### Physics System Separation
- `web/src/services/physics/`
- `web/src/hooks/useCubePhysics.js`
- `web/src/components/three/MagneticFieldVisualizer.jsx`

### Component Structure Improvement
- `web/src/components/three/CubePresentation.jsx`
- `web/src/components/CubeContainer.jsx`
- `web/src/hooks/`

### Configuration Management
- `web/src/config/`
- All files using configuration imports

### Error Handling Enhancement
- `web/src/errors/`
- `web/src/components/ErrorBoundary.jsx`
- Error handling in all service files

## Key Files for Common Tasks

### Adding New Features
1. Game Mechanics
   - `web/src/services/gameLogic.js`
   - `web/src/services/actions/ActionHandler.js`

2. Visual Components
   - `web/src/components/three/`
   - `web/src/components/ui/`

3. State Changes
   - `web/src/store/`
   - `web/src/services/stateMachine/`

### Debugging
1. Physics Issues
   - `web/src/services/physics/MagneticPhysicsEngine.js`
   - `web/src/components/three/PhysicsDebugger.jsx`

2. State Issues
   - `web/src/store/`
   - `web/src/services/stateMachine/`

3. Component Issues
   - Relevant component files in `web/src/components/`
   - `web/src/errors/ErrorBoundary.jsx`

### Configuration Changes
1. Game Settings
   - `web/src/config/game.js`

2. Physics Settings
   - `web/src/config/physics.js`

3. Debug Settings
   - `web/src/config/debug.js` 