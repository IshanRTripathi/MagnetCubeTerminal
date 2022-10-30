package service.actions;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import entities.Climber;
import entities.ClimberColour;
import entities.Position;

class BuildActionServiceTest {
    BuildActionService buildActionService;

    @Test
    void performBuildActionTest() {
        /*
        * public Climber(int id, int totalCubes, Position position, ClimberColour colour,
                   List<PowerCard> powerCards, Boolean canBuild, Boolean canMove, Boolean canRoll) {
        * */
        buildActionService = new BuildActionService();
        Climber climber = new Climber(1, 1, new Position(1,1,1), ClimberColour.BLACK, null, true, true, true);
        buildActionService.performBuildAction(climber);
    }
}