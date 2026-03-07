export function initializeForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const btn = document.getElementById("submit-btn");
  const successMsg = document.getElementById("form-success");
  const errorMsg = document.getElementById("form-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[name="email"]')?.value;
    if (!email || !email.includes("@")) {
      showError("Provide a valid email address.");
      return;
    }

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "TRANSMITTING...";
    if (errorMsg) errorMsg.style.display = "none";

    try {
      const response = await fetch("https://formspree.io/f/xgooljlk", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        if (successMsg) successMsg.style.display = "block";
        form.reset();
        form.style.display = "none";
      } else {
        throw new Error("Server rejected the request.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      showError("Transmission failed. Try again.");
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "block";
    } else {
      console.error(msg);
    }
  }
}
