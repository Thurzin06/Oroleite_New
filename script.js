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

// Function to show form messages
function showFormMessage(message, type = 'error', timeout = 5000) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = `form-message form-message--${type}`;
    if (timeout > 0) {
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, timeout);
    }
}

// ========== Segurança: Honeypot anti-spam ==========
// Adicione um campo hidden no HTML: <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
// Bots costumam preencher esse campo, humanos não.

/* ==========================
   EmailJS Configuration - REMOVED FOR SECURITY
   Using Netlify Forms instead
   ========================== */

/* ========================================
   FORM HANDLING - Simplified for Netlify Forms
   ======================================== */

// Initialize form handling
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        // Don't prevent default - let Netlify handle it
        // But add validation first

        // ========== Honeypot anti-spam ==========
        const honeypot = this.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) {
            e.preventDefault();
            showFormMessage('Envio bloqueado por suspeita de spam.', 'error');
            return;
        }

        // Get form values
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // ========== Validação reforçada ==========
        if (!data.name || !data.email || !data.message) {
            e.preventDefault();
            showFormMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        // Nome mínimo 2 letras
        if (data.name.trim().length < 2) {
            e.preventDefault();
            showFormMessage('Nome muito curto.', 'error');
            return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            e.preventDefault();
            showFormMessage('Por favor, insira um email válido.', 'error');
            return;
        }
        // Mensagem mínima
        if (data.message.trim().length < 5) {
            e.preventDefault();
            showFormMessage('Mensagem muito curta.', 'error');
            return;
        }

        // ========== Segurança extra: Limite de envio por sessão ==========
        if (window.sessionStorage) {
            const lastSent = sessionStorage.getItem('lastContactSent');
            if (lastSent && Date.now() - parseInt(lastSent) < 60000) { // 1 min
                e.preventDefault();
                showFormMessage('Aguarde um minuto antes de enviar novamente.', 'error');
                return;
            }
        }

        // If validation passes, let Netlify handle the form
        // Netlify will show success message automatically
        if (window.sessionStorage) sessionStorage.setItem('lastContactSent', Date.now().toString());
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
