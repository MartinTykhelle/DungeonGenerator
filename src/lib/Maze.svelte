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
</script>

{#if mazeObject.maze}
    <div class="grid-container" style="grid-template-columns: repeat({mazeObject.maze[0].length}, 1fr);">
        {#each mazeObject.maze as row, x}
            {#each row as tile, y}
                <Tile {tile} {x} {y}></Tile>
            {/each}
        {/each}
    </div>
    <button on:click={addRoom}> Add Rooms! </button>
    <button on:click={generateHallway}> Add Hallway! </button>
    <button on:click={resetMaze}> Reset</button>
{/if}

<style>
    .grid-container {
        display: inline-grid;
    }
</style>
