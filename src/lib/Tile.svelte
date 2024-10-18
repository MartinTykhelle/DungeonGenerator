<script>
    import { Tile, TileActivity } from './dungeonGen.js';

    export let tile = new Tile();

    let displayCost = false;
    let displayPath = false;
    export let dungeonCrawl;
</script>

<div class="grid-element {tile.opacity}" title="{tile.x},{tile.y} cost ={tile.cost}">
    {#if !!dungeonCrawl && dungeonCrawl.position.x === tile.x && dungeonCrawl.position.y === tile.y}
        <img style="transform:rotate({dungeonCrawl.rotation}rad)" src="arrow.png" alt="player {dungeonCrawl.rotation}" />
    {/if}
</div>

<style>
    .grid-element {
        width: 16px;
        height: 16px;
        border: 1px solid black;
    }
    .closed {
        background-color: gray;
        /*border-color: gray;*/
    }
    .open {
        background-color: white;
        /*border: 1px solid white;*/
        color: black;
    }
    .goal {
        background-color: rgb(20, 20, 80);
        border-color: rgb(20, 20, 80);
    }
    .start {
        background-color: rgb(46, 102, 46);
        border-color: rgb(46, 102, 46);
    }
    .path {
        background-color: rgb(255, 139, 139);
        border-color: rgb(255, 139, 139);
    }
</style>
