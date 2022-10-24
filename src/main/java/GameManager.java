import java.util.Scanner;

import service.BoardService;
import service.GameService;
import service.PlayerService;

public class GameManager {
    private PlayerService playerService;
    private BoardService boardService;
    private GameService gameService;
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        GameManager gameManager = new GameManager();
        System.out.println("How many players are participating? :");
        int numberOfPlayers = sc.nextInt();

        gameManager.initialise(numberOfPlayers);

        gameManager.startGame(numberOfPlayers);
    }

    private void startGame(int numberOfPlayers) {
        gameService = new GameService();
        gameService.startGame(numberOfPlayers);
    }

    private void initialise(int numberOfPlayers) {
        playerService = new PlayerService();
        playerService.initialisePlayers(numberOfPlayers);

        boardService = new BoardService();
        boardService.initialiseBoard();
    }
}
