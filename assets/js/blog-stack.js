const DESKTOP_STACK_QUERY = "(min-width: 992px)";

export function initBlogStack() {
  const blogSection = document.getElementById("blog");
  const stackStage = blogSection?.querySelector(".blog-stack-stage");
  if (!blogSection || !stackStage) return;

  const desktopMedia = window.matchMedia(DESKTOP_STACK_QUERY);

  const setOpen = (isOpen) => {
    const nextState = Boolean(isOpen) && desktopMedia.matches;
    stackStage.classList.toggle("is-open", nextState);

    if (desktopMedia.matches) {
      stackStage.setAttribute("aria-expanded", String(nextState));
    }
  };

  const toggleOpen = () => {
    setOpen(!stackStage.classList.contains("is-open"));
  };

  const onStageClick = (event) => {
    if (!desktopMedia.matches) return;
    if (event.target.closest(".blog-read-link")) return;
    toggleOpen();
  };

  const onStageKeyDown = (event) => {
    if (!desktopMedia.matches) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    toggleOpen();
  };

  const onDocumentClick = (event) => {
    if (!desktopMedia.matches) return;
    if (!stackStage.classList.contains("is-open")) return;
    if (stackStage.contains(event.target)) return;
    setOpen(false);
  };

  const onSectionStateChange = (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        setOpen(false);
      }
    });
  };

  const sectionObserver = new IntersectionObserver(onSectionStateChange, {
    threshold: 0.22,
  });

  const syncDesktopState = () => {
    if (desktopMedia.matches) {
      stackStage.setAttribute("tabindex", "0");
      stackStage.setAttribute(
        "aria-expanded",
        String(stackStage.classList.contains("is-open")),
      );
      return;
    }

    stackStage.removeAttribute("tabindex");
    stackStage.removeAttribute("aria-expanded");
    setOpen(false);
  };

  syncDesktopState();

  stackStage.addEventListener("click", onStageClick);
  stackStage.addEventListener("keydown", onStageKeyDown);
  document.addEventListener("click", onDocumentClick);
  sectionObserver.observe(blogSection);

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", syncDesktopState);
  } else if (typeof desktopMedia.addListener === "function") {
    desktopMedia.addListener(syncDesktopState);
  }

  return () => {
    stackStage.removeEventListener("click", onStageClick);
    stackStage.removeEventListener("keydown", onStageKeyDown);
    document.removeEventListener("click", onDocumentClick);
    sectionObserver.disconnect();

    if (typeof desktopMedia.removeEventListener === "function") {
      desktopMedia.removeEventListener("change", syncDesktopState);
    } else if (typeof desktopMedia.removeListener === "function") {
      desktopMedia.removeListener(syncDesktopState);
    }
  };
}
