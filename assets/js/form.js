

export function initializeForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const submitButton = document.getElementById('submit-btn');

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.innerHTML = "Transmitting...";

        try {
            const response = await fetch("https://formspree.io/f/xgooljlk", {
                method: "POST",
                body: new FormData(this),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                $('#form-success').fadeIn();
                this.reset();
                $(this).fadeOut();
            }
        } catch {
            alert("Transmission failed.");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = "Send Message";
        }
    });
}
