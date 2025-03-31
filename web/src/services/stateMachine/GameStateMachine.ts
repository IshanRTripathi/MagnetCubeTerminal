import { GameState } from './states/GameState';
import { SetupState } from './states/SetupState';
import { PlayingState } from './states/PlayingState';
import { GameOverState } from './states/GameOverState';
import { logger } from '../../utils/logger';
import { Position } from '../validators/MovementValidator';

export interface Player {
  id: string;
  name: string;
  score: number;
  position: Position;
  color: string;
}

export interface GameStateData {
  players: Player[];
  currentPlayerId: string;
  board: Array<{
    id: string;
    position: Position;
  }>;
  moveHistory: Array<{
    playerId: string;
    action: string;
    position: Position;
    timestamp: number;
  }>;
  timestamp: number;
}

export class GameStateMachine {
  private currentState: GameState | null = null;
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
      board: [],
      moveHistory: [],
      timestamp: Date.now()
    };
    logger.info('Initial state data created', this.stateData);
    
    // Set initial state
    this.currentState = this.states.get('setup') as GameState;
    logger.info('Initial state set to setup, current state:', this.currentState);
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
      board: [],
      moveHistory: [],
      timestamp: Date.now()
    };
    logger.info('Initial state data created', initialData);
    return initialData;
  }

  public getCurrentState(): GameState | null {
    return this.currentState;
  }

  public setCurrentState(state: GameState): void {
    if (this.currentState) {
      this.currentState.onExit();
    }
    this.currentState = state;
    this.currentState.onEnter();
    logger.info('State changed', { 
      newState: state.constructor.name,
      stateData: this.stateData 
    });
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
      currentState: this.currentState?.constructor.name
    });
    this.persistState();
  }

  public transitionTo(stateName: string): void {
    if (!this.currentState) {
      logger.error('Cannot transition: no current state');
      return;
    }
    logger.info('State transition requested', { 
      from: this.currentState.constructor.name,
      to: stateName 
    });

    const newState = this.states.get(stateName);
    if (!newState) {
      logger.error('Invalid state transition', { 
        from: this.currentState.constructor.name,
        to: stateName 
      });
      return;
    }

    this.setCurrentState(newState);
    logger.info('State transition complete', {
      from: this.currentState.constructor.name,
      to: stateName,
      stateData: this.stateData
    });
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