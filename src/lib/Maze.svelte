<script>
    // @ts-nocheck

    import Tile from './Tile.svelte';
    import { Maze } from './mazegen.js';

    let mazeObject = new Maze(35, 35);
    mazeObject.generateRooms(3);
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

<div class="grid-container" style="grid-template-columns: repeat({mazeObject.maze[0].length}, 1fr);">
    {#each mazeObject.maze as row, x}
        {#each row as tile, y}
            <Tile {tile}></Tile>
        {/each}
    {/each}
</div>

<style>
    .grid-container {
        display: inline-grid;
    }
</style>
