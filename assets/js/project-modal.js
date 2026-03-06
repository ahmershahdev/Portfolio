"use strict";

(function () {
  const overlay = document.getElementById("projectModal");
  const iframe = document.getElementById("projectModalIframe");
  const iframeWrap = document.getElementById("projectModalIframeWrap");
  const titleEl = document.getElementById("projectModalTitle");
  const urlText = document.getElementById("projectModalUrl");
  const visitBtn = document.getElementById("projectModalVisit");
  const closeBtn = document.getElementById("projectModalClose");
  const loader = overlay.querySelector(".project-modal-loader");
  const viewportBtns = overlay.querySelectorAll(".viewport-btn");

  if (!overlay || !iframe) return;

  function openModal(url, title) {
    titleEl.textContent = title || "Project Preview";
    visitBtn.href = url;
    try {
      urlText.textContent = new URL(url).hostname + new URL(url).pathname;
    } catch {
      urlText.textContent = url;
    }
    iframe.src = url;
    loader.style.display = "flex";
    loader.classList.remove("loaded");

    iframe.onload = () => {
      loader.classList.add("loaded");
      setTimeout(() => {
        loader.style.display = "none";
      }, 400);
    };

    iframeWrap.style.maxWidth = "100%";
    viewportBtns.forEach((b) => b.classList.remove("active"));
    viewportBtns[0].classList.add("active");

    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      iframe.src = "about:blank";
    }, 400);
  }

  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) {
      closeModal();
    }
  });

  viewportBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      viewportBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      iframeWrap.style.maxWidth = btn.dataset.width;
    });
  });

  document.querySelectorAll(".project-preview-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      const title = btn.dataset.title;
      if (url) openModal(url, title);
    });
  });
})();
