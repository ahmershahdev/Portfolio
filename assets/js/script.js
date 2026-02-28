import { initializeLoader } from './loader.js';
import { initializeNavigation } from './navigation.js';
import { initializeAnimations } from './animations.js';
import { initializeEffects } from './effects.js';
import { initializeForm } from './form.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeLoader();
    initializeForm();

    window.addEventListener('loaderComplete', () => {
        document.documentElement.style.overflowY = 'auto'; 
        document.body.style.overflowY = 'auto';

        initializeNavigation();
        initializeAnimations();
        initializeEffects();
        
        loadThreeScene();
    }, { once: true });
});

function loadThreeScene() {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => importThreeJS());
    } else {
        setTimeout(importThreeJS, 1000);
    }
}

function importThreeJS() {
    import('./three-scene.js')
        .then(module => module.initializeThreeScene())
        .catch(err => console.error('Failed to load three-scene:', err));
}