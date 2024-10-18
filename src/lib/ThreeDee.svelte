<script>
    // @ts-nocheck

    import * as THREE from 'three';
    import { afterUpdate } from 'svelte';
    export let subArea;
    export let dungeonCrawl;

    afterUpdate(async () => {
        const width = 500,
            height = 500;
        const camera = new THREE.PerspectiveCamera(70, width / height, 0.05, 5);

        camera.up.set(0, 0, 1);
        camera.position.x = Math.floor(subArea.length / 2);
        camera.position.y = Math.floor(subArea.length / 2);
        camera.position.z = 0;

        let inFront = { x: camera.position.x, y: camera.position.y, z: 0 };

        //up
        if (dungeonCrawl.rotation === 0) {
            inFront.x = camera.position.x - 1;
        }
        //right
        if (dungeonCrawl.rotation === Math.PI / 2) {
            inFront.y = camera.position.y + 1;
        }
        //down
        if (dungeonCrawl.rotation === Math.PI) {
            inFront.x = camera.position.x + 1;
        }
        //left
        if (dungeonCrawl.rotation === (3 * Math.PI) / 2) {
            inFront.y = camera.position.y - 1;
        }
        console.log(inFront);

        camera.lookAt(inFront.x, inFront.y, inFront.z);
        let material = new THREE.MeshLambertMaterial({
            color: 0xeeeeee,
            wireframe: false,
        });

        let material2 = new THREE.MeshLambertMaterial({
            color: 0x888888,
            wireframe: false,
        });

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000000, 0.015, 5);
        scene.add(new THREE.AmbientLight(0xc9c9c9, 0.8));

        for (let x = 0; x < subArea.length; x++) {
            for (let y = 0; y < subArea[0].length; y++) {
                let geometry = new THREE.BoxGeometry(1, 1, 1).translate(x, y, -1);
                let floor = new THREE.Mesh(geometry, material2);

                scene.add(floor);

                let geometry2 = new THREE.BoxGeometry(1, 1, 1).translate(x, y, 1);
                let roof = new THREE.Mesh(geometry2, material2);

                scene.add(roof);

                if (subArea[x][y].opacity === 'closed') {
                    let geometry = new THREE.BoxGeometry(1, 1, 1).translate(x, y, 0);
                    let wall = new THREE.Mesh(geometry, material);
                    scene.add(wall);
                }
            }
        }

        const testCanvas = document.getElementById('testCanvas');
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: testCanvas,
        });

        renderer.setSize(width, height);
        renderer.render(scene, camera);
    });
</script>

<main>
    <canvas id="testCanvas"></canvas>
</main>
