import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let renderer;
(function () {
    const container = document.getElementById('three-bg-container');
    if (!container) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5, 60);

    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 15);

    const homeGroup = new THREE.Group();
    const scrollGroup = new THREE.Group();
    const contactGroup = new THREE.Group();
    scene.add(homeGroup, scrollGroup, contactGroup);

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

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 4);
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    const chestLight = new THREE.PointLight(0x00f0ff, 20, 15);
    scrollGroup.add(chestLight);

    const geometry = new THREE.PlaneGeometry(120, 120, 40, 40);
    const meshGround = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1
    }));
    meshGround.rotation.x = -Math.PI / 2;
    meshGround.position.y = -6;
    scrollGroup.add(meshGround);

    const rainCount = 1500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i++) rainPos[i] = (Math.random() - 0.5) * 60;
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.06 }));
    scrollGroup.add(rain);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let ironMan = null, targetX = 0, targetY = 0;

    loader.load('assets/blender/character/iron_man.glb', (gltf) => {
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
    loader.load('assets/blender/background/background_room.glb', (gltf) => {
        roomModel = gltf.scene;
        const box = new THREE.Box3().setFromObject(roomModel);
        const size = box.getSize(new THREE.Vector3());
        const scaleFactor = 30 / Math.max(size.x, size.y, size.z);
        roomModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
        roomModel.position.y = -4;
        homeGroup.add(roomModel);
    });

    function updateInput(x, y) {
        targetY = (x / window.innerWidth - 0.5) * 1.5;
        targetX = (y / window.innerHeight - 0.5) * 0.8;
    }

    document.addEventListener('mousemove', (e) => {
        updateInput(e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            updateInput(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    let transitionFactor = 0;
    let contactTransition = 0;

    function animate() {
        requestAnimationFrame(animate);
        const time = performance.now() * 0.001;
        const scrollPos = window.scrollY;
        const viewportHeight = window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight;

        const targetFactor = THREE.MathUtils.clamp(scrollPos / (viewportHeight * 0.8), 0, 1);
        transitionFactor = THREE.MathUtils.lerp(transitionFactor, targetFactor, 0.08);

        const isAtBottom = (window.innerHeight + scrollPos) >= (totalHeight - 750);
        const targetContactFactor = isAtBottom ? 1 : 0;
        contactTransition = THREE.MathUtils.lerp(contactTransition, targetContactFactor, 0.08);

        homeGroup.position.y = transitionFactor * 25;
        homeGroup.scale.set(1 - transitionFactor, 1 - transitionFactor, 1 - transitionFactor);
        homeGroup.visible = transitionFactor < 0.98;

        scrollGroup.position.y = ((1 - transitionFactor) * -25) + (contactTransition * 25);
        scrollGroup.scale.set(1 - contactTransition, 1 - contactTransition, 1 - contactTransition);
        scrollGroup.visible = transitionFactor > 0.02 && contactTransition < 0.98;

        contactGroup.position.y = (1 - contactTransition) * -25;
        contactGroup.visible = contactTransition > 0.02;

        if (homeGroup.visible && roomModel) {
            roomModel.rotation.y = THREE.MathUtils.lerp(roomModel.rotation.y, targetY * 0.5, 0.1);
            roomModel.rotation.x = THREE.MathUtils.lerp(roomModel.rotation.x, targetX * 0.2, 0.1);
        }

        if (scrollGroup.visible) {
            const posAttr = meshGround.geometry.attributes.position;
            for (let i = 0; i < posAttr.count; i++) {
                posAttr.setZ(i, Math.sin(posAttr.getX(i) * 0.3 + time) * 0.5);
            }
            posAttr.needsUpdate = true;

            const rPos = rain.geometry.attributes.position.array;
            for (let i = 1; i < rPos.length; i += 3) {
                rPos[i] -= 0.22;
                if (rPos[i] < -20) rPos[i] = 30;
            }
            rain.geometry.attributes.position.needsUpdate = true;

            if (ironMan) {
                const hoverY = -5.0 + Math.sin(time * 2.5) * 0.2;
                ironMan.position.y = hoverY;
                chestLight.position.set(0, hoverY + 6.5, 1.5);
                ironMan.rotation.y = THREE.MathUtils.lerp(ironMan.rotation.y, targetY, 0.15);
                ironMan.rotation.x = THREE.MathUtils.lerp(ironMan.rotation.x, targetX, 0.15);
                chestLight.intensity = (20 + Math.sin(time * 5) * 8) * transitionFactor * (1 - contactTransition);
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
    const quotes = [
        "A cage went in search of a bird. — Franz Kafka",
        "Man is sometimes extraordinarily, passionately, in love with suffering. — Fyodor Dostoevsky",
        "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
        "It is better to be feared than loved, if one cannot be both. — Niccolò Machiavelli"
    ];


    if ($quote.length) $quote.text(quotes[Math.floor(Math.random() * quotes.length)]);

    let loadWidth = 0;
    const loadingInterval = setInterval(() => {
        loadWidth += Math.random() * 12 + 5;
        if (loadWidth >= 96) {
            loadWidth = 96;
            clearInterval(loadingInterval);
        }
        $bar.css('width', loadWidth + '%');
        $percentText.text(Math.floor(loadWidth) + '%');
    }, 60);

    const finishLoading = () => {
        clearInterval(loadingInterval);
        $bar.stop().css('width', '100%');
        $percentText.text('100%');
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

    const failsafe = setTimeout(finishLoading, 3000);

    $(window).on("load", function () {
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
        const position = window.pageYOffset;
        position > 300 ? upBtn.addClass("show") : upBtn.removeClass("show");
        for (let i = 0, len = sections.length; i < len; i++) {
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
            window.addEventListener('mousemove', (e) => { isVisible = true; mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
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
            window.addEventListener('resize', () => { cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight; }, { passive: true });
            cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight;
            animateCursor();
        } else {
            cursorCanvas.style.display = 'none';
        }
    }
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
        card.style.transform = `perspective(1000px) translateY(-2px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
};

const resetRotation = (card) => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
};

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => applyRotation(card, e.clientX, e.clientY), { passive: true });
    card.addEventListener('touchmove', (e) => applyRotation(card, e.touches[0].clientX, e.touches[0].clientY), { passive: false });
    card.addEventListener('mouseleave', () => resetRotation(card));
    card.addEventListener('touchend', () => resetRotation(card));
});

window.addEventListener('deviceorientation', (event) => {
    if (!ticking && window.innerWidth < 768) {
        window.requestAnimationFrame(() => {
            const beta = event.beta || 0;
            const gamma = event.gamma || 0;
            let rX = (beta - 45) / 3;
            let rY = gamma / 3;
            cards.forEach(c => c.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg)`);
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

const skillCards = document.querySelectorAll('.skill-item');
const applySkillTilt = (card, x, y) => {
    const rect = card.getBoundingClientRect();
    const rotateX = (rect.height / 2 - (y - rect.top)) / 15;
    const rotateY = ((x - rect.left) - rect.width / 2) / 15;
    window.requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
};

skillCards.forEach(card => {
    card.addEventListener('mousemove', (e) => applySkillTilt(card, e.clientX, e.clientY), { passive: true });
    card.addEventListener('touchmove', (e) => applySkillTilt(card, e.touches[0].clientX, e.touches[0].clientY), { passive: false });
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

document.querySelectorAll('.timeline-item').forEach(item => {
    let rect, rafId;
    const handleMove = (e) => {
        if (!rect) rect = item.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        const rotateX = (rect.height / 2 - (clientY - rect.top)) / 10;
        const rotateY = ((clientX - rect.left) - rect.width / 2) / 10;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            item.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(50px)`;
        });
    };
    const handleReset = () => {
        rect = null;
        if (rafId) cancelAnimationFrame(rafId);
        item.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    };
    item.addEventListener('mousemove', handleMove, { passive: true });
    item.addEventListener('mouseleave', handleReset);
    item.addEventListener('touchstart', (e) => { rect = item.getBoundingClientRect(); }, { passive: true });
    item.addEventListener('touchmove', handleMove, { passive: true });
    item.addEventListener('touchend', handleReset);
});

const textElement = document.querySelector('.glowing-text');
const trigger = document.querySelector('.neon-border');
if (textElement && trigger) {
    const originalText = textElement.innerText;
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let frameId = null;
    function scramble() {
        if (frameId) cancelAnimationFrame(frameId);
        const startTime = performance.now();
        function update(currentTime) {
            const iteration = (currentTime - startTime) / 50;
            let result = "";
            for (let i = 0; i < originalText.length; i++) {
                result += i < iteration ? originalText[i] : chars[Math.floor(Math.random() * chars.length)];
            }
            textElement.innerText = result;
            if (iteration < originalText.length) frameId = requestAnimationFrame(update);
            else textElement.innerText = originalText;
        }
        frameId = requestAnimationFrame(update);
    }
    trigger.addEventListener('mouseenter', scramble);
    trigger.addEventListener('touchstart', scramble, { passive: true });
}

(function () {
    const aboutBox = document.querySelector('#about .neon-border');
    if (!aboutBox) return;

    const update3D = (x, y) => {
        aboutBox.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
        aboutBox.style.setProperty('--shine-x', `${y * 2}%`);
        aboutBox.style.setProperty('--shine-y', `${-x * 2}%`);
    };

    const resetPosition = () => {
        aboutBox.style.transform = `rotateX(0deg) rotateY(0deg)`;
        aboutBox.style.setProperty('--shine-x', `50%`);
        aboutBox.style.setProperty('--shine-y', `50%`);
    };

    const handleInput = (clientX, clientY) => {
        const rect = aboutBox.getBoundingClientRect();
        const x = (rect.height / 2 - (clientY - rect.top)) / 20;
        const y = ((clientX - rect.left) - rect.width / 2) / 30;
        update3D(x, y);
    };

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 992) return;
        const rect = aboutBox.getBoundingClientRect();
        if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        ) {
            handleInput(e.clientX, e.clientY);
        } else {
            resetPosition();
        }
    });

    aboutBox.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        handleInput(touch.clientX, touch.clientY);
    }, { passive: true });

    aboutBox.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        handleInput(touch.clientX, touch.clientY);
    }, { passive: true });

    aboutBox.addEventListener('mouseleave', resetPosition);
    aboutBox.addEventListener('touchend', resetPosition);
    aboutBox.addEventListener('touchcancel', resetPosition);
})();