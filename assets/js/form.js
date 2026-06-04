export function initializeForm(config = {}) {
  const timeout = config.timeout || 10000;
  const maxRetries = config.maxRetries ?? 2;
  const rateLimitMs = config.rateLimitMs ?? 30000;

  const form = document.getElementById("contact-form");
  if (!form) return;

  const emailjsConfig = {
    serviceId: config.serviceId || form.dataset.emailjsServiceId || "",
    templateId: config.templateId || form.dataset.emailjsTemplateId || "",
    confirmTemplateId:
      config.confirmTemplateId || form.dataset.emailjsConfirmTemplateId || "",
    publicKey: config.publicKey || form.dataset.emailjsPublicKey || "",
  };

  const hasPrimaryConfig =
    Boolean(emailjsConfig.serviceId) &&
    Boolean(emailjsConfig.templateId) &&
    Boolean(emailjsConfig.publicKey);

  let emailjsInitialized = false;

  const btn = document.getElementById("submit-btn");
  const successMsg = document.getElementById("form-success");
  const errorMsg = document.getElementById("form-error");
  const honeypot = form.querySelector('input[name="_gotcha"]');
  const nameField = form.querySelector("#contact-name");
  const emailField = form.querySelector("#contact-email");
  const emailConfirmField = form.querySelector("#contact-email-confirm");
  const reasonField = form.querySelector("#contact-reason");
  const subjectField = form.querySelector("#contact-subject");
  const messageField = form.querySelector("#contact-message");
  const recaptchaContainer = form.querySelector("#recaptcha-container");
  const recaptchaSiteKey = recaptchaContainer?.dataset.sitekey || "";
  const recaptchaRequired = Boolean(recaptchaContainer);
  let recaptchaWidgetId = null;

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

  const getRecaptchaTheme = () =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark";

  const renderRecaptcha = (forceNew = false) => {
    if (!recaptchaContainer || !recaptchaSiteKey) return;
    if (!window.grecaptcha?.render) return;
    if (recaptchaWidgetId !== null && !forceNew) return;
    if (recaptchaWidgetId !== null && window.grecaptcha?.reset) {
      try {
        window.grecaptcha.reset(recaptchaWidgetId);
      } catch (err) {
        console.warn("Failed to reset reCAPTCHA widget:", err);
      }
    }
    recaptchaContainer.innerHTML = "";
    const mount = document.createElement("div");
    mount.className = "recaptcha-widget";
    recaptchaContainer.appendChild(mount);
    recaptchaWidgetId = window.grecaptcha.render(mount, {
      sitekey: recaptchaSiteKey,
      theme: getRecaptchaTheme(),
    });
  };

  const initRecaptcha = () => {
    if (!recaptchaRequired) return;
    const existingOnload = window.onRecaptchaLoad;
    window.onRecaptchaLoad = () => {
      if (typeof existingOnload === "function") existingOnload();
      renderRecaptcha();
    };
    if (window.grecaptcha?.render) renderRecaptcha();
    window.addEventListener("themeChange", () => {
      if (window.grecaptcha?.render) renderRecaptcha(true);
    });
  };

  const getRecaptchaResponse = () => {
    if (!window.grecaptcha?.getResponse) return "";
    if (recaptchaWidgetId === null) return "";
    return window.grecaptcha.getResponse(recaptchaWidgetId);
  };

  const resetRecaptcha = () => {
    if (!window.grecaptcha?.reset) return;
    if (recaptchaWidgetId === null) return;
    window.grecaptcha.reset(recaptchaWidgetId);
  };

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

  initRecaptcha();

  const templateAliases = new Map([
    ["from_name", () => nameField?.value || ""],
    ["from_email", () => emailField?.value || ""],
    ["reply_to", () => emailField?.value || ""],
    ["user_name", () => nameField?.value || ""],
    ["user_email", () => emailField?.value || ""],
    ["contact_reason", () => reasonField?.value || ""],
    ["contact_subject", () => subjectField?.value || ""],
    ["contact_message", () => messageField?.value || ""],
    ["confirm_email", () => emailConfirmField?.value || ""],
  ]);

  const ensureHiddenField = (name) => {
    let field = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    return field;
  };

  const syncTemplateFields = () => {
    templateAliases.forEach((getValue, name) => {
      if (form.querySelector(`[name="${name}"]:not([type="hidden"])`)) return;
      const hidden = ensureHiddenField(name);
      hidden.value = getValue?.() ?? "";
    });
  };

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

  const ensureEmailjsReady = (templateId) => {
    if (!window.emailjs?.sendForm) {
      throw new Error(
        "Email service failed to load. Refresh the page and try again.",
      );
    }
    if (!emailjsConfig.serviceId || !emailjsConfig.publicKey || !templateId) {
      throw new Error(
        "Email service is not configured. Add EmailJS service ID, template ID, and public key.",
      );
    }
    if (!emailjsInitialized && typeof window.emailjs.init === "function") {
      window.emailjs.init({ publicKey: emailjsConfig.publicKey });
      emailjsInitialized = true;
    }
  };

  const sendTemplate = async (templateId) => {
    ensureEmailjsReady(templateId);
    const sendPromise = window.emailjs.sendForm(
      emailjsConfig.serviceId,
      templateId,
      form,
      {
        publicKey: emailjsConfig.publicKey,
      },
    );

    if (!timeout) return sendPromise;

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              "Request timed out. Check your connection and try again.",
            ),
          ),
        timeout,
      );
    });

    return Promise.race([sendPromise, timeoutPromise]);
  };

  const sendPrimaryEmail = async () => {
    if (!hasPrimaryConfig) {
      throw new Error(
        "Email service is not configured. Add EmailJS service ID, template ID, and public key.",
      );
    }
    return sendTemplate(emailjsConfig.templateId);
  };

  const sendConfirmationEmail = async () => {
    if (!emailjsConfig.confirmTemplateId) return;
    return sendTemplate(emailjsConfig.confirmTemplateId);
  };

  const submitWithRetry = async (retries) => {
    try {
      await sendPrimaryEmail();
      return;
    } catch (err) {
      if (retries > 0) return submitWithRetry(retries - 1);
      const fallbackMessage =
        err?.text || err?.message || "Email delivery failed. Try again soon.";
      throw new Error(fallbackMessage);
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

    if (recaptchaRequired) {
      if (!recaptchaSiteKey) {
        showGlobalError("Captcha site key is missing. Contact support.");
        return;
      }
      if (!window.grecaptcha?.getResponse || recaptchaWidgetId === null) {
        showGlobalError("Captcha is still loading. Please wait and try again.");
        return;
      }
      if (!getRecaptchaResponse()) {
        showGlobalError("Please complete the captcha to continue.");
        return;
      }
    }

    syncTemplateFields();

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
      try {
        await sendConfirmationEmail();
      } catch (err) {
        console.warn("Confirmation email failed:", err);
      }
      resetRecaptcha();
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
      resetRecaptcha();
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
