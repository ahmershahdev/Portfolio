# Ahmer Shah | Software Engineer & Full-Stack Developer

![Portfolio Preview](assets/images/projects/3D_Portfolio.webp)

## Overview

This repository contains the source for Ahmer Shah's personal portfolio website. It highlights projects, certificates,
skills, and contact information with a focus on performance, accessibility, and SEO readiness.

## Features

- Responsive layout with custom UI components
- Interactive project and certificate showcases
- Lazy-loaded media and optimized assets
- Structured metadata and sitemap for search engines

## Tech Stack

- HTML5, CSS3, JavaScript
- Bootstrap 5
- Three.js, Blender (3D assets)

## Running Locally

1. Clone the repository

   ```bash
   git clone https://github.com/ahmershahdev/Portfolio.git
   cd Portfolio
   ```

2. Open in a browser

   ```bash
   # Simple
   open index.html

   # Local server
   python -m http.server 8000
   ```

## Performance Notes

- Critical CSS is loaded early; non-critical CSS is deferred.
- Images use WebP where available.
- A service worker provides runtime caching for static assets.

## Links

- Live site: https://ahmershah.dev
- GitHub Pages: https://ahmershahdev.github.io/Portfolio/

## License

This project is proprietary and confidential. See [LICENSE](LICENSE.txt) for details.
