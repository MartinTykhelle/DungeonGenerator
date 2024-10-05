class Position {
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Tile {
    constructor(opacity, type) {
        this.opacity = opacity;
        this.type = type || Maze.tileTypes.none;
        this.cost = 0;

    }
}
export class Maze {

    static tileTypes = {
        goal: 'goal',
        start: 'start',
        path: 'path',
        room: 'room',
        roomCenter: 'roomCenter',
        none: 'none',
        hallway: 'hallway',
    };
    static opacity = {
        closed: 'closed',
        open: 'open'
    }
    static hallwayTypes = {
        direct: 'direct',
        meandering: 'meandering',
        explore: 'explore', //direct but avoid existing open areas

    }
    /**
     * 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    static getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * @param {number} height
     * @param {number} width
     * Height is X (outer array)
     * Width is Y (Inner array)    
     */
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.rooms = [];
        this.maze = [];//Array of arrays         
        for (let x = 0; x < this.height; x++) {
            let row = [];
            for (let y = 0; y < this.width; y++) {
                row.push(new Tile(Maze.opacity.closed));
            }
            this.maze.push(row);
        }

    }

    /**
     * Checks if x and y are within the bounds of this maze, keeping the outermost perimeter as out of bounds
     * @param {number} x
     * @param {number} y
     * @returns True if within bounds
     */
    isWithinBounds(x, y) {
        return x > 0 && x < this.height - 1 && y > 0 && y < this.width - 1
    }

    getRandomPositionWithinBounds() {

        //todo: Add preferOpenArea(width, height) or something to avoid overlapping points
        let x = Math.min(Math.max(Math.floor(Math.random() * this.height), 2), this.height - 2);
        let y = Math.min(Math.max(Math.floor(Math.random() * this.width), 2), this.width - 2);
        return new Position(x, y);
    }
    /**
     * Generates noisy maze. 50/50 open or closed. 
     * No logic.
     * Bad gameplay.
     */
    generateNoise() {
        for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
                if (this.isWithinBounds(x, y)) {
                    if (Math.random() > 0.5) {
                        this.maze[x][y] = new Tile(Maze.opacity.open);
                    }
                }
            }
        }
    }
    /**
     * Generates numRooms number of rooms,
     * Rooms are put in the this.rooms array
     * @param {number} numRooms 
     * @param {boolean} includeHallways 
     */
    generateRooms(numRooms, includeHallways = true, minRoomSize = 3, maxRoomSize = 15) {
        for (let index = 0; index <= numRooms - 1; index++) {
            let room = {};

            let upperLeftCorner;
            let width;
            let height;
            //try to find some nice untouched space for a few iterations
            for (let index = 0; index < 30; index++) {
                upperLeftCorner = this.getRandomPositionWithinBounds();

                //todo:fix so that width and height is within bounds so that center is not placed outside bounds
                width = Maze.getRandomInteger(minRoomSize, maxRoomSize);
                height = Maze.getRandomInteger(minRoomSize, maxRoomSize);

                if (this.maze[upperLeftCorner.x][upperLeftCorner.y].opacity === Maze.opacity.closed &&
                    this.isWithinBounds(upperLeftCorner.x + height, upperLeftCorner.y + height)
                ) {
                    break;
                }

            }


            //approx center position
            let center = new Position(Math.floor(upperLeftCorner.x + height / 2), Math.floor(upperLeftCorner.y + width / 2))
            let lowerRightCorner = new Position(upperLeftCorner.x + height, upperLeftCorner.y + width);

            console.log(`Room ${index} is being generated with upper left corner at (${upperLeftCorner.x},${upperLeftCorner.y}, it is ${width} tiles wide and ${height} tiles tall. Center is at about ${center.x}, ${center.y} `)
            this.assignArea(upperLeftCorner, lowerRightCorner, new Tile(Maze.opacity.open, Maze.tileTypes.room))

            this.assignPosition(center, new Tile(Maze.opacity.open, Maze.tileTypes.roomCenter))

            room.center = center;
            room.upperLeftCorner = upperLeftCorner;
            room.height = height;
            room.width = width;
            if (includeHallways && index > 0) {
                this.generateHallway(this.rooms[index - 1].center, room.center);
            }

            this.rooms.push(room);


        }
    }
    /**
     * 
     * @param {Position} position 
     * @param {Tile} tile 
     */
    assignPosition(position, tile) {
        tile = structuredClone(tile);
        if (this.isWithinBounds(position.x, position.y)) {
            //check that tile type is not overwritten when generating hallways or nonetype
            if (tile.type === Maze.tileTypes.none || (tile.type === Maze.tileTypes.hallway && this.maze[position.x][position.y].type != Maze.tileTypes.none)) {
                tile.type = this.maze[position.x][position.y].type;
            }
            //start and goal should never be overwritten
            if (this.maze[position.x][position.y].type === Maze.tileTypes.start || this.maze[position.x][position.y].type === Maze.tileTypes.goal) {
                tile.type = this.maze[position.x][position.y].type;
            }
            //console.log(`Position ${position.x},${position.y} is being assigned to be ${tile.opacity} and has the type ${tile.type}`)
            this.maze[position.x][position.y] = tile;
        }
    }
    /**
     * Assigns area from posA to posB to tile
     * @param {Position} posA 
     * @param {Position} posB 
     * @param {Tile} tile 
     */
    assignArea(posA, posB, tile) {
        //Find top left
        let top = Math.min(posA.x, posB.x);
        let left = Math.min(posA.y, posB.y);
        let distanceX = posA.x - posB.x;
        let distanceY = posA.y - posB.y;

        //Off by one fuckery
        if (distanceY === 0) {
            if (distanceX < 0) {
                top = top + 1;
            }
        }
        if (distanceX === 0) {
            if (distanceY < 0) {
                left = left + 1;
            }
        }
        distanceX = Math.max(Math.max(Math.abs(distanceX), 1))
        distanceY = Math.max(Math.max(Math.abs(distanceY), 1))

        console.log(`Assigning area from (${top},${left}) to (${distanceX + top},${distanceY + left}) to ${tile.opacity}/${tile.type}`)
        for (let x = top; x < distanceX + top; x++) {
            for (let y = left; y < distanceY + left; y++) {

                this.assignPosition(new Position(x, y), tile)


            }
        }
        return posB

    }

    generateStartAndGoal() {
        this.start = this.getRandomPositionWithinBounds();
        this.goal = this.getRandomPositionWithinBounds();
        this.assignPosition(this.start, new Tile(Maze.opacity.open, Maze.tileTypes.start));
        this.assignPosition(this.goal, new Tile(Maze.opacity.open, Maze.tileTypes.goal));

    }
    /**
     * 
     * @param {Position} posA 
     * @param {Position} posB 
     * @returns 
     */
    findDistance(posA, posB) {
        return { x: posB.x - posA.x, y: posB.y - posA.y };
    }
    /**
     * 
     * @param {Position} position 
     * @param {string} direction 
     */
    findNextOpenArea(position, direction) {
        let newPosition = new Position(position.x, position.y)
        if (direction === 'up' || direction === 'down') {
            for (let index = 0; index < this.height; index++) {
                //Move position one point on axis
                if (direction === 'down') {
                    newPosition.x = newPosition.x + 1;
                }
                else {
                    newPosition.x = newPosition.x - 1;
                }
                if (!this.isWithinBounds(newPosition.x, newPosition.y)) {
                    break;
                }
                if (this.maze[newPosition.x][newPosition.y].opacity === Maze.opacity.open) {
                    break;
                }
            }
        }

        if (direction === 'left' || direction === 'right') {
            for (let index = 0; index < this.height; index++) {
                //Move position one point on axis
                if (direction === 'right') {
                    newPosition.y = newPosition.y + 1;
                }
                else {
                    newPosition.y = newPosition.y - 1;
                }
                if (!this.isWithinBounds(newPosition.x, newPosition.y)) {
                    break;
                }
                if (this.maze[newPosition.x][newPosition.y].opacity === Maze.opacity.open) {
                    break;
                }
            }
        }


        return newPosition;
    }
    /**
     * 
     * @param {Position} startPos 
     * @param {Position} stopPos 
     * @param {string} type 
     */
    generateHallway(startPos, stopPos, type = Maze.hallwayTypes.direct) {

        let currentPos = structuredClone(startPos)
        let prevDirection;


        //Go directly to the position
        if (type === Maze.hallwayTypes.direct) {

            let distances = this.findDistance(startPos, stopPos);

            if (Math.random() > 0.5) {
                //go x then y
                let currentPos = this.assignArea(startPos, new Position(startPos.x + distances.x, startPos.y), new Tile(Maze.opacity.open, Maze.tileTypes.hallway))
                this.assignArea(currentPos, new Position(currentPos.x, currentPos.y + distances.y), new Tile(Maze.opacity.open, Maze.tileTypes.hallway))
            }
            else {
                //go y then x
                let currentPos = this.assignArea(startPos, new Position(startPos.x, startPos.y + distances.y), new Tile(Maze.opacity.open, Maze.tileTypes.hallway))
                this.assignArea(currentPos, new Position(currentPos.x + distances.x, currentPos.y), new Tile(Maze.opacity.open, Maze.tileTypes.hallway))
            }




        }
        else if (type === Maze.hallwayTypes.meandering) {
            /*
            Better meander algorithm:
            Give tiles value
            go to lower value or not based on random chance, 
            prefer closed tiles
            
            */
            for (let index = 0; index < 100; index++) {
                let distances = this.findDistance(currentPos, stopPos);
                let potentialDirections = ['right', 'left', 'down', 'up']
                let randomWeightedDirections = [];
                let direction;
                let distance = 1;
                let meanderFactor = 0.5; //lower = more meander
                let generalDirection;
                let nextPos = structuredClone(currentPos);

                if (Math.abs(distances.y) > Math.abs(distances.x)) {
                    if (distances.y > 0) {
                        generalDirection = "right";
                    } else {
                        generalDirection = "left";
                    }
                } else {
                    if (distances.x > 0) {
                        generalDirection = "down";
                    } else {
                        generalDirection = "up";
                    }
                }

                //remove generalDirection from potential directions
                let index = potentialDirections.indexOf(generalDirection);
                if (index > -1) {
                    potentialDirections.splice(index, 1);
                }

                //also remove previous direction, never look back
                index = potentialDirections.indexOf(prevDirection);
                if (index > -1) {
                    potentialDirections.splice(index, 1);
                }

                //make it twice more likely to get generalDirection from random pick for each other direction.
                //2 directions : 4 times generalDirection, 1 dir 1, 1 dir 2
                //3 directions : 6 times generalDirection, 1 dir 1, 1 dir 2, 1 dir 3

                for (let index = 0; index < potentialDirections.length; index++) {
                    randomWeightedDirections.push(generalDirection);
                    randomWeightedDirections.push(generalDirection);
                    randomWeightedDirections.push(potentialDirections[index]);

                }

                direction = randomWeightedDirections[Math.floor(Math.random() * randomWeightedDirections.length)];

                if (direction === 'right' || direction === 'left') {
                    distance = Maze.getRandomInteger(2, distances.x)

                    if (direction === 'left') {
                        distance = -distance;
                    }

                    nextPos.y = currentPos.y + distance;

                    if (nextPos.y < 1) {
                        nextPos.y = 2;
                    }
                    if (nextPos.y > this.height - 1) {
                        nextPos.y = this.height - 2;
                    }
                }

                if (direction === 'down' || direction === 'up') {
                    distance = Maze.getRandomInteger(2, distances.y);
                    if (direction === 'up') {
                        distance = -distance;
                    }

                    nextPos.x = currentPos.x + distance;


                    if (nextPos.x < 1) {
                        nextPos.x = 2;
                    }
                    if (nextPos.x > this.width - 1) {
                        nextPos.x = this.width - 2;
                    }
                }


                currentPos = this.assignArea(currentPos, nextPos, new Tile(Maze.opacity.open, Maze.tileTypes.hallway))




                /*
                
                    if (direction === "l" || direction === "r") {
                        distance =
                            Math.abs(Math.round(Math.random() * deltaY * 0.5)) + 1;
                    }
        
                    if (direction === "d" || direction === "u") {
                        distance =
                            Math.abs(Math.round(Math.random() * deltaX * 0.5)) + 1;
                    }
                
                */
            }


        }
        /*
                for (let index = 0; index < 100; index++) {
                    let distances = this.findDistance(currentPos, stopPos);
                    let direction;
                    let distance;
                    let nextPos = [];
                    let generalDirection;
                    console.log(distances);
        
        
        
                    /*
                    nextPos[0] = currentPos[0];
                    nextPos[1] = currentPos[1];
                    //if Y > X, go left/right
                    if (Math.abs(deltaY) > Math.abs(deltaX)) {
                        if (deltaY > 0) {
                            generalDirection = "r";
                        } else {
                            generalDirection = "l";
                        }
                    } else {
                        if (deltaX > 0) {
                            generalDirection = "d";
                        } else {
                            generalDirection = "u";
                        }
                    }
                    //Find a random direction and length, but prefer generalDirection
        
                    //remove generalDirection from directions
        
                    directions.splice(generalDirection, 1);
                    //never look back
                    directions.splice(prevDirection, 1);
                    if (prevDirection === "u") {
                        directions.splice("d", 1);
                    }
                    if (prevDirection === "d") {
                        directions.splice("u", 1);
                    }
                    if (prevDirection === "r") {
                        directions.splice("l", 1);
                    }
                    if (prevDirection === "l") {
                        directions.splice("r", 1);
                    }
        
                    let randomNumber = Math.round(Math.random() * 100);
                    if (randomNumber < 40) {
                        direction = generalDirection;
                    } else if (randomNumber < 60) {
                        direction = directions[0] ?? directions[directions.length - 1];
                    } else if (randomNumber < 80) {
                        direction = directions[1] ?? directions[directions.length - 1];
                    } else {
                        direction = directions[2] ?? directions[directions.length - 1];
                    }
        
                    direction = direction;
        
                    direction = generalDirection;
                    prevDirection = direction;
        
                    if (direction === "l" || direction === "r") {
                        distance =
                            Math.abs(Math.round(Math.random() * deltaY * 0.5)) + 1;
                    }
        
                    if (direction === "d" || direction === "u") {
                        distance =
                            Math.abs(Math.round(Math.random() * deltaX * 0.5)) + 1;
                    }
                    distance = distance + 1;
                    for (let dist = 0; dist < distance; dist++) {
                        if (direction === "u" && nextPos[0] - 1 > 1) {
                            console.log("u");
                            nextPos[0] = nextPos[0] - 1;
                            mazeDefinition[nextPos[0]][nextPos[1]] = 1;
                        }
                        if (
                            direction === "d" &&
                            nextPos[0] + 1 < mazeDefinition.length - 1
                        ) {
                            console.log("d");
                            nextPos[0] = nextPos[0] + 1;
                            mazeDefinition[nextPos[0]][nextPos[1]] = 1;
                        }
                        if (
                            direction === "r" &&
                            nextPos[1] + 1 < mazeDefinition[0].length - 1
                        ) {
                            console.log("r");
                            nextPos[1] = nextPos[1] + 1;
                            mazeDefinition[nextPos[0]][nextPos[1]] = 1;
                        }
                        if (direction === "l" && nextPos[1] - 1 > 1) {
                            console.log("l");
                            nextPos[1] = nextPos[1] - 1;
                            mazeDefinition[nextPos[0]][nextPos[1]] = 1;
                        }
                        if (nextPos[0] === stopPos[0] && nextPos[1] === stopPos[1]) {
                            console.log("Got it");
                            index = 10000; // dumb
                        }
                    }
                    console.log(
                        `Starting at [${currentPos[0]},${currentPos[1]}]. Going ${direction} for ${distance} paces, total distance to target is ${stopPos[0] - currentPos[0]},${stopPos[1] - currentPos[1]}. I am at [${nextPos[0]},${nextPos[1]}]`,
                    );
        
                    currentPos[0] = nextPos[0];
                    currentPos[1] = nextPos[1];*/
        //}
    }

}
