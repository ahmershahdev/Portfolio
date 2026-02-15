

const philosophicalQuotes = [
    "A cage went in search of a bird. — Franz Kafka",
    "Man is sometimes extraordinarily, passionately, in love with suffering. — Fyodor Dostoevsky",
    "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
    "It is better to be feared than loved, if one cannot be both. — Niccolò Machiavelli"
];

export function initializeLoader() {
    const $loadingBar = $('#loading-bar');
    const $loadPercent = $('#load-percent');
    const $dynamicQuote = $('#dynamic-quote');
    const $loaderWrapper = $('#loader-wrapper');

    
    if ($dynamicQuote.length) {
        $dynamicQuote.text(philosophicalQuotes[Math.floor(Math.random() * philosophicalQuotes.length)]);
    }

    
    let loadingProgress = 0;
    const loadingInterval = setInterval(() => {
        loadingProgress += Math.random() * 12 + 5;
        if (loadingProgress >= 96) {
            loadingProgress = 96;
            clearInterval(loadingInterval);
        }
        $loadingBar.css('width', loadingProgress + '%');
        $loadPercent.text(Math.floor(loadingProgress) + '%');
    }, 60);

    
    const loadingFailsafe = setTimeout(finishLoadingSequence, 1500);

    
    $(window).on("load", () => {
        clearTimeout(loadingFailsafe);
        finishLoadingSequence();
    });

    function finishLoadingSequence() {
        $loadingBar.stop().css('width', '100%');
        $loadPercent.text('100%');
        setTimeout(() => {
            if ($loaderWrapper.length) {
                $loaderWrapper.fadeOut(400, function() {
                    $(this).hide();
                    $('html, body').css({
                        'overflow-y': 'auto',
                        'overflow-x': 'hidden'
                    });
                    
                    window.dispatchEvent(new CustomEvent('loaderComplete'));
                });
            }
        }, 100);
    }
}
