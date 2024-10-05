
const constants = {
    goal: 2,
    start: 3,
    open: 1,
    closed: 0,
    path: 4,
};
let inverseConstants = [];

Object.keys(constants).map((x) => (inverseConstants[constants[x]] = x));
///   y---->
///   x
///   |
///   |
///  \/
export let mazeDefinition = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 1, 2],
    [0, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 1, 3, 0],
    [0, 0, 0, 0, 0, 0, 0],
];

let maxX = 38;
let maxY = 85;
let start;
let goal;
let costs = [];
function getPoint() {
    return [
        Math.min(Math.max(Math.floor(Math.random() * maxX), 2), maxX - 2),

        Math.min(Math.max(Math.floor(Math.random() * maxY), 2), maxY - 2),
    ];
}
//Full random generator
function generateRandomMaze() {
    mazeDefinition = [];
    for (let x = 0; x < maxX; x++) {
        let row = [];
        for (let y = 0; y < maxY; y++) {
            if (x === 0 || x === maxX - 1 || y === 0 || y === maxY - 1) {
                row.push(0);
            } else {
                row.push(Math.round(Math.random()));
            }
        }
        mazeDefinition.push(row);
    }

    start = getPoint();
    goal = getPoint();
}
function generateHallway(startPos, stopPos) {
    let currentPos = [];
    currentPos[0] = startPos[0];
    currentPos[1] = startPos[1];
    let prevDirection;
    for (let index = 0; index < 100; index++) {
        let generalDirection;
        let deltaX = stopPos[0] - currentPos[0];
        let deltaY = stopPos[1] - currentPos[1];
        let directions = ["l", "r", "u", "d"];
        let direction;
        let distance;
        let nextPos = [];
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
        currentPos[1] = nextPos[1];
    }
}
//Full random generator
function generateHallways() {
    mazeDefinition = [];
    //initial maze
    if (!mazeDefinition.length) {
        for (let x = 0; x < maxX; x++) {
            let row = [];
            for (let y = 0; y < maxY; y++) {
                row.push(0);
            }
            mazeDefinition.push(row);
        }
    }
    //generate a bunch of hallways
    for (let index = 0; index < 30; index++) {
        generateHallway(getPoint(), getPoint());
    }
    //fill big rooms
    let bigRoom = [];
    for (let x = 1; x < maxX - 1; x++) {
        let row = [];
        for (let y = 1; y < maxY - 1; y++) {
            if (
                mazeDefinition[x][y] === 1 &&
                mazeDefinition[x][y - 1] === 1 &&
                mazeDefinition[x][y + 1] === 1 &&
                mazeDefinition[x - 1][y - 1] === 1 &&
                mazeDefinition[x + 1][y + 1] === 1 &&
                mazeDefinition[x - 1][y + 1] === 1 &&
                mazeDefinition[x + 1][y - 1] === 1 &&
                mazeDefinition[x - 1][y] === 1 &&
                mazeDefinition[x + 1][y] === 1
            ) {
                bigRoom.push([x, y]);
            }
        }
    }
    console.log(bigRoom);
    for (let index = 0; index < bigRoom.length; index++) {
        mazeDefinition[bigRoom[index][0]][bigRoom[index][1]] = 0;
    }

    //ensure that path between start and goal exists
    start = [1, 1];
    goal = [maxX - 2, maxY - 2];
    generateHallway(start, goal);
}

function generateCosts() {
    mazeDefinition[start[0]][start[1]] = constants.start;
    mazeDefinition[goal[0]][goal[1]] = constants.goal;

    //Generate initial costs and costs matrix
    for (let x = 0; x < mazeDefinition.length; x++) {
        let row = mazeDefinition[x];
        costs.push([]);
        for (let y = 0; y < row.length; y++) {
            const element = mazeDefinition[x][y];
            if (element === constants.goal) {
                goal = [x, y];
            }
            if (element === constants.start) {
                start = [x, y];
            }
            costs[x][y] = NaN;
        }
    }
    costs[goal[0]][goal[1]] = 0;
    //find cost path
    for (let i = 0; i < costs.length * costs[0].length; i++) {
        //Find highest cost
        let highest = Math.max(...costs.flat(2).filter((x) => x > -1));
        //Find all instances of the highest cost
        let instances = [];
        for (let x = 0; x < costs.length; x++) {
            for (let y = 0; y < costs[x].length; y++) {
                if (costs[x][y] === highest) {
                    instances.push([x, y]);
                }
            }
        }

        //For all instances, find all neighbouring tiles that can be traversed
        for (let index = 0; index < instances.length; index++) {
            let x = instances[index][0];
            let y = instances[index][1];
            let neighbours = [];
            //Check neighbours for empty cells that are open
            if (
                x > 0 &&
                !(costs[x - 1][y] > -1) &&
                mazeDefinition[x - 1][y] > 0
            ) {
                costs[x - 1][y] = highest + 1;
            }
            if (
                y > 0 &&
                !(costs[x][y - 1] > -1) &&
                mazeDefinition[x][y - 1] > 0
            ) {
                costs[x][y - 1] = highest + 1;
            }
            if (
                x < mazeDefinition.length &&
                !(costs[x + 1][y] > -1) &&
                mazeDefinition[x + 1][y] > 0
            ) {
                costs[x + 1][y] = highest + 1;
            }
            if (
                y < mazeDefinition[0].length &&
                !(costs[x][y + 1] > -1) &&
                mazeDefinition[x][y + 1] > 0
            ) {
                costs[x][y + 1] = highest + 1;
            }
        }
    }
}
function removeUnreachable() {
    for (let x = 0; x < maxX; x++) {
        let row = [];
        for (let y = 0; y < maxY; y++) {
            if (!(costs[x][y] > -1) && mazeDefinition[x][y] === 1) {
                mazeDefinition[x][y] = 0;
            }
        }
    }
}

function findPath() {
    //Find shortest path
    let path = [];
    for (let i = 0; i < costs.length * costs[0].length; i++) {
        //start with start position
        if (!path.length) {
            path.push(start);
        }
        //Find cheapest neighbour tile
        let currentPos = path[path.length - 1];
        let x = currentPos[0];
        let y = currentPos[1];
        let cheapest = Infinity;
        let nextPos;
        if (x === goal[0] && y === goal[1]) {
            console.log("Solved!", path.length);
            break;
        }
        if (x > 0 && costs[x - 1][y] < cheapest) {
            cheapest = costs[x - 1][y];
            nextPos = [x - 1, y];
        }
        if (y > 0 && costs[x][y - 1] < cheapest) {
            cheapest = costs[x][y - 1];
            nextPos = [x, y - 1];
        }
        if (x < mazeDefinition.length && costs[x + 1][y] < cheapest) {
            cheapest = costs[x + 1][y];
            nextPos = [x + 1, y];
        }
        if (y < mazeDefinition[0].length && costs[x][y + 1] < cheapest) {
            cheapest = costs[x][y + 1];
            nextPos = [x, y + 1];
        }
        path.push(nextPos);
    }
    for (let index = 0; index < path.length; index++) {
        const pos = path[index];
        if (
            !(goal[0] === pos[0] && goal[1] === pos[1]) &&
            !(start[0] === pos[0] && start[1] === pos[1])
        ) {
            mazeDefinition[pos[0]][pos[1]] = 4;
        }
    }
    console.log(path);
}
//generateRandomMaze();
generateHallways();
console.log(mazeDefinition);
try {
    generateCosts();
} catch (error) { }
if (!(costs[start[0]][start[1]] > -1)) {
    console.log("Unsolvable");
} else {
    findPath();
    //removeUnreachable();
}