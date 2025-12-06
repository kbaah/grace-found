// Grace Found Home Care Agency - JavaScript

const CONTACT_FORM_API = 'https://gracefound-contact-form.kwabena-baahboakye.workers.dev';

document.addEventListener('DOMContentLoaded', function() {

    // =====================================================
    // Mobile Navigation
    // =====================================================
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // =====================================================
    // Header Scroll Effect
    // =====================================================
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // =====================================================
    // Active Navigation Link on Scroll
    // =====================================================
    const sections = document.querySelectorAll('section[id]');

    function setActiveNav() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', setActiveNav);

    // =====================================================
    // Smooth Scroll for Anchor Links
    // =====================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =====================================================
    // Back to Top Button
    // =====================================================
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =====================================================
    // Contact Form Handling
    // =====================================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // Basic validation
            const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
            let isValid = true;

            requiredFields.forEach(field => {
                const input = this.querySelector(`[name="${field}"]`);
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e53e3e';
                } else {
                    input.style.borderColor = '';
                }
            });

            // Email validation
            const emailInput = this.querySelector('[name="email"]');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && !emailRegex.test(emailInput.value)) {
                isValid = false;
                emailInput.style.borderColor = '#e53e3e';
            }

            // Phone validation (basic)
            const phoneInput = this.querySelector('[name="phone"]');
            const phoneRegex = /^[\d\s\-\(\)\+]{10,}$/;
            if (phoneInput && !phoneRegex.test(phoneInput.value)) {
                isValid = false;
                phoneInput.style.borderColor = '#e53e3e';
            }

            // Privacy checkbox
            const privacyCheckbox = this.querySelector('[name="privacy"]');
            if (privacyCheckbox && !privacyCheckbox.checked) {
                isValid = false;
                alert('Please agree to the Privacy Policy to submit your request.');
                return;
            }

            if (isValid) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;

                // Send to Cloudflare Worker / SendGrid
                fetch(CONTACT_FORM_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        submitBtn.innerHTML = '<i class="fas fa-check"></i> Request Sent!';
                        submitBtn.style.background = '#48bb78';

                        setTimeout(() => {
                            contactForm.reset();
                            submitBtn.innerHTML = originalText;
                            submitBtn.style.background = '';
                            submitBtn.disabled = false;
                            alert('Thank you for your inquiry! We will contact you within 24 hours.');
                        }, 1500);
                    } else {
                        throw new Error(result.error || 'Failed to send');
                    }
                })
                .catch(error => {
                    console.error('Form submission error:', error);
                    submitBtn.innerHTML = '<i class="fas fa-times"></i> Error';
                    submitBtn.style.background = '#e53e3e';

                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                        alert('Sorry, there was an error sending your request. Please call us directly at (223) 378-6560.');
                    }, 1500);
                });
            }
        });

        // Clear error styling on input
        contactForm.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('input', function() {
                this.style.borderColor = '';
            });
        });
    }

    // =====================================================
    // Scroll Animation (Intersection Observer)
    // =====================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                animateOnScroll.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.service-card, .badge-item, .testimonial-card, .why-feature, .caregiver-feature, .setting-card, .mv-card'
    );

    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.animationDelay = `${index * 0.1}s`;
        animateOnScroll.observe(el);
    });

    // =====================================================
    // Phone Number Click Tracking (Analytics Ready)
    // =====================================================
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            // Track phone clicks (integrate with Google Analytics or other)
            console.log('Phone click tracked:', this.getAttribute('href'));

            // If using Google Analytics:
            // gtag('event', 'click', {
            //     'event_category': 'Contact',
            //     'event_label': 'Phone Call',
            //     'value': 1
            // });
        });
    });

    // =====================================================
    // Lazy Loading Images (Native + Fallback)
    // =====================================================
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for older browsers
        const lazyImages = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // =====================================================
    // Counter Animation (for stats if added)
    // =====================================================
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }

    // Observe counters
    document.querySelectorAll('[data-counter]').forEach(counter => {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.counter);
                    animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counterObserver.observe(counter);
    });

    // =====================================================
    // Preloader (Optional - uncomment if needed)
    // =====================================================
    /*
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });
    */

    // =====================================================
    // Initialize
    // =====================================================
    console.log('Grace Found Home Care Agency website initialized');
});

// =====================================================
// Service Worker Registration (for PWA - optional)
// =====================================================
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
*/
