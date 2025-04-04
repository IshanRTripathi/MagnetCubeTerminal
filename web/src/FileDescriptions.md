# File Descriptions for `web/src`

## App.jsx
This file serves as the main entry point for the React application. It sets up the application structure, including the 3D scene using `@react-three/fiber`, the game UI, and toast notifications. It also integrates the Redux store and the `GameProvider` context.

## App.module.css
Contains CSS styles for the `App` component, including layout and styling for the canvas container and the overall application background.

## index.css
Defines global styles for the application, including Tailwind CSS utilities and custom styles for the root element, buttons, and canvas. It ensures a consistent look and feel across the app.

## index.jsx
The main entry point for rendering the React application. It initializes the React DOM, wraps the `App` component with the Redux `Provider`, and applies global styles.

## main.jsx
Similar to `index.jsx`, this file initializes the React application and renders the `App` component. It also integrates the Redux store.

## config/featureFlags.js
Defines feature flags for enabling or disabling specific features in the application, such as toast notifications and particle effects. It includes utility functions and hooks for checking feature flag values.

## config/GameConfig.ts
Manages the configuration for the game, including movement, building, highlighting, and board settings. It provides a singleton `GameConfigManager` class to access and update the configuration.

## constants
- **GameConstants.ts**: Defines constants used throughout the game, such as game states, phases, player colors, board object types, and default values. These constants ensure consistency and reusability.

## context
- **GameContext.jsx**: Provides a React context for managing the game's state and logic. It integrates Redux, the state machine, and the `GameLogic` service. It also synchronizes the state between Redux and the state machine and provides utility functions for managing the game state.

## components/three
- **Cube.jsx**: Represents a 3D cube in the game scene. It uses `@react-three/fiber` and `@react-three/rapier` for rendering and physics. The cube's position, color, and interactions are managed dynamically, and it logs collision events.
- **GameBoard.jsx**: Manages the 3D game board layout, including players and cubes. It integrates Redux to fetch game state and renders the ground, players, and cubes dynamically.
- **GameScene.jsx**: Sets up the overall 3D scene for the game. It includes grid helpers, magnetic field visualizers, and space selectors. It also renders cubes and players based on the game state.
- **GridHelper.jsx**: Provides a grid overlay for the game board using `@react-three/drei`.
- **Ground.jsx**: Represents the ground plane in the 3D scene. It uses `@react-three/rapier` for physics and includes a plane geometry with a standard material.
- **Lighting.jsx**: Configures lighting for the 3D scene, including ambient, directional, point, and hemisphere lights. It ensures proper illumination and shadows in the scene.
- **MagneticFieldVisualizer.jsx**: Visualizes the magnetic field in the game using `THREE.SphereGeometry` and custom field lines. It dynamically adjusts the level of detail based on distance.
- **Player.jsx**: Represents a player in the 3D scene. It includes features like particle effects for the current player and dynamically updates the player's position and appearance based on the game state.
- **Scene.jsx**: Combines all 3D elements into a single scene. It includes physics, lighting, grid helpers, and the game board. It also integrates `OrbitControls` for camera interaction and sets up the scene in the `ActionManager`.
- **SpaceSelector.jsx**: Handles user interaction for selecting spaces on the game board.
- **SpaceSelector.module.css**: Styles for the `SpaceSelector` component.

## components/ui
- **GameControls.jsx**: Provides interactive controls for players to perform actions like building, moving, rolling dice, and ending their turn. It integrates with the Redux store and the state machine to manage game actions and transitions.
- **GameUI.jsx**: Serves as the main container for the game's user interface, organizing components like `PlayerInfo`, `PowerCards`, `TurnControls`, and `LogDisplay` into a cohesive layout.
- **LogDisplay.jsx**: Displays a log of game events and actions. It fetches logs from the Redux store and renders them in a scrollable list.
- **PlayerInfo.jsx**: Shows information about the current player, including their turn, score, and state. It dynamically updates based on the game state and player actions.
- **PowerCard.jsx**: Represents an individual power card with details like name, description, effects, and cooldown. It allows players to select and activate cards.
- **PowerCardDeck.jsx**: Displays the deck of power cards available to the current player. It organizes cards into a visually appealing layout.
- **PowerCards.jsx**: Manages the display and interaction of all power cards for the current player. It allows players to activate cards and view their details.
- **TurnControls.jsx**: Provides controls for managing player turns, including selecting actions like move, build, and roll. It integrates with the state machine to validate and execute actions.
- **GameUI.module.css**: Styles for the `GameUI` component.
- **LogDisplay.module.css**: Styles for the `LogDisplay` component.
- **PlayerInfo.module.css**: Styles for the `PlayerInfo` component.
- **PowerCardDeck.module.css**: Styles for the `PowerCardDeck` component.
- **PowerCards.module.css**: Styles for the `PowerCards` component.
- **TurnControls.module.css**: Styles for the `TurnControls` component.

