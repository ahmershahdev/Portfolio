import { initializeLoader } from './loader.js';
import { initializeNavigation } from './navigation.js';
import { initializeAnimations } from './animations.js';
import { initializeEffects } from './effects.js';
import { initializeForm } from './form.js';
import { initializeThreeScene } from './three-scene.js';

$(document).ready(function() {
    
    $('html, body').css({
        'overflow-x': 'hidden',
        'overflow-y': 'hidden',
        'scroll-behavior': 'smooth'
    });

    
    initializeLoader();

    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeThreeScene);
    } else {
        initializeThreeScene();
    }

    
    window.addEventListener('loaderComplete', function() {
        
        initializeNavigation();
        
               
        initializeAnimations();
        
        
        initializeEffects();
    }, { once: true });

    
    initializeForm();
});