(function () {
  "use strict";

  const NAME_ART = `
 █████╗ ██╗  ██╗███╗   ███╗███████╗██████╗     ███████╗██╗  ██╗ █████╗ ██╗  ██╗
██╔══██╗██║  ██║████╗ ████║██╔════╝██╔══██╗    ██╔════╝██║  ██║██╔══██╗██║  ██║
███████║███████║██╔████╔██║█████╗  ██████╔╝    ███████╗███████║███████║███████║
██╔══██║██╔══██║██║╚██╔╝██║██╔══╝  ██╔══██╗    ╚════██║██╔══██║██╔══██║██╔══██║
██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██║  ██║    ███████║██║  ██║██║  ██║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝    ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝
`;

  const nameStyle =
    "color: #00f5ff; font-weight: 900; font-family: 'Courier New', monospace; font-size: 10px; line-height: 1.2;";
  const msgStyle =
    "color: #d0d0d0; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.8; border: 1px solid #444; padding: 8px 16px; display: block;";
  const linkStyle =
    "color: #00f5ff; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.8; text-shadow: 0 0 6px #00f5ff; border: 1px solid #00f5ff; padding: 8px 16px; display: block;";
  const copyStyle =
    "color: #e03c3c; font-family: 'Courier New', monospace; font-size: 11px;";

  console.log("%c" + NAME_ART, nameStyle);

  console.log(
    "%cHey! 👋 I'm Ahmer Shah.\n\n" +
      "I'm a Full-Stack Developer and Software Engineering student passionate\n" +
      "about building clean, meaningful, and future-ready software.\n\n" +
      "This is my latest portfolio — go ahead and explore. Click around,\n" +
      "check out my projects, and see what I've been working on.\n\n" +
      "Found a bug or something that looks off? Please reach out right away —\n" +
      "I genuinely appreciate every report. 📧  support@ahmershah.dev",
    msgStyle,
  );

  console.log(
    "%c🌐  https://ahmershah.dev\n" +
      "💼  https://linkedin.com/in/syedahmershah\n" +
      "🐙  https://github.com/ahmershahdev\n" +
      "🐦  https://twitter.com/ahmershah29\n" +
      "💬  https://wa.me/923263186750\n" +
      "📧  support@ahmershah.dev",
    linkStyle,
  );

  console.log(
    "%c© 2026 – Present  Ahmer Shah. All rights reserved.",
    copyStyle,
  );
})();