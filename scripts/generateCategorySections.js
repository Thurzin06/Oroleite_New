// Node script to populate index.html category sections automatically
// Usage: node scripts/generateCategorySections.js

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// configuration of categories -> brands
const categoryMap = {
  bebidas: ['nestle', 'puri', 'notco', 'life'],
  congelados: ['zinho'],
  confeitaria: ['bauducco', 'peccin', 'visconti', 'galbani'],
};

// paths
const brandsDir = path.join(__dirname, '..', 'brands');
const indexPath = path.join(__dirname, '..', 'index.html');

function readBrandCards(slug) {
  const file = path.join(brandsDir, `${slug}.html`);
  if (!fs.existsSync(file)) {
    console.warn(`brand file not found: ${file}`);
    return '';
  }
  const content = fs.readFileSync(file, 'utf8');
  const $ = cheerio.load(content);
  // grab all .product-card elements from the page
  const cards = $('.product-card').toArray().map(el => $.html(el)).join('\n');
  return cards;
}

function updateIndex() {
  const html = fs.readFileSync(indexPath, 'utf8');
  const $ = cheerio.load(html);

  for (const [cat, brands] of Object.entries(categoryMap)) {
    const selector = `#${cat} .products-grid`;
    const $grid = $(selector);
    if (!$grid.length) {
      console.warn(`no grid found for category ${cat}`);
      continue;
    }
    let combined = '';
    brands.forEach(slug => {
      combined += '\n' + readBrandCards(slug);
    });
    $grid.html(combined);
  }

  fs.writeFileSync(indexPath, $.html(), 'utf8');
  console.log('index.html updated with category products');
}

updateIndex();
