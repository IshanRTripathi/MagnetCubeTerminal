package entities;

public enum CardName {
    ACCELERATE(1, "ACCELERATE", "Take an extra turn after this one. (You must still perform all actions needed to end your current turn.)"),
    ARMAGEDDON(2, "ARMAGEDDON", "Remove 1 cube under any number of players. (You can choose multiple players, including yourself. Cubes are removed from the game.)"),
    BARRIER(3, "BARRIER", "Negate wind or a power that would affect you. This power may be used any time during the game. (Effects of wind and powers can only be negated once.)"),
    ECHO(4, "ECHO", "Use one of your other powers once more. (Can be used on a separate turn from the chosen power.)"),
    FREEZE(5, "FREEZE", "Each other player cannot perform their move action during their next turn.(Players may not perform the move action through powers.)"),
    GAMBLE(6, "GAMBLE", "Perform the roll action. You may use this power twice per game but once per turn"),
    IGNITE(7, "IGNITE", "Remove 1 or 2 cubes under any player. (You can choose yourself. Cubes are removed from the game.)"),
    KICK(8, "KICK", "Choose a player on an adjacent space at your level. Place them on a space adjacent to them. (Players may be placed on spaces adjacent to them at any level.)"),
    LEVITATE(9, "LEVITATE", "You may perform the build action directly under yourself this turn."),
    LIMITLESS(10, "LIMITLESS", "Perform the move action any number of times this turn. Each move must be legal. (Move actions can be performed before and  after other actions.)"),
    MASTERY(11, "MASTERY", "Perform the grapple action"),
    REVIVE(12, "REVIVE", "Place your player on any unoccupied space on the 3rd level or below."),
    ROAR(13, "ROAR", "Players on spaces adjacent to you can’t perform their move and grapple actions  during their next turn. (Players may not perform  the move or grapple action through powers.)"),
    STEAL(14, "STEAL", "Remove 1 cube under any other player and place it under yourself."),
    TELEKINESIS(15, "TELEKINESIS", "Remove 2 cubes from the board and place them on unoccupied spaces. You can’t remove cubes that are under other players and cubes, or ones that would separate other cubes and players from the board."),
    TIMESTOP(16, "TIMESTOP", "End your turn without performing another action. (You may still perform other actions before using this skill.)");

    public final int id;
    public final String name;
    public final String description;


    CardName(int id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}