
class Position {
    /**
     * Position
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class Room {
    /**
     * Room
     * @param {Position} topLeftCorner 
     * @param {number} height 
     * @param {number} width 
     * @param {number} mazeHeight 
     * @param {number} mazeWidth 
     */
    constructor(topLeftCorner, height, width, mazeHeight, mazeWidth) {
        this.topLeftCorner = topLeftCorner;
        this.height = Math.min(height, mazeHeight - this.topLeftCorner.x);
        this.width = Math.min(width, mazeWidth - this.topLeftCorner.y);
        this.center = new Position(Math.floor(topLeftCorner.x + height / 2), Math.floor(topLeftCorner.y + width / 2))
        this.bottomRightCorner = new Position(topLeftCorner.x + height, topLeftCorner.y + width);
        this.badness = 0;
    }

}
export class Tile {
    /**
     * 
     * @param {string} opacity 
     * @param {string} type 
     */
    constructor(opacity = Maze.opacity.closed, type = Maze.tileTypes.none) {
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
    }


    /**
     * Get random integer
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    static getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Initialize new maze
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
     * Returns array of neighbours
     * [ ][N][ ]
     * [N][P][N]
     * [ ][N][ ]
     * 
     * P = Position 
     * N = Neighbours
     * 
     * @param {Position} position
     * @returns {Array.<Position>}
     */
    #getNeighbours(position) {

        let neighbours = [];
        //all 4 neighbours
        neighbours.push(new Position(position.x + 1, position.y));
        neighbours.push(new Position(position.x - 1, position.y));
        neighbours.push(new Position(position.x, position.y + 1));
        neighbours.push(new Position(position.x, position.y - 1));

        neighbours = neighbours.filter((neighbour) => {
            return this.#isPositionWithinBounds(neighbour);
        })
        return neighbours;

    }


    /**
     * Returns array of diagonals
     * 
     * [D][ ][D]
     * [ ][P][ ]
     * [D][ ][D]
     * 
     * P = Position 
     * D = Diagonals
     * 
     * @param {Position} position
     */
    #getDiagonals(position) {

        let diagonals = [];
        //all 4 neighbours
        diagonals.push(new Position(position.x + 1, position.y + 1));
        diagonals.push(new Position(position.x - 1, position.y - 1));
        diagonals.push(new Position(position.x - 1, position.y + 1));
        diagonals.push(new Position(position.x + 1, position.y - 1));

        diagonals = diagonals.filter((diagonal) => {
            return this.#isPositionWithinBounds(diagonal);
        })
        return diagonals;

    }

    /**
     * Calculates badness of a given room depending on overlap of existing rooms etc.
     * @param {Room} room 
     */
    #calculateRoomBadness(room) {
        //Check room area + outline
        for (let x = room.topLeftCorner.x - 2; x < room.topLeftCorner.x + room.height + 2; x++) {
            for (let y = room.topLeftCorner.y - 2; y < room.topLeftCorner.y + room.width + 2; y++) {
                if (this.#isWithinBounds(x, y)) {
                    if (this.maze[x][y].opacity === Maze.opacity.open) {
                        room.badness = room.badness + 2;
                    }
                    if (this.maze[x][y].type === Maze.tileTypes.room) {
                        room.badness = room.badness + 10;
                    }
                    if (this.maze[x][y].type === Maze.tileTypes.hallway) {
                        room.badness = room.badness - 1;
                    }
                    if (this.maze[x][y].type === Maze.tileTypes.roomCenter) {
                        room.badness = room.badness + 100;
                    }

                }
                else {
                    // Position in room is outside of bounds
                    room.badness = room.badness + 1000;
                }


            }

        }
    }


    /**
     * Calculates costs to goal
     * 
     * @param {Position} goal 
     * @param {string} opacity 
     * 
     * @returns {Array.<Array>}
     */
    #calculateCosts(goal, opacity = Maze.opacity.open) {
        let costs = [];
        for (let x = 0; x < this.maze.length; x++) {
            let row = this.maze[x];
            costs.push([]);
            for (let y = 0; y < row.length; y++) {
                costs[x][y] = NaN;
            }
        }

        //Cost of goal is 0
        costs[goal.x][goal.y] = 0;

        //No idea how high this could be, someone smarter than me can figure it out, but it is less than width x height and exits on completion so it really doesn't matter
        let iterations = costs.length * costs[0].length;

        let previousHighest = -1;
        for (let i = 0; i < iterations; i++) {
            //Find highest cost
            let highest = Math.max(...costs.flat(2).filter((x) => !isNaN(x)));
            //No new paths in last iteration, break
            if (highest === previousHighest) {
                break;
            }
            //Find all instances of the highest cost
            let instances = [];
            for (let x = 0; x < costs.length; x++) {
                for (let y = 0; y < costs[x].length; y++) {
                    if (costs[x][y] === highest) {
                        instances.push(new Position(x, y));
                    }
                }
            }

            //For all instances, find all neighbouring tiles that can be traversed
            for (let index = 0; index < instances.length; index++) {
                let instance = instances[index];
                let neighbours = this.#getNeighbours(instance)
                let extraCost = 0;
                //filter neighbours to remove invalid types 
                neighbours = neighbours.filter((neighbour) => {
                    return (this.maze[neighbour.x][neighbour.y].opacity === opacity || [Maze.tileTypes.hallway, Maze.tileTypes.start, Maze.tileTypes.goal, Maze.tileTypes.room, Maze.tileTypes.roomCenter].indexOf(this.maze[neighbour.x][neighbour.y].type) > -1) &&
                        isNaN(costs[neighbour.x][neighbour.y]);
                })

                neighbours.map((neighbour) => {
                    if ([Maze.tileTypes.hallway, Maze.tileTypes.room, Maze.tileTypes.roomCenter].indexOf(this.maze[neighbour.x][neighbour.y].type) > -1) {
                        extraCost = 1;
                    }
                    costs[neighbour.x][neighbour.y] = highest + 1 + extraCost;
                })

            }
            previousHighest = highest;


        }

        for (let x = 0; x < this.maze.length; x++) {
            let row = this.maze[x];
            costs.push([]);
            for (let y = 0; y < row.length; y++) {
                this.maze[x][y].cost = costs[x][y]
            }
        }
        return (costs);

    }


    /**
     * Finds path from startPos given costs, return is an array of positions going from startPos to the lowest possible point in costs.
     * 
     * @param {Array.<Array>} costs 
     * @param {Position} startPos 
     * @param {number} meanderFactor in percentage, 0 means no meandering, 100 will only meander and never find the goal.
     * 
     * @returns {Array.<Position>}
     */
    #findPath(costs, startPos, meanderFactor = 0) {
        //Find shortest path
        let path = [];
        let meanderCounter = 0;
        let backAndForthCounter = 0;
        for (let i = 0; i < costs.length * costs[0].length; i++) {
            //start with start position
            if (!path.length) {
                path.push(startPos);
            }

            //Start on previous position
            let currentPos = path[path.length - 1];

            //Check if we're doing some meandering, but not right at the start
            let doMeandering = path.length > 4 && meanderCounter > 4 && Math.random() * 100 < meanderFactor;
            //doMeandering = i == 3;
            if (doMeandering) {
                meanderCounter = 0;
                //check which direction we're going in. 
                //The diff should be [-1,0], [1,0], [0,-1], [0,1]
                let distances = this.#findDistance(path[path.length - 1], path[path.length - 2]);
                //Check that it is [-1,0], [1,0], [0,-1], [0,1]
                if (Math.abs(distances.x + distances.y) === 1) {
                    let meanderDistance = { x: 0, y: 0 };

                    if (distances.x !== 0) {
                        meanderDistance.y = Math.round((Math.random() - 0.5) * 20)
                    }
                    if (distances.y !== 0) {
                        meanderDistance.x = Math.round((Math.random() - 0.5) * 20)
                    }

                    let direction = { x: Math.sign(meanderDistance.x), y: Math.sign(meanderDistance.y) }
                    let meanderPos = new Position(currentPos.x, currentPos.y);

                    //push the meander positions and add 3 to cost to avoid walking on a meander path
                    for (let x = 0; x < Math.abs(meanderDistance.x); x++) {

                        if (this.#isWithinBounds(meanderPos.x + direction.x, meanderPos.y)) {
                            meanderPos.x = meanderPos.x + direction.x;
                            costs[meanderPos.x][meanderPos.y] = costs[meanderPos.x][meanderPos.y] + 2;
                            path.push(new Position(meanderPos.x, meanderPos.y));
                        }
                    }

                    for (let y = 0; y < Math.abs(meanderDistance.y); y++) {

                        if (this.#isWithinBounds(meanderPos.x, meanderPos.y + direction.y)) {
                            meanderPos.y = meanderPos.y + direction.y;
                            costs[meanderPos.x][meanderPos.y] = costs[meanderPos.x][meanderPos.y] + 2;

                            path.push(new Position(meanderPos.x, meanderPos.y));
                        }
                    }
                }



                currentPos = path[path.length - 1];

                //Add cost to diagonals to avoid double hallways
                let diagonals = this.#getDiagonals(currentPos);
                for (let index = 0; index < diagonals.length; index++) {
                    const diagonal = diagonals[index];
                    costs[diagonal.x][diagonal.y] = costs[diagonal.x][diagonal.y] + 1;

                }
            }


            let nextPos;

            //Check if we've found the position
            if (costs[currentPos.x][currentPos.y] == 0) {
                break;
            }
            let neighbours = this.#getNeighbours(currentPos);
            //Find costs and sort by lowest
            let neighbourCost = neighbours.map((neighbour) => { return { position: new Position(neighbour.x, neighbour.y), cost: costs[neighbour.x][neighbour.y] } }).sort((a, b) => { return a.cost - b.cost });

            nextPos = neighbourCost[0].position;


            /*
            The following checks if a path is going back and forth between two spaces and tries to undo the damage
            The reason for this should be investigated and avoided. Might be due to diagonal extra cost?
            */
            if (path.length > 3 && nextPos.x === path[path.length - 2].x && nextPos.y === path[path.length - 2].y) {
                let skipSteps = Math.min(4 + backAndForthCounter, path.length - 1);
                meanderCounter = -backAndForthCounter - 4;
                backAndForthCounter = backAndForthCounter + 1;
                for (let index = 0; index < skipSteps; index++) {
                    path.pop();
                }
            }
            else {
                backAndForthCounter = 0;
                meanderCounter = meanderCounter + 1;
                path.push(nextPos);
            }


        }
        return (path);
    }
    /**
     * Checks if x and y are within the bounds of this maze, keeping the outermost perimeter as out of bounds
     * @param {number} x
     * @param {number} y
     * @returns {boolean} True if within bounds
     */
    #isWithinBounds(x, y) {
        return x > 0 && x < this.height - 1 && y > 0 && y < this.width - 1
    }

    /**
     * Checks if position is within the bounds of this maze, keeping the outermost perimeter as out of bounds
     * @param {Position} position
     * @returns {boolean} True if within bounds
     */
    #isPositionWithinBounds(position) {
        return this.#isWithinBounds(position.x, position.y)
    }

    /**
     * Returns a random position within bounds
     * @returns {Position}
     */
    #getRandomPositionWithinBounds() {

        //todo: Add preferOpenArea(width, height) or something to avoid overlapping points
        let x = Math.min(Math.max(Math.floor(Math.random() * this.height), 2), this.height - 2);
        let y = Math.min(Math.max(Math.floor(Math.random() * this.width), 2), this.width - 2);
        return new Position(x, y);
    }

    /**
     * Assigns a Position to Tile
     * 
     * @param {Position} position 
     * @param {Tile} tile 
     */
    #assignPosition(position, tile) {
        tile = structuredClone(tile);
        if (this.#isWithinBounds(position.x, position.y)) {
            //check that tile type is not overwritten when generating hallways or nonetype
            if (tile.type === Maze.tileTypes.none || (tile.type === Maze.tileTypes.hallway && this.maze[position.x][position.y].type != Maze.tileTypes.none)) {
                tile.type = this.maze[position.x][position.y].type;
            }
            //start and goal should never be overwritten
            if (this.maze[position.x][position.y].type === Maze.tileTypes.start || this.maze[position.x][position.y].type === Maze.tileTypes.goal) {
                tile.type = this.maze[position.x][position.y].type;
            }
            this.maze[position.x][position.y] = tile;
        }
    }

    /**
     * Assigns area from posA to posB to tile
     * @param {Position} posA 
     * @param {Position} posB 
     * @param {Tile} tile 
     */
    #assignArea(posA, posB, tile) {
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

                this.#assignPosition(new Position(x, y), tile)


            }
        }
        return posB

    }

    /**
     * Finds distance between two points
     * @param {Position} posA 
     * @param {Position} posB 
     * @returns {Object}
     */
    #findDistance(posA, posB) {
        return { x: posB.x - posA.x, y: posB.y - posA.y };
    }

    /**
     * Generates noisy maze. 50/50 open or closed. 
     * No logic.
     * Bad gameplay.
     */
    generateNoise() {
        for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
                if (this.#isWithinBounds(x, y)) {
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


            let rooms = [];
            //try to find some nice untouched space for a few iterations
            for (let roomIdx = 0; roomIdx < 30; roomIdx++) {

                rooms.push(new Room(this.#getRandomPositionWithinBounds(), Maze.getRandomInteger(minRoomSize, maxRoomSize), Maze.getRandomInteger(minRoomSize, maxRoomSize), this.height, this.width));
                this.#calculateRoomBadness(rooms[rooms.length - 1]);
            }

            let room = rooms.sort((a, b) => { return a.badness - b.badness })[0];

            console.log(`Room ${index} is being generated with upper left corner at (${room.topLeftCorner.x},${room.topLeftCorner.y}, it is ${room.width} tiles wide and ${room.height} tiles tall. Center is at about ${room.center.x}, ${room.center.y} `)
            this.#assignArea(room.topLeftCorner, room.bottomRightCorner, new Tile(Maze.opacity.open, Maze.tileTypes.room))

            this.#assignPosition(room.center, new Tile(Maze.opacity.open, Maze.tileTypes.roomCenter))

            if (includeHallways && index > 0) {

                this.generateHallway(this.rooms[index - 1].center, room.center, Maze.hallwayTypes.meandering);

            }

            this.rooms.push(room);


        }
    }

    generateStartAndGoal() {
        this.start = this.#getRandomPositionWithinBounds();
        this.goal = this.#getRandomPositionWithinBounds();
        this.#assignPosition(this.start, new Tile(Maze.opacity.open, Maze.tileTypes.start));
        this.#assignPosition(this.goal, new Tile(Maze.opacity.open, Maze.tileTypes.goal));
    }

    /**
     * Generates hallway between startPos and stopPos
     * 
     * @param {Position} startPos 
     * @param {Position} stopPos 
     * @param {string} type 
     */
    generateHallway(startPos, stopPos, type = Maze.hallwayTypes.direct) {

        let costs = this.#calculateCosts(stopPos, Maze.opacity.closed);

        if (type === Maze.hallwayTypes.direct) {

            let path = this.#findPath(costs, startPos, 0);
            for (let index = 1; index < path.length - 1; index++) {
                this.#assignPosition(path[index], new Tile(Maze.opacity.open, Maze.tileTypes.hallway))
            }

        }
        else if (type === Maze.hallwayTypes.meandering) {

            let path = this.#findPath(costs, startPos, 3);
            for (let index = 1; index < path.length - 1; index++) {
                this.#assignPosition(path[index], new Tile(Maze.opacity.open, Maze.tileTypes.hallway))
            }
        }
    }

}
