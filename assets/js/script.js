import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

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

    const renderer = new THREE.WebGLRenderer({
        antialias: window.innerWidth > 768,
        alpha: true,
        powerPreference: "high-performance",
        precision: "lowp"
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

    const groundGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    const meshGround = new THREE.Mesh(groundGeo, new THREE.MeshBasicMaterial({
        color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1
    }));
    meshGround.rotation.x = -Math.PI / 2;
    meshGround.position.y = -6;
    scrollGroup.add(meshGround);

    const rainCount = 1200;
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

    let ironMan, roomModel, targetX = 0, targetY = 0;
    const v3 = new THREE.Vector3(), box = new THREE.Box3();

    loader.load('assets/blender/character/iron_man.glb', (gltf) => {
        ironMan = gltf.scene;
        ironMan.traverse(n => {
            if (n.isMesh) {
                n.material.metalness = 1;
                n.material.roughness = 0.2;
            }
        });
        box.setFromObject(ironMan);
        const center = box.getCenter(v3.clone()), size = box.getSize(v3.clone());
        const s = 9.5 / Math.max(size.x, size.y, size.z);
        ironMan.scale.set(s, s, s);
        ironMan.position.set(-center.x * s, -5.5, -center.z * s);
        scrollGroup.add(ironMan);
    });

    loader.load('assets/blender/background/background_room.glb', (gltf) => {
        roomModel = gltf.scene;
        box.setFromObject(roomModel);
        const size = box.getSize(v3.clone());
        const s = 30 / Math.max(size.x, size.y, size.z);
        roomModel.scale.set(s, s, s);
        roomModel.position.y = -4;
        homeGroup.add(roomModel);
    });

    const updateIn = (x, y) => {
        targetY = (x / window.innerWidth - 0.5) * 1.5;
        targetX = (y / window.innerHeight - 0.5) * 0.8;
    };

    document.addEventListener('mousemove', (e) => updateIn(e.clientX, e.clientY), { passive: true });
    document.addEventListener('touchmove', (e) => e.touches[0] && updateIn(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

    let tF = 0, cF = 0;
    const clock = new THREE.Clock();

    let currentScrollY = 0;
    let cachedTotalH = 2000;
    let cachedWinH = 800;

    window.addEventListener('load', () => {
        currentScrollY = window.pageYOffset;
        cachedTotalH = document.documentElement.scrollHeight;
        cachedWinH = window.innerHeight;
    });

    window.addEventListener('scroll', () => {
        currentScrollY = window.pageYOffset;
    }, { passive: true });

    window.addEventListener('resize', () => {
        cachedTotalH = document.documentElement.scrollHeight;
        cachedWinH = window.innerHeight;
        camera.aspect = window.innerWidth / cachedWinH;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, cachedWinH);
    }, { passive: true });

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        tF = THREE.MathUtils.lerp(tF, THREE.MathUtils.clamp(currentScrollY / (cachedWinH * 0.8), 0, 1), 0.08);
        cF = THREE.MathUtils.lerp(cF, (cachedWinH + currentScrollY) >= (cachedTotalH - 750) ? 1 : 0, 0.08);

        homeGroup.position.y = tF * 25;
        homeGroup.scale.setScalar(1 - tF);
        homeGroup.visible = tF < 0.98;

        scrollGroup.position.y = ((1 - tF) * -25) + (cF * 25);
        scrollGroup.scale.setScalar(1 - cF);
        scrollGroup.visible = tF > 0.02 && cF < 0.98;

        contactGroup.position.y = (1 - cF) * -25;
        contactGroup.visible = cF > 0.02;

        if (homeGroup.visible && roomModel) {
            roomModel.rotation.y = THREE.MathUtils.lerp(roomModel.rotation.y, targetY * 0.5, 0.1);
            roomModel.rotation.x = THREE.MathUtils.lerp(roomModel.rotation.x, targetX * 0.2, 0.1);
        }

        if (scrollGroup.visible) {
            const gPos = meshGround.geometry.attributes.position;
            for (let i = 0; i < gPos.count; i++) {
                gPos.setZ(i, Math.sin(gPos.getX(i) * 0.3 + time) * 0.5);
            }
            gPos.needsUpdate = true;

            const rP = rain.geometry.attributes.position.array;
            for (let i = 1; i < rP.length; i += 3) {
                rP[i] -= 0.22;
                if (rP[i] < -20) rP[i] = 30;
            }
            rain.geometry.attributes.position.needsUpdate = true;

            if (ironMan) {
                const hY = -5.0 + Math.sin(time * 2.5) * 0.2;
                ironMan.position.y = hY;
                chestLight.position.set(0, hY + 6.5, 1.5);
                ironMan.rotation.y = THREE.MathUtils.lerp(ironMan.rotation.y, targetY, 0.15);
                ironMan.rotation.x = THREE.MathUtils.lerp(ironMan.rotation.x, targetX, 0.15);
                chestLight.intensity = (20 + Math.sin(time * 5) * 8) * tF * (1 - cF);
            }
        }
        renderer.render(scene, camera);
    }
    animate();
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
    let isScrollingManual = false;

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
        if (loadWidth >= 96) { loadWidth = 96; clearInterval(loadingInterval); }
        $bar.css('width', loadWidth + '%');
        $percentText.text(Math.floor(loadWidth) + '%');
    }, 60);

    const initNavObserver = () => {
        const observer = new IntersectionObserver((entries) => {
            if (isScrollingManual) return;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = `#${entry.target.id}`;
                    navBtn.removeClass("active").removeAttr("aria-current");
                    $(`.nav-link[href="${id}"]`).addClass("active").attr("aria-current", "page");
                }
            });
        }, { rootMargin: `-${navHeight}px 0px -45% 0px`, threshold: 0 });
        document.querySelectorAll("section[id]").forEach(section => observer.observe(section));
    };

    const finishLoading = () => {
        clearInterval(loadingInterval);
        $bar.stop().css('width', '100%');
        $percentText.text('100%');
        setTimeout(() => {
            if ($wrapper.length) {
                $wrapper.fadeOut(400, function () {
                    $(this).hide();
                    $('html, body').css({ 'overflow-y': 'auto', 'overflow-x': 'hidden' });
                    initNavObserver();
                });
            }
        }, 100);
    };

    const failsafe = setTimeout(finishLoading, 1500);
    $(window).on("load", () => { clearTimeout(failsafe); finishLoading(); });

    let pIdx = 0, cIdx = 0, isDeleting = false;
    (function type() {
        if (!$typeElement.length) return;
        const currentPhrase = phrases[pIdx];
        $typeElement.text(currentPhrase.substring(0, isDeleting ? cIdx - 1 : cIdx + 1));
        isDeleting ? cIdx-- : cIdx++;
        let speed = isDeleting ? 40 : 80;
        if (!isDeleting && cIdx === currentPhrase.length) { isDeleting = true; speed = 2000; }
        else if (isDeleting && cIdx === 0) { isDeleting = false; pIdx = (pIdx + 1) % phrases.length; speed = 500; }
        setTimeout(type, speed);
    })();

    navBtn.on("click", function (e) {
        const id = $(this).attr("href"), targetEl = document.querySelector(id);
        if (targetEl) {
            e.preventDefault();
            isScrollingManual = true;
            navBtn.removeClass("active").removeAttr("aria-current");
            $(this).addClass("active").attr("aria-current", "page");
            const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });
            setTimeout(() => { isScrollingManual = false; }, 850);
            if (navbarCollapse.hasClass("show")) navbarCollapse.collapse('hide');
        }
    });


    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            upBtn.addClass("show");
        } else {
            upBtn.removeClass("show");
        }
    }, { passive: true });

    function firePistol(e) {
        if (e.cancelable) {
            e.preventDefault();
        }

        if (upBtn.hasClass('firing')) return;

        upBtn.addClass('firing');

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        setTimeout(() => {
            upBtn.removeClass('firing');
        }, 1000);
    }

    upBtn.on('click', firePistol);

    const btnElement = document.getElementById('backToTop');
    if (btnElement) {
        btnElement.addEventListener('touchstart', firePistol, { passive: false });
    }
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
                const res = await fetch("https://formspree.io/f/xgooljlk", {
                    method: "POST", body: new FormData(this), headers: { 'Accept': 'application/json' }
                });
                if (res.ok) { $('#form-success').fadeIn(); this.reset(); $(this).fadeOut(); }
            } catch (err) { alert("Transmission failed."); }
            finally { submitBtn.disabled = false; submitBtn.innerHTML = "Send Message"; }
        });
    }

    const initCursor = () => {
        const cursorCanvas = document.getElementById('cursor-canvas');
        if (!cursorCanvas || 'ontouchstart' in window || navigator.maxTouchPoints > 0) return cursorCanvas && (cursorCanvas.style.display = 'none');
        const ctx = cursorCanvas.getContext('2d', { alpha: true });
        let mouse = { x: 0, y: 0 }, dots = Array.from({ length: 10 }, () => ({ x: 0, y: 0 })), friction = 0.4, isVisible = false;
        window.addEventListener('mousemove', (e) => { isVisible = true; mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
        window.addEventListener('resize', () => { cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight; }, { passive: true });
        cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight;
        (function animateCursor() {
            ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
            if (isVisible) {
                let x = mouse.x, y = mouse.y;
                dots.forEach((dot, i) => {
                    dot.x += (x - dot.x) * friction; dot.y += (y - dot.y) * friction;
                    const color = i % 2 === 0 ? '#0ff0fc' : '#00ff41';
                    ctx.globalAlpha = 1 - (i / 10);
                    ctx.beginPath(); ctx.fillStyle = color;
                    ctx.arc(dot.x, dot.y, (10 - i) * 1.1, 0, Math.PI * 2); ctx.fill();
                    x = dot.x; y = dot.y;
                });
            }
            requestAnimationFrame(animateCursor);
        })();
    };
    initCursor();

    const handleTilt = (elements, intensity, scale) => {
        elements.forEach(el => {
            let rect = null;
            const updateRect = () => { rect = el.getBoundingClientRect(); };
            const move = (e) => {
                if (!rect) updateRect();
                const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
                const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
                requestAnimationFrame(() => {
                    if (!rect) return;
                    const rotateX = (rect.height / 2 - (y - rect.top)) / intensity;
                    const rotateY = ((x - rect.left) - rect.width / 2) / intensity;
                    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale})`;
                });
            };
            const reset = () => { rect = null; el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`; };
            el.addEventListener('mouseenter', updateRect, { passive: true });
            el.addEventListener('mousemove', move, { passive: true });
            el.addEventListener('touchstart', updateRect, { passive: true });
            el.addEventListener('touchmove', move, { passive: true });
            el.addEventListener('mouseleave', reset);
            el.addEventListener('touchend', reset);
        });
    };
    handleTilt(document.querySelectorAll('.project-card'), 10, 1.05);
    handleTilt(document.querySelectorAll('.skill-item'), 15, 1.02);

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.progress-bar').forEach(bar => bar.style.width = bar.getAttribute('aria-valuenow') + '%');
            }
        });
    }, { threshold: 0.2 });
    document.querySelectorAll('.skill-item').forEach(item => skillObserver.observe(item));

    document.querySelectorAll('.timeline-item').forEach(item => {
        let rect = null, raf = null;
        const updateRect = () => { rect = item.getBoundingClientRect(); };
        const move = (e) => {
            if (!rect) updateRect();
            const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                if (!rect) return;
                const rotateX = (rect.height / 2 - (y - rect.top)) / 10;
                const rotateY = ((x - rect.left) - rect.width / 2) / 10;
                item.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(50px)`;
            });
        };
        const reset = () => { rect = null; if (raf) cancelAnimationFrame(raf); item.style.transform = `perspective(2000px) rotateX(0) rotateY(0) translateZ(0)`; };
        item.addEventListener('mouseenter', updateRect, { passive: true });
        item.addEventListener('mousemove', move, { passive: true });
        item.addEventListener('touchstart', updateRect, { passive: true });
        item.addEventListener('touchmove', move, { passive: true });
        item.addEventListener('mouseleave', reset);
        item.addEventListener('touchend', reset);
    });

    const textEl = document.querySelector('.glowing-text'), trig = document.querySelector('.neon-border');
    if (textEl && trig) {
        const orig = textEl.innerText, chars = '!<>-_\\/[]{}—=+*^?#________';
        let fid = null;
        trig.addEventListener('mouseenter', () => {
            if (fid) cancelAnimationFrame(fid);
            const start = performance.now();
            (function up(cur) {
                const iter = (cur - start) / 50;
                textEl.innerText = orig.split('').map((c, i) => i < iter ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
                if (iter < orig.length) fid = requestAnimationFrame(up); else textEl.innerText = orig;
            })(performance.now());
        });
    }

    const aboutBox = document.querySelector('#about .neon-border');
    if (aboutBox) {
        let aboutRect = null;
        const updateAboutRect = () => { aboutRect = aboutBox.getBoundingClientRect(); };
        const reset = () => { aboutRect = null; aboutBox.style.transform = `rotateX(0) rotateY(0)`; aboutBox.style.setProperty('--shine-x', '50%'); aboutBox.style.setProperty('--shine-y', '50%'); };
        const move = (e) => {
            if (window.innerWidth < 992) return;
            if (!aboutRect) updateAboutRect();
            const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            requestAnimationFrame(() => {
                if (!aboutRect) return;
                aboutBox.style.transform = `rotateX(${(aboutRect.height / 2 - (y - aboutRect.top)) / 20}deg) rotateY(${((x - aboutRect.left) - aboutRect.width / 2) / 30}deg)`;
                aboutBox.style.setProperty('--shine-x', `${((x - aboutRect.left) - aboutRect.width / 2) / 15 * 2}%`);
                aboutBox.style.setProperty('--shine-y', `${-(aboutRect.height / 2 - (y - aboutRect.top)) / 10 * 2}%`);
            });
        };
        window.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 992 || !aboutBox) return;
            if (!aboutRect) updateAboutRect();
            (e.clientX >= aboutRect.left && e.clientX <= aboutRect.right && e.clientY >= aboutRect.top && e.clientY <= aboutRect.bottom) ? move(e) : reset();
        }, { passive: true });
        aboutBox.addEventListener('touchstart', updateAboutRect, { passive: true });
        aboutBox.addEventListener('touchmove', move, { passive: true });
        aboutBox.addEventListener('mouseleave', reset);
        aboutBox.addEventListener('touchend', reset);
    }
});