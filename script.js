/* ========================================
   HERO SLIDER
   ======================================== */

const heroSlider = document.getElementById('heroSlider');
const heroSlides = document.querySelectorAll('.hero-slide');
const hero = document.getElementById('inicio');
let currentSlide = 0;

function showSlide(n) {
    heroSlides.forEach(slide => slide.classList.remove('active'));
    heroSlides[n].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    showSlide(currentSlide);
}

// Auto-rotate hero slides every 8 seconds
let heroInterval = setInterval(nextSlide, 8000);

// Pause on hover
hero.addEventListener('mouseenter', () => {
    clearInterval(heroInterval);
});

hero.addEventListener('mouseleave', () => {
    clearInterval(heroInterval);
    heroInterval = setInterval(nextSlide, 8000);
});

/* ========================================
   HEADER SCROLL EFFECTS
   ======================================== */

const header = document.getElementById('header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

/* ========================================
   MOBILE MENU TOGGLE
   ======================================== */

const menuToggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    menu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.menu__link').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        menu.classList.remove('active');
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-toggle') && !e.target.closest('.menu')) {
        menuToggle.classList.remove('active');
        menu.classList.remove('active');
    }
});

/* ========================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ======================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ========================================
   INTERSECTION OBSERVER - SCROLL ANIMATIONS
   ======================================== */

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with data-animate attribute
document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
});

/* ========================================
   FORM HANDLING
   ======================================== */

const contactForm = document.querySelector('#contactForm');
const toastContainer = document.getElementById('toastContainer');
const formMessage = document.getElementById('formMessage');

// ========== Segurança: Honeypot anti-spam ==========
// Adicione um campo hidden no HTML: <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
// Bots costumam preencher esse campo, humanos não.

/* ==========================
   EmailJS Configuration
   Replace placeholders with your EmailJS IDs
   ========================== */
const EMAILJS_USER_ID = 'BnrBkR1lRgmOu7SwT';
const EMAILJS_SERVICE_ID = 'service_c1wu1yf';
const EMAILJS_TEMPLATE_ID = 'template_v1dmhae'; // inserido pelo usuário

// Initialize EmailJS if SDK loaded
if (window.emailjs && typeof emailjs.init === 'function' && EMAILJS_USER_ID && !EMAILJS_USER_ID.includes('YOUR')) {
    try { emailjs.init(EMAILJS_USER_ID); } catch (e) { console.warn('EmailJS init failed', e); }
}

