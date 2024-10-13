<script>
    // @ts-nocheck

    import Tile from './Tile.svelte';
    import { Maze } from './mazegen.js';
    let mazeObject = new Maze(35, 80);
    let costs;
    async function resetMaze() {
        let mazeSize = { height: mazeObject.height, width: mazeObject.width };
        mazeObject = new Maze(mazeSize.height, mazeSize.width);
    }
    async function addRoom() {
        mazeObject.generateRooms(1);
        mazeObject = mazeObject;
    }
    async function generateHallway() {
        mazeObject.generateStartAndGoal();
        mazeObject.generateHallway(mazeObject.start, mazeObject.goal, Maze.hallwayTypes.direct);
        mazeObject = mazeObject;
    }
    async function test1() {
        costs = mazeObject.test1();
        mazeObject = mazeObject;
    }
    async function test2() {
        mazeObject.test2(costs);
        mazeObject = mazeObject;
    }
    //console.log(mazeObject.maze);
    //console.log(mazeObject.rooms);
</script>

{#if mazeObject.maze}
    <div class="grid-container" style="grid-template-columns: repeat({mazeObject.maze[0].length}, 1fr);">
        {#each mazeObject.maze as row, x}
            {#each row as tile, y}
                <Tile {tile} {x} {y}></Tile>
            {/each}
        {/each}
    </div>
{/if}
<button on:click={addRoom}> Add Rooms! </button>
<button on:click={generateHallway}> Add Hallway! </button>
<button on:click={resetMaze}> Reset</button>
<button on:click={test1}> Test 1 </button>
<button on:click={test2}> Test 2 </button>

<style>
    .grid-container {
        display: inline-grid;
    }
</style>
