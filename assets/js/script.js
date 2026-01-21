import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

(function () {
    const container = document.getElementById('three-bg-container');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5, 45);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ 
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
    scene.add(chestLight);

    const geometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const meshGround = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.1
    }));
    meshGround.rotation.x = -Math.PI / 2;
    meshGround.position.y = -6;
    scene.add(meshGround);

    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i++) rainPos[i] = (Math.random() - 0.5) * 40;
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.05 }));
    scene.add(rain);

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
        scene.add(ironMan);
    }, (xhr) => {
        if (xhr.lengthComputable) {
            const percent = (xhr.loaded / xhr.total) * 100;
            const $bar = document.getElementById('loading-bar');
            const $text = document.getElementById('load-percent');
            if ($bar) $bar.style.width = percent + '%';
            if ($text) $text.innerText = Math.round(percent) + '%';
        }
    });

    camera.position.set(0, 0, 15);

    document.addEventListener('mousemove', (e) => {
        targetY = (e.clientX / window.innerWidth - 0.5) * 1.0; 
        targetX = (e.clientY / window.innerHeight - 0.5) * 0.4;
        if (renderer.toneMappingExposure < 4.0) renderer.toneMappingExposure += 0.05;
    }, { passive: true });

    document.addEventListener('click', () => {
        if (ironMan) {
            renderer.toneMappingExposure = 7.0;
            chestLight.intensity = 150;
            setTimeout(() => {
                renderer.toneMappingExposure = 3.0;
                chestLight.intensity = 20;
            }, 100);
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        const time = performance.now() * 0.001;
        if (renderer.toneMappingExposure > 3.0) renderer.toneMappingExposure -= 0.03;

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
            ironMan.rotation.y = THREE.MathUtils.lerp(ironMan.rotation.y, targetY, 0.4);
            ironMan.rotation.x = THREE.MathUtils.lerp(ironMan.rotation.x, targetX, 0.4);
            chestLight.intensity = 18 + Math.sin(time * 4) * 6;
        }
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
    const quotes = ["Initializing the inevitable...", "Calculated risks. High rewards.", "Reality is a simulation. Master the code.", "The Titan awakens in the silence."];
    $quote.text(quotes[Math.floor(Math.random() * quotes.length)]);
    
    setTimeout(() => { $bar.css('width', '25%'); $percentText.text('25%'); }, 1000);
    setTimeout(() => { $bar.css('width', '70%'); $percentText.text('70%'); }, 2500);
    setTimeout(() => { 
        $bar.css('width', '100%'); 
        $percentText.text('100%'); 
        setTimeout(() => {
            $wrapper.fadeOut(1000, function () { 
                $(this).remove(); 
                $('html, body').css({ 'overflow-y': 'auto', 'overflow-x': 'hidden' });
            });
        }, 800);
    }, 3500);

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
    const updateSectionCache = () => {
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
    };

    $(window).on("load", updateSectionCache);
    
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
            $("html, body").stop().animate({ 
                scrollTop: $section.offset().top - navHeight 
            }, 800);
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
});