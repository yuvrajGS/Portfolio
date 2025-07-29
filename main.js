import * as THREE from 'three';

var scene, camera, renderer;

let LINE_COUNT = 10000;
let geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINE_COUNT * 6), 3));
geom.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(LINE_COUNT * 2), 1));
let pos = geom.getAttribute('position').array;
let vel = geom.getAttribute('velocity').array;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.z = 200;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

    for (let i = 0; i < LINE_COUNT; i++) {
        let x = Math.random() * 400 - 200;
        let y = Math.random() * 200 - 100;
        let z = Math.random() * 500 - 100;
        pos[i * 6] = x;
        pos[i * 6 + 1] = y;
        pos[i * 6 + 2] = z;

        pos[i * 6 + 3] = x;
        pos[i * 6 + 4] = y;
        pos[i * 6 + 5] = z;

        vel[i * 2] = vel[i * 2 + 1] = 0;
    }

    let material = new THREE.LineBasicMaterial({ color: 0xffffff });
    let lines = new THREE.LineSegments(geom, material);
    scene.add(lines);
    
    window.addEventListener('resize', onWindowResize, false);
    animate();
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function animate() {
    for (let i = 0; i < LINE_COUNT; i++) {
        vel[i * 2] += 0.03
        vel[i * 2 + 1] += 0.025

        // Update z position based on velocity
        pos[i * 6 + 2] += vel[i * 2]; 
        pos[i * 6 + 5] += vel[i * 2 + 1];

        if (pos[i * 6 + 5] > 200) {
            const z = Math.random() * 200 - 100; // Reset z position randomly
            pos[i * 6 + 2] = z;
            pos[i * 6 + 5] = z;
            vel[i * 2] = vel[i * 2 + 1] = 0; // Reset velocity
        }
    }
    geom.getAttribute('position').needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
init();
