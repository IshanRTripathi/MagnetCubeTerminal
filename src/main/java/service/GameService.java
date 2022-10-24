package service;

import static config.CommonConfiguration.BUILD_ACTION;
import static config.CommonConfiguration.MOVE_ACTION;
import static config.CommonConfiguration.ROLL_ACTION;
import static config.CommonConfiguration.playersList;

import java.util.ArrayList;
import java.util.Scanner;

import entities.Climber;

public class GameService {
    int playerTurn = 0;
    boolean isGameOver = false;
    private final Scanner sc = new Scanner(System.in);

    BuildActionService buildActionService;

    public void startGame(int numberOfPlayers) {
        buildActionService = new BuildActionService();
        while (!isGameOver) {
            playerTurn = playerTurn%numberOfPlayers;
            Climber currentPlayer = playersList.get(playerTurn);

            while (true) {
                System.out.println("Player " + currentPlayer + "'s turn");
                System.out.println("Enter 1 to build\nEnter 2 to move\nEnter 3 to roll");

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
                performRollAction(currentPlayer);
                break;
            case MOVE_ACTION:
                performMoveAction(currentPlayer);
                break;
            default:
                System.out.println("Wrong action input");
        }
    }

    private void performRollAction(Climber currentPlayer) {
    }

    private void performMoveAction(Climber currentPlayer) {
    }
}
