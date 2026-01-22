import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let renderer;
(function () {
    const container = document.getElementById('three-bg-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5, 45);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 15);

    const homeGroup = new THREE.Group();
    const scrollGroup = new THREE.Group();
    scene.add(homeGroup);
    scene.add(scrollGroup);

    renderer = new THREE.WebGLRenderer({ 
        antialias: window.innerWidth > 768, 
        alpha: true, 
        powerPreference: "high-performance" 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace; 
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3.0;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const mainLight = new THREE.DirectionalLight(0xffffff, 3);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const chestLight = new THREE.PointLight(0x00f0ff, 20, 15);
    scrollGroup.add(chestLight);

    const geometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const meshGround = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1
    }));
    meshGround.rotation.x = -Math.PI / 2;
    meshGround.position.y = -6;
    scrollGroup.add(meshGround);

    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i++) rainPos[i] = (Math.random() - 0.5) * 40;
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.05 }));
    scrollGroup.add(rain);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let ironMan = null, targetX = 0, targetY = 0;
    loader.load('assets/character/iron_man.glb', (gltf) => {
        ironMan = gltf.scene;
        ironMan.traverse(node => {
            if (node.isMesh) {
                node.material.metalness = 1;
                node.material.roughness = 0.2;
            }
        });
        const box = new THREE.Box3().setFromObject(ironMan);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = 9.5 / Math.max(size.x, size.y, size.z);
        ironMan.scale.set(scaleFactor, scaleFactor, scaleFactor);
        ironMan.position.set(-center.x * scaleFactor, -5.5, -center.z * scaleFactor);
        scrollGroup.add(ironMan);
    });

    let roomModel = null;
    loader.load('assets/background/background_room.glb', (gltf) => {
        roomModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(roomModel);
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = 25 / Math.max(size.x, size.y, size.z);
        roomModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        roomModel.position.y = -4; 
        homeGroup.add(roomModel);
    });

    document.addEventListener('mousemove', (e) => {
        targetY = (e.clientX / window.innerWidth - 0.5) * 1.0; 
        targetX = (e.clientY / window.innerHeight - 0.5) * 0.4;
        if (renderer.toneMappingExposure < 4.0) renderer.toneMappingExposure += 0.05;
    }, { passive: true });

    let transitionFactor = 0; 

    function animate() {
        requestAnimationFrame(animate);
        const time = performance.now() * 0.001;
        const scrollPos = window.scrollY;
        const viewportHeight = window.innerHeight;

        const targetFactor = THREE.MathUtils.clamp(scrollPos / (viewportHeight * 0.8), 0, 1);
        transitionFactor = THREE.MathUtils.lerp(transitionFactor, targetFactor, 0.08);

        homeGroup.position.y = transitionFactor * 20;
        homeGroup.scale.set(1 - transitionFactor, 1 - transitionFactor, 1 - transitionFactor);
        homeGroup.visible = transitionFactor < 0.95;

        scrollGroup.position.y = (1 - transitionFactor) * -20;
        scrollGroup.visible = transitionFactor > 0.05;

        if (homeGroup.visible && roomModel) {
            roomModel.rotation.y = THREE.MathUtils.lerp(roomModel.rotation.y, targetY * 0.5, 0.05);
            roomModel.rotation.x = THREE.MathUtils.lerp(roomModel.rotation.x, targetX * 0.2, 0.05);
        }

        if (scrollGroup.visible) {
            const posAttr = meshGround.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                const x = posAttr.getX(i);
                posAttr.setZ(i, Math.sin(x * 0.3 + time) * 0.4);
            }
            posAttr.needsUpdate = true;

            const rPos = rain.geometry.attributes.position.array;
            for (let i = 1; i < rPos.length; i += 3) {
                rPos[i] -= 0.18;
                if (rPos[i] < -15) rPos[i] = 25;
            }
            rain.geometry.attributes.position.needsUpdate = true;

            if (ironMan) {
                const hoverY = -5.0 + Math.sin(time * 2) * 0.15;
                ironMan.position.y = hoverY;
                chestLight.position.set(0, hoverY + 6.5, 1.5);
                ironMan.rotation.y = THREE.MathUtils.lerp(ironMan.rotation.y, targetY, 0.1);
                ironMan.rotation.x = THREE.MathUtils.lerp(ironMan.rotation.x, targetX, 0.1);
                chestLight.intensity = (18 + Math.sin(time * 4) * 6) * transitionFactor;
            }
        }

        if (renderer.toneMappingExposure > 3.0) renderer.toneMappingExposure -= 0.03;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });

    $('.offcanvas-body .nav-link').on('click', function() {
        if(renderer) renderer.toneMappingExposure = 3.0; 
    });
})();

console.log(
    "%c %c SYED AHMER SHAH %c SYSTEM_INITIALIZED %c ",
    "background: #00ffff; padding:5px 0;",
    "background: #000; color: #00ffff; padding:5px 10px; font-weight: bold; border: 1px solid #00ffff;",
    "background: #00ffff; color: #000; padding:5px 10px; font-weight: bold;",
    "background: #00ffff; padding:5px 0;"
);

