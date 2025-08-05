import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer;

let LINE_COUNT = 8000;
let geom = new THREE.BufferGeometry();
geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(LINE_COUNT * 6), 3));
geom.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(LINE_COUNT * 2), 1));
let pos = geom.getAttribute('position').array;
let vel = geom.getAttribute('velocity').array;

const fadeOverlay = document.getElementById('fade-overlay');
const portfolio = document.getElementById('portfolio');
const loadingScreen = document.getElementById('loading-screen');
const scrollPrompt = document.getElementById('scroll-prompt');
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);

// Hide loading screen and show scroll prompt
manager.onLoad = function () {
  loadingScreen.style.opacity = 0;
  loadingScreen.remove();
  scrollPrompt.style.display = 'block';
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 500);
    camera.position.z = 200;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
    scene.add(ambientLight);

    loader.load('/models/scene.gltf', function(gltf) {
        const model = gltf.scene;
        model.scale.set(10, 10, 10);
        model.rotation.y = Math.PI;
        model.position.set(0, 0, 200);
        scene.add(model);
    }, undefined, function(error) {
        console.error('Error loading .glb model:', error);
    });

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

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
    const scrollY = window.scrollY;
    const maxScroll = window.innerHeight;
    const scrollProgress = Math.min(1, scrollY / maxScroll);

    // Move camera from z = 200 to z = 20
    camera.position.z = 200 - scrollProgress * 180;

    // Fade overlay
    fadeOverlay.style.opacity = scrollProgress.toFixed(2);

    // Stop animation once fully faded
    const shouldAnimateLines = scrollProgress < 1;

    if (shouldAnimateLines) {
        for (let i = 0; i < LINE_COUNT; i++) {
            vel[i * 2] += 0.03;
            vel[i * 2 + 1] += 0.025;
            pos[i * 6 + 2] += vel[i * 2];
            pos[i * 6 + 5] += vel[i * 2 + 1];

            if (pos[i * 6 + 5] > 200) {
                const z = Math.random() * 200 - 100;
                pos[i * 6 + 2] = z;
                pos[i * 6 + 5] = z;
                vel[i * 2] = vel[i * 2 + 1] = 0;
            }
        }

        geom.getAttribute('position').needsUpdate = true;
    }

    // Show or hide portfolio section
    if (scrollProgress >= 1) {
        portfolio.classList.add('visible');
        scrollPrompt.style.display = 'none';
    } else {
        portfolio.classList.remove('visible');
        scrollPrompt.style.display = 'block';
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

init();
