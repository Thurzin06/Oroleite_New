document.addEventListener('DOMContentLoaded', ()=>{
  const cards = document.querySelectorAll('.product-card');
  if(!cards.length) return;

  function titleize(str){
    if(!str) return '';
    str = decodeURIComponent(str);
    // keep only filename if full path
    str = str.replace(/.*[\\\/]/, '');
    // remove extension
    str = str.replace(/\.[^.]+$/, '');
    // remove EAN codes and long numeric sequences
    str = str.replace(/EAN[-_\s]*\d+/gi, '');
    str = str.replace(/\b\d{5,}\b/g,'');
    // remove leading number prefixes like "01. " or "01 "
    str = str.replace(/^\d+\.?\s*/,'');
    // replace separators with space
    str = str.replace(/[_\-\u2013\u2014]+/g,' ');
    str = str.replace(/[\/:]+/g,' ');
    // remove file-specific tokens like "Mockups" or "ROT" or "DSP"
    str = str.replace(/\b(Mockups|ROT|DSP|DSPTRENTO|ROTTrento)\b/gi,'');
    // remove leftover parentheses and trailing numbers
    str = str.replace(/\(.*?\)/g,'');
    str = str.replace(/\b\d+\b$/,'');
    // collapse spaces
    str = str.replace(/\s+/g,' ').trim();
    // common brand tokens to nicer form
    str = str.replace(/\bNOTMAYO\b/gi,'NotMayo');
    str = str.replace(/\bNOTMILK\b/gi,'NotMilk');
    str = str.replace(/\bNOTSHAKE\b/gi,'NotShake');
    // Title Case
    str = str.toLowerCase().split(' ').map(w=> w.length>2 ? w[0].toUpperCase()+w.slice(1) : w ).join(' ');
    return str;
  }

  cards.forEach(card=>{
    const img = card.querySelector('img');
    const overlayH4 = card.querySelector('.product-overlay h4');
    let source = '';
    if(img) source = img.getAttribute('alt') || img.getAttribute('src') || '';
    const pretty = titleize(source);
    if(overlayH4){
      overlayH4.textContent = pretty || overlayH4.textContent;
    } else {
      // create overlay if missing
      const overlay = document.createElement('div');
      overlay.className = 'product-overlay';
      const h4 = document.createElement('h4'); h4.textContent = pretty;
      overlay.appendChild(h4);
      const media = card.querySelector('.product-media') || card;
      media.appendChild(overlay);
    }
  });

  // determine current brand from path (e.g., brands/galbani.html -> galbani)
  function currentBrandSlug(){
    try{
      const parts = location.pathname.split('/');
      const last = parts.pop() || parts.pop();
      return (last || '').replace(/\.html$/i,'').toLowerCase();
    }catch(e){ return '' }
  }

  const brandSlug = currentBrandSlug();

  // basic mapping of keywords -> descriptions per brand. You can extend these.
  const BRAND_DESC_MAP = {
    galbani: [
      ['muss', 'Queijo mussarela: sabor autêntico, ideal para lanches e pizzas.'],
      ['ricota', 'Ricota fresca: ótima para preparos e recheios.'],
      ['reque', 'Requeijão cremoso Galbani. Excelente para patês e receitas.'],
      ['grana', 'Grana Padano ralado: finalização perfeita para massas.']
    ],
    notco: [
      ['notmilk', 'Bebida vegetal NotCo: alternativa sem lactose.'],
      ['notmayo', 'Maionese vegana NotCo: cremosidade sem ingredientes de origem animal.'],
      ['shake', 'Shake vegetal NotCo: prático e saboroso.'],
      ['creme', 'Creme de leite vegetal NotCo: ideal para cozinhar e sobremesas.']
    ],
    nestle: [
      ['nesquik', 'Achocolatado em pó Nestlé.'],
      ['chamb', 'Produtos lácteos Nestlé.'],
      ['grego', 'Iogurte Grego: textura encorpada e sabor fresco.']
    ],
    peccin: [
      ['peccin', 'Produto Peccin disponível.'],
    ],
    bauducco: [
      ['bauducco', 'Biscoitos e panettones Bauducco.'],
    ],
    puri: [
      ['puri', 'Produtos Puri: qualidade em bebidas e derivados.'],
    ],
    viscont: [
      ['viscont', 'Linha Viscont: laticínios e especialidades.'],
    ],
    life: [
      ['life', 'Produtos Life: seleção de itens saudáveis.'],
    ],
    zinho: [
      ['zinho', 'Produtos Zinho: itens práticos para o dia a dia.'],
    ]
  };

  function lookupBrandDescription(brand, title){
    if(!brand || !title) return '';
    const rules = BRAND_DESC_MAP[brand];
    if(!rules) return '';
    const t = title.toLowerCase();
    for(const [kw, desc] of rules){
      if(t.indexOf(kw.toLowerCase()) !== -1) return desc;
    }
    return '';
  }

  // --- Product Modal: open larger image + description on click ---
  // create modal element
  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.innerHTML = `
    <div class="product-modal__backdrop"></div>
    <div class="product-modal__dialog" role="dialog" aria-modal="true">
      <button class="product-modal__close" aria-label="Fechar">×</button>
      <div class="product-modal__media"><img src="" alt=""/></div>
      <div class="product-modal__content">
        <h3></h3>
        <p></p>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const modalImg = modal.querySelector('.product-modal__media img');
  const modalTitle = modal.querySelector('.product-modal__content h3');
  const modalDesc = modal.querySelector('.product-modal__content p');
  const modalDialog = modal.querySelector('.product-modal__dialog');
  const modalClose = modal.querySelector('.product-modal__close');

  function openModal(imgSrc, imgAlt, title, desc){
    modalImg.src = imgSrc || imgAlt || '';
    modalImg.alt = imgAlt || title || '';
    modalTitle.textContent = title || '';
    modalDesc.textContent = desc || '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // clear src to help mobile browsers
    modalImg.src = '';
  }

  // attach handlers to cards
  cards.forEach(card=>{
    const imgEl = card.querySelector('img');
    const titleEl = card.querySelector('.product-overlay h4');
    const descEl = card.querySelector('.product-overlay p');
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e)=>{
      // avoid clicks on internal links or buttons
      const tag = e.target.tagName.toLowerCase();
      if(tag === 'a' || tag === 'button') return;
      const src = imgEl ? (imgEl.dataset.large || imgEl.src) : '';
      const alt = imgEl ? (imgEl.alt || '') : '';
      const title = titleEl ? titleEl.textContent : titleize(alt || src);
      let desc = descEl ? descEl.textContent : (imgEl ? (imgEl.dataset.desc || imgEl.getAttribute('title') || '') : '');
      // if no explicit description, try brand-specific mapping
      if(!desc){
        const auto = lookupBrandDescription(brandSlug, title);
        if(auto) desc = auto;
      }
      openModal(src, alt, title, desc);
    });
  });

  // close events
  modalClose.addEventListener('click', closeModal);
  modal.querySelector('.product-modal__backdrop').addEventListener('click', closeModal);
  modal.addEventListener('keydown', (ev)=>{
    if(ev.key === 'Escape') closeModal();
  });
  // ensure dialog gets focus when opened (delegated): observe class changes
  const obs = new MutationObserver((mut)=>{
    mut.forEach(m=>{
      if(m.attributeName === 'class'){
        if(modal.classList.contains('open')){
          modalDialog.setAttribute('tabindex','-1');
          modalDialog.focus();
        }
      }
    });
  });
  obs.observe(modal, { attributes: true });
});