$(document).ready(function () {
    const $bar = $('#loading-bar'), $percentText = $('#load-percent'), $quote = $('#dynamic-quote'), $wrapper = $('#loader-wrapper'), $typeElement = $("#typewriter");
    const navBtn = $(".nav-link"), upBtn = $("#backToTop"), navbarCollapse = $(".navbar-collapse"), contactForm = document.getElementById('contact-form');
    const navHeight = 65;

    $('html, body').css({ 'overflow-x': 'hidden', 'overflow-y': 'hidden', 'scroll-behavior': 'smooth' });

    const phrases = ["SWE Student", "Full-Stack Web Developer", "SQL Developer", "WordPress Developer", "PHP Developer", "Laravel Developer", "SEO"];
    const quotes = ["Initializing the inevitable...", "Calculated risks. High rewards.", "Reality is a simulation. Master the code.", "The Titan awakens in the silence."];
    $quote.text(quotes[Math.floor(Math.random() * quotes.length)]);
    
    let loadWidth = 0;
    const loadingInterval = setInterval(() => {
        loadWidth += Math.random() * 12 + 5;
        if (loadWidth >= 96) {
            loadWidth = 96;
            clearInterval(loadingInterval);
        }
        if ($bar.length) $bar.css('width', loadWidth + '%');
        if ($percentText.length) $percentText.text(Math.floor(loadWidth) + '%');
    }, 60);

    const finishLoading = () => {
        clearInterval(loadingInterval);
        if ($bar.length) $bar.stop().css('width', '100%');
        if ($percentText.length) $percentText.text('100%');
        updateSectionCache();
        setTimeout(() => {
            if ($wrapper.length) {
                $wrapper.fadeOut(600, function () { 
                    $(this).hide(); 
                    $('html, body').css({ 'overflow-y': 'auto', 'overflow-x': 'hidden' });
                });
            }
        }, 200);
    };

    const failsafe = setTimeout(() => {
        finishLoading();
    }, 3000);

    $(window).on("load", function() {
        clearTimeout(failsafe);
        finishLoading();
    });

    let pIdx = 0, cIdx = 0, isDeleting = false;
    function type() {
        if (!$typeElement.length) return;
        const currentPhrase = phrases[pIdx];
        $typeElement.text(currentPhrase.substring(0, isDeleting ? cIdx - 1 : cIdx + 1));
        isDeleting ? cIdx-- : cIdx++;
        let typeSpeed = isDeleting ? 40 : 80;
        if (!isDeleting && cIdx === currentPhrase.length) { isDeleting = true; typeSpeed = 2000; } 
        else if (isDeleting && cIdx === 0) { isDeleting = false; pIdx = (pIdx + 1) % phrases.length; typeSpeed = 500; }
        setTimeout(type, typeSpeed);
    }
    type();

    let sections = [];
    function updateSectionCache() {
        sections = []; 
        navBtn.each(function () {
            const targetId = $(this).attr("href");
            const $target = $(targetId);
            if ($target.length) {
                const top = $target.offset().top;
                sections.push({
                    el: $(this),
                    top: top - navHeight - 50, 
                    bottom: top + $target.outerHeight() - navHeight
                });
            }
        });
    }
    
    let resizeTimer;
    $(window).on("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateSectionCache, 200); 
    });

    navBtn.on("click", function (e) {
        const sectionId = $(this).attr("href");
        const $section = $(sectionId);
        if ($section.length) {
            e.preventDefault();
            $("html, body").stop().animate({ scrollTop: $section.offset().top - navHeight }, 800);
            if (navbarCollapse.hasClass("show")) navbarCollapse.collapse('hide');
        }
    });

    $(window).on("scroll", function () {
        const position = window.scrollY || window.pageYOffset;
        position > 300 ? upBtn.addClass("show") : upBtn.removeClass("show");
        for (let i = 0; i < sections.length; i++) {
            if (position >= sections[i].top && position < sections[i].bottom) {
                navBtn.removeClass("active").removeAttr("aria-current");
                sections[i].el.addClass("active").attr("aria-current", "page");
                break;
            }
        }
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('[class*="reveal-"]').forEach(el => revealObserver.observe(el));

    if (contactForm) {
        const submitBtn = document.getElementById('submit-btn');
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            submitBtn.disabled = true; submitBtn.innerHTML = "Transmitting...";
            try {
                const response = await fetch("https://formspree.io/f/xgooljlk", {
                    method: "POST", body: new FormData(this), headers: { 'Accept': 'application/json' }
                });
                if (response.ok) { $('#form-success').fadeIn(); this.reset(); $(this).fadeOut(); }
            } catch (error) { alert("Transmission failed."); } 
            finally { submitBtn.disabled = false; submitBtn.innerHTML = "Send Message"; }
        });
    }

    const cursorCanvas = document.getElementById('cursor-canvas');
if (cursorCanvas) {
    const ctx = cursorCanvas.getContext('2d');
    let mouse = { x: 0, y: 0 }, dots = [], totalDots = 12, friction = 0.4, isVisible = false;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        for (let i = 0; i < totalDots; i++) dots.push({ x: 0, y: 0 });
        window.addEventListener('mousemove', (e) => { isVisible = true; mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseout', () => { isVisible = false; });

        function animateCursor() {
            ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
            if (isVisible) {
                let x = mouse.x, y = mouse.y;
                dots.forEach((dot, index) => {
                    dot.x += (x - dot.x) * friction; dot.y += (y - dot.y) * friction;
                    const color = index % 2 === 0 ? '#0ff0fc' : '#00ff41';
                    ctx.globalAlpha = 1 - (index / totalDots);
                    ctx.beginPath(); ctx.fillStyle = color;
                    const size = (totalDots - index) * 1.1;
                    ctx.shadowBlur = 10; ctx.shadowColor = color;
                    ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2); ctx.fill();
                    if (index > 0) {
                        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.5;
                        ctx.moveTo(dots[index - 1].x, dots[index - 1].y); ctx.lineTo(dot.x, dot.y); ctx.stroke();
                    }
                    x = dot.x; y = dot.y;
                });
            }
            requestAnimationFrame(animateCursor);
        }
        window.addEventListener('resize', () => { cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight; });
        cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight;
        animateCursor();
    } else {
        cursorCanvas.style.display = 'none';
    }
};
});

