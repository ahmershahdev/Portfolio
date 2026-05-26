# Ahmer Shah

Hey, I'm Ahmer—a full-stack developer obsessed with clean code, performance, and building things that actually work. This is my latest portfolio site, and I maintain it actively because, let's be honest, a dead portfolio is worse than no portfolio.

## What You'll Find Here

**Live Sites**

- Production: https://ahmershah.dev
- Backup: https://ahmershahdev.github.io/Portfolio/

The site showcases my work, education, certifications, and ways to get in touch. It's built to be blazing fast, accessible, and doesn't require you to turn off animations to read the content.

## The Stack (Because Context Matters)

**Frontend**

- Semantic HTML5 with proper structure and metadata
- Vanilla JavaScript—no heavy frameworks unless absolutely necessary
- CSS3 with custom properties, grid, and flexbox (and yes, animations that respect prefers-reduced-motion)
- Bootstrap 5 for the grid foundation, customized heavily

**Assets & Performance**

- Three.js for 3D elements (orbit visualization, scene effects)
- Blender for 3D model generation
- WebP with PNG fallbacks for images
- Service worker for intelligent caching
- Deferred non-critical CSS loading
- Responsive images with lazy loading

**Deployment**

- Static hosting (no database, no backend needed)
- Git-based workflow
- Vercel Web Analytics for silent performance tracking
- Google Tag Manager for event tracking
- Formspree for form handling

## Features That Actually Matter

- **Responsive Design**: Works on everything from old phones to 4K monitors
- **Performance First**: Lighthouse scores that don't make me cringe
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Dark & Light Mode**: Toggle based on preference, persisted across sessions
- **Project Carousel**: Smooth swiping (disabled on mobile to prevent accidents)
- **Certificate Flipbook**: Yes, it's a book you can flip through (cool, I know)
- **Social Hub**: All my professional and personal profiles in one place
- **Contact Form**: Actually works. I get emails. They're real.
- **Reduced Motion Support**: Because not everyone wants your site to spin
- **SEO Ready**: Schema markup, Open Graph tags, structured data

## How to Run This Locally

```bash
# Clone the repo
git clone https://github.com/ahmershahdev/Portfolio.git
cd Portfolio

# Option 1: Use Python's built-in server
python -m http.server 8000

# Option 2: Use Node's HTTP server
npx http-server

# Option 3: Just open index.html in your browser (limited features without a server)
```

Then visit `http://localhost:8000`

## Performance & Optimization

- **Service Worker Caching**: Critical assets cached aggressively, other assets cache-first
- **Lazy Loading**: Images load only when they're about to enter the viewport
- **Content-Visibility**: Sections optimized for offscreen rendering
- **FX Settings**: Users can toggle 3D animations for older devices
- **Reduced Motion**: Detects `prefers-reduced-motion` and respects it
- **Bundle Size**: Minimal dependencies, tree-shaking where possible

## Upcoming Features

- Blog integration with real articles (not just links)
- Dark mode system theme detection (not just manual toggle)
- Newsletter subscription with email validation
- Project case studies with detailed problem statements and solutions
- Performance budget monitoring via GitHub Actions
- API for contact form analytics
- Lighthouse CI to catch performance regressions

## Pending Work / Known Issues

- Mobile project carousel could use smoother transitions
- Certificate images need better mobile sizing (in progress)
- Font loading strategy could be more aggressive
- Need to add `fetchpriority` hints for above-the-fold images
- SEO for project pages (currently only main page is indexed)
- Browser support testing for older Safari versions
- Accessibility audit needed (WCAG 2.1 AA target)

## Contact

- Email: support@ahmershah.dev
- Website: https://ahmershah.dev
- LinkedIn: https://linkedin.com/in/syedahmershah
- GitHub: https://github.com/ahmershahdev
- Twitter: https://twitter.com/ahmershah29

## License

This project is proprietary and confidential. You can look, admire the code, and maybe learn something. You can't use it to build your own portfolio site and pass it off as yours. See [LICENSE](LICENSE.txt) for the legal stuff.

---

If you found something broken or have suggestions, open an issue. I actually read them.
