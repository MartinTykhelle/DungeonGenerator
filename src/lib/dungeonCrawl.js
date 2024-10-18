import { Dungeon, Position } from './dungeonGen.js';

export class DungeonCrawl {
    /**
     * Dungeoncrawl should contain handling of events like player movement, enemies etc.
     * Some of these migth be contained within the tile in the dungeon object, but movement should be handled here
     * @param {Dungeon} dungeon Dungeon object from dungeonGen
     */
    constructor(dungeon) {
        this.dungeon = dungeon;
        this.rotation = 0;
        let potentialPositions = this.dungeon.dungeon.flat(2).filter((x) => x.opacity === Dungeon.opacity.open);
        let selectedPosition = potentialPositions[Math.floor(Math.random() * potentialPositions.length)];
        this.position = new Position(selectedPosition.x, selectedPosition.y);
    }
    rotatePlayer(rotation) {
        this.rotation += rotation;
        if (this.rotation === Math.PI * 2) {
            this.rotation = 0;
        }
        if (this.rotation === -Math.PI / 2) {
            this.rotation = (3 * Math.PI) / 2;
        }
    }
    movePlayer(distance) {
        let newPosition = new Position(this.position.x, this.position.y);
        //up
        if (this.rotation === 0) {
            newPosition.x = this.position.x - distance;
        }
        //right
        if (this.rotation === Math.PI / 2) {
            newPosition.y = this.position.y + distance;
        }
        //down
        if (this.rotation === Math.PI) {
            newPosition.x = this.position.x + distance;
        }
        //left
        if (this.rotation === (3 * Math.PI) / 2) {
            newPosition.y = this.position.y - distance;
        }
        console.log(newPosition);
        if (this.dungeon.isPositionWithinBounds(newPosition) && this.dungeon.dungeon[newPosition.x][newPosition.y].opacity === Dungeon.opacity.open) {
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
        }
    }
}
