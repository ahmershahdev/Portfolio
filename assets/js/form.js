export function initializeForm(config = {}) {
  const endpoint = config.endpoint || "https://formspree.io/f/xgooljlk";
  const timeout = config.timeout || 10000;
  const maxRetries = config.maxRetries ?? 2;
  const rateLimitMs = config.rateLimitMs ?? 30000;

  const form = document.getElementById("contact-form");
  if (!form) return;

  const btn = document.getElementById("submit-btn");
  const successMsg = document.getElementById("form-success");
  const errorMsg = document.getElementById("form-error");

  if (errorMsg) errorMsg.setAttribute("role", "alert");
  if (successMsg) successMsg.setAttribute("role", "status");

  let isSubmitting = false;
  let lastSubmitTime = 0;
  const fieldErrorMap = new Map();

  const getOrCreateFieldError = (field) => {
    if (fieldErrorMap.has(field)) return fieldErrorMap.get(field);
    const el = document.createElement("span");
    el.id = `err-${field.name || Math.random().toString(36).slice(2)}`;
    el.className = "field-error";
    el.setAttribute("role", "alert");
    field.insertAdjacentElement("afterend", el);
    fieldErrorMap.set(field, el);
    return el;
  };

  const clearFieldError = (field) => {
    const el = fieldErrorMap.get(field);
    if (el) {
      el.textContent = "";
      el.style.display = "none";
    }
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  };

  const setFieldError = (field, msg) => {
    const el = getOrCreateFieldError(field);
    el.textContent = msg;
    el.style.display = "block";
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", el.id);
  };

  const validateField = (field) => {
    if (!field.checkValidity()) {
      const label =
        form.querySelector(`label[for="${field.id}"]`)?.textContent?.trim() ||
        field.name ||
        "This field";
      setFieldError(field, field.validationMessage || `${label} is invalid.`);
      return false;
    }
    clearFieldError(field);
    return true;
  };

  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener(
      "input",
      debounce(() => validateField(field), 400),
    );
    field.addEventListener("blur", () => validateField(field));
  });

  const validateAll = () => {
    const fields = [...form.querySelectorAll("[required]")];
    let firstInvalid = null;
    for (const field of fields) {
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    }
    firstInvalid?.focus();
    return !firstInvalid;
  };

  const setLoading = (loading) => {
    btn.disabled = loading;
    btn.setAttribute("aria-busy", String(loading));
    btn.textContent = loading
      ? "TRANSMITTING..."
      : btn.dataset.originalText || "SEND";
  };

  const submitWithRetry = async (retries) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await response.json();
      if (response.ok && !data.errors) return;
      if (response.status >= 500 && retries > 0)
        return submitWithRetry(retries - 1);
      throw new Error(
        data.errors?.[0]?.message ||
          `Server rejected the request (${response.status}).`,
      );
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError")
        throw new Error(
          "Request timed out. Check your connection and try again.",
        );
      if (err.name === "TypeError") {
        if (retries > 0) return submitWithRetry(retries - 1);
        throw new Error("Network error. You may be offline.");
      }
      throw err;
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const now = Date.now();
    const remaining = Math.ceil((rateLimitMs - (now - lastSubmitTime)) / 1000);
    if (now - lastSubmitTime < rateLimitMs) {
      showGlobalError(`Please wait ${remaining}s before submitting again.`);
      return;
    }

    if (!validateAll()) return;

    isSubmitting = true;
    lastSubmitTime = now;
    btn.dataset.originalText = btn.textContent;
    setLoading(true);
    if (errorMsg) {
      errorMsg.style.display = "none";
      errorMsg.textContent = "";
    }

    try {
      await submitWithRetry(maxRetries);
      setLoading(false);
      form.classList.add("fade-out");
      form.addEventListener(
        "animationend",
        () => {
          form.reset();
          form.style.display = "none";
        },
        { once: true },
      );
      if (successMsg) successMsg.style.display = "block";
    } catch (err) {
      console.error("Submission error:", err);
      showGlobalError(err.message);
      setLoading(false);
      isSubmitting = false;
    }
  });

  function showGlobalError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "block";
    } else console.error(msg);
  }
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
