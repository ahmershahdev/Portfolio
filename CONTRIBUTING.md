# Contributing to My Portfolio

First off, thanks for even thinking about contributing. Most people don't, so this is genuinely appreciated.

## The Honest Bits

This is a personal portfolio site, not a community project. That means contributing is a bit different than contributing to open-source libraries. Below is how it actually works.

## Found a Bug or Issue?

Great, I want to know. Open a GitHub issue with:

- What you did (or what you were doing)
- What you expected to happen
- What actually happened
- Screenshots if relevant (especially for visual bugs)
- Browser, OS, device info (if it's device-specific)

Example of a good issue:

> "The certificate carousel doesn't work on mobile Safari. The flipbook effect freezes on swiping. I'm using iPhone 13, iOS 17.2. Expected: smooth flip transition. Actual: nothing happens after first swipe."

Example of a bad issue:

> "site broken"

One of these gets fixed. Guess which one.

## Suggestions & Feedback

If you think something could be better (design, layout, content, whatever), I want to hear it. Open an issue or email me at support@ahmershah.dev with:

- What you're suggesting
- Why you think it's better
- Any references or examples

Keep it constructive. "Your design sucks" doesn't help anyone. "The hero section is visually cluttered on mobile, consider reducing the animation density" actually does.

## Code Changes

This is where it gets tricky. The portfolio is personal, which means I'm picky about code changes. Here's what happens:

**For Small Fixes (typos, dead links, minor bugs)**

- Submit a PR with a clear description
- I'll review and merge if it's solid
- No need to ask permission for these

**For Feature Additions or Significant Changes**

- Open an issue first to discuss
- I'll let you know if I'm interested or if it conflicts with my plans
- Only then should you write code and submit a PR
- "You didn't ask first and I don't want this feature" PRs will be closed politely

## Code Style & Standards

I'm not a snob about this, but I have preferences:

**HTML**

- Use semantic elements (nav, section, article, etc.)
- Write valid HTML—test it
- Include proper ARIA labels where needed
- Avoid divitis (wrapping everything in divs)

**CSS**

- Use CSS custom properties for colors and spacing
- Keep specificity low—no `!important` unless absolutely necessary
- Mobile-first approach with media queries for larger screens
- Meaningful class names, not `box-1`, `container-2`, etc.
- If it's complex, add a comment explaining why

**JavaScript**

- Vanilla JS preferred, no unnecessary libraries
- Clear variable names (not `x`, `y`, `temp`)
- Comments for non-obvious logic
- Performance matters—measure before and after changes
- No inline event listeners on a thousand elements

**Performance**

- Don't add heavy libraries without a good reason
- Check your changes don't tank Lighthouse scores
- Lazy load images and defer non-critical CSS
- Minify and optimize assets

**Accessibility**

- Test with keyboard navigation only
- Run through a screen reader occasionally
- Ensure color contrast meets WCAG standards
- Don't assume everyone uses a mouse

## What I'm NOT Looking For

- Complete rewrites of working code
- Adding jQuery, Bootstrap JS, or other frameworks when vanilla JS works
- Heavy animations for the sake of animations
- Tracking pixels and third-party scripts (within reason)
- Changes that break existing functionality without a really good reason
- Dependencies for dependencies (lodash for one function)

## Licensing

This portfolio is proprietary and confidential. If you contribute code, you're cool with it being used in the portfolio under those same terms. No GPL or weird licenses, please.

## Communication

Be respectful. This is a solo project, so I'm doing code review in my free time. If I don't respond immediately, I'm not ignoring you—I might just be busy shipping features or fixing production bugs.

- GitHub Issues: I check these regularly (usually within 48 hours)
- Email: support@ahmershah.dev for more sensitive stuff
- Twitter: @ahmershah29 if you want to chat

## Questions?

Don't have perfect information? That's okay. Ask in an issue or email me. I'd rather answer questions than have you spend hours guessing what I want.

---

Thanks again for caring enough to contribute. Seriously. It means this portfolio isn't just sitting in a void—someone out there actually looked at the code and thought "I can help."

That's cool.
