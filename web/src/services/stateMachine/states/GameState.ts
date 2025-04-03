import { GameStateMachine } from '../GameStateMachine';
import { UniversalLogger } from '../../../utils/UniversalLogger'
const logger = UniversalLogger.getInstance();
export abstract class GameState {
  protected stateMachine: GameStateMachine;
  protected stateName: string;

  constructor(stateMachine: GameStateMachine, stateName: string) {
    this.stateMachine = stateMachine;
    this.stateName = stateName;
    logger.debug(`${stateName} state initialized`);
  }

  public getName(): string {
    return this.stateName;
  }

  abstract onEnter(): void;
  abstract onExit(): void;
  abstract update(): void;
} 