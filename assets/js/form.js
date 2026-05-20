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
  const honeypot = form.querySelector('input[name="_gotcha"]');
  const emailField = form.querySelector("#contact-email");
  const emailConfirmField = form.querySelector("#contact-email-confirm");

  const allowedEmailDomains = new Set([
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
  ]);

  const disposableEmailDomains = new Set([
    "10minutemail.com",
    "10minutemail.net",
    "dispostable.com",
    "getnada.com",
    "guerrillamail.com",
    "maildrop.cc",
    "mailinator.com",
    "moakt.com",
    "sharklasers.com",
    "temp-mail.org",
    "tempmail.com",
    "trashmail.com",
    "yopmail.com",
  ]);

  if (errorMsg) errorMsg.setAttribute("role", "alert");
  if (successMsg) successMsg.setAttribute("role", "status");

  let isSubmitting = false;
  let lastSubmitTime = 0;
  const fieldErrorMap = new Map();
  const fieldStatusMap = new Map();

  const getFieldErrorElement = (field) => {
    if (fieldErrorMap.has(field)) return fieldErrorMap.get(field);

    const describedId = field.getAttribute("aria-describedby");
    if (describedId) {
      const existing = document.getElementById(describedId);
      if (existing) {
        if (!existing.dataset.defaultText)
          existing.dataset.defaultText = existing.textContent;
        fieldErrorMap.set(field, existing);
        return existing;
      }
    }

    const group = field.closest(".float-label-group");
    const sibling = group?.nextElementSibling;
    if (sibling?.classList.contains("invalid-feedback")) {
      if (!sibling.dataset.defaultText)
        sibling.dataset.defaultText = sibling.textContent;
      fieldErrorMap.set(field, sibling);
      return sibling;
    }

    const el = document.createElement("span");
    el.id = `err-${field.name || Math.random().toString(36).slice(2)}`;
    el.className = "invalid-feedback";
    el.setAttribute("role", "alert");
    el.dataset.dynamic = "true";
    field.insertAdjacentElement("afterend", el);
    fieldErrorMap.set(field, el);
    return el;
  };

  const getOrCreateFieldStatus = (field) => {
    if (fieldStatusMap.has(field)) return fieldStatusMap.get(field);
    const group = field.closest(".float-label-group");
    if (!group) return null;
    let statusEl = group.querySelector(".field-status");
    if (!statusEl) {
      statusEl = document.createElement("span");
      statusEl.className = "field-status";
      statusEl.setAttribute("aria-hidden", "true");
      group.appendChild(statusEl);
    }
    fieldStatusMap.set(field, statusEl);
    return statusEl;
  };

  const setFieldState = (field, state) => {
    const group = field.closest(".float-label-group");
    if (group) {
      group.classList.toggle("is-valid", state === "valid");
      group.classList.toggle("is-invalid", state === "invalid");
    }
    const statusEl = getOrCreateFieldStatus(field);
    if (!statusEl) return;
    if (state === "valid") {
      statusEl.textContent = "OK";
      statusEl.dataset.state = "valid";
    } else if (state === "invalid") {
      statusEl.textContent = "ERR";
      statusEl.dataset.state = "invalid";
    } else {
      statusEl.textContent = "";
      statusEl.dataset.state = "neutral";
    }
  };

  const clearFieldError = (field) => {
    const el = getFieldErrorElement(field);
    if (el) {
      if (el.dataset.defaultText) el.textContent = el.dataset.defaultText;
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
    }
    field.removeAttribute("aria-invalid");
    if (el?.dataset.dynamic === "true")
      field.removeAttribute("aria-describedby");
  };

  const setFieldError = (field, msg) => {
    const el = getFieldErrorElement(field);
    if (el) {
      el.textContent = msg || el.dataset.defaultText || "Invalid value.";
      el.style.display = "block";
      el.setAttribute("aria-hidden", "false");
    }
    field.setAttribute("aria-invalid", "true");
    if (el?.id) field.setAttribute("aria-describedby", el.id);
  };

  const getEmailDomain = (value) => {
    const at = value.lastIndexOf("@");
    if (at === -1) return "";
    return value
      .slice(at + 1)
      .trim()
      .toLowerCase();
  };

  const validateField = (field, mode = "input") => {
    const isEmpty = field.value.trim().length === 0;
    if (!field.checkValidity()) {
      if (mode === "input" && isEmpty) {
        clearFieldError(field);
        setFieldState(field, "neutral");
        return false;
      }
      const label =
        form.querySelector(`label[for="${field.id}"]`)?.textContent?.trim() ||
        field.name ||
        "This field";
      setFieldError(field, field.validationMessage || `${label} is invalid.`);
      setFieldState(field, "invalid");
      return false;
    }

    if (field.type === "email") {
      const domain = getEmailDomain(field.value);
      if (disposableEmailDomains.has(domain)) {
        setFieldError(field, "Disposable email domains are not allowed.");
        setFieldState(field, "invalid");
        return false;
      }
      if (!allowedEmailDomains.has(domain)) {
        setFieldError(
          field,
          "Use a professional email (gmail/outlook/hotmail/live/icloud).",
        );
        setFieldState(field, "invalid");
        return false;
      }
    }

    if (field.id === "contact-email-confirm" && emailField) {
      if (field.value.trim() !== emailField.value.trim()) {
        setFieldError(field, "Email addresses must match.");
        setFieldState(field, "invalid");
        return false;
      }
    }

    clearFieldError(field);
    setFieldState(field, "valid");
    return true;
  };

  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener(
      "input",
      debounce(() => validateField(field, "input"), 240),
    );
    field.addEventListener("blur", () => validateField(field, "blur"));
  });

  if (emailField && emailConfirmField) {
    emailField.addEventListener(
      "input",
      debounce(() => validateField(emailConfirmField, "input"), 240),
    );
    emailField.addEventListener("blur", () =>
      validateField(emailConfirmField, "blur"),
    );
  }

  const validateAll = () => {
    const fields = [...form.querySelectorAll("[required]")];
    let firstInvalid = null;
    for (const field of fields) {
      if (!validateField(field, "submit") && !firstInvalid)
        firstInvalid = field;
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
    if (honeypot && honeypot.value.trim().length > 0) return;

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
      errorMsg.setAttribute("aria-hidden", "true");
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
      if (successMsg) {
        successMsg.style.display = "block";
        successMsg.setAttribute("aria-hidden", "false");
      }
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
      errorMsg.setAttribute("aria-hidden", "false");
      errorMsg.focus?.({ preventScroll: true });
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
