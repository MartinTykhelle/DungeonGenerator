<script>
    import { Tile } from './mazegen.js';

    import { Tooltip } from '@svelte-plugins/tooltips';
    export let tile = new Tile();

    let displayCost = true;
    let displayPath = false;
    export let x = 0;
    export let y = 0;
    /*
    if (!displayPath && type === "path") {
        type = "open";
    }
        */
</script>

<Tooltip content="{x},{y}" position="top">
    <div class="grid-element {tile.opacity}">
        {#if displayCost && !isNaN(tile.cost)}
            {tile.cost}
        {:else if tile.type === 'start'}
            S
        {:else if tile.type === 'goal'}
            G
        {:else if tile.type === 'roomCenter'}
            C
        {/if}
    </div>
</Tooltip>

<style>
    .grid-element {
        width: 20px;
        height: 20px;
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
