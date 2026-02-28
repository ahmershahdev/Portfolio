const philosophicalQuotes = [
    "A cage went in search of a bird. — Franz Kafka",
    "Man is sometimes extraordinarily, passionately, in love with suffering. — Fyodor Dostoevsky",
    "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
    "It is better to be feared than loved, if one cannot be both. — Niccolò Machiavelli"
];

export function initializeLoader() {
    const loader = {
        bar: document.getElementById('loading-bar'),
        percent: document.getElementById('load-percent'),
        quote: document.getElementById('dynamic-quote'),
        wrapper: document.getElementById('loader-wrapper'),
        isFinished: false
    };

    if (loader.quote) {
        loader.quote.textContent = philosophicalQuotes[Math.floor(Math.random() * philosophicalQuotes.length)];
    }

    let progress = 0;
    const interval = setInterval(() => {
        if (progress >= 96) return clearInterval(interval);
        
        progress += Math.random() * 12 + 5;
        if (progress > 96) progress = 96;
        
        requestAnimationFrame(() => {
            if (loader.bar) loader.bar.style.width = `${progress}%`;
            if (loader.percent) loader.percent.textContent = `${Math.floor(progress)}%`;
        });
    }, 100);

    const finish = () => {
        if (loader.isFinished) return;
        loader.isFinished = true;
        
        clearInterval(interval);
        
        requestAnimationFrame(() => {
            if (loader.bar) loader.bar.style.width = '100%';
            if (loader.percent) loader.percent.textContent = '100%';
            
            setTimeout(() => {
                if (loader.wrapper) {
                    loader.wrapper.style.transition = 'opacity 0.4s ease';
                    loader.wrapper.style.opacity = '0';
                    
                    setTimeout(() => {
                        loader.wrapper.style.display = 'none';
                        document.documentElement.style.overflowY = 'auto';
                        window.dispatchEvent(new CustomEvent('loaderComplete'));
                    }, 400);
                }
            }, 200);
        });
    };

    const failsafe = setTimeout(finish, 2500); 
    window.addEventListener('load', () => {
        clearTimeout(failsafe);
        finish();
    });
}