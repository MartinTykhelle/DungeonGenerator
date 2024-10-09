<script>
    // @ts-nocheck

    import Tile from './Tile.svelte';
    import { Maze } from './mazegen.js';
    let mazeObject = new Maze(20, 60);
    async function addRoom() {
        mazeObject.generateRooms(1);
        mazeObject = mazeObject;
    }
    //   mazeObject.generateStartAndGoal();
    /*mazeObject.generateHallway(
        mazeObject.start,
        mazeObject.goal,
        Maze.hallwayTypes.meandering,
    );
*/
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

<style>
    .grid-container {
        display: inline-grid;
    }
</style>