## game
- **ActionManager.js**: Handles the logic for highlighting valid build positions on the game board. It validates positions and highlights them visually using specific colors and opacity.
- **gameLogic.js**: Contains the core logic for validating and performing build actions. It ensures that build positions are within bounds, adjacent to the player, and not already occupied by cubes.

## services
- **ActionHandler.ts**: Manages game actions like building and moving. It validates actions using the `BuildValidator` and updates the game state through the `GameStateManager`. It ensures actions are performed in the correct game phase and by the correct player.
- **ActionManager.ts**: Handles the initiation and management of game actions. It integrates with the `ActionStrategyContext` to validate and highlight valid positions for actions. It also manages the current action state and interacts with the 3D scene.
- **GameBoardManager.ts**: Manages the state of the game board, including objects like players, cubes, and ground. It calculates valid moves, updates positions, and validates height differences for movement.
- **gameLogic.ts**: Acts as the central logic layer for the game. It initializes the game, manages state transitions, and interacts with the `GameManager` and state machine to perform actions like building and moving.
- **GameManager.ts**: Coordinates game state and actions. It initializes the game, manages player turns, and interacts with the `GameStateManager` and `ActionHandler` to perform actions and update the Redux store.
- **GameStateManager.ts**: Maintains the core game state, including players, cubes, and the current game phase. It provides methods to add, remove, and validate game objects and player positions.
- **notifications.js**: Manages toast notifications for game events. It uses `react-toastify` to display messages and integrates with the `UniversalLogger` to subscribe to log levels and show relevant notifications.
- **UIUpdater.js**: Updates the UI based on game actions. It logs actions and provides methods to update player positions and add cubes to the board in the UI.
- **highlight**
  - **BuildHighlighter.ts**: Highlights valid build positions.
  - **MovementHighlighter.ts**: Highlights valid movement positions.
- **logger**
  - **GameLogger.ts**: Handles logging for game events and actions.
- **stateMachine**
  - **GameStateMachine.ts**: Manages the state machine for the game.
  - **states/**: Contains state definitions for the game state machine.
- **strategies**
  - **ActionStrategy.ts**: Defines the base strategy for game actions.
  - **ActionStrategyContext.ts**: Provides context for executing action strategies.
  - **BuildStrategy.ts**: Implements the strategy for building actions.
  - **MoveStrategy.ts**: Implements the strategy for movement actions.
- **utils**
  - **HeightCalculator.ts**: Calculates height-related values for the game.
- **validators**
  - **BuildPositionCalculator.ts**: Calculates valid build positions.
  - **BuildValidator.ts**: Validates build actions.
  - **MovementValidator.ts**: Validates movement actions.

## store/middleware
- **actionValidation.js**: Middleware for validating game actions.

## store
- **gameSlice.js**: Defines the Redux slice for managing the game's state, including players, cubes, logs, and the current game phase. It provides reducers for actions like initializing the game, moving players, adding cubes, and managing turns.
- **index.js**: Configures and exports the Redux store. It integrates the `gameSlice` reducer and includes middleware for action validation.

## hooks
- **useGameStateMachine.ts**: A custom hook that provides access to the game's state machine. It manages state transitions, persists state, and provides operations for different game phases, such as setup, playing, and game over.

## utils
- **Singleton.js**: A utility class for managing singleton instances of other classes. It ensures that only one instance of a class is created and provides methods for clearing instances (useful for testing).
- **UniversalLogger.ts**: A logging utility that provides methods for logging messages at different levels (info, warn, error, debug). It includes functionality to capture and format caller information for better debugging.