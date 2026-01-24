import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

(function initializeThreeScene() {
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

    const RAIN_COUNT = 800;
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
        opacity: 0.8
    });
    const rain = new THREE.Points(rainGeometry, rainMaterial);
    scrollGroup.add(rain);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    
    const modelLoader = new GLTFLoader();
    modelLoader.setDRACOLoader(dracoLoader);

    let ironManModel = null;
    let roomModel = null;
    let targetX = 0;
    let targetY = 0;
    
    const tempVector = new THREE.Vector3();
    const sizeVector = new THREE.Vector3();
    const boundingBox = new THREE.Box3();
    const metalMaterialProps = { metalness: 1, roughness: 0.2 };

    modelLoader.load('assets/blender/character/iron_man.glb', (gltf) => {
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
        gltf.scene = null;
    });

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
        gltf.scene = null;
    });

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

    const rainPositionArray = rain.geometry.attributes.position.array;
    
    function animate(currentTime) {
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
            for (let i = 0; i < RAIN_COUNT; i++) {
                const yIndex = i * 3 + 1;
                rainPositionArray[yIndex] -= rainVelocities[i];
                if (rainPositionArray[yIndex] < -20) {
                    rainPositionArray[yIndex] = 30;
                    rainPositionArray[yIndex - 1] = (Math.random() - 0.5) * 60;
                    rainPositionArray[yIndex + 1] = (Math.random() - 0.5) * 60;
                }
            }
            rain.geometry.attributes.position.needsUpdate = true;
            
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
    
    animate(0);
    
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
        renderer.domElement.remove();
    };
})();

console.log(
    "%c %c SYED AHMER SHAH %c SYSTEM_INITIALIZED %c ",
    "background: #00ffff; padding:5px 0;",
    "background: #000; color: #00ffff; padding:5px 10px; font-weight: bold; border: 1px solid #00ffff;",
    "background: #00ffff; color: #000; padding:5px 10px; font-weight: bold;",
    "background: #00ffff; padding:5px 0;"
);

