

const NAVBAR_HEIGHT = 65;
let isManualScrolling = false;

export function initializeNavigation() {
    const $navLinks = $(".nav-link");
    const $dropdownItems = $(".dropdown-item");
    const $backToTopButton = $("#backToTop");
    const $navbarCollapse = $(".navbar-collapse");
    const $scrollProgressBar = $("#scroll-progress-bar");

    
    initializeNavigationObserver($navLinks, $dropdownItems);

    
    window.addEventListener('scroll', () => {
        $backToTopButton.toggleClass("show", window.scrollY > 400);
    }, { passive: true });

    
    function handleBackToTop(event) {
        if (event.cancelable) event.preventDefault();
        if ($backToTopButton.hasClass('firing')) return;
        $backToTopButton.addClass('firing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => $backToTopButton.removeClass('firing'), 1000);
    }

    $backToTopButton.on('click', handleBackToTop);
    document.getElementById('backToTop')?.addEventListener('touchstart', handleBackToTop, { passive: false });

    
    let scrollUpdateScheduled = false;
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        $scrollProgressBar.css('width', scrollPercent + '%');
        scrollUpdateScheduled = false;
    }

    window.addEventListener('scroll', () => {
        if (!scrollUpdateScheduled) {
            scrollUpdateScheduled = true;
            requestAnimationFrame(updateScrollProgress);
        }
    }, { passive: true });

    
    function handleNavigationClick(event) {
        const targetId = $(this).attr("href");
        if (!targetId || targetId.startsWith("javascript")) return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            event.preventDefault();
            isManualScrolling = true;
            $navLinks.add($dropdownItems).removeClass("active").removeAttr("aria-current");
            $(this).addClass("active").attr("aria-current", "page");
            if ($(this).hasClass('dropdown-item')) {
                $(this).closest('.dropdown').find('.nav-link').addClass('active');
            }
            const targetPosition = targetElement.getBoundingClientRect().top +
                window.pageYOffset - NAVBAR_HEIGHT + 1;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            setTimeout(() => isManualScrolling = false, 850);
            if ($navbarCollapse.hasClass("show")) $navbarCollapse.collapse('hide');
            const offcanvasElement = document.getElementById('offcanvasNavbar');
            if (offcanvasElement && offcanvasElement.classList.contains('show')) {
                bootstrap.Offcanvas.getInstance(offcanvasElement).hide();
            }
        }
    }

    $navLinks.add($dropdownItems).on("click", handleNavigationClick);

    
    const offcanvasElement = document.getElementById('offcanvasNavbar');
    if (offcanvasElement) {
        const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
        offcanvasElement.addEventListener('show.bs.offcanvas', () => {
            offcanvasElement.removeAttribute('inert');
        });
        offcanvasElement.addEventListener('hide.bs.offcanvas', () => {
            offcanvasElement.setAttribute('inert', '');
        });
    }
}

function initializeNavigationObserver($navLinks, $dropdownItems) {
    const sectionObserver = new IntersectionObserver((entries) => {
        if (isManualScrolling) return;
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const sectionId = `#${entry.target.id}`;
                $navLinks.add($dropdownItems).removeClass("active").removeAttr("aria-current");
                const $currentLink = $(`.nav-link[href="${sectionId}"], .dropdown-item[href="${sectionId}"]`);
                $currentLink.addClass("active").attr("aria-current", "page");
                if ($currentLink.hasClass('dropdown-item')) {
                    $currentLink.closest('.dropdown').find('.nav-link').addClass('active');
                }
            }
        });
    }, {
        rootMargin: `-${NAVBAR_HEIGHT}px 0px -45% 0px`,
        threshold: 0
    });
    document.querySelectorAll("section[id]").forEach((section) => sectionObserver.observe(section));
}
