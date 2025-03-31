import { GameState } from './states/GameState';
import { SetupState } from './states/SetupState';
import { PlayingState } from './states/PlayingState';
import { GameOverState } from './states/GameOverState';
import { logger } from '../../utils/logger';
import { Position } from '../BoardStateManager';
import { store } from '../../store';
import { updateGameState } from '../../store/gameReducer';
import { GameConstants } from '../../constants/GameConstants';

export interface Player {
  id: string;
  name: string;
  score: number;
  position: Position;
  color: string;
}

export interface StateData {
  players: any[];
  currentPlayerId: string;
  board: any[];
  moveHistory: any[];
  timestamp: number;
}

export class GameStateMachine {
  private static instance: GameStateMachine;
  private currentState: GameState;
  private states: Map<string, GameState>;
  private stateData: StateData;
  private stateUpdateQueue: (() => void)[] = [];
  private isTransitioning: boolean = false;
  private isDispatchingToRedux: boolean = false;
  private pendingStateUpdate: { gameState?: string; stateData?: Partial<StateData> } | null = null;
  private updateTimeoutId: number | null = null;

  private constructor() {
    this.states = new Map();
    this.stateData = this.createInitialStateData();
    this.initializeStates();
    this.currentState = this.states.get(GameConstants.STATE_SETUP)!;
    logger.info('Game state machine initialized');
  }

  public static getInstance(): GameStateMachine {
    if (!GameStateMachine.instance) {
      GameStateMachine.instance = new GameStateMachine();
    }
    return GameStateMachine.instance;
  }

  private initializeStates(): void {
    this.states.set(GameConstants.STATE_SETUP, new SetupState(this));
    this.states.set(GameConstants.STATE_PLAYING, new PlayingState(this));
    this.states.set(GameConstants.STATE_GAME_OVER, new GameOverState(this));
  }

  private createInitialStateData(): StateData {
    return {
      players: [],
      currentPlayerId: '',
      board: [],
      moveHistory: [],
      timestamp: Date.now()
    };
  }

  public getCurrentState(): GameState | null {
    return this.currentState || null;
  }

  public setCurrentState(state: GameState): void {
    this.currentState = state;
  }

  public getStateData(): StateData {
    return { ...this.stateData };
  }

  private flushStateUpdate(): void {
    if (!this.pendingStateUpdate || this.isDispatchingToRedux) {
      return;
    }

    this.isDispatchingToRedux = true;
    try {
      store.dispatch(updateGameState(this.pendingStateUpdate));
      this.pendingStateUpdate = null;
    } finally {
      this.isDispatchingToRedux = false;
    }
  }

  private scheduleStateUpdate(): void {
    if (this.updateTimeoutId) {
      clearTimeout(this.updateTimeoutId);
    }

    this.updateTimeoutId = setTimeout(() => {
      this.flushStateUpdate();
      this.updateTimeoutId = null;
    }, 0);
  }

  public updateStateData(newData: Partial<StateData>): void {
    const oldData = { ...this.stateData };
    this.stateData = {
      ...this.stateData,
      ...newData,
      timestamp: Date.now()
    };

    logger.info('State data updated', {
      changes: Object.keys(newData),
      timestamp: this.stateData.timestamp
    });

    // Queue the state update
    this.pendingStateUpdate = {
      ...this.pendingStateUpdate,
      stateData: this.stateData
    };
    this.scheduleStateUpdate();
  }

  public transitionTo(stateName: string): void {
    if (this.isTransitioning) {
      this.stateUpdateQueue.push(() => this.transitionTo(stateName));
      logger.debug('State transition queued', { to: stateName });
      return;
    }

    this.isTransitioning = true;
    const nextState = this.states.get(stateName);

    if (!nextState) {
      logger.error('Invalid state transition requested', { to: stateName });
      this.isTransitioning = false;
      return;
    }

    const prevState = this.currentState;
    if (prevState) {
      logger.info('Exiting state', { from: prevState.getName() });
      prevState.onExit();
    }

    this.currentState = nextState;
    logger.info('Entering state', { to: stateName });
    nextState.onEnter();

    // Queue the state update
    this.pendingStateUpdate = {
      ...this.pendingStateUpdate,
      gameState: stateName,
      stateData: this.stateData
    };
    this.scheduleStateUpdate();

    logger.info('State transition complete', {
      from: prevState?.getName() || 'none',
      to: stateName,
      stateData: {
        players: this.stateData.players.length,
        currentPlayer: this.stateData.currentPlayerId,
        timestamp: this.stateData.timestamp
      }
    });

    this.isTransitioning = false;

    // Process any queued state updates
    if (this.stateUpdateQueue.length > 0) {
      const nextUpdate = this.stateUpdateQueue.shift();
      nextUpdate?.();
    }
  }

  public getCurrentStateName(): string {
    if (!this.currentState) {
      logger.warn('No current state set, defaulting to setup');
      return GameConstants.STATE_SETUP;
    }

    for (const [name, state] of this.states.entries()) {
      if (state === this.currentState) {
        return name;
      }
    }

    logger.error('Current state not found in states map');
    return GameConstants.STATE_SETUP; // Default to setup if state not found
  }

  private persistState(): void {
    const saveData = {
      currentState: this.getCurrentStateName(),
      stateData: this.stateData
    };
    localStorage.setItem(GameConstants.STORAGE_GAME_STATE, JSON.stringify(saveData));
    logger.debug('State persisted', saveData);
  }

  public loadPersistedState(): boolean {
    const savedState = localStorage.getItem(GameConstants.STORAGE_GAME_STATE);
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
    localStorage.setItem(`${GameConstants.STORAGE_SAVED_GAME_PREFIX}${saveName}`, JSON.stringify(saveData));
    logger.info('Game saved', { saveName, saveData });
  }

  public loadGame(saveName: string): boolean {
    const savedGame = localStorage.getItem(`${GameConstants.STORAGE_SAVED_GAME_PREFIX}${saveName}`);
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
      if (key?.startsWith(GameConstants.STORAGE_SAVED_GAME_PREFIX)) {
        try {
          const saveData = JSON.parse(localStorage.getItem(key)!);
          savedGames.push({
            name: key.replace(GameConstants.STORAGE_SAVED_GAME_PREFIX, ''),
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