

export function initializeEffects() {
    
    initializeCustomCursor();

    
    initializeTiltEffect(document.querySelectorAll('.project-card'), 10, 1.05);
    initializeTiltEffect(document.querySelectorAll('.skill-item'), 15, 1.02);

    
    initializeTimelineTilt();

    
    initializeAboutBoxEffect();
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

function initializeTimelineTilt() {
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
}

function initializeAboutBoxEffect() {
    const aboutBoxElement = document.querySelector('#about .neon-border');
    if (!aboutBoxElement) return;

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
