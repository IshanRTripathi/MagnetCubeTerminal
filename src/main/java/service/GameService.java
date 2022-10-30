package service;

import static config.CommonConfiguration.BUILD_ACTION;
import static config.CommonConfiguration.GET_LAYOUT;
import static config.CommonConfiguration.MOVE_ACTION;
import static config.CommonConfiguration.ROLL_ACTION;
import static config.CommonConfiguration.playersList;

import java.util.Scanner;

import entities.Climber;
import service.actions.BuildActionService;
import service.actions.MoveActionService;
import service.actions.RollDiceActionService;

public class GameService {
    int playerTurn = 0;
    boolean isGameOver = false;
    private final Scanner sc = new Scanner(System.in);

    BuildActionService buildActionService;
    MoveActionService moveActionService;
    BoardService boardService;
    RollDiceActionService diceActionService;

    public void startGame(int numberOfPlayers) {
        buildActionService = new BuildActionService();
        moveActionService = new MoveActionService();
        boardService = new BoardService();
        diceActionService = new RollDiceActionService();
        while (!isGameOver) {
            playerTurn = playerTurn%numberOfPlayers;
            Climber currentPlayer = playersList.get(playerTurn);

            while (true) {
                System.out.println("Player " + currentPlayer + "'s turn");
                System.out.println("Enter 1 to build\nEnter 2 to move\nEnter 3 to roll\nEnter 4 to get current layout");

                if(!currentPlayer.getCanMove() && !currentPlayer.getCanBuild() && !currentPlayer.getCanRoll()){
                    System.out.println("Player used all actions");
                    break;
                }
                String action = sc.nextLine();
                performActionHelper(action, currentPlayer);
            }
            playerTurn++;
        }
    }

    private void performActionHelper(String action, Climber currentPlayer) {
        switch (action) {
            case BUILD_ACTION:
                buildActionService.performBuildAction(currentPlayer);
                break;
            case ROLL_ACTION:
                diceActionService.performRollAction(currentPlayer);
                break;
            case MOVE_ACTION:
                moveActionService.performMoveAction(currentPlayer);
                break;
            case GET_LAYOUT:
                System.out.println("Enter level whose layout you want to view: ");
                int level = Integer.parseInt(sc.nextLine());
                boardService.printBoardLayout(level);
                break;
            default:
                System.out.println("Wrong action input");
        }
    }
}