$(document).ready(function initializeUI() {

    const loadingBar = $('#loading-bar');
    const loadPercent = $('#load-percent');
    const dynamicQuote = $('#dynamic-quote');
    const loaderWrapper = $('#loader-wrapper');
    const typewriterElement = $("#typewriter");

    const navLinks = $(".nav-link");
    const dropdownItems = $(".dropdown-item");
    const backToTopButton = $("#backToTop");
    const navbarCollapse = $(".navbar-collapse");
    const contactForm = document.getElementById('contact-form');

    const NAVBAR_HEIGHT = 65;
    let isManualScrolling = false;


    $('html, body').css({
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
        'scroll-behavior': 'smooth'
    });


    const professionPhrases = [
        "SWE Student",
        "Full-Stack Web Developer",
        "SQL Developer",
        "WordPress Developer",
        "PHP Developer",
        "Laravel Developer",
        "SEO"
    ];

    const philosophicalQuotes = [
        "A cage went in search of a bird. — Franz Kafka",
        "Man is sometimes extraordinarily, passionately, in love with suffering. — Fyodor Dostoevsky",
        "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
        "It is better to be feared than loved, if one cannot be both. — Niccolò Machiavelli"
    ];


    if (dynamicQuote.length) {
        const randomQuoteIndex = Math.floor(Math.random() * philosophicalQuotes.length);
        dynamicQuote.text(philosophicalQuotes[randomQuoteIndex]);
    }


    let loadingProgress = 0;
    const loadingInterval = setInterval(() => {
        loadingProgress += Math.random() * 12 + 5;

        if (loadingProgress >= 96) {
            loadingProgress = 96;
            clearInterval(loadingInterval);
        }

        loadingBar.css('width', loadingProgress + '%');
        loadPercent.text(Math.floor(loadingProgress) + '%');
    }, 60);


    function initializeNavigationObserver() {
        const sectionObserver = new IntersectionObserver((entries) => {
            if (isManualScrolling) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = `#${entry.target.id}`;


                    navLinks.removeClass("active").removeAttr("aria-current");
                    dropdownItems.removeClass("active");


                    const currentLink = $(`.nav-link[href="${sectionId}"], .dropdown-item[href="${sectionId}"]`);
                    currentLink.addClass("active").attr("aria-current", "page");


                    if (currentLink.hasClass('dropdown-item')) {
                        currentLink.closest('.dropdown').find('.nav-link').addClass('active');
                    }
                }
            });
        }, {
            rootMargin: `-${NAVBAR_HEIGHT}px 0px -45% 0px`,
            threshold: 0
        });


        document.querySelectorAll("section[id]").forEach((section) => {
            sectionObserver.observe(section);
        });
    }


    function finishLoadingSequence() {
        clearInterval(loadingInterval);
        loadingBar.stop().css('width', '100%');
        loadPercent.text('100%');

        setTimeout(() => {
            if (loaderWrapper.length) {
                loaderWrapper.fadeOut(400, function () {
                    $(this).hide();
                    $('html, body').css({
                        'overflow-y': 'auto',
                        'overflow-x': 'hidden'
                    });
                    initializeNavigationObserver();
                });
            }
        }, 100);
    }


    const loadingFailsafe = setTimeout(finishLoadingSequence, 1500);

    $(window).on("load", () => {
        clearTimeout(loadingFailsafe);
        finishLoadingSequence();
    });


    let phraseIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;

    function typeWriterAnimation() {
        if (!typewriterElement.length) return;

        const currentPhrase = professionPhrases[phraseIndex];

        if (isDeleting) {
            typewriterElement.text(currentPhrase.substring(0, characterIndex - 1));
            characterIndex--;
        } else {
            typewriterElement.text(currentPhrase.substring(0, characterIndex + 1));
            characterIndex++;
        }

        let typingSpeed = isDeleting ? 40 : 80;

        if (!isDeleting && characterIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000;
        } else if (isDeleting && characterIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % professionPhrases.length;
            typingSpeed = 500;
        }

        setTimeout(typeWriterAnimation, typingSpeed);
    }

    typeWriterAnimation();


    function handleNavigationClick(event) {
        const targetId = $(this).attr("href");

        if (!targetId || targetId.startsWith("javascript")) {
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            event.preventDefault();
            isManualScrolling = true;


            navLinks.removeClass("active").removeAttr("aria-current");
            dropdownItems.removeClass("active");
            $(this).addClass("active").attr("aria-current", "page");

            if ($(this).hasClass('dropdown-item')) {
                $(this).closest('.dropdown').find('.nav-link').addClass('active');
            }


            const targetPosition = targetElement.getBoundingClientRect().top +
                window.pageYOffset - NAVBAR_HEIGHT + 1;


            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });


            setTimeout(() => {
                isManualScrolling = false;
            }, 850);


            if (navbarCollapse.hasClass("show")) {
                navbarCollapse.collapse('hide');
            }

            const offcanvasElement = document.getElementById('offcanvasNavbar');
            if (offcanvasElement && offcanvasElement.classList.contains('show')) {
                bootstrap.Offcanvas.getInstance(offcanvasElement).hide();
            }
        }
    }

    navLinks.add(dropdownItems).on("click", handleNavigationClick);


    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopButton.addClass("show");
        } else {
            backToTopButton.removeClass("show");
        }
    }, { passive: true });

    function handleBackToTop(event) {
        if (event.cancelable) {
            event.preventDefault();
        }

        if (backToTopButton.hasClass('firing')) {
            return;
        }

        backToTopButton.addClass('firing');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        setTimeout(() => {
            backToTopButton.removeClass('firing');
        }, 1000);
    }

    backToTopButton.on('click', handleBackToTop);

    const backToTopElement = document.getElementById('backToTop');
    if (backToTopElement) {
        backToTopElement.addEventListener('touchstart', handleBackToTop, { passive: false });
    }


    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[class*="reveal-"]').forEach((element) => {
        revealObserver.observe(element);
    });


    function createSectionObserver(sectionId, className) {
        const sectionElement = document.getElementById(sectionId);

        if (!sectionElement) return null;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('fog-fade-out');
                    entry.target.classList.add(className);
                    entry.target.classList.add('fog-fade-in');
                } else {
                    entry.target.classList.remove(className);
                    entry.target.classList.remove('fog-fade-in');
                    entry.target.classList.add('fog-fade-out');
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px'
        });

        observer.observe(sectionElement);
        return observer;
    }


    createSectionObserver('education', 'camera-view-left-active');
    createSectionObserver('skills', 'camera-view-right-active');
    createSectionObserver('projects', 'camera-view-up-active');
    createSectionObserver('certificates', 'camera-view-left-active');


    if (contactForm) {
        const submitButton = document.getElementById('submit-btn');

        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            submitButton.disabled = true;
            submitButton.innerHTML = "Transmitting...";

            try {
                const response = await fetch("https://formspree.io/f/xgooljlk", {
                    method: "POST",
                    body: new FormData(this),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    $('#form-success').fadeIn();
                    this.reset();
                    $(this).fadeOut();
                }
            } catch (error) {
                alert("Transmission failed.");
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = "Send Message";
            }
        });
    }


    function initializeCustomCursor() {
        const cursorCanvas = document.getElementById('cursor-canvas');


        if (!cursorCanvas || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
            if (cursorCanvas) cursorCanvas.style.display = 'none';
            return;
        }

        const cursorContext = cursorCanvas.getContext('2d', { alpha: true });
        const cursorDots = Array.from({ length: 10 }, () => ({ x: 0, y: 0 }));
        const cursorFriction = 0.4;
        let cursorVisible = false;
        let cursorPosition = { x: 0, y: 0 };


        window.addEventListener('mousemove', (event) => {
            cursorVisible = true;
            cursorPosition.x = event.clientX;
            cursorPosition.y = event.clientY;
        }, { passive: true });


        function resizeCursorCanvas() {
            cursorCanvas.width = window.innerWidth;
            cursorCanvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCursorCanvas, { passive: true });
        resizeCursorCanvas();


        function animateCursor() {
            cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

            if (cursorVisible) {
                let x = cursorPosition.x;
                let y = cursorPosition.y;

                cursorDots.forEach((dot, index) => {
                    dot.x += (x - dot.x) * cursorFriction;
                    dot.y += (y - dot.y) * cursorFriction;

                    const dotColor = index % 2 === 0 ? '#0ff0fc' : '#00ff41';
                    const dotOpacity = 1 - (index / 10);
                    const dotSize = (10 - index) * 1.1;

                    cursorContext.globalAlpha = dotOpacity;
                    cursorContext.beginPath();
                    cursorContext.fillStyle = dotColor;
                    cursorContext.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
                    cursorContext.fill();

                    x = dot.x;
                    y = dot.y;
                });
            }

            requestAnimationFrame(animateCursor);
        }

        animateCursor();
    }

    initializeCustomCursor();


    function initializeTiltEffect(elements, intensity, scale) {
        elements.forEach((element) => {
            let elementBounds = null;
            let animationFrame = null;

            function updateElementBounds() {
                elementBounds = element.getBoundingClientRect();
            }

            function handleTiltMove(event) {
                if (!elementBounds) updateElementBounds();

                const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
                const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

                if (animationFrame) cancelAnimationFrame(animationFrame);

                animationFrame = requestAnimationFrame(() => {
                    if (!elementBounds) return;

                    const rotateX = (elementBounds.height / 2 - (clientY - elementBounds.top)) / intensity;
                    const rotateY = ((clientX - elementBounds.left) - elementBounds.width / 2) / intensity;

                    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale})`;
                });
            }

            function resetTilt() {
                if (animationFrame) cancelAnimationFrame(animationFrame);
                elementBounds = null;
                element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
            }


            element.addEventListener('mouseenter', updateElementBounds, { passive: true });
            element.addEventListener('mousemove', handleTiltMove, { passive: true });
            element.addEventListener('touchstart', updateElementBounds, { passive: true });
            element.addEventListener('touchmove', handleTiltMove, { passive: true });
            element.addEventListener('mouseleave', resetTilt);
            element.addEventListener('touchend', resetTilt);
        });
    }


    initializeTiltEffect(document.querySelectorAll('.project-card'), 10, 1.05);
    initializeTiltEffect(document.querySelectorAll('.skill-item'), 15, 1.02);


    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.progress-bar').forEach((bar) => {
                    bar.style.width = bar.getAttribute('aria-valuenow') + '%';
                });
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-item').forEach((item) => {
        skillObserver.observe(item);
    });


    document.querySelectorAll('.timeline-item').forEach((item) => {
        let itemBounds = null;
        let animationFrame = null;

        function updateItemBounds() {
            itemBounds = item.getBoundingClientRect();
        }

        function handleTimelineMove(event) {
            if (!itemBounds) updateItemBounds();

            const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
            const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

            if (animationFrame) cancelAnimationFrame(animationFrame);

            animationFrame = requestAnimationFrame(() => {
                if (!itemBounds) return;

                const rotateX = (itemBounds.height / 2 - (clientY - itemBounds.top)) / 10;
                const rotateY = ((clientX - itemBounds.left) - itemBounds.width / 2) / 10;

                item.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(50px)`;
            });
        }

        function resetTimeline() {
            if (animationFrame) cancelAnimationFrame(animationFrame);
            itemBounds = null;
            item.style.transform = `perspective(2000px) rotateX(0) rotateY(0) translateZ(0)`;
        }


        item.addEventListener('mouseenter', updateItemBounds, { passive: true });
        item.addEventListener('mousemove', handleTimelineMove, { passive: true });
        item.addEventListener('touchstart', updateItemBounds, { passive: true });
        item.addEventListener('touchmove', handleTimelineMove, { passive: true });
        item.addEventListener('mouseleave', resetTimeline);
        item.addEventListener('touchend', resetTimeline);
    });


    const glowingTextElement = document.querySelector('.glowing-text');
    const neonBorderElement = document.querySelector('.neon-border');

    if (glowingTextElement && neonBorderElement) {
        const originalText = glowingTextElement.innerText;
        const glitchCharacters = '!<>-_\\/[]{}—=+*^?________';
        let glitchAnimationId = null;

        neonBorderElement.addEventListener('mouseenter', () => {
            if (glitchAnimationId) cancelAnimationFrame(glitchAnimationId);

            const animationStart = performance.now();

            function updateGlitch(currentTime) {
                const iteration = (currentTime - animationStart) / 50;

                glowingTextElement.innerText = originalText.split('').map((character, index) => {
                    return index < iteration ? character : glitchCharacters[Math.floor(Math.random() * glitchCharacters.length)];
                }).join('');

                if (iteration < originalText.length) {
                    glitchAnimationId = requestAnimationFrame(updateGlitch);
                } else {
                    glowingTextElement.innerText = originalText;
                }
            }

            glitchAnimationId = requestAnimationFrame(updateGlitch);
        });
    }


    const aboutBoxElement = document.querySelector('#about .neon-border');

    if (aboutBoxElement) {
        let aboutBoxBounds = null;

        function updateAboutBoxBounds() {
            aboutBoxBounds = aboutBoxElement.getBoundingClientRect();
        }

        function resetAboutBoxEffect() {
            aboutBoxBounds = null;
            aboutBoxElement.style.transform = `rotateX(0) rotateY(0)`;
            aboutBoxElement.style.setProperty('--shine-x', '50%');
            aboutBoxElement.style.setProperty('--shine-y', '50%');
        }

        function handleAboutBoxMove(event) {
            if (window.innerWidth < 992) return;
            if (!aboutBoxBounds) updateAboutBoxBounds();

            const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
            const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

            requestAnimationFrame(() => {
                if (!aboutBoxBounds) return;

                const rotateX = (aboutBoxBounds.height / 2 - (clientY - aboutBoxBounds.top)) / 20;
                const rotateY = ((clientX - aboutBoxBounds.left) - aboutBoxBounds.width / 2) / 30;

                aboutBoxElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                aboutBoxElement.style.setProperty('--shine-x', `${((clientX - aboutBoxBounds.left) - aboutBoxBounds.width / 2) / 15 * 2}%`);
                aboutBoxElement.style.setProperty('--shine-y', `${-(aboutBoxBounds.height / 2 - (clientY - aboutBoxBounds.top)) / 10 * 2}%`);
            });
        }


        window.addEventListener('mousemove', (event) => {
            if (window.innerWidth < 992 || !aboutBoxElement) return;

            if (!aboutBoxBounds) updateAboutBoxBounds();

            const isMouseOverBox = (
                event.clientX >= aboutBoxBounds.left &&
                event.clientX <= aboutBoxBounds.right &&
                event.clientY >= aboutBoxBounds.top &&
                event.clientY <= aboutBoxBounds.bottom
            );

            isMouseOverBox ? handleAboutBoxMove(event) : resetAboutBoxEffect();
        }, { passive: true });


        aboutBoxElement.addEventListener('touchstart', updateAboutBoxBounds, { passive: true });
        aboutBoxElement.addEventListener('touchmove', handleAboutBoxMove, { passive: true });
        aboutBoxElement.addEventListener('mouseleave', resetAboutBoxEffect);
        aboutBoxElement.addEventListener('touchend', resetAboutBoxEffect);
    }
});