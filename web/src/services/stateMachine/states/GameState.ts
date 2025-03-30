import { GameStateMachine } from '../GameStateMachine';
import { logger } from '../../../utils/logger';

export abstract class GameState {
  protected stateMachine: GameStateMachine;
  protected stateName: string;

  constructor(stateMachine: GameStateMachine, stateName: string) {
    this.stateMachine = stateMachine;
    this.stateName = stateName;
    logger.debug(`${stateName} state initialized`);
  }

  abstract onEnter(): void;
  abstract onExit(): void;
  abstract update(): void;
} 