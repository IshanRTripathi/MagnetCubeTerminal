import { GameState } from './states/GameState';
import { SetupState } from './states/SetupState';
import { PlayingState } from './states/PlayingState';
import { GameOverState } from './states/GameOverState';
import { logger } from '../../utils/logger';

export interface GameStateData {
  players: Array<{
    id: string;
    name: string;
    score: number;
  }>;
  currentPlayerId: string;
  board: any; // Will be properly typed based on your board structure
  moveHistory: Array<any>; // Will be properly typed based on your move structure
  timestamp: number;
}

export class GameStateMachine {
  private currentState: GameState;
  private stateData: GameStateData;
  private states: Map<string, GameState>;

  constructor() {
    this.states = new Map();
    this.initializeStates();
    logger.info('States initialized', { states: Array.from(this.states.keys()) });
    
    // Create initial state data
    this.stateData = {
      players: [],
      currentPlayerId: '',
      board: null,
      moveHistory: [],
      timestamp: Date.now()
    };
    logger.info('Initial state data created', this.stateData);
    
    // Set initial state
    this.currentState = this.states.get('setup');
    logger.info('Initial state set to setup');
  }

  private initializeStates(): void {
    this.states.set('setup', new SetupState(this));
    this.states.set('playing', new PlayingState(this));
    this.states.set('gameOver', new GameOverState(this));
  }

  private createInitialStateData(): GameStateData {
    const initialData = {
      players: [],
      currentPlayerId: '',
      board: null,
      moveHistory: [],
      timestamp: Date.now()
    };
    logger.info('Initial state data created', initialData);
    return initialData;
  }

  public getStateData(): GameStateData {
    return { ...this.stateData };
  }

  public updateStateData(newData: Partial<GameStateData>): void {
    const oldData = { ...this.stateData };
    this.stateData = {
      ...this.stateData,
      ...newData,
      timestamp: Date.now()
    };
    logger.info('State data updated', {
      oldData,
      newData,
      currentState: this.getCurrentStateName()
    });
    this.persistState();
  }

  public transitionTo(stateName: string): void {
    const newState = this.states.get(stateName);
    if (!newState) {
      const error = `State '${stateName}' not found`;
      logger.error(error);
      throw new Error(error);
    }
    
    const oldStateName = this.getCurrentStateName();
    logger.info(`State transition: ${oldStateName} -> ${stateName}`);
    
    this.currentState.onExit();
    this.currentState = newState;
    this.currentState.onEnter();
    this.persistState();
  }

  public getCurrentStateName(): string {
    for (const [name, state] of this.states.entries()) {
      if (state === this.currentState) {
        return name;
      }
    }
    const error = 'Current state not found in states map';
    logger.error(error);
    throw new Error(error);
  }

  private persistState(): void {
    const saveData = {
      currentState: this.getCurrentStateName(),
      stateData: this.stateData
    };
    localStorage.setItem('gameState', JSON.stringify(saveData));
    logger.debug('State persisted', saveData);
  }

  public loadPersistedState(): boolean {
    const savedState = localStorage.getItem('gameState');
    if (!savedState) {
      logger.info('No persisted state found');
      return false;
    }

    try {
      const { currentState, stateData } = JSON.parse(savedState);
      this.stateData = stateData;
      this.transitionTo(currentState);
      logger.info('Persisted state loaded', { currentState, stateData });
      return true;
    } catch (error) {
      logger.error('Error loading persisted state', { error });
      return false;
    }
  }

  public saveGame(saveName: string): void {
    const saveData = {
      currentState: this.getCurrentStateName(),
      stateData: this.stateData,
      timestamp: Date.now()
    };
    localStorage.setItem(`savedGame_${saveName}`, JSON.stringify(saveData));
    logger.info('Game saved', { saveName, saveData });
  }

  public loadGame(saveName: string): boolean {
    const savedGame = localStorage.getItem(`savedGame_${saveName}`);
    if (!savedGame) {
      logger.warn('Save game not found', { saveName });
      return false;
    }

    try {
      const { currentState, stateData } = JSON.parse(savedGame);
      this.stateData = stateData;
      this.transitionTo(currentState);
      logger.info('Game loaded', { saveName, currentState, stateData });
      return true;
    } catch (error) {
      logger.error('Error loading game', { saveName, error });
      return false;
    }
  }

  public listSavedGames(): Array<{ name: string; timestamp: number }> {
    const savedGames: Array<{ name: string; timestamp: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('savedGame_')) {
        try {
          const saveData = JSON.parse(localStorage.getItem(key)!);
          savedGames.push({
            name: key.replace('savedGame_', ''),
            timestamp: saveData.timestamp
          });
        } catch (error) {
          logger.error('Error parsing saved game', { key, error });
        }
      }
    }
    logger.debug('Listed saved games', { savedGames });
    return savedGames;
  }
} 