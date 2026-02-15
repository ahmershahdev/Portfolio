import { initializeLoader } from './loader.js';
import { initializeNavigation } from './navigation.js';
import { initializeAnimations } from './animations.js';
import { initializeEffects } from './effects.js';
import { initializeForm } from './form.js';

$(document).ready(function() {
    
    $('html, body').css({
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
        'scroll-behavior': 'smooth'
    });

    
    initializeLoader();
    
    // Load Three.js scene only after page becomes fully interactive (5s after page load)
    // This ensures LCP completes before rendering expensive 3D scene
    let threeSceneLoaded = false;
    setTimeout(() => {
        if (!threeSceneLoaded) {
            threeSceneLoaded = true;
            import('./three-scene.js').then(module => {
                module.initializeThreeScene();
            }).catch(err => console.error('Failed to load three-scene:', err));
        }
    }, 5000);

    
    window.addEventListener('loaderComplete', function() {
        
        initializeNavigation();
               
        initializeAnimations();
        
        
        initializeEffects();
    }, { once: true });

    initializeForm();
});