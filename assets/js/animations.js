const professionPhrases = [
    "SWE Student",
    "Full-Stack Web Developer",
    "SQL Developer",
    "WordPress Developer",
    "PHP Developer",
    "Laravel Developer",
    "SEO"
];

export function initializeAnimations() {
    typeWriterAnimation();
    initializeGlitchText();

    const generalObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('skill-item')) {
                    entry.target.querySelectorAll('.progress-bar').forEach(bar => {
                        bar.style.width = bar.getAttribute('aria-valuenow') + '%';
                    });
                } else {
                    entry.target.classList.add('reveal-visible');
                    generalObserver.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('[class*="reveal-"], .skill-item').forEach(el => generalObserver.observe(el));

    const sections = {
        'education': 'camera-view-left-active',
        'skills': 'camera-view-right-active',
        'projects': 'camera-view-up-active',
        'certificates': 'camera-view-left-active',
        'contact': 'camera-view-back-active'
    };

    const cameraObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const className = sections[entry.target.id];
            entry.target.classList.toggle(className, entry.isIntersecting);
            entry.target.classList.toggle('fog-fade-in', entry.isIntersecting);
            entry.target.classList.toggle('fog-fade-out', !entry.isIntersecting);
        });
    }, { threshold: 0.2 });

    Object.keys(sections).forEach(id => {
        const el = document.getElementById(id);
        if (el) cameraObserver.observe(el);
    });
}

function typeWriterAnimation() {
    const el = document.getElementById('typewriter');
    if (!el) return;

    let phraseIdx = 0, charIdx = 0, isDeleting = false;

    function animate() {
        const current = professionPhrases[phraseIdx];
        el.textContent = current.substring(0, isDeleting ? charIdx-- : charIdx++);

        let speed = isDeleting ? 40 : 80;
        if (!isDeleting && charIdx > current.length) {
            isDeleting = true;
            speed = 2000;
        } else if (isDeleting && charIdx < 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % professionPhrases.length;
            charIdx = 0;
            speed = 500;
        }
        setTimeout(animate, speed);
    }
    animate();
}

function initializeGlitchText() {
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
}