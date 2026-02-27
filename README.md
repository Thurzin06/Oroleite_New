# Nova Oroleite

This repository contains the static site for Oroleite.

## Generating category sections automatically

A Node script has been provided to collect `product-card` elements from the
brand pages (`brands/*.html`) and insert them into the appropriate category
sections of `index.html`.

Categories are defined in `scripts/generateCategorySections.js` by mapping
category IDs (`bebidas`, `congelados`, `confeitaria`) to brand slugs. You can
edit this mapping in the script if needed.

To use the script you'll need Node.js installed. Install dependencies with:

```bash
npm install cheerio
```

Then run:

```bash
node scripts/generateCategorySections.js
```

Running the script updates `index.html` in place and can be re-run whenever
you add or remove products from the brand files.

If you don't have Node, you can still manually copy the `.product-card`
elements from the brand pages into the `<div class="products-grid">`
sections added for each category.
