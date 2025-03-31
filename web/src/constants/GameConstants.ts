export class GameConstants {
  // Game States
  static readonly STATE_SETUP = 'setup';
  static readonly STATE_PLAYING = 'playing';
  static readonly STATE_GAME_OVER = 'gameOver';
  static readonly STATE_ENDED = 'ended';

  // Game Phases
  static readonly PHASE_SETUP = 'setup';
  static readonly PHASE_PLAYING = 'playing';
  static readonly PHASE_ENDED = 'ended';

  // Local Storage Keys
  static readonly STORAGE_GAME_STATE = 'gameState';
  static readonly STORAGE_SAVED_GAME_PREFIX = 'savedGame_';

  // Player Colors
  static readonly PLAYER_COLOR_RED = '#f44336';
  static readonly PLAYER_COLOR_BLUE = '#2196F3';
  static readonly PLAYER_COLOR_GREEN = '#4CAF50';
  static readonly PLAYER_COLOR_YELLOW = '#FFC107';

  // Board Objects
  static readonly OBJECT_TYPE_GROUND = 'ground';
  static readonly OBJECT_TYPE_CUBE = 'cube';
  static readonly OBJECT_TYPE_PLAYER = 'player';

  // Action Types
  static readonly ACTION_NONE = 'none';
  static readonly ACTION_BUILD = 'build';
  static readonly ACTION_MOVE = 'move';
  static readonly ACTION_ROLL = 'roll';

  // UI Elements
  static readonly UI_SELECTED_CLASS = 'selected';

  // Default Values
  static readonly DEFAULT_BOARD_SIZE = 8;
  static readonly MIN_PLAYERS = 2;
  static readonly MAX_PLAYERS = 4;
  static readonly DEFAULT_MAGNETIC_FIELD_STRENGTH = 1.0;
  static readonly MAX_LOG_ENTRIES = 50;

  // Highlight Colors
  static readonly HIGHLIGHT_COLOR_DEFAULT = '#ffffff';
  static readonly HIGHLIGHT_COLOR_VALID = '#00ff00';
  static readonly HIGHLIGHT_OPACITY = 0.6;
} 