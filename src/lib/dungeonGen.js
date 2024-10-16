class Position {
    /**
     * Position
     * 0,0 is the top left corner
     * X position goes down
     * Y position goes right
     * @param {number} x X Position (Heightwise)
     * @param {number} y Y Position (Widthwise)
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Room {
    /**
     * Room
     * @param {Position} topLeftCorner Top left corner of room
     * @param {number} height Height of room
     * @param {number} width Width of room
     * @param {number} dungeonHeight Height of dungeon
     * @param {number} dungeonWidth Width of dungeon
     */
    constructor(topLeftCorner, height, width, dungeonHeight, dungeonWidth) {
        this.topLeftCorner = topLeftCorner;
        this.height = Math.min(height, dungeonHeight - this.topLeftCorner.x);
        this.width = Math.min(width, dungeonWidth - this.topLeftCorner.y);
        this.center = new Position(Math.floor(topLeftCorner.x + height / 2), Math.floor(topLeftCorner.y + width / 2));
        this.bottomRightCorner = new Position(topLeftCorner.x + height, topLeftCorner.y + width);
        this.badness = 0;
        this.connectedTo = [];
        this.sortOrder = 0;
    }
}
export class Tile {
    /**
     * A tile is what is contained at a single position
     * @param {string} opacity Opacity is a constant from the Dungeon.opacity static object
     * @param {string} type Type is a constant from the Dungeon.tileTypes static object
     */
    constructor(opacity = Dungeon.opacity.closed, type = Dungeon.tileTypes.none) {
        this.opacity = opacity;
        this.type = type || Dungeon.tileTypes.none;
        this.cost = 0;
    }
}
export class Dungeon {
    static kernelTypes = {
        topLeft: 'topLeft',
        center: 'center',
    };

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
        open: 'open',
    };

    static hallwayTypes = {
        direct: 'direct',
        meandering: 'meandering',
    };

    /**
     * Get random integer
     * @param {number} min Minimum number
     * @param {number} max Maximum number
     * @returns {number} A random number between min and max
     */
    static getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /**
     * Gets linear distance between two points.
     * (1,1) to (0,0) will be sqrt(2)
     * @param {Position} posA first position
     * @param {Position} posB Second position
     * @returns {number} Distance between points
     */
    static getDistance(posA, posB) {
        return Math.sqrt(Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2));
    }

    /**
     * Gets taxicab distance between two points
     * (1,1) to (0,0) will be two as it takes two moves to get there
     * @param {Position} posA first position
     * @param {Position} posB Second position
     * @returns {number} Distance between points
     */
    static getRectilinearDistance(posA, posB) {
        return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
    }
    /**
     * Initialize new dungeon
     * Height is X (outer array)
     * Width is Y (inner array)
     * @param {number} height Height of Dungeon
     * @param {number} width Width of Dungeon
     */
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.rooms = [];
        this.dungeon = []; //Array of arrays
        for (let x = 0; x < this.height; x++) {
            let row = [];
            for (let y = 0; y < this.width; y++) {
                row.push(new Tile(Dungeon.opacity.closed));
            }
            this.dungeon.push(row);
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
     * @param {Position} position Position of center point
     * @returns {Array.<Position>} Array of positions for neighbouring tiles
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
        });
        return neighbours;
    }

    /**
     * Calcualtes matrix of distances to goal
     * @param {Position} goal Goal position
     * @param {Function} distanceFunction function to use for distance calculation
     * @returns {Array<Array>} Array of arrays
     */

    #calculateDistanceMatrix(goal, distanceFunction = Dungeon.getRectilinearDistance) {
        let costs = Array(this.height)
            .fill(0)
            .map(() => Array(this.width).fill(0));
        for (let x = 0; x < costs.length; x++) {
            for (let y = 0; y < costs[0].length; y++) {
                costs[x][y] = distanceFunction(goal, new Position(x, y));
            }
        }
        return costs;
    }
    /**
     * Calculates matrix of hallway costs
     * @returns {Array<Array>} Cost to generate hallways
     */
    #calculateHallwayCosts() {
        let costs = Array(this.height)
            .fill(0)
            .map(() => Array(this.width).fill(0));
        for (let x = 0; x < costs.length; x++) {
            for (let y = 0; y < costs[0].length; y++) {
                if (this.dungeon[x][y].type === Dungeon.tileTypes.room) {
                    costs[x][y] += 1;
                }
                if (this.dungeon[x][y].type === Dungeon.tileTypes.hallway) {
                    costs[x][y] += -1;
                }
            }
        }
        return costs;
    }
    /**
     * Calculates matrix of room costs
     * @returns {Array<Array>} Cost to generate rooms
     */
    #calculateRoomCosts() {
        let costs = Array(this.height)
            .fill(0)
            .map(() => Array(this.width).fill(0));
        for (let x = 0; x < costs.length; x++) {
            for (let y = 0; y < costs[0].length; y++) {
                if (this.dungeon[x][y].opacity === Dungeon.opacity.open) {
                    costs[x][y] += 1;
                }
                if (this.dungeon[x][y].type === Dungeon.tileTypes.room) {
                    costs[x][y] += 3;
                }
                if (this.dungeon[x][y].type === Dungeon.tileTypes.hallway) {
                    costs[x][y] += 1;
                }
                if (this.dungeon[x][y].type === Dungeon.tileTypes.roomCenter) {
                    costs[x][y] += 10;
                }
            }
        }
        return costs;
    }

    /**
     * Convolutes kernel on costs
     * @param {Array<Array>} costs Cost matrix
     * @param {Array<Array>} kernel Kernel for convolution
     * @param {string} kernelType Dungeon.kernelType, topLeft uses the topLeft corner as "center"
     * @param {number} buffer If this is greater than 0, a number of cells are added to the outside of the kernel
     * @param {number} bufferValue This is the value of the cells added to the outside of the kernel
     * @returns {Array<Array>} Cost matrix
     */
    #calculateCostsKernel(costs, kernel, kernelType = Dungeon.kernelTypes.topLeft, buffer = 0, bufferValue = 1) {
        let convolutedCosts = Array(this.height)
            .fill(0)
            .map(() => Array(this.width).fill(0));
        let kernelCenter;

        if (kernelType === Dungeon.kernelTypes.center && kernel.length === kernel[0].length && kernel.length % 2) {
            kernelCenter = { x: Math.floor(kernel.length / 2), y: Math.floor(kernel[0].length / 2) };
        }

        // pad kernel
        if (buffer > 0) {
            let bufferArray = Array(buffer).fill(bufferValue);
            for (let index = 0; index < kernel.length; index++) {
                kernel[index].unshift(...bufferArray);
                kernel[index].push(...bufferArray);
            }
            bufferArray = Array(kernel[0].length).fill(bufferValue);
            kernel.unshift(bufferArray);
            kernel.push(bufferArray);
        }

        //What follows is convolutionesque, the kernel will be the room and the "center" is the top left position
        //Each point in the cost matrix will be calculated based on this room size
        for (let x = 0; x < costs.length; x++) {
            for (let y = 0; y < costs[0].length; y++) {
                for (let kx = 0; kx < kernel.length; kx++) {
                    for (let ky = 0; ky < kernel[0].length; ky++) {
                        let signalX = x + kx;
                        let signalY = y + ky;
                        if (kernelType === Dungeon.kernelTypes.center) {
                            signalX = signalX - kernelCenter.x;
                            signalY = signalY - kernelCenter.y;
                        } else {
                            signalX = signalX - buffer;
                            signalY = signalY - buffer;
                        }

                        if (signalX >= 0 && signalX < costs.length && signalY >= 0 && signalY < costs[0].length) {
                            convolutedCosts[x][y] += costs[signalX][signalY] * kernel[kx][ky];
                        }
                    }
                }
            }
        }
        return convolutedCosts;
    }

    /**
     * Finds path from startPos given costs, return is an array of positions going from startPos to the lowest possible point in costs.
     * @param {Array.<Array>} costs Cost matrix from #calculateCosts
     * @param {Position} startPos Position of start of path, path[0]
     * @param {boolean} straighHallways Prefer straight hallways
     * @returns {Array.<Position>} Array of positions describing the whole path
     */
    #findPath(costs, startPos, straighHallways = true) {
        //Find shortest path
        let path = [];
        for (let i = 0; i < costs.length * costs[0].length; i++) {
            //start with start position
            if (!path.length) {
                path.push(startPos);
            }

            //Start on previous position
            let currentPos = path[path.length - 1];

            let nextPos;
            //Check if we've found the position
            if (costs[currentPos.x][currentPos.y] == 0) {
                break;
            }

            let neighbours = this.#getNeighbours(currentPos);

            for (let index = 0; index < path.length; index++) {
                for (let neighbourIndex = 0; neighbourIndex < neighbours.length; neighbourIndex++) {
                    if (neighbours[neighbourIndex].x === path[index].x && neighbours[neighbourIndex].y === path[index].y) {
                        neighbours.splice(neighbourIndex, 1);
                    }
                }
            }
            //Find costs and sort by lowest
            let neighbourCost = neighbours
                .map((neighbour) => {
                    return { position: new Position(neighbour.x, neighbour.y), cost: costs[neighbour.x][neighbour.y] };
                })
                .sort((a, b) => {
                    return a.cost - b.cost;
                });

            // select random from low cost position
            if (neighbourCost.length) {
                let cheapNeighbours = neighbourCost.filter((neighbour) => neighbour.cost === neighbourCost[0].cost);

                if (!straighHallways || Dungeon.getRandomInteger(1, 100) > 80) {
                    nextPos = cheapNeighbours[Math.floor(Math.random() * cheapNeighbours.length)].position;
                } else {
                    nextPos = cheapNeighbours[0].position;
                }
                path.push(nextPos);
            } else {
                //invalid state, handle outside
                path = [];
                break;
            }
        }
        return path;
    }

    /**
     * Assigns a path to hallway
     * @param {Array<Position>} path Path found in various functions
     */
    #assignPath(path) {
        for (let index = 1; index < path.length - 1; index++) {
            this.#assignPosition(path[index], new Tile(Dungeon.opacity.open, Dungeon.tileTypes.hallway));
        }
    }
    /**
     * Checks if x and y are within the bounds of this dungeon, keeping the outermost perimeter as out of bounds
     * @param {number} x X position of point
     * @param {number} y Y position of point
     * @returns {boolean} True if within bounds
     */
    #isWithinBounds(x, y) {
        return x > 0 && x < this.height - 1 && y > 0 && y < this.width - 1;
    }

    /**
     * Checks if position is within the bounds of this dungeon, keeping the outermost perimeter as out of bounds
     * @param {Position} position Position to check
     * @returns {boolean} True if within bounds
     */
    #isPositionWithinBounds(position) {
        return this.#isWithinBounds(position.x, position.y);
    }

    /**
     * Returns a random position within bounds
     * @returns {Position} Random position within bounds
     */
    #getRandomPositionWithinBounds() {
        let x = Dungeon.getRandomInteger(1, this.height - 2);
        let y = Dungeon.getRandomInteger(1, this.width - 2);
        return new Position(x, y);
    }

    /**
     * Assigns a Position to Tile
     * @param {Position} position Position to assign
     * @param {Tile} tile Tile to be assigned to position
     */
    #assignPosition(position, tile) {
        tile = structuredClone(tile);
        if (this.#isWithinBounds(position.x, position.y)) {
            //check that tile type is not overwritten when generating hallways or nonetype
            if (
                tile.type === Dungeon.tileTypes.none ||
                (tile.type === Dungeon.tileTypes.hallway && this.dungeon[position.x][position.y].type != Dungeon.tileTypes.none)
            ) {
                tile.type = this.dungeon[position.x][position.y].type;
            }
            //start and goal should never be overwritten
            if (this.dungeon[position.x][position.y].type === Dungeon.tileTypes.start || this.dungeon[position.x][position.y].type === Dungeon.tileTypes.goal) {
                tile.type = this.dungeon[position.x][position.y].type;
            }
            //avoid overwriting cost as well
            if (this.dungeon[position.x][position.y].cost > 0 && tile.cost == 0) {
                tile.cost = this.dungeon[position.x][position.y].cost;
            }
            this.dungeon[position.x][position.y] = tile;
        }
    }

    /**
     * Assigns area from posA to posB to tile
     * The top left position within the are is found and tile is assigned to all positions within area
     * @param {Position} posA First position
     * @param {Position} posB Second position
     * @param {Tile} tile Tile to assign to area
     */
    #assignArea(posA, posB, tile) {
        //Find top left
        let top = Math.min(posA.x, posB.x);
        let left = Math.min(posA.y, posB.y);
        let distanceX = posA.x - posB.x;
        let distanceY = posA.y - posB.y;

        distanceX = Math.max(Math.max(Math.abs(distanceX), 1));
        distanceY = Math.max(Math.max(Math.abs(distanceY), 1));

        console.log(`Assigning area from (${top},${left}) to (${distanceX + top},${distanceY + left}) to ${tile.opacity}/${tile.type}`);
        for (let x = top; x < distanceX + top; x++) {
            for (let y = left; y < distanceY + left; y++) {
                this.#assignPosition(new Position(x, y), tile);
            }
        }
    }

    /**
     * Generates noisy dungeon. 50/50 open or closed.
     * No logic.
     * Bad gameplay.
     */
    generateNoise() {
        for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
                if (this.#isWithinBounds(x, y)) {
                    if (Math.random() > 0.5) {
                        this.dungeon[x][y] = new Tile(Dungeon.opacity.open);
                    }
                }
            }
        }
    }

    /**
     * Generates numRooms number of rooms,
     * Rooms are put in the this.rooms array
     * @param {number} numRooms Number of rooms
     * @param {boolean} includeHallways Include hallways
     * @param {number} minRoomSize Minimum room size
     * @param {number} maxRoomSize Maximum room size
     */
    generateRooms(numRooms, includeHallways = true, minRoomSize = 3, maxRoomSize = 12) {
        for (let index = 0; index <= numRooms - 1; index++) {
            let roomCosts = this.#calculateRoomCosts();

            let roomKernel = [];
            let height = Dungeon.getRandomInteger(minRoomSize, maxRoomSize);
            let width = Dungeon.getRandomInteger(minRoomSize, maxRoomSize);

            //Make a kernel the size of the room
            for (let x = 0; x < height; x++) {
                roomKernel.push([]);
                for (let y = 0; y < width; y++) {
                    roomKernel[x][y] = 1;
                }
            }
            roomCosts = this.#calculateCostsKernel(roomCosts, roomKernel, Dungeon.kernelTypes.topLeft, 1, 1);

            let potentialRoomPositions = [];

            for (let x = 1; x < this.height - height; x++) {
                for (let y = 1; y < this.width - width; y++) {
                    potentialRoomPositions.push({ position: new Position(x, y), cost: roomCosts[x][y] });
                }
            }

            potentialRoomPositions.sort((a, b) => a.cost - b.cost);
            potentialRoomPositions = potentialRoomPositions.filter((x) => x.cost <= potentialRoomPositions[0].cost);

            let roomPosition = potentialRoomPositions[Math.floor(Math.random() * potentialRoomPositions.length)];
            let room = new Room(roomPosition.position, height, width, this.height, this.width);

            console.log(
                `Room ${index} is being generated with upper left corner at (${room.topLeftCorner.x},${room.topLeftCorner.y}), it is ${room.width} tiles wide and ${room.height} tiles tall. Center is at about ${room.center.x}, ${room.center.y} `
            );
            this.#assignArea(room.topLeftCorner, room.bottomRightCorner, new Tile(Dungeon.opacity.open, Dungeon.tileTypes.room));

            this.#assignPosition(room.center, new Tile(Dungeon.opacity.open, Dungeon.tileTypes.roomCenter));

            this.rooms.push(room);
        }
        if (includeHallways) {
            this.rooms.map((room) => {
                room.sortOrder = Dungeon.getDistance(room.center, new Position(0, 0));
            });
            this.rooms = this.rooms.sort((a, b) => a.sortOrder - b.sortOrder);
            for (let roomIndex = 1; roomIndex < this.rooms.length; roomIndex++) {
                if (!this.rooms[roomIndex - 1].connected) {
                    this.rooms[roomIndex - 1].connected = true;
                    this.generateHallway(this.rooms[roomIndex - 1].center, this.rooms[roomIndex].center, Dungeon.hallwayTypes.direct);
                }
            }
        }
    }

    /**
     * Generates start and goal positions
     */
    generateStartAndGoal() {
        this.start = this.#getRandomPositionWithinBounds();
        this.goal = this.#getRandomPositionWithinBounds();
        this.#assignPosition(this.start, new Tile(Dungeon.opacity.open, Dungeon.tileTypes.start));
        this.#assignPosition(this.goal, new Tile(Dungeon.opacity.open, Dungeon.tileTypes.goal));
    }

    /**
     * Generates hallway between startPos and stopPos
     * @param {Position} startPos Start position of hallway
     * @param {Position} stopPos Stop position of hallway
     * @param {string} type Constant from Dungeon.hallwayTypes
     */
    generateHallway(startPos, stopPos, type = Dungeon.hallwayTypes.direct) {
        //let costs = this.#calculateCosts(stopPos, Dungeon.opacity.closed);
        let distances = this.#calculateDistanceMatrix(stopPos);

        let costs = this.#calculateHallwayCosts();
        let kernel = [
            [1 / 8, 2 / 8, 1 / 8],
            [2 / 8, 8 / 8, 2 / 8],
            [1 / 8, 2 / 8, 1 / 8],
        ];
        costs = this.#calculateCostsKernel(costs, kernel, Dungeon.kernelTypes.center);
        //Ensure that stop pos is 0
        costs[stopPos.x][stopPos.y] = 0;

        for (let x = 0; x < costs.length; x++) {
            for (let y = 0; y < costs[0].length; y++) {
                costs[x][y] = costs[x][y] + distances[x][y];
            }
        }

        if (type === Dungeon.hallwayTypes.direct) {
            let path = this.#findPath(costs, startPos, true);
            this.#assignPath(path);
        } else if (type === Dungeon.hallwayTypes.meandering) {
            let meanderPositions = [];

            //Add random points
            for (let index = 0; index < Math.random() * 2 + 1; index++) {
                let position = this.#getRandomPositionWithinBounds();
                let meanderPosition = {
                    position: position,
                    distance: Dungeon.getRectilinearDistance(startPos, position),
                };
                meanderPositions.push(meanderPosition);
            }
            //Sort the positions by distance to start
            meanderPositions.push({ position: startPos, distance: 0 });
            meanderPositions.push({ position: stopPos, distance: Infinity });
            meanderPositions.sort((a, b) => a.distance - b.distance);

            for (let mi = 1; mi < meanderPositions.length; mi++) {
                let costs = this.#calculateDistanceMatrix(meanderPositions[mi].position, Dungeon.getRectilinearDistance);
                let path = this.#findPath(costs, meanderPositions[mi - 1].position, false);
                this.#assignPath(path);
            }
        }
    }
}