function showToast(message, type = 'success', timeout = 4500) {
    if (!toastContainer) return;
    const t = document.createElement('div');
    t.className = `toast toast--${type}`;
    t.textContent = message;
    toastContainer.appendChild(t);
    // allow CSS transition
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                // ========== Honeypot anti-spam ==========
                const honeypot = this.querySelector('input[name="website"]');
                if (honeypot && honeypot.value) {
                    showFormMessage('Envio bloqueado por suspeita de spam.', 'error');
                    return;
                }

                // Get form values
                const formData = new FormData(this);
                const data = Object.fromEntries(formData);

                // ========== Validação reforçada ==========
                if (!data.name || !data.email || !data.message) {
                    showFormMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
                    return;
                }
                // Nome mínimo 2 letras
                if (data.name.trim().length < 2) {
                    showFormMessage('Nome muito curto.', 'error');
                    return;
                }
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email)) {
                    showFormMessage('Por favor, insira um email válido.', 'error');
                    return;
                }
                // Mensagem mínima
                if (data.message.trim().length < 5) {
                    showFormMessage('Mensagem muito curta.', 'error');
                    return;
                }

                // ========== UX: Bloqueio de duplo envio ==========
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn ? submitBtn.textContent : null;
                if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; }

                // ========== Coleta de variáveis extras ==========
                // Data/hora local
                const now = new Date();
                const date = now.toLocaleDateString('pt-BR');
                const time = now.toLocaleTimeString('pt-BR');
                // Página
                const page_url = window.location.href;
                // IP (via API pública, fallback '')
                let user_ip = '';
                try {
                    const resp = await fetch('https://api.ipify.org?format=json');
                    if (resp.ok) {
                        const ipData = await resp.json();
                        user_ip = ipData.ip;
                    }
                } catch (err) { user_ip = ''; }

                // ========== Segurança extra: Limite de envio por sessão ==========
                if (window.sessionStorage) {
                    const lastSent = sessionStorage.getItem('lastContactSent');
                    if (lastSent && Date.now() - parseInt(lastSent) < 60000) { // 1 min
                        showFormMessage('Aguarde um minuto antes de enviar novamente.', 'error');
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
                        return;
                    }
                }

                // ========== Fallback mailto ==========
                const emailjsConfigured = EMAILJS_USER_ID && !EMAILJS_USER_ID.includes('YOUR') &&
                                        EMAILJS_SERVICE_ID && !EMAILJS_SERVICE_ID.includes('YOUR') &&
                                        EMAILJS_TEMPLATE_ID && !EMAILJS_TEMPLATE_ID.includes('YOUR');

                if (!emailjsConfigured || typeof emailjs === 'undefined') {
                    // fallback: open mailto in new window (user must send manual)
                    const subject = encodeURIComponent('Contato pelo site - ' + data.name);
                    const body = encodeURIComponent(`Nome: ${data.name}\nTelefone: ${data.phone || ''}\n\n${data.message}`);
                    const mailto = `mailto:oroleite@oroleite.com.br?subject=${subject}&body=${body}`;
                    window.open(mailto, '_blank');
                    showToast('Abra o cliente de e-mail para finalizar o envio.', 'success');
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
                    this.reset();
                    return;
                }

                // ========== Envio via EmailJS ==========
                const templateParams = {
                    from_name: data.name,
                    name: data.name,
                    reply_to: data.email,
                    email: data.email,
                    phone: data.phone || '',
                    company: data.company || '',
                    subject: data.subject || '',
                    message: data.message,
                    date,
                    time,
                    page_url,
                    user_ip
                };

                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                    .then(() => {
                        showToast('Obrigado! Sua mensagem foi enviada com sucesso.', 'success');
                        showFormMessage('', 'success', 1);
                        contactForm.reset();
                        if (window.sessionStorage) sessionStorage.setItem('lastContactSent', Date.now().toString());
                    }, (err) => {
                        console.error('EmailJS error', err);
                        showFormMessage('Erro ao enviar mensagem. Tente novamente mais tarde.', 'error');
                        showToast('Erro ao enviar mensagem.', 'error');
                    })
                    .finally(() => {
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
                    });
            });
        }
        if (!emailjsConfigured || typeof emailjs === 'undefined') {
            // fallback: open mailto in new window (user must send manually)
            const subject = encodeURIComponent('Contato pelo site - ' + data.name);
            const body = encodeURIComponent(`Nome: ${data.name}\nTelefone: ${data.phone || ''}\n\n${data.message}`);
            const mailto = `mailto:oroleite@oroleite.com.br?subject=${subject}&body=${body}`;
            window.open(mailto, '_blank');
            showToast('Abra o cliente de e-mail para finalizar o envio.', 'success');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
            this.reset();
            return;
        }

        // Collect extra metadata: date/time, page URL, public IP (best-effort)
        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        const page_url = window.location.href;
        let user_ip = '';
        try {
            const r = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
            if (r && r.ok) {
                const j = await r.json();
                user_ip = j.ip || '';
            }
        } catch (err) {
            // don't fail on IP lookup
        }

        // Send via EmailJS
        const templateParams = {
            from_name: data.name,
            name: data.name,
            reply_to: data.email,
            email: data.email,
            phone: data.phone || '',
            company: data.company || '',
            subject: data.subject || '',
            message: data.message,
            date: date,
            time: time,
            page_url: page_url,
            user_ip: user_ip
        };

        try {
            const resp = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            // mark last submit timestamp
            try { localStorage.setItem('lastSubmitTimestamp', String(Date.now())); } catch (e) {}
            showToast('Obrigado! Sua mensagem foi enviada com sucesso.', 'success');
            showFormMessage('', 'success', 1000);
            contactForm.reset();
        } catch (err) {
            console.warn('EmailJS error', err);
            // If EmailJS call failed, fallback to mailto as last resort
            showFormMessage('Erro ao enviar mensagem. Tentando alternativa...', 'error');
            showToast('Erro ao enviar via EmailJS; abrindo cliente de e-mail.', 'error');
            const subject = encodeURIComponent('Contato pelo site - ' + data.name);
            const body = encodeURIComponent(`Nome: ${data.name}\nTelefone: ${data.phone || ''}\n\n${data.message}`);
            window.open(`mailto:oroleite@oroleite.com.br?subject=${subject}&body=${body}`, '_blank');
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalBtnText; }
        }
    });
}

/* ========================================
   LAZY LOAD IMAGES
   ======================================== */

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
