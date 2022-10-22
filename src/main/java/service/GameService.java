package service;

import static config.CommonConfiguration.playersList;

import java.util.Scanner;

import entities.Climber;

public class GameService {
    int playerTurn = 0;
    boolean isGameOver = false;

    public void startGame(int numberOfPlayers) {
        Scanner sc = new Scanner(System.in);
        while (!isGameOver) {
            playerTurn = playerTurn%numberOfPlayers;
            Climber currentPlayer = playersList.get(playerTurn);
            System.out.println("Player " + currentPlayer + "'s turn");
//            while (currentPlayer.getCanMove())
//            printAvailableOptions()


            playerTurn++;
        }
    }
}
