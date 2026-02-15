import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export function initializeThreeScene() {
    const container = document.getElementById('three-bg-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5, 60);

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 15);

    const homeGroup = new THREE.Group();
    const scrollGroup = new THREE.Group();
    const contactGroup = new THREE.Group();
    scene.add(homeGroup, scrollGroup, contactGroup);

    const renderer = new THREE.WebGLRenderer({
        antialias: window.innerWidth > 768,
        alpha: true,
        powerPreference: "high-performance",
        precision: "lowp"
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.0;
    container.appendChild(renderer.domElement);

    
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 4);
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    const chestLight = new THREE.PointLight(0x00f0ff, 20, 15);
    scrollGroup.add(chestLight);

    
    const groundGeometry = new THREE.PlaneGeometry(120, 120, 16, 16);
    const groundMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.1,
        depthWrite: false
    });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -8;
    scrollGroup.add(groundMesh);

    
    const RAIN_COUNT = 300;
    const rainGeometry = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(RAIN_COUNT * 3);
    const rainVelocities = new Float32Array(RAIN_COUNT);
    
    for (let i = 0; i < RAIN_COUNT * 3; i += 3) {
        rainPositions[i] = (Math.random() - 0.5) * 60;
        rainPositions[i + 1] = (Math.random() - 0.5) * 40 + 10;
        rainPositions[i + 2] = (Math.random() - 0.5) * 60;
        rainVelocities[i/3] = 0.22 + Math.random() * 0.1;
    }
    
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMaterial = new THREE.PointsMaterial({ 
        color: 0x00f0ff, 
        size: 0.06,
        transparent: true,
        opacity: 0.6
    });
    const rain = new THREE.Points(rainGeometry, rainMaterial);
    scrollGroup.add(rain);

    // Lazy-load models after scene setup
    let modelsLoaded = false;
    
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    
    const modelLoader = new GLTFLoader();
    modelLoader.setDRACOLoader(dracoLoader);

    let ironManModel = null;
    let roomModel = null;
    let targetX = 0;
    let targetY = 0;
    
    const sizeVector = new THREE.Vector3();
    const boundingBox = new THREE.Box3();
    const metalMaterialProps = { metalness: 1, roughness: 0.2 };

    // Load background immediately (smaller file, non-blocking)
    modelLoader.load('assets/blender/background/background_room.glb', (gltf) => {
        roomModel = gltf.scene;
        roomModel.traverse((node) => {
            if (node.isMesh) node.frustumCulled = true;
        });

        boundingBox.setFromObject(roomModel);
        boundingBox.getSize(sizeVector);
        const maxDimension = Math.max(sizeVector.x, sizeVector.y, sizeVector.z);
        const scaleFactor = 30 / maxDimension;
        
        roomModel.scale.setScalar(scaleFactor);
        roomModel.position.y = -4;
        homeGroup.add(roomModel);
    });

    // Defer Iron Man model loading to avoid blocking LCP
    requestIdleCallback(() => {
        modelLoader.load('assets/blender/character/iron_man.glb', (gltf) => {
            modelsLoaded = true;
            ironManModel = gltf.scene;
            ironManModel.traverse((node) => {
                if (node.isMesh && node.material) {
                    Object.assign(node.material, metalMaterialProps);
                    node.material.needsUpdate = true;
                }
            });

            boundingBox.setFromObject(ironManModel);
            boundingBox.getSize(sizeVector);
            const maxDimension = Math.max(sizeVector.x, sizeVector.y, sizeVector.z);
            const scaleFactor = 12 / maxDimension;
            
            ironManModel.scale.setScalar(scaleFactor);
            ironManModel.position.set(0, -6, 0);
            chestLight.position.set(0, -5, 1.5);
            scrollGroup.add(ironManModel);
        });
    }, { timeout: 4000 });

    
    function updateInputPosition(x, y) {
        targetY = (x / window.innerWidth - 0.5) * 1.5;
        targetX = (y / window.innerHeight - 0.5) * 0.8;
    }

    let mouseMoveTimeout = null;
    document.addEventListener('mousemove', (e) => {
        if (mouseMoveTimeout) return;
        mouseMoveTimeout = setTimeout(() => {
            updateInputPosition(e.clientX, e.clientY);
            mouseMoveTimeout = null;
        }, 16);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (e.touches[0]) updateInputPosition(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    
    let transitionFactor = 0;
    let contactFactor = 0;
    const animationClock = new THREE.Clock();
    let currentScrollY = window.pageYOffset;
    let totalDocumentHeight = document.documentElement.scrollHeight;
    let windowHeight = window.innerHeight;

    
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            currentScrollY = window.pageYOffset;
            scrollTimeout = null;
        }, 16);
    }, { passive: true });

    
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            totalDocumentHeight = document.documentElement.scrollHeight;
            windowHeight = window.innerHeight;
            camera.aspect = container.clientWidth / windowHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }, 150);
    }, { passive: true });

    
    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = animationClock.getElapsedTime();
        const targetTransition = Math.min(currentScrollY / (windowHeight * 0.8), 1);
        transitionFactor += (targetTransition - transitionFactor) * 0.08;
        
        const targetContact = (windowHeight + currentScrollY) >= (totalDocumentHeight - 750) ? 1 : 0;
        contactFactor += (targetContact - contactFactor) * 0.08;
        
        transitionFactor = Math.max(0, Math.min(1, transitionFactor));
        contactFactor = Math.max(0, Math.min(1, contactFactor));
        
        
        homeGroup.position.y = transitionFactor * 25;
        homeGroup.scale.setScalar(1 - transitionFactor);
        homeGroup.visible = transitionFactor < 0.98;
        
        
        scrollGroup.position.y = ((1 - transitionFactor) * -25) + (contactFactor * 25);
        scrollGroup.scale.setScalar(1 - contactFactor);
        scrollGroup.visible = transitionFactor > 0.02 && contactFactor < 0.98;
        
        
        if (homeGroup.visible && roomModel) {
            roomModel.rotation.y += (targetY * 0.5 - roomModel.rotation.y) * 0.1;
            roomModel.rotation.x += (targetX * 0.2 - roomModel.rotation.x) * 0.1;
        }
        
        
        if (scrollGroup.visible) {
            groundMesh.position.z = Math.sin(elapsedTime * 0.5) * 2;
            
            
            const posAttr = rain.geometry.attributes.position;
            const rainPositionArray = posAttr.array;
            
            for (let i = 0; i < RAIN_COUNT; i++) {
                const yIndex = i * 3 + 1;
                rainPositionArray[yIndex] -= rainVelocities[i];
                if (rainPositionArray[yIndex] < -20) {
                    rainPositionArray[yIndex] = 30;
                    rainPositionArray[yIndex - 1] = (Math.random() - 0.5) * 60;
                    rainPositionArray[yIndex + 1] = (Math.random() - 0.5) * 60;
                }
            }
            posAttr.needsUpdate = true;
            
            
            if (ironManModel) {
                const hoverHeight = Math.sin(elapsedTime * 2.5) * 0.3;
                ironManModel.position.y = -6 + hoverHeight;
                chestLight.position.set(0, -5 + hoverHeight, 1.5);
                ironManModel.rotation.y += (targetY - ironManModel.rotation.y) * 0.15;
                ironManModel.rotation.x += (targetX - ironManModel.rotation.x) * 0.15;
                const baseIntensity = 25 + Math.sin(elapsedTime * 5) * 10;
                chestLight.intensity = baseIntensity * transitionFactor * (1 - contactFactor);
            }
        }
        
        
        contactGroup.position.y = (1 - contactFactor) * -25;
        contactGroup.visible = contactFactor > 0.02;

        renderer.render(scene, camera);
    }
    
    animate();
    
    
    window.cleanupThreeScene = function() {
        [groundGeometry, rainGeometry].forEach(geo => geo?.dispose());
        [groundMaterial, rainMaterial].forEach(mat => mat?.dispose());
        [ironManModel, roomModel].forEach(model => {
            if (model) {
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.geometry?.dispose();
                        if (node.material) {
                            if (Array.isArray(node.material)) node.material.forEach(m => m.dispose());
                            else node.material.dispose();
                        }
                    }
                });
            }
        });
        renderer.dispose();
        renderer.domElement.remove();
    };
}
