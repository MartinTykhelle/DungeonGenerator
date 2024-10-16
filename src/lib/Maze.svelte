<script>
    // @ts-nocheck

    import Tile from './Tile.svelte';
    import { Dungeon } from './dungeonGen.js';
    let dungeonObject = new Dungeon(35, 80);
    let costs;
    async function resetDungeon() {
        let dungeonSize = { height: dungeonObject.height, width: dungeonObject.width };
        dungeonObject = new Dungeon(dungeonSize.height, dungeonSize.width);
    }
    async function addRoom() {
        dungeonObject.generateRooms(1);
        dungeonObject = dungeonObject;
    }
    async function generateHallway() {
        dungeonObject.generateStartAndGoal();
        dungeonObject.generateHallway(dungeonObject.start, dungeonObject.goal, Dungeon.hallwayTypes.direct);
        dungeonObject = dungeonObject;
    }
</script>

{#if dungeonObject.dungeon}
    <div class="grid-container" style="grid-template-columns: repeat({dungeonObject.dungeon[0].length}, 1fr);">
        {#each dungeonObject.dungeon as row, x}
            {#each row as tile, y}
                <Tile {tile} {x} {y}></Tile>
            {/each}
        {/each}
    </div>
    <button on:click={addRoom}> Add Rooms! </button>
    <button on:click={generateHallway}> Add Hallway! </button>
    <button on:click={resetDungeon}> Reset</button>
{/if}

<style>
    .grid-container {
        display: inline-grid;
    }
</style>
