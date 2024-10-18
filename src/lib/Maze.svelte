<script>
    // @ts-nocheck

    import Tile from './Tile.svelte';
    import { Dungeon, Position } from './dungeonGen.js';
    import { DungeonCrawl } from './dungeonCrawl.js';
    import ThreeDee from './ThreeDee.svelte';

    let dungeonObject = new Dungeon(35, 80);
    let dungeonCrawl;
    let mode = 'setup';
    let subArea;
    async function resetDungeon() {
        let dungeonSize = { height: dungeonObject.height, width: dungeonObject.width };
        dungeonObject = new Dungeon(dungeonSize.height, dungeonSize.width);
        dungeonCrawl = undefined;
        mode = 'setup';
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
    async function startGame() {
        mode = 'game';
        dungeonCrawl = new DungeonCrawl(dungeonObject);
        subArea = dungeonObject.getSubArea(dungeonCrawl.position, 9);
        dungeonObject = dungeonObject;
    }

    async function onKeyDown(e) {
        switch (e.key) {
            case 'w':
                dungeonCrawl.movePlayer(1);
                break;
            case 'a':
                dungeonCrawl.rotatePlayer(-(Math.PI / 2));
                break;
            case 's':
                dungeonCrawl.movePlayer(-1);
                break;

            case 'd':
                dungeonCrawl.rotatePlayer(Math.PI / 2);
                break;
        }
        subArea = dungeonObject.getSubArea(dungeonCrawl.position, 9);
        dungeonCrawl = dungeonCrawl;
    }
    function moveRandom() {
        let random = Math.random() * 100;
        if (random > 50) {
            dungeonCrawl.movePlayer(1);
        } else if (random > 20) {
            dungeonCrawl.rotatePlayer(-(Math.PI / 2));
        } else {
            dungeonCrawl.rotatePlayer(Math.PI / 2);
        }

        subArea = dungeonObject.getSubArea(dungeonCrawl.position, 9);
        dungeonCrawl = dungeonCrawl;
        setTimeout(() => moveRandom(), 100);
    }
</script>

{#if mode === 'setup' && dungeonObject.dungeon}
    <div class="grid-container" style="grid-template-columns: repeat({dungeonObject.dungeon[0].length}, 1fr);">
        {#each dungeonObject.dungeon as row, x}
            {#each row as tile, y}
                <Tile {tile} {dungeonCrawl}></Tile>
            {/each}
        {/each}
    </div>
{/if}
{#if mode === 'game' && dungeonCrawl}
    <div class="grid-container" style="grid-template-columns: repeat({subArea[0].length}, 1fr);">
        {#each subArea as row, x}
            {#each row as tile, y}
                <Tile {tile} {dungeonCrawl}></Tile>
            {/each}
        {/each}
    </div>
    <ThreeDee {subArea} {dungeonCrawl}></ThreeDee>
{/if}

<button on:click={addRoom}> Add Rooms! </button>
<button on:click={generateHallway}> Add Hallway! </button>
<button on:click={resetDungeon}> Reset</button>
<button on:click={startGame}> Play </button>
<button on:click={moveRandom}> Move randomly </button>
<svelte:window on:keydown|preventDefault={onKeyDown} />

<style>
    .grid-container {
        display: inline-grid;
    }
</style>
