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

    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('[class*="reveal-"]').forEach((element) => revealObserver.observe(element));

    
    initializeGlitchText();

    
    initializeSkillProgress();

    
    createSectionObserver('education', 'camera-view-left-active');
    createSectionObserver('skills', 'camera-view-right-active');
    createSectionObserver('projects', 'camera-view-up-active');
    createSectionObserver('certificates', 'camera-view-left-active');
    createSectionObserver('contact', 'camera-view-back-active');
}

function typeWriterAnimation() {
    const $typewriter = $("#typewriter");
    if (!$typewriter.length) return;

    let phraseIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;

    function animate() {
        const currentPhrase = professionPhrases[phraseIndex];
        if (isDeleting) {
            $typewriter.text(currentPhrase.substring(0, characterIndex - 1));
            characterIndex--;
        } else {
            $typewriter.text(currentPhrase.substring(0, characterIndex + 1));
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

        setTimeout(animate, typingSpeed);
    }

    animate();
}

function createSectionObserver(sectionId, className) {
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return null;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle(className, entry.isIntersecting);
            entry.target.classList.toggle('fog-fade-in', entry.isIntersecting);
            entry.target.classList.toggle('fog-fade-out', !entry.isIntersecting);
        });
    }, { threshold: 0.2, rootMargin: '0px' });

    observer.observe(sectionElement);
    return observer;
}

function initializeSkillProgress() {
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.progress-bar').forEach((bar) => {
                    bar.style.width = bar.getAttribute('aria-valuenow') + '%';
                });
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-item').forEach((item) => skillObserver.observe(item));
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
