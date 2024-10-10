<script>
    // @ts-nocheck

    import Tile from './Tile.svelte';
    import { Maze } from './mazegen.js';
    let mazeObject = new Maze(20, 60);
    async function resetMaze() {
        let mazeSize = { height: mazeObject.height, width: mazeObject.width };
        mazeObject = new Maze(mazeSize.height, mazeSize.width);
    }
    async function addRoom() {
        mazeObject.generateRooms(4);
        mazeObject = mazeObject;
    }
    async function generateHallway() {
        mazeObject.generateStartAndGoal();
        mazeObject.generateHallway(mazeObject.start, mazeObject.goal, Maze.hallwayTypes.meandering);
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

<style>
    .grid-container {
        display: inline-grid;
    }
</style>