const cards = document.querySelectorAll('.project-card');
let ticking = false;

const applyRotation = (card, x, y) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (centerY - (y - rect.top)) / 10;
    const rotateY = ((x - rect.left) - centerX) / 10;

    window.requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
};

const resetRotation = (card) => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
};

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        applyRotation(card, e.clientX, e.clientY);
    });

    card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        applyRotation(card, touch.clientX, touch.clientY);
    }, { passive: false });

    card.addEventListener('mouseleave', () => resetRotation(card));
    card.addEventListener('touchend', () => resetRotation(card));
});

window.addEventListener('deviceorientation', (event) => {
    if (!ticking && window.innerWidth < 768) {
        window.requestAnimationFrame(() => {
            let rX = (event.beta - 45) / 3;
            let rY = event.gamma / 3;
            cards.forEach(c => {
                c.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)`;
            });
            ticking = false;
        });
        ticking = true;
    }
});

const skillCards = document.querySelectorAll('.skill-item');

const applySkillTilt = (card, x, y) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (centerY - (y - rect.top)) / 15;
    const rotateY = ((x - rect.left) - centerX) / 15;

    window.requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
};

skillCards.forEach(card => {
   
    card.addEventListener('mousemove', (e) => applySkillTilt(card, e.clientX, e.clientY));
    
    card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        applySkillTilt(card, touch.clientX, touch.clientY);
    }, { passive: false });

    const reset = () => card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.addEventListener('mouseleave', reset);
    card.addEventListener('touchend', reset);
});

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.progress-bar').forEach(bar => {
                bar.style.width = bar.getAttribute('aria-valuenow') + '%';
            });
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.skill-item').forEach(item => skillObserver.observe(item));

const educationItems = document.querySelectorAll('.timeline-item');

educationItems.forEach(item => {
    let rect, rafId, isMoving = false;

    const handleEnter = () => {
        rect = item.getBoundingClientRect();
        isMoving = true;
    };

    const handleMove = (e) => {
        if (!isMoving || !rect) return;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const rotateX = (rect.height / 2 - y) / 50;
        const rotateY = (x - rect.width / 2) / 100;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(10px) translateZ(20px)`;
        });
    };

    const handleReset = () => {
        isMoving = false;
        if (rafId) cancelAnimationFrame(rafId);
        item.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateZ(0px)`;
    };

    item.addEventListener('mouseenter', handleEnter, { passive: true });
    item.addEventListener('mousemove', handleMove, { passive: true });
    item.addEventListener('mouseleave', handleReset, { passive: true });

    item.addEventListener('touchstart', handleEnter, { passive: true });
    item.addEventListener('touchmove', handleMove, { passive: true });
    item.addEventListener('touchend', handleReset, { passive: true });
});

const textElement = document.querySelector('.glowing-text');
const trigger = document.querySelector('.neon-border');
const originalText = textElement.innerText;
const chars = '!<>-_\\/[]{}—=+*^?#________';
let frameId = null;

function scramble() {
    if (frameId) cancelAnimationFrame(frameId);

    let iteration = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        iteration = elapsed / 50; 

        let result = "";
        for (let i = 0; i < originalText.length; i++) {
            if (i < iteration) {
                result += originalText[i];
            } else {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }

        textElement.innerText = result;

        if (iteration < originalText.length) {
            frameId = requestAnimationFrame(update);
        } else {
            textElement.innerText = originalText;
            frameId = null;
        }
    }

    frameId = requestAnimationFrame(update);
}

trigger.addEventListener('mouseenter', scramble);
trigger.addEventListener('touchstart', scramble, { passive: true });