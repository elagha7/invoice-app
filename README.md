# Frontend Mentor - Invoice app solution

This is a solution to the [Invoice app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/invoice-app-i7KaLTQjl). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the app depending on their device's screen size
- See hover states for all interactive elements on the page
- Create, read, update, and delete invoices
- Receive form validations when trying to create/edit an invoice
- Save draft invoices, and mark pending invoices as paid
- Filter invoices by status (draft/pending/paid)
- Toggle light and dark mode
- **Bonus**: Keep track of any changes, even after refreshing the browser (`localStorage`)

### Screenshot

![](./screenshot.jpg)

<!-- TODO: add a screenshot of your solution and update the path above. -->

### Links

- Solution URL: [Add solution URL here](https://your-solution-url.com)
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties (light and dark themes)
- Flexbox
- CSS Grid
- Media queries for tablet and mobile layouts
- Vanilla JavaScript (no frameworks)
- `localStorage` for persisting invoices

### What I learned

<!-- TODO: rewrite these in your own words and keep only what you really took away. -->

- Keeping the app's data in one place (`allInvoices`) and re-rendering the list from it after every change, instead of editing the page by hand.
- Event delegation: one listener on the invoice list (using `closest()` and `dataset`) instead of one per card.
- Escaping user input before putting it into `innerHTML` to avoid XSS:

```js
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

- Deriving data instead of storing it by hand: an item's total is `quantity × price`, an invoice's total is the sum of its items, and the due date is the invoice date plus the payment terms.
- Persisting state with `localStorage` and falling back to `data.json` on first load.

### Continued development

- Custom styled date picker and dropdown (these are optional in the design).
- Sticky action buttons at the bottom of the form panel.
- Email format validation and a clearer error message for it.
- Linking every `<label>` to its input and adding ARIA attributes for better accessibility.
- Remembering the chosen theme after a refresh.

### AI Collaboration

<!-- TODO: edit this so it accurately describes what you did yourself and what the AI did. -->

I used Claude while building this project. It helped me:

- Review my HTML and CSS against the design files and find mismatches.
- Understand each concept step by step (state and rendering, event delegation, validation, `localStorage`).
- Write a large part of the JavaScript, which I then tested in the browser one step at a time.

What worked well: small steps with a clear thing to test after each one. What didn't: when I was given too much code at once I lost track of what each part did, so I asked for smaller steps and explanations.

## Author

- Website - [Add your name here](https://www.your-site.com)
- Frontend Mentor - [@yourusername](https://www.frontendmentor.io/profile/yourusername)
