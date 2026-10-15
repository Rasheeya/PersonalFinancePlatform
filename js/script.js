/**
 * PERSONAL FINANCE PLATFORM — MAIN SCRIPT
 * File: js/script.js
 * Strictly client-side JavaScript powering all 9 pages and error view.
 * Brand Colors: #1F3C88 (Primary Royal Blue), #FFFFFF (Secondary White), #F5A623 (Accent Amber Gold)
 * No emojis or keyboard icons in UI.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // 1. DOM READY HELPER & GLOBAL STATE
  // -------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollEffects();
    initCounters();
    initAccordions();
    initParallax();
    initModals();
    initForms();
    initBlog();
    initUserDashboard();
    initClientDashboard();
    initCharts();
    initProgressBarAnimation();
    initBackToTop();
    init404Redirection();
  });

  // -------------------------------------------------------------
  // 2. NAVIGATION (Public Pages: Navbar, Mobile Drawer, Sticky)
  // -------------------------------------------------------------
  function initNavigation() {
    const navbar = document.querySelector('.site-navbar');
    const toggleBtn = document.querySelector('.navbar-toggle');
    const mobileMenu = document.querySelector('.navbar-menu');

    // Sticky navbar on scroll (Public pages and Dashboards)
    const allHeaders = document.querySelectorAll('.site-navbar, .dash-header, .client-header');
    if (allHeaders.length > 0) {
      window.addEventListener('scroll', function () {
        const isScrolled = window.scrollY > 20;
        allHeaders.forEach(function (hdr) {
          if (isScrolled) {
            hdr.classList.add('navbar-scrolled');
          } else {
            hdr.classList.remove('navbar-scrolled');
          }
        });
      }, { passive: true });
    }

    // Mobile Hamburger / Closing Tag Toggle
    if (toggleBtn && mobileMenu) {
      let savedScrollY = 0;

      function stopAllScroll(e) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();
        return false;
      }

      function lockScrollPosition() {
        if (savedScrollY !== undefined && savedScrollY >= 0) {
          window.scrollTo(0, savedScrollY);
        }
      }

      function preventKeyScroll(e) {
        // Space (32), PageUp (33), PageDown (34), End (35), Home (36), Left (37), Up (38), Right (39), Down (40)
        const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
        if (scrollKeys.indexOf(e.keyCode) !== -1 && !['INPUT', 'TEXTAREA'].includes((e.target && e.target.tagName) || '')) {
          if (e.cancelable) {
            e.preventDefault();
          }
          e.stopPropagation();
          return false;
        }
      }

      function setMobileMenuOpen(isOpen) {
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation drawer' : 'Open navigation drawer');

        if (isOpen) {
          savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          toggleBtn.classList.add('active');
          mobileMenu.classList.add('active');
          document.documentElement.classList.add('mobile-nav-open');
          document.body.classList.add('mobile-nav-open');

          // Capture phase listeners to stop all scroll gestures completely
          window.addEventListener('wheel', stopAllScroll, { passive: false, capture: true });
          window.addEventListener('touchmove', stopAllScroll, { passive: false, capture: true });
          window.addEventListener('scroll', lockScrollPosition, { passive: false, capture: true });
          document.addEventListener('scroll', lockScrollPosition, { passive: false, capture: true });
          window.addEventListener('keydown', preventKeyScroll, { passive: false, capture: true });
        } else {
          toggleBtn.classList.remove('active');
          mobileMenu.classList.remove('active');
          document.documentElement.classList.remove('mobile-nav-open');
          document.body.classList.remove('mobile-nav-open');

          window.removeEventListener('wheel', stopAllScroll, { capture: true });
          window.removeEventListener('touchmove', stopAllScroll, { capture: true });
          window.removeEventListener('scroll', lockScrollPosition, { capture: true });
          document.removeEventListener('scroll', lockScrollPosition, { capture: true });
          window.removeEventListener('keydown', preventKeyScroll, { capture: true });

          // Restore exact scroll position cleanly
          if (savedScrollY > 0) {
            window.scrollTo(0, savedScrollY);
          }
        }

        const icon = toggleBtn.querySelector('i');
        if (icon) {
          if (isOpen) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
          } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
          }
        }
      }

      toggleBtn.addEventListener('click', function () {
        const isCurrentlyActive = mobileMenu.classList.contains('active');
        setMobileMenuOpen(!isCurrentlyActive);
      });

      // Close menu when clicking any nav link inside mobile drawer
      const links = mobileMenu.querySelectorAll('a');
      links.forEach(function (link) {
        link.addEventListener('click', function () {
          setMobileMenuOpen(false);
        });
      });

      // Reset state if window is resized past mobile breakpoint
      window.addEventListener('resize', function () {
        if (window.innerWidth > 991 && mobileMenu.classList.contains('active')) {
          setMobileMenuOpen(false);
        }
      });
    }

    // Highlight current page nav link accurately across all pages
    const rawPath = window.location.pathname.split('/').pop().toLowerCase();
    const currentPath = (rawPath === '' || rawPath === 'index.htm') ? 'index.html' : rawPath;

    const allNavLinks = document.querySelectorAll('.site-navbar .nav-links a');
    allNavLinks.forEach(function (link) {
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (href === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Handle any in-page anchor links smoothly (e.g. footer sub-services or #main-content)
    const inPageLinks = document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href^="#!"])');
    inPageLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        // Exclude dashboard view-switching sidebar items
        if (
          link.classList.contains('sidebar-nav-item') ||
          link.classList.contains('client-sidebar-nav-item') ||
          link.hasAttribute('data-target-view')
        ) {
          return;
        }

        const hash = link.getAttribute('href');
        let targetEl = null;
        try {
          targetEl = document.querySelector(hash);
        } catch (err) {
          targetEl = null;
        }

        if (targetEl) {
          e.preventDefault();
          const navHeight = navbar ? navbar.offsetHeight : 76;
          const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight + 2;
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth'
          });
          try {
            if (history.pushState) {
              history.pushState(null, null, hash);
            } else {
              window.location.hash = hash;
            }
          } catch (err) {
            window.location.hash = hash;
          }
        }
      });
    });

    // Handle landing on page with an in-page hash (e.g. service.html#budget-planning)
    if (window.location.hash) {
      setTimeout(function () {
        try {
          const targetEl = document.querySelector(window.location.hash);
          if (targetEl) {
            const navHeight = navbar ? navbar.offsetHeight : 76;
            const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - navHeight + 2;
            window.scrollTo({
              top: Math.max(0, targetTop),
              behavior: 'smooth'
            });
          }
        } catch (err) {}
      }, 150);
    }
  }

  // -------------------------------------------------------------
  // 3. SCROLL REVEAL ANIMATIONS (Intersection Observer)
  // -------------------------------------------------------------
  function initScrollEffects() {
    const reveals = document.querySelectorAll(
      '.reveal-fade-up, .reveal-fade-down, .reveal-fade-left, .reveal-fade-right, .reveal-scale, .reveal-pop, .stagger-card'
    );
    if (!reveals.length) return;

    // Auto-stagger card grids for rhythmic cascade entrance
    const gridSelectors = [
      '.overview-grid',
      '.service-cards-grid',
      '.features-grid',
      '.timeline-grid',
      '.testimonials-grid',
      '.recent-blog-grid',
      '.tool-features-grid',
      '.pillars-grid',
      '.blog-article-grid',
      '.contact-info-grid',
      '.resource-grid',
      '.metric-cards-grid'
    ];
    gridSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (container) {
        Array.from(container.children).forEach(function (child, i) {
          if (!child.style.transitionDelay) {
            child.style.transitionDelay = ((i % 8) * 0.08 + 0.04).toFixed(2) + 's';
          }
        });
      });
    });

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      reveals.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  // -------------------------------------------------------------
  // 4. ANIMATED COUNTERS
  // -------------------------------------------------------------
  function initCounters() {
    const counters = document.querySelectorAll('.counter-val');
    if (!counters.length) return;

    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-target') || '0');
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const duration = 1600;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = target * easeOut;

            el.textContent = prefix + (decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal).toLocaleString()) + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
              el.classList.add('counter-finished');
            }
          }

          requestAnimationFrame(updateCounter);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  // -------------------------------------------------------------
  // 4B. ANIMATED FINANCIAL PROGRESS BARS & CAPACITY METERS
  // -------------------------------------------------------------
  function animateCounterNumber(el, targetVal, totalStr, prefix, duration) {
    if (!el) return;
    const startTime = performance.now();
    prefix = prefix || '$';
    const suffix = totalStr ? ' / ' + totalStr : '';

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth cubic-out easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(targetVal * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + targetVal.toLocaleString() + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  function animateSingleProgressBar(bar, delayMs) {
    if (!bar) return;
    let targetW = bar.getAttribute('data-target-width');
    if (!targetW) {
      targetW = bar.style.width || bar.getAttribute('data-width') || '100%';
      bar.setAttribute('data-target-width', targetW);
    }

    // Number counter animation if inside mock-progress-item or card
    const item = bar.closest('.mock-progress-item, .overview-metric-card, .budget-card, .goal-card, .dash-metric-card');
    if (item) {
      const strongEl = item.querySelector('strong');
      if (strongEl) {
        let rawText = strongEl.getAttribute('data-original-text');
        if (!rawText) {
          rawText = strongEl.textContent.trim();
          strongEl.setAttribute('data-original-text', rawText);
        }
        // Match pattern like "$1,950 / $2,200" or "$1,950"
        const match = rawText.match(/\$([0-9,]+)(?:\s*\/\s*(\$[0-9,]+))?/);
        if (match) {
          const numVal = parseInt(match[1].replace(/,/g, ''), 10);
          const totalStr = match[2] || '';
          setTimeout(function () {
            animateCounterNumber(strongEl, numVal, totalStr, '$', 1350);
          }, delayMs || 0);
        }
      }
    }

    bar.style.transition = 'none';
    bar.style.width = '0%';
    void bar.offsetWidth; // Force reflow
    setTimeout(function () {
      bar.style.transition = 'width 1.35s cubic-bezier(0.22, 1, 0.36, 1)';
      bar.style.width = targetW;
    }, delayMs || 30);
  }

  function animateProgressBars(container) {
    const root = container || document;
    const bars = root.querySelectorAll(
      '.progress-bar, .progress-bar-fill, .budget-progress-fill, .goal-progress-fill, .overview-progress-fill, .mock-progress-fill'
    );
    if (!bars.length) return;

    bars.forEach(function (bar, idx) {
      animateSingleProgressBar(bar, idx * 160);
    });
  }

  function initProgressBarAnimation() {
    const progressBars = document.querySelectorAll(
      '.progress-bar, .progress-bar-fill, .budget-progress-fill, .goal-progress-fill, .overview-progress-fill, .mock-progress-fill'
    );
    if (!progressBars.length) return;

    // Cache initial target widths
    progressBars.forEach(function (bar) {
      const targetW = bar.getAttribute('data-target-width') || bar.style.width || bar.getAttribute('data-width') || '100%';
      bar.setAttribute('data-target-width', targetW);
      // Pre-set 0% width if element is not in initial screen viewport so it animates when scrolled
      const rect = bar.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) {
        bar.style.width = '0%';
      }
    });

    if ('IntersectionObserver' in window) {
      const animatedContainers = new WeakSet();
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const container = entry.target;
            if (!animatedContainers.has(container)) {
              animatedContainers.add(container);
              const bars = container.querySelectorAll(
                '.progress-bar, .progress-bar-fill, .budget-progress-fill, .goal-progress-fill, .overview-progress-fill, .mock-progress-fill'
              );
              bars.forEach(function (bar, idx) {
                animateSingleProgressBar(bar, idx * 180);
              });
            }
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

      // Observe cards and containers for smooth group triggering
      const cardContainers = document.querySelectorAll(
        '.interactive-mock-card, .overview-metric-card, .card-premium, .dash-metric-card, .client-summary-card'
      );
      if (cardContainers.length > 0) {
        cardContainers.forEach(function (c) {
          if (c.querySelector('.progress-bar, .progress-bar-fill, .budget-progress-fill, .goal-progress-fill, .overview-progress-fill, .mock-progress-fill')) {
            observer.observe(c);
          }
        });
      }
      // Also observe any isolated progress bars
      progressBars.forEach(function (b) {
        if (!b.closest('.interactive-mock-card, .overview-metric-card, .card-premium')) {
          observer.observe(b);
        }
      });
    } else {
      animateProgressBars(document);
    }

    // Replay on clicking interactive mock card or its badge
    document.querySelectorAll('.interactive-mock-card, .interactive-mock-header .badge').forEach(function (el) {
      el.style.cursor = 'pointer';
      el.title = 'Click to replay animation';
      el.addEventListener('click', function () {
        const card = el.closest('.interactive-mock-card') || el;
        const bars = card.querySelectorAll('.mock-progress-fill, .progress-bar');
        bars.forEach(function (bar, idx) {
          animateSingleProgressBar(bar, idx * 180);
        });
      });
    });
  }

  // -------------------------------------------------------------
  // 5. ACCORDIONS (FAQ)
  // -------------------------------------------------------------
  function initAccordions() {
    const accordions = document.querySelectorAll('.faq-accordion');
    accordions.forEach(function (acc) {
      const items = acc.querySelectorAll('.faq-item');
      items.forEach(function (item) {
        const header = item.querySelector('.faq-question');
        if (!header) return;

        header.addEventListener('click', function () {
          const isOpen = item.classList.contains('active');
          // Close other items in same accordion if data-single="true"
          if (acc.getAttribute('data-single') !== 'false') {
            items.forEach(function (i) {
              i.classList.remove('active');
              const btn = i.querySelector('.faq-question');
              if (btn) btn.setAttribute('aria-expanded', 'false');
            });
          }
          if (!isOpen) {
            item.classList.add('active');
            header.setAttribute('aria-expanded', 'true');
          } else {
            item.classList.remove('active');
            header.setAttribute('aria-expanded', 'false');
          }
        });
      });
    });
  }

  // -------------------------------------------------------------
  // 6. MOUSE PARALLAX ON DESKTOP
  // -------------------------------------------------------------
  function initParallax() {
    const container = document.querySelector('.hero-parallax-wrap');
    if (!container || window.innerWidth < 992) return;

    const layers = container.querySelectorAll('.parallax-layer');
    if (!layers.length) return;

    container.addEventListener('mousemove', function (e) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      layers.forEach(function (layer) {
        const speed = parseFloat(layer.getAttribute('data-speed') || '15');
        const moveX = x * speed;
        const moveY = y * speed;
        layer.style.transform = 'translate3d(' + moveX + 'px, ' + moveY + 'px, 0)';
      });
    });

    container.addEventListener('mouseleave', function () {
      layers.forEach(function (layer) {
        layer.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // -------------------------------------------------------------
  // 7. MODALS
  // -------------------------------------------------------------
  function initModals() {
    // Open Modal Triggers
    document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const modalId = btn.getAttribute('data-open-modal');
        openModal(modalId);
      });
    });

    // Close Modal Triggers
    document.querySelectorAll('[data-close-modal], .modal-overlay').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target === el || el.hasAttribute('data-close-modal')) {
          e.preventDefault();
          const modal = el.closest('.modal-container');
          if (modal) closeModal(modal.id);
        }
      });
    });

    // Escape Key closes active modals
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-container.active');
        if (activeModal) closeModal(activeModal.id);
      }
    });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // -------------------------------------------------------------
  // 8. FORMS & VALIDATION (Login, Signup, Contact, Newsletter)
  // -------------------------------------------------------------
  function initForms() {
    // Password visibility toggle
    document.querySelectorAll('.password-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const inputId = btn.getAttribute('data-target');
        const input = document.getElementById(inputId);
        const icon = btn.querySelector('i');
        if (!input) return;

        if (input.type === 'password') {
          input.type = 'text';
          if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          }
          btn.setAttribute('aria-label', 'Hide password');
        } else {
          input.type = 'password';
          if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
          btn.setAttribute('aria-label', 'Show password');
        }
      });
    });

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(loginForm);

        const email = loginForm.querySelector('#loginEmail');
        const pass = loginForm.querySelector('#loginPassword');
        const role = loginForm.querySelector('input[name="demoRole"]:checked');
        let isValid = true;

        if (!email.value.trim()) {
          showFieldError(email, 'Email is required.');
          isValid = false;
        } else if (!validateEmail(email.value.trim())) {
          showFieldError(email, 'Please provide a valid email address.');
          isValid = false;
        }

        if (!pass.value.trim()) {
          showFieldError(pass, 'Password is required.');
          isValid = false;
        }

        if (!isValid) return;

        // Persist session identity from entered email
        const enteredEmail = email.value.trim();
        const derivedName = formatNameFromEmail(enteredEmail);
        try {
          sessionStorage.setItem('finvantage_auth_email', enteredEmail);
          sessionStorage.setItem('finvantage_auth_name', derivedName);
          localStorage.setItem('finvantage_auth_email', enteredEmail);
          localStorage.setItem('finvantage_auth_name', derivedName);
        } catch (storageErr) {
          console.warn('Storage unavailable:', storageErr);
        }

        // Show honest demo status notification
        const statusBox = document.getElementById('loginStatusBox');
        if (statusBox) {
          statusBox.innerHTML = '<div class="alert-box alert-success">' +
            '<i class="fa-solid fa-circle-check"></i> ' +
            '<strong>Authentication Verified:</strong> Welcome ' + escapeHtml(derivedName) + '! Redirecting to your dashboard...' +
            '</div>';
        }

        const selectedRole = role ? role.value : 'user';
        const targetUrl = selectedRole === 'client' ? 'client-dashboard.html' : 'user-dashboard.html';

        setTimeout(function () {
          window.location.href = targetUrl;
        }, 900);
      });
    }

    // Signup Form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(signupForm);

        const name = signupForm.querySelector('#signupName');
        const email = signupForm.querySelector('#signupEmail');
        const pass = signupForm.querySelector('#signupPassword');
        const confirmPass = signupForm.querySelector('#signupConfirmPassword');
        const terms = signupForm.querySelector('#signupTerms');
        let isValid = true;

        if (!name.value.trim() || name.value.trim().length < 2) {
          showFieldError(name, 'Full Name is required.');
          isValid = false;
        }

        if (!email.value.trim()) {
          showFieldError(email, 'Email is required.');
          isValid = false;
        } else if (!validateEmail(email.value.trim())) {
          showFieldError(email, 'Please provide a valid email address.');
          isValid = false;
        }

        if (!pass.value) {
          showFieldError(pass, 'Password is required.');
          isValid = false;
        } else if (pass.value.length < 8) {
          showFieldError(pass, 'Password must be at least 8 characters long.');
          isValid = false;
        }

        if (!confirmPass.value) {
          showFieldError(confirmPass, 'Please confirm your password.');
          isValid = false;
        } else if (confirmPass.value !== pass.value) {
          showFieldError(confirmPass, 'Passwords do not match.');
          isValid = false;
        }

        if (!terms.checked) {
          showFieldError(terms, 'You must acknowledge the terms to continue.');
          isValid = false;
        }

        if (!isValid) return;

        // Persist session identity from registration
        const registeredName = name.value.trim();
        const registeredEmail = email.value.trim();
        try {
          sessionStorage.setItem('finvantage_auth_email', registeredEmail);
          sessionStorage.setItem('finvantage_auth_name', registeredName);
          localStorage.setItem('finvantage_auth_email', registeredEmail);
          localStorage.setItem('finvantage_auth_name', registeredName);
        } catch (storageErr) {
          console.warn('Storage unavailable:', storageErr);
        }

        const statusBox = document.getElementById('signupStatusBox');
        if (statusBox) {
          statusBox.innerHTML = '<div class="alert-box alert-success">' +
            '<i class="fa-solid fa-circle-check"></i> ' +
            '<strong>Account Created:</strong> Welcome ' + escapeHtml(registeredName) + '! Redirecting to login...' +
            '</div>';
        }

        setTimeout(function () {
          window.location.href = 'login.html';
        }, 1200);
      });
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(contactForm);

        const name = contactForm.querySelector('#contactName');
        const email = contactForm.querySelector('#contactEmail');
        const subject = contactForm.querySelector('#contactSubject');
        const message = contactForm.querySelector('#contactMessage');
        let isValid = true;

        if (!name.value.trim()) {
          showFieldError(name, 'Full Name is required.');
          isValid = false;
        }

        if (!email.value.trim()) {
          showFieldError(email, 'Email is required.');
          isValid = false;
        } else if (!validateEmail(email.value.trim())) {
          showFieldError(email, 'Please provide a valid email address.');
          isValid = false;
        }

        if (!subject.value.trim()) {
          showFieldError(subject, 'Inquiry subject is required.');
          isValid = false;
        }

        if (!message.value.trim()) {
          showFieldError(message, 'Message is required.');
          isValid = false;
        } else if (message.value.trim().length < 10) {
          showFieldError(message, 'Message must be at least 10 characters long.');
          isValid = false;
        }

        if (!isValid) return;

        window.location.href = '404.html';
      });
    }

    // Newsletter Forms (Home, About, Service, Blog, Contact, Footer)
    document.querySelectorAll('.newsletter-form, .newsletter-form-box').forEach(function (form) {
      form.setAttribute('novalidate', 'true');
      const input = form.querySelector('input[type="email"]');
      const msgBox = form.parentElement.querySelector('.newsletter-feedback') || form.querySelector('.newsletter-feedback');
      const inputWrap = form.querySelector('.footer-newsletter-form') || form.querySelector('.blog-newsletter-form') || form;

      if (input) {
        input.addEventListener('input', function () {
          input.classList.remove('has-error');
          if (inputWrap) inputWrap.classList.remove('has-error');
          form.classList.remove('has-error');
          if (msgBox) {
            const errEl = msgBox.querySelector('.form-error-msg, .text-error');
            if (errEl) msgBox.innerHTML = '';
          }
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!input) return;

        const val = input.value.trim();

        if (!val) {
          input.classList.add('has-error');
          if (inputWrap) inputWrap.classList.add('has-error');
          form.classList.add('has-error');
          if (msgBox) {
            msgBox.innerHTML = '<span class="form-error-msg text-error"><i class="fa-solid fa-circle-exclamation"></i> Email is required.</span>';
          }
          input.focus();
          return;
        }

        if (!validateEmail(val)) {
          input.classList.add('has-error');
          if (inputWrap) inputWrap.classList.add('has-error');
          form.classList.add('has-error');
          if (msgBox) {
            msgBox.innerHTML = '<span class="form-error-msg text-error"><i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address.</span>';
          }
          input.focus();
          return;
        }

        input.classList.remove('has-error');
        if (inputWrap) inputWrap.classList.remove('has-error');
        form.classList.remove('has-error');
        window.location.href = '404.html';
      });
    });

    // Service Page demo summary report download
    const serviceReportBtn = document.getElementById('downloadServiceSummaryBtn');
    if (serviceReportBtn) {
      serviceReportBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showFieldError(element, msg) {
    const parent = element.closest('.form-group') || element.closest('.footer-newsletter-form') || element.closest('.blog-newsletter-form') || element.parentElement;
    parent.classList.add('has-error');
    element.classList.add('has-error');
    let err = parent.querySelector('.form-error-msg');
    if (!err) {
      err = document.createElement('div');
      err.className = 'form-error-msg text-error';
      parent.appendChild(err);
    }
    err.textContent = msg;

    element.addEventListener('input', function onInputClear() {
      parent.classList.remove('has-error');
      element.classList.remove('has-error');
      if (err) err.remove();
      element.removeEventListener('input', onInputClear);
    });
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.has-error').forEach(function (el) {
      el.classList.remove('has-error');
    });
    form.querySelectorAll('.form-error-msg').forEach(function (el) {
      el.remove();
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // -------------------------------------------------------------
  // User Profile & Authentication State Helpers
  // -------------------------------------------------------------
  function formatNameFromEmail(email) {
    if (!email || !email.includes('@')) return 'Alex Morgan';
    const userPart = email.split('@')[0];
    const cleaned = userPart.replace(/[._\-+]/g, ' ').replace(/\d+/g, ' ').trim();
    let words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      words = [email.split('@')[0]];
    }
    return words
      .map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');
  }

  function getActiveUserProfile(defaultName, defaultEmail) {
    let email = '';
    let name = '';
    try {
      email = sessionStorage.getItem('finvantage_auth_email') || localStorage.getItem('finvantage_auth_email') || '';
      name = sessionStorage.getItem('finvantage_auth_name') || localStorage.getItem('finvantage_auth_name') || '';
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }

    if (!email) {
      email = defaultEmail;
    }
    if (!name) {
      name = email ? formatNameFromEmail(email) : defaultName;
    }

    return {
      name: name,
      email: email,
      firstName: name.split(' ')[0] || name
    };
  }

  // -------------------------------------------------------------
  // 9. BLOG PAGE (Filter & Search & Modal Article Preview)
  // -------------------------------------------------------------
  const BLOG_ARTICLES = [
    {
      id: 'blog-1',
      title: 'How to Build an Emergency Fund',
      category: 'savings',
      date: 'October 10, 2026',
      readTime: '6 min read',
      image: 'assets/images/blog-1.webp',
      snippet: 'Learn how to calculate a resilient 3-to-6-month safety net and automate risk-free cash buffers.',
      body: '<p>An emergency cash reserve is the bedrock of lasting personal solvency. Rather than viewing liquid savings as idle capital, treat your safety buffer as an active hedge against unforeseen obligations, sudden medical costs, or volatile employment markets.</p><h4>1. Define Your Essential Baseline</h4><p>Calculate strictly unavoidable monthly costs: housing, debt commitments, foundational utilities, and nutrition. Discretionary recreation and subscription tiers are omitted during crisis budgeting.</p><h4>2. Automate Velocity Over Volume</h4><p>Consistency outperforms lump-sum deposits. Configure auto-transfers on primary paydays toward a high-yield yield account to eliminate discretionary friction.</p>'
    },
    {
      id: 'blog-2',
      title: 'Smart Ways to Manage Monthly Expenses',
      category: 'budgeting',
      date: 'October 8, 2026',
      readTime: '5 min read',
      image: 'assets/images/blog-2.webp',
      snippet: 'Discover tactical frameworks to audit recurring outlays, identify silent leaks, and curb inflation.',
      body: '<p>Controlling cash outflows does not demand austerity; it demands awareness and intentional allocation. Unmonitored recurring renewals and dining creep represent the largest drags on personal balance sheets.</p><h4>Audit Subscriptions Quarterly</h4><p>Consolidate duplicative digital services. Most households maintain three to four subscriptions they utilize fewer than twice per month.</p><h4>Implement Category Caps</h4><p>Establish strict spending partitions for volatile categories such as grocery deliveries and entertainment.</p>'
    },
    {
      id: 'blog-3',
      title: 'Creating a Realistic Personal Budget',
      category: 'planning',
      date: 'October 4, 2026',
      readTime: '8 min read',
      image: 'assets/images/blog-3.webp',
      snippet: 'Step-by-step guidance on implementing balanced 50/30/20 proportions tailored to modern economic reality.',
      body: '<p>A budget is not a restriction—it is a blueprint granting you permission to spend without guilt. Realistic frameworks provide elasticity for unexpected fluctuations rather than rigid, brittle rules.</p><h4>The 50/30/20 Baseline</h4><p>Direct 50% of net compensation toward vital obligations, 30% toward lifestyle priorities, and 20% directly toward debt amortization or savings capital.</p>'
    },
    {
      id: 'blog-4',
      title: 'Debt Repayment Strategies That Work',
      category: 'debt',
      date: 'September 28, 2026',
      readTime: '7 min read',
      image: 'assets/images/blog-4.webp',
      snippet: 'Compare the Avalanche vs Snowball protocols to engineer mathematically optimal or psychologically empowering debt paydown.',
      body: '<p>Amortizing outstanding liabilities requires choosing between mathematical efficiency and behavioral momentum. Both strategies are valid depending on individual psychological profiles.</p><h4>Debt Avalanche</h4><p>Target obligations carrying the highest percentage interest rates first to minimize cumulative financing expense over time.</p><h4>Debt Snowball</h4><p>Eliminate minor balances first to secure psychological milestones and free up tangible monthly cash flow.</p>'
    },
    {
      id: 'blog-5',
      title: 'Long-Term Financial Goal Setting',
      category: 'planning',
      date: 'September 22, 2026',
      readTime: '6 min read',
      image: 'assets/images/blog-5.webp',
      snippet: 'Synthesize 5-year and 10-year milestones into daily execution tactics using compounding models.',
      body: '<p>Abstract desires rarely convert into net worth. Structuring capital accumulation into chronological horizons transforms intimidating future milestones into manageable monthly commitments.</p><h4>Segment by Horizon</h4><p>Differentiate short-term targets (1-2 years), mid-range asset acquisitions (3-5 years), and generational independence (10+ years).</p>'
    },
    {
      id: 'blog-6',
      title: 'Psychology of Spending & Mindful Habits',
      category: 'wellness',
      date: 'September 15, 2026',
      readTime: '5 min read',
      image: 'assets/images/blog-6.webp',
      snippet: 'Unpack behavioral triggers, retail therapy impulses, and delayed gratification mechanisms for financial peace.',
      body: '<p>Money decisions are driven predominantly by neurological emotion rather than pure mathematical calculation. Understanding psychological triggers enables sustainable financial health.</p><h4>The 72-Hour Friction Rule</h4><p>Enforce an intentional 72-hour delay on any non-essential acquisition exceeding $100 to mitigate dopamine-driven impulse buys.</p>'
    }
  ];

  function initBlog() {
    const blogContainer = document.getElementById('blogArticleGrid');
    if (!blogContainer) return;

    const searchInput = document.getElementById('blogSearchInput');
    const categoryBtns = document.querySelectorAll('.blog-filter-btn');
    let currentCategory = 'all';
    let currentQuery = '';

    function renderArticles() {
      const filtered = BLOG_ARTICLES.filter(function (item) {
        const matchesCat = currentCategory === 'all' || item.category === currentCategory;
        const matchesQuery = !currentQuery ||
          item.title.toLowerCase().includes(currentQuery) ||
          item.snippet.toLowerCase().includes(currentQuery);
        return matchesCat && matchesQuery;
      });

      if (!filtered.length) {
        blogContainer.innerHTML = '<div class="col-12 text-center py-5">' +
          '<div class="empty-state-card">' +
          '<i class="fa-solid fa-magnifying-glass fa-3x text-accent mb-3"></i>' +
          '<h3 class="text-primary">No Articles Found</h3>' +
          '<p class="text-muted">No insights match your search criteria. Try a different keyword or reset filters.</p>' +
          '</div></div>';
        return;
      }

      blogContainer.innerHTML = filtered.map(function (art) {
        return '<article class="col-lg-4 col-md-6 mb-4">' +
          '<div class="blog-card card-premium h-100">' +
          '<div class="blog-card-media">' +
          '<img src="' + art.image + '" alt="' + escapeHtml(art.title) + '" loading="lazy" class="img-fluid">' +
          '<span class="blog-badge">' + art.category.toUpperCase() + '</span>' +
          '</div>' +
          '<div class="blog-card-body">' +
          '<div class="blog-meta">' +
          '<span><i class="fa-regular fa-calendar"></i> ' + art.date + '</span>' +
          '<span><i class="fa-regular fa-clock"></i> ' + art.readTime + '</span>' +
          '</div>' +
          '<h3 class="blog-title">' + escapeHtml(art.title) + '</h3>' +
          '<p class="blog-snippet">' + escapeHtml(art.snippet) + '</p>' +
          '<button type="button" class="btn btn-outline-primary btn-sm blog-read-btn" data-article-id="' + art.id + '">' +
          'Read Article <i class="fa-solid fa-arrow-right ms-1"></i>' +
          '</button>' +
          '</div>' +
          '</div>' +
          '</article>';
      }).join('');

      // Attach article preview click handlers to redirect to 404
      blogContainer.querySelectorAll('.blog-read-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = '404.html';
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        currentQuery = searchInput.value.trim().toLowerCase();
        renderArticles();
      });
    }

    categoryBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        categoryBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category') || 'all';
        renderArticles();
      });
    });

    renderArticles();
  }

  function openBlogModal(id) {
    const art = BLOG_ARTICLES.find(function (a) { return a.id === id; });
    if (!art) return;

    const modalTitle = document.getElementById('blogModalTitle');
    const modalCategory = document.getElementById('blogModalCategory');
    const modalDate = document.getElementById('blogModalDate');
    const modalImage = document.getElementById('blogModalImage');
    const modalBody = document.getElementById('blogModalBody');

    if (modalTitle) modalTitle.textContent = art.title;
    if (modalCategory) modalCategory.textContent = art.category.toUpperCase();
    if (modalDate) modalDate.textContent = art.date + ' • ' + art.readTime;
    if (modalImage) {
      modalImage.src = art.image;
      modalImage.alt = art.title;
    }
    if (modalBody) modalBody.innerHTML = art.body;

    openModal('blogArticleModal');
  }

  // -------------------------------------------------------------
  // 10. USER DASHBOARD INTERACTIVITY
  // -------------------------------------------------------------
  function initUserDashboard() {
    const dash = document.querySelector('.user-dashboard-wrapper');
    if (!dash) return;

    // Sync User Identity from Login Credentials
    const userProfile = getActiveUserProfile('Alex Morgan', 'alex.morgan@finvantage.local');

    // 1. Welcome Section & Avatar Initial
    const userFirstName = userProfile.firstName || userProfile.name.split(' ')[0] || userProfile.name;
    const userInitial = userFirstName.charAt(0).toUpperCase();

    const welcomeNameEl = document.getElementById('dashWelcomeName');
    if (welcomeNameEl) {
      welcomeNameEl.textContent = userFirstName;
    }
    const avatarInitialEl = document.getElementById('dashAvatarInitial');
    if (avatarInitialEl) {
      avatarInitialEl.textContent = userInitial;
    }

    // 2. Profile Logo & Details Section
    const profileNameEl = document.getElementById('dashProfileName');
    if (profileNameEl) {
      profileNameEl.textContent = userProfile.name;
    }
    const profileEmailEl = document.getElementById('dashProfileEmail');
    if (profileEmailEl) {
      profileEmailEl.textContent = userProfile.email;
    }
    const profileAvatar = document.getElementById('dashProfileAvatar');
    if (profileAvatar) {
      profileAvatar.setAttribute('alt', userProfile.name + ' Avatar');
    }

    // 3. Settings Form Inputs (View 6)
    const settingsNameInput = document.getElementById('dashSettingsName');
    if (settingsNameInput) {
      settingsNameInput.value = userProfile.name;
    }
    const settingsEmailInput = document.getElementById('dashSettingsEmail');
    if (settingsEmailInput) {
      settingsEmailInput.value = userProfile.email;
    }

    // Sidebar navigation switching
    const navItems = dash.querySelectorAll('.sidebar-nav-item');
    const sections = dash.querySelectorAll('.dash-view-section');
    const sidebar = dash.querySelector('.dash-sidebar');
    const sidebarToggle = dash.querySelector('.dash-sidebar-toggle');
    const sidebarClose = dash.querySelector('.dash-sidebar-close');
    const sidebarBackdrop = dash.querySelector('.dash-sidebar-backdrop');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
        if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active');
      });
    }
    if (sidebarClose && sidebar) {
      sidebarClose.addEventListener('click', function () {
        sidebar.classList.remove('active');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      });
    }
    if (sidebarBackdrop && sidebar) {
      sidebarBackdrop.addEventListener('click', function () {
        sidebar.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
      });
    }

    navItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const targetView = item.getAttribute('data-target-view');
        if (!targetView) return;

        navItems.forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');

        sections.forEach(function (sec) {
          if (sec.id === targetView) {
            sec.classList.add('active');
            animateProgressBars(sec);
          } else {
            sec.classList.remove('active');
          }
        });

        // Close mobile drawer on item select
        if (sidebar && window.innerWidth < 992) {
          sidebar.classList.remove('active');
          if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        }

        // Reset scroll position to top when switching views
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Render charts when any section becomes active
        setTimeout(initCharts, 60);
        setTimeout(initCharts, 250);
      });
    });

    // Sample Interactive Budget Items
    let userBudgets = [
      { id: 1, category: 'Housing & Utilities', planned: 2200, spent: 1950 },
      { id: 2, category: 'Groceries & Dining', planned: 900, spent: 780 },
      { id: 3, category: 'Transportation', planned: 450, spent: 390 },
      { id: 4, category: 'Healthcare & Wellness', planned: 350, spent: 210 },
      { id: 5, category: 'Entertainment & Leisure', planned: 400, spent: 340 }
    ];

    function renderBudgets() {
      const container = document.getElementById('userBudgetList');
      if (!container) return;

      container.innerHTML = userBudgets.map(function (b) {
        const remaining = Math.max(0, b.planned - b.spent);
        const pct = Math.min(100, Math.round((b.spent / b.planned) * 100));
        const isNearLimit = pct >= 85;

        return '<div class="budget-card mb-3 p-3">' +
          '<div class="d-flex justify-content-between align-items-center mb-2">' +
          '<h5 class="m-0 text-primary fw-bold">' + escapeHtml(b.category) + '</h5>' +
          '<span class="badge ' + (isNearLimit ? 'badge-accent' : 'badge-primary') + '">' + pct + '% Allocated</span>' +
          '</div>' +
          '<div class="progress mb-2" style="height: 10px;">' +
          '<div class="progress-bar ' + (isNearLimit ? 'bg-accent' : 'bg-primary') + '" style="width: ' + pct + '%;"></div>' +
          '</div>' +
          '<div class="d-flex justify-content-between text-muted small">' +
          '<span>Spent: $' + b.spent.toLocaleString() + '</span>' +
          '<span>Limit: $' + b.planned.toLocaleString() + '</span>' +
          '<span class="fw-bold text-primary">Remaining: $' + remaining.toLocaleString() + '</span>' +
          '</div>' +
          '</div>';
      }).join('');
      animateProgressBars(container);
    }
    renderBudgets();

    // Add Budget Form
    const addBudgetForm = document.getElementById('addBudgetForm');
    if (addBudgetForm) {
      addBudgetForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(addBudgetForm);
        const cat = document.getElementById('budgetCatInput');
        const planned = document.getElementById('budgetPlannedInput');
        let isValid = true;

        if (!cat || !cat.value.trim()) {
          if (cat) showFieldError(cat, 'Category Name is required.');
          isValid = false;
        }
        if (!planned || isNaN(parseFloat(planned.value)) || parseFloat(planned.value) <= 0) {
          if (planned) showFieldError(planned, 'Please enter a valid planned limit.');
          isValid = false;
        }

        if (!isValid) return;

        window.location.href = '404.html';
      });
    }

    // Sample Transactions Data
    let userTransactions = [
      { id: 1, title: 'Payroll Direct Deposit', date: '2026-10-10', category: 'Income', type: 'income', amount: 4850 },
      { id: 2, title: 'Metro Housing Management', date: '2026-10-08', category: 'Housing', type: 'expense', amount: 1650 },
      { id: 3, title: 'Organic Market Groceries', date: '2026-10-06', category: 'Groceries', type: 'expense', amount: 142.50 },
      { id: 4, title: 'Clean Power Utility', date: '2026-10-04', category: 'Utilities', type: 'expense', amount: 98.20 },
      { id: 5, title: 'Freelance Advisory Retainer', date: '2026-10-01', category: 'Income', type: 'income', amount: 1200 },
      { id: 6, title: 'High-Yield Reserve Deposit', date: '2026-09-28', category: 'Savings', type: 'expense', amount: 800 },
      { id: 7, title: 'Urban Transit Card', date: '2026-09-26', category: 'Transport', type: 'expense', amount: 65.00 }
    ];

    function renderTransactions() {
      const tbody = document.getElementById('userTxnTableBody');
      const search = document.getElementById('txnSearchInput');
      const filterCat = document.getElementById('txnFilterCategory');
      const sortSelect = document.getElementById('txnSortSelect');
      if (!tbody) return;

      const q = search ? search.value.trim().toLowerCase() : '';
      const cat = filterCat ? filterCat.value : 'all';
      const sort = sortSelect ? sortSelect.value : 'date-desc';

      let list = userTransactions.filter(function (t) {
        const matchesQ = !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
        const matchesCat = cat === 'all' || t.category.toLowerCase() === cat.toLowerCase();
        return matchesQ && matchesCat;
      });

      list.sort(function (a, b) {
        if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sort === 'amount-desc') return b.amount - a.amount;
        if (sort === 'amount-asc') return a.amount - b.amount;
        return 0;
      });

      if (!list.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">' +
          '<i class="fa-solid fa-receipt me-2"></i> No transactions found matching filters.</td></tr>';
        return;
      }

      tbody.innerHTML = list.map(function (t) {
        const isIncome = t.type === 'income';
        return '<tr>' +
          '<td><strong class="text-primary">' + escapeHtml(t.title) + '</strong></td>' +
          '<td>' + t.date + '</td>' +
          '<td><span class="badge badge-subtle">' + escapeHtml(t.category) + '</span></td>' +
          '<td><span class="badge ' + (isIncome ? 'badge-primary' : 'badge-accent') + '">' + (isIncome ? 'Credit' : 'Debit') + '</span></td>' +
          '<td class="text-end fw-bold ' + (isIncome ? 'text-primary' : 'text-accent') + '">' +
          (isIncome ? '+' : '-') + '$' + t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
          '</td>' +
          '</tr>';
      }).join('');
    }

    if (document.getElementById('userTxnTableBody')) {
      const sInput = document.getElementById('txnSearchInput');
      const fCat = document.getElementById('txnFilterCategory');
      const sSort = document.getElementById('txnSortSelect');
      if (sInput) sInput.addEventListener('input', renderTransactions);
      if (fCat) fCat.addEventListener('change', renderTransactions);
      if (sSort) sSort.addEventListener('change', renderTransactions);
      renderTransactions();
    }

    // Add Transaction Form
    const addTxnForm = document.getElementById('addTxnForm');
    if (addTxnForm) {
      addTxnForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(addTxnForm);
        const title = document.getElementById('txnTitleInput');
        const amount = document.getElementById('txnAmountInput');
        let isValid = true;

        if (!title || !title.value.trim()) {
          if (title) showFieldError(title, 'Description is required.');
          isValid = false;
        }
        if (!amount || isNaN(parseFloat(amount.value)) || parseFloat(amount.value) <= 0) {
          if (amount) showFieldError(amount, 'Please enter a valid positive amount.');
          isValid = false;
        }

        if (!isValid) return;

        window.location.href = '404.html';
      });
    }

    // Savings Goals in User Dashboard
    let userGoals = [
      { id: 1, name: 'Liquid Emergency Reserve', target: 20000, current: 15400, date: '2027-04-01' },
      { id: 2, name: 'Index Wealth Portfolio', target: 50000, current: 31200, date: '2028-12-31' },
      { id: 3, name: 'Residential Down Payment', target: 45000, current: 18900, date: '2027-11-15' }
    ];

    function renderUserGoals() {
      const container = document.getElementById('userGoalsContainer');
      if (!container) return;

      container.innerHTML = userGoals.map(function (g) {
        const pct = Math.min(100, Math.round((g.current / g.target) * 100));
        const remaining = Math.max(0, g.target - g.current);

        return '<div class="col-md-6 mb-4">' +
          '<div class="card-premium h-100 p-4">' +
          '<div class="d-flex justify-content-between align-items-start mb-2">' +
          '<h5 class="fw-bold text-primary m-0">' + escapeHtml(g.name) + '</h5>' +
          '<span class="badge badge-accent">' + pct + '% Complete</span>' +
          '</div>' +
          '<div class="text-muted small mb-3"><i class="fa-regular fa-calendar-check me-1"></i> Target Date: ' + g.date + '</div>' +
          '<div class="progress mb-3" style="height: 12px;">' +
          '<div class="progress-bar bg-accent" style="width: ' + pct + '%;"></div>' +
          '</div>' +
          '<div class="d-flex justify-content-between mb-3 small">' +
          '<span>Saved: <strong>$' + g.current.toLocaleString() + '</strong></span>' +
          '<span>Goal: <strong>$' + g.target.toLocaleString() + '</strong></span>' +
          '</div>' +
          '<div class="pt-2 border-top border-light d-flex justify-content-between align-items-center">' +
          '<span class="small text-muted">Remaining: $' + remaining.toLocaleString() + '</span>' +
          '<button type="button" class="btn btn-outline-primary btn-sm deposit-btn" data-goal-id="' + g.id + '">' +
          '<i class="fa-solid fa-plus me-1"></i> Contribute' +
          '</button>' +
          '</div>' +
          '</div>' +
          '</div>';
      }).join('');
      animateProgressBars(container);

      container.querySelectorAll('.deposit-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const gid = parseInt(btn.getAttribute('data-goal-id'), 10);
          const goal = userGoals.find(function (x) { return x.id === gid; });
          if (!goal) return;

          // Add demo increment of $500
          goal.current = Math.min(goal.target, goal.current + 500);
          renderUserGoals();
          showToast('Added $500 demo contribution to ' + goal.name + '!');
        });
      });
    }

    // User Savings Goal Modeler (Interactive ETA Calculator)
    const modelGoalSelect = document.getElementById('modelGoalSelect');
    const modelGoalMonthly = document.getElementById('modelGoalMonthly');
    const modelGoalEta = document.getElementById('modelGoalEta');

    function updateGoalModelEta() {
      if (!modelGoalSelect || !modelGoalMonthly || !modelGoalEta) return;
      const gid = parseInt(modelGoalSelect.value, 10);
      const monthly = parseFloat(modelGoalMonthly.value) || 100;
      const selected = userGoals.find(function (g) { return g.id === gid; }) || userGoals[0];
      const remaining = Math.max(0, selected.target - selected.current);
      const months = Math.ceil(remaining / Math.max(1, monthly));
      modelGoalEta.textContent = months + (months === 1 ? ' Month' : ' Months');
    }

    if (modelGoalSelect && modelGoalMonthly) {
      modelGoalSelect.addEventListener('change', updateGoalModelEta);
      modelGoalMonthly.addEventListener('input', updateGoalModelEta);
      updateGoalModelEta();
    }

    renderUserGoals();

    // Add Goal Form
    const addGoalForm = document.getElementById('addGoalForm');
    if (addGoalForm) {
      addGoalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(addGoalForm);
        const nameInput = document.getElementById('goalNameInput');
        const targetInput = document.getElementById('goalTargetInput');
        let isValid = true;

        if (!nameInput || !nameInput.value.trim()) {
          if (nameInput) showFieldError(nameInput, 'Goal Name is required.');
          isValid = false;
        }
        if (!targetInput || isNaN(parseFloat(targetInput.value)) || parseFloat(targetInput.value) <= 0) {
          if (targetInput) showFieldError(targetInput, 'Please enter a valid target amount.');
          isValid = false;
        }

        if (!isValid) return;

        window.location.href = '404.html';
      });
    }

    // Download Sample User Report button
    const downloadUserReportBtn = document.getElementById('downloadUserReportBtn');
    if (downloadUserReportBtn) {
      downloadUserReportBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }

    // Profile Settings Form
    const userSettingsForm = document.getElementById('userSettingsForm');
    if (userSettingsForm) {
      userSettingsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(userSettingsForm);
        const nameInput = document.getElementById('dashSettingsName') || (settingsNameInput || userSettingsForm.querySelector('input[type="text"]'));
        const emailInput = document.getElementById('dashSettingsEmail') || (settingsEmailInput || userSettingsForm.querySelector('input[type="email"]'));
        let isValid = true;

        if (!nameInput || !nameInput.value.trim()) {
          if (nameInput) showFieldError(nameInput, 'Full Name is required.');
          isValid = false;
        }
        if (!emailInput || !emailInput.value.trim()) {
          if (emailInput) showFieldError(emailInput, 'Email is required.');
          isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
          showFieldError(emailInput, 'Please enter a valid email address.');
          isValid = false;
        }

        if (!isValid) return;

        window.location.href = '404.html';
      });
    }
  }

  // -------------------------------------------------------------
  // 11. CLIENT DASHBOARD INTERACTIVITY (Advisory & Plans)
  // -------------------------------------------------------------
  function initClientDashboard() {
    const dash = document.querySelector('.client-dashboard-wrapper');
    if (!dash) return;

    // Sync Client Identity from Login Credentials
    const clientProfile = getActiveUserProfile('Elena Vance', 'elena.vance@finvantage.local');

    // 1. Welcome Section & Avatar Initial
    const clientFirstName = clientProfile.firstName || clientProfile.name.split(' ')[0] || clientProfile.name;
    const clientInitial = clientFirstName.charAt(0).toUpperCase();

    const clientWelcomeNameEl = document.getElementById('clientWelcomeName');
    if (clientWelcomeNameEl) {
      clientWelcomeNameEl.textContent = clientFirstName;
    }
    const clientAvatarInitialEl = document.getElementById('clientAvatarInitial');
    if (clientAvatarInitialEl) {
      clientAvatarInitialEl.textContent = clientInitial;
    }

    // 2. Profile Logo & Details Section
    const clientProfileNameEl = document.getElementById('clientProfileName');
    if (clientProfileNameEl) {
      clientProfileNameEl.textContent = clientProfile.name;
    }
    const clientProfileEmailEl = document.getElementById('clientProfileEmail');
    if (clientProfileEmailEl) {
      clientProfileEmailEl.textContent = clientProfile.email;
    }
    const clientProfileAvatar = document.getElementById('clientProfileAvatar');
    if (clientProfileAvatar) {
      clientProfileAvatar.setAttribute('alt', clientProfile.name + ' Avatar');
    }

    // 3. Profile & Support View Inputs (View 6)
    const clientProfileInputName = document.getElementById('clientProfileInputName');
    if (clientProfileInputName) {
      clientProfileInputName.value = clientProfile.name;
    }
    const clientProfileInputEmail = document.getElementById('clientProfileInputEmail');
    if (clientProfileInputEmail) {
      clientProfileInputEmail.value = clientProfile.email;
    }

    // View switching
    const navItems = dash.querySelectorAll('.client-sidebar-nav-item');
    const sections = dash.querySelectorAll('.client-view-section');
    const sidebar = dash.querySelector('.client-sidebar');
    const sidebarToggle = dash.querySelector('.client-sidebar-toggle');
    const sidebarClose = dash.querySelector('.client-sidebar-close');
    const sidebarBackdrop = dash.querySelector('.client-sidebar-backdrop');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
        if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active');
      });
    }
    if (sidebarClose && sidebar) {
      sidebarClose.addEventListener('click', function () {
        sidebar.classList.remove('active');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      });
    }
    if (sidebarBackdrop && sidebar) {
      sidebarBackdrop.addEventListener('click', function () {
        sidebar.classList.remove('active');
        sidebarBackdrop.classList.remove('active');
      });
    }

    navItems.forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const targetView = item.getAttribute('data-target-view');
        if (!targetView) return;

        navItems.forEach(function (i) { i.classList.remove('active'); });
        item.classList.add('active');

        sections.forEach(function (sec) {
          if (sec.id === targetView) {
            sec.classList.add('active');
            animateProgressBars(sec);
          } else {
            sec.classList.remove('active');
          }
        });

        if (sidebar && window.innerWidth < 992) {
          sidebar.classList.remove('active');
          if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
        }

        // Reset scroll position to top when switching views
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Render charts when any client section becomes active
        setTimeout(initCharts, 60);
        setTimeout(initCharts, 250);
      });
    });

    // Client Financial Plan Calculator (Interactive emergency fund & targets)
    const calcMonthlyExpenses = document.getElementById('cPlanMonthlyExpenses');
    const calcMonthsReserve = document.getElementById('cPlanMonthsReserve');
    const calcResultTarget = document.getElementById('cPlanTargetOutput');

    function updateEmergencyPlan() {
      if (!calcMonthlyExpenses || !calcMonthsReserve || !calcResultTarget) return;
      const expense = parseFloat(calcMonthlyExpenses.value) || 0;
      const months = parseInt(calcMonthsReserve.value, 10) || 6;
      const total = expense * months;
      calcResultTarget.textContent = '$' + total.toLocaleString();
    }

    if (calcMonthlyExpenses && calcMonthsReserve) {
      calcMonthlyExpenses.addEventListener('input', updateEmergencyPlan);
      calcMonthsReserve.addEventListener('change', updateEmergencyPlan);
      updateEmergencyPlan();
    }

    // Client Goal Acceleration Simulator (View 4)
    const cGoalModelSelect = document.getElementById('cGoalModelSelect');
    const cGoalModelExtra = document.getElementById('cGoalModelExtra');
    const cGoalModelResult = document.getElementById('cGoalModelResult');

    function updateCGoalModel() {
      if (!cGoalModelSelect || !cGoalModelExtra || !cGoalModelResult) return;
      const gval = cGoalModelSelect.value;
      const extra = parseFloat(cGoalModelExtra.value) || 0;
      let remaining = 21600;
      let baseRate = 1200;
      if (gval === '1') { remaining = 4000; baseRate = 800; }
      else if (gval === '2') { remaining = 21600; baseRate = 1200; }
      else if (gval === '3') { remaining = 19000; baseRate = 700; }
      else if (gval === '4') { remaining = 18000; baseRate = 500; }

      const standardMonths = Math.ceil(remaining / baseRate);
      const acceleratedMonths = Math.ceil(remaining / (baseRate + extra));
      const saved = Math.max(0, standardMonths - acceleratedMonths);
      cGoalModelResult.textContent = saved > 0 ? (saved + (saved === 1 ? ' Month Faster' : ' Months Faster')) : 'Baseline Timeline';
    }

    if (cGoalModelSelect && cGoalModelExtra) {
      cGoalModelSelect.addEventListener('change', updateCGoalModel);
      cGoalModelExtra.addEventListener('input', updateCGoalModel);
      updateCGoalModel();
    }

    // Client Downloadable Document
    const downloadClientDocBtn = document.getElementById('downloadClientDocBtn');
    if (downloadClientDocBtn) {
      downloadClientDocBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }

    // Client Profile Form
    const clientProfileForm = document.getElementById('clientProfileUpdateForm');
    if (clientProfileForm) {
      clientProfileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(clientProfileForm);
        const nameInput = document.getElementById('clientProfileInputName');
        let isValid = true;
        if (!nameInput || !nameInput.value.trim()) {
          if (nameInput) showFieldError(nameInput, 'Client Full Name is required.');
          isValid = false;
        }
        if (!isValid) return;
        window.location.href = '404.html';
      });
    }

    // Client Support Inquiry Form
    const clientSupportForm = document.getElementById('clientSupportForm');
    if (clientSupportForm) {
      clientSupportForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearFormErrors(clientSupportForm);
        const subjectInput = document.getElementById('cSupportSubject');
        const msgInput = document.getElementById('cSupportMsg');
        let isValid = true;

        if (!subjectInput || !subjectInput.value.trim()) {
          if (subjectInput) showFieldError(subjectInput, 'Inquiry subject is required.');
          isValid = false;
        }
        if (!msgInput || !msgInput.value.trim()) {
          if (msgInput) showFieldError(msgInput, 'Message is required.');
          isValid = false;
        }

        if (!isValid) return;

        window.location.href = '404.html';
      });
    }
  }

  // -------------------------------------------------------------
  // 12. CHART ENGINE (Pure Canvas Engine — Strictly 3 Brand Colors)
  // Royal Blue: #1F3C88 | Amber Gold: #F5A623 | White: #FFFFFF
  // -------------------------------------------------------------
  function initCharts() {
    // 1. Home / Overview Cashflow Bar Chart
    drawBarChart('overviewCashflowCanvas', {
      labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        { label: 'Income', data: [5200, 5400, 5300, 5800, 5600, 6100], color: '#1F3C88' },
        { label: 'Expenses', data: [3400, 3200, 3600, 3450, 3300, 3200], color: '#F5A623' }
      ]
    });

    // 2. Budget & Savings Doughnut Chart
    drawDoughnutChart('budgetDoughnutCanvas', {
      labels: ['Housing (35%)', 'Investments (25%)', 'Living (20%)', 'Recreation (12%)', 'Health (8%)'],
      data: [35, 25, 20, 12, 8],
      colors: [
        '#1F3C88',
        '#F5A623',
        'rgba(31, 60, 136, 0.7)',
        'rgba(245, 166, 35, 0.65)',
        'rgba(31, 60, 136, 0.4)'
      ]
    });

    // 3. User Dashboard Reports Line Chart
    drawLineChart('userReportLineCanvas', {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      dataset: [8200, 9400, 11200, 12800, 15300, 17200, 19600, 22400, 24100, 27800],
      lineColor: '#1F3C88',
      fillColor: 'rgba(31, 60, 136, 0.12)'
    });

    // 4. Client Dashboard Asset Allocation Doughnut
    drawDoughnutChart('clientAssetDoughnutCanvas', {
      labels: ['Equities (55%)', 'Treasuries (25%)', 'Bonds (15%)', 'Alternatives (5%)'],
      data: [55, 25, 15, 5],
      colors: [
        '#1F3C88',
        '#F5A623',
        'rgba(31, 60, 136, 0.65)',
        'rgba(245, 166, 35, 0.55)'
      ]
    });

    // 5. Client Monthly Variance Bar Chart
    drawBarChart('clientVarianceBarCanvas', {
      labels: ['Q1 Target', 'Q1 Actual', 'Q2 Target', 'Q2 Actual', 'Q3 Target', 'Q3 Actual'],
      datasets: [
        { label: 'Target / Actual', data: [15000, 16200, 15000, 14800, 18000, 19400], color: '#1F3C88' }
      ]
    });

    // 6. User Dashboard Budget Envelope Doughnut (View 2)
    drawDoughnutChart('userBudgetDoughnutCanvas', {
      labels: ['Housing (45%)', 'Food (18%)', 'Transport (9%)', 'Health (5%)', 'Leisure (8%)', 'Surplus (15%)'],
      data: [45, 18, 9, 5, 8, 15],
      colors: [
        '#1F3C88',
        '#F5A623',
        'rgba(31, 60, 136, 0.7)',
        'rgba(245, 166, 35, 0.7)',
        'rgba(31, 60, 136, 0.4)',
        'rgba(31, 60, 136, 0.2)'
      ]
    });

    // 7. User Dashboard Weekly Transaction Volume Bar Chart (View 3)
    drawBarChart('userTxnVolumeCanvas', {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        { label: 'Inflow', data: [2400, 2400, 2400, 2450], color: '#1F3C88' },
        { label: 'Outflow', data: [980, 1150, 890, 1100], color: '#F5A623' }
      ]
    });

    // 8. Client Dashboard 5-Year Wealth Compounding Trajectory Line Chart (View 2)
    drawLineChart('clientPlanGrowthCanvas', {
      labels: ['2026', '2027', '2028', '2029', '2030', '2031'],
      dataset: [142600, 178000, 221000, 274000, 338000, 415000],
      lineColor: '#1F3C88',
      fillColor: 'rgba(31, 60, 136, 0.12)'
    });

    // 9. Client Dashboard Capital Deployment Allocation Doughnut (View 4)
    drawDoughnutChart('clientGoalAllocationCanvas', {
      labels: ['Treasury (25%)', 'Growth (37%)', 'Real Estate (22%)', 'Education (16%)'],
      data: [25, 37, 22, 16],
      colors: [
        '#1F3C88',
        '#F5A623',
        'rgba(31, 60, 136, 0.65)',
        'rgba(245, 166, 35, 0.55)'
      ]
    });
  }

  // --- Canvas Chart Drawing Implementations ---
  function setupCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;

    // Do not initialize or force dimensions on hidden canvas (display: none view)
    if (canvas.offsetParent === null && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
      return null;
    }

    const parent = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Compute true available container width
    let width = parent ? parent.clientWidth : 0;
    if (!width || width < 20) {
      const container = canvas.closest('.dash-body, .client-body');
      if (container && container.clientWidth > 40) {
        width = container.clientWidth - 40;
      } else {
        width = Math.min(window.innerWidth - 32, 500);
      }
    }
    const maxViewportW = Math.max(220, window.innerWidth - 32);
    if (width > maxViewportW) {
      width = maxViewportW;
    }

    const height = canvas.getAttribute('data-height') ? parseInt(canvas.getAttribute('data-height'), 10) : 260;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = '100%';
    canvas.style.maxWidth = '100%';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, width: width, height: height };
  }

  const chartAnimationFrames = {};
  const chartHoverStates = {};
  const chartConfigs = {};

  function drawBarChart(canvasId, config) {
    chartConfigs[canvasId] = config;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Check if canvas is in a hidden view (e.g. inactive tab in dashboard)
    if (canvas.offsetParent === null && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
      return;
    }

    // Scroll-triggered entry using IntersectionObserver
    if ('IntersectionObserver' in window && !canvas.getAttribute('data-chart-observed')) {
      canvas.setAttribute('data-chart-observed', 'true');
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateBarChart(canvasId, config);
          }
        });
      }, { threshold: 0.15 });
      const targetCard = canvas.closest('.card-premium, .chart-canvas-container') || canvas;
      observer.observe(targetCard);
      // If already in view on page load, trigger immediately
      const rect = canvas.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animateBarChart(canvasId, config);
      }
      return;
    }

    animateBarChart(canvasId, config);
  }

  function animateBarChart(canvasId, config) {
    const c = setupCanvas(canvasId);
    if (!c) return;
    const ctx = c.ctx;
    const w = c.width;
    const h = c.height;
    const pad = w < 400 ? { top: 22, right: 12, bottom: 42, left: 45 } : { top: 28, right: 20, bottom: 45, left: 55 };

    if (chartAnimationFrames[canvasId]) {
      cancelAnimationFrame(chartAnimationFrames[canvasId]);
      delete chartAnimationFrames[canvasId];
    }

    let maxVal = 0;
    config.datasets.forEach(function (ds) {
      ds.data.forEach(function (v) { if (v > maxVal) maxVal = v; });
    });
    maxVal = Math.ceil((maxVal * 1.15) / 1000) * 1000 || 1000;

    const chartH = h - pad.top - pad.bottom;
    const chartW = w - pad.left - pad.right;
    const steps = 4;
    const groupCount = config.labels.length;
    const groupW = chartW / groupCount;
    const dsCount = config.datasets.length;
    const barW = Math.min(26, (groupW * 0.7) / dsCount);

    const canvas = document.getElementById(canvasId);
    if (canvas && !canvas.getAttribute('data-chart-interactive')) {
      canvas.setAttribute('data-chart-interactive', 'true');
      canvas.style.cursor = 'pointer';

      canvas.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let foundGroup = -1;
        for (let i = 0; i < groupCount; i++) {
          const gx = pad.left + i * groupW + groupW / 2;
          if (Math.abs(mouseX - gx) <= groupW / 2 && mouseY >= pad.top && mouseY <= pad.top + chartH) {
            foundGroup = i;
            break;
          }
        }
        if (chartHoverStates[canvasId] !== foundGroup) {
          chartHoverStates[canvasId] = foundGroup;
          if (!chartAnimationFrames[canvasId]) {
            renderBarScene(1, true);
          }
        }
      });

      canvas.addEventListener('mouseleave', function () {
        chartHoverStates[canvasId] = -1;
        if (!chartAnimationFrames[canvasId]) {
          renderBarScene(1, true);
        }
      });

      canvas.addEventListener('click', function () {
        animateBarChart(canvasId, config);
      });

      // Wire parent card's badge to replay on click
      const card = canvas.closest('.card-premium');
      if (card) {
        const badge = card.querySelector('.badge');
        if (badge) {
          badge.style.cursor = 'pointer';
          badge.title = 'Click to replay animation';
          badge.addEventListener('click', function () {
            animateBarChart(canvasId, config);
          });
        }
      }
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0 : 1050;
    const startTime = performance.now();

    function renderBarScene(rawProgress, isStaticOnly) {
      ctx.clearRect(0, 0, w, h);

      // Horizontal grid lines & labels
      ctx.strokeStyle = 'rgba(31, 60, 136, 0.08)';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#1F3C88';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';

      for (let i = 0; i <= steps; i++) {
        const y = pad.top + chartH - (i / steps) * chartH;
        const val = Math.round((i / steps) * maxVal);

        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();

        ctx.fillText('$' + val.toLocaleString(), pad.left - 8, y + 4);
      }

      const activeHover = chartHoverStates[canvasId];

      // Draw hovered column highlight
      if (activeHover !== undefined && activeHover >= 0 && activeHover < groupCount) {
        const hGroupX = pad.left + activeHover * groupW + groupW / 2;
        ctx.fillStyle = 'rgba(31, 60, 136, 0.04)';
        drawRoundedRect(ctx, hGroupX - groupW / 2 + 3, pad.top, groupW - 6, chartH, 6);
      }

      // Grouped animated vertical bars
      ctx.textAlign = 'center';

      config.labels.forEach(function (label, gIdx) {
        const groupX = pad.left + gIdx * groupW + groupW / 2;
        const isHovered = (activeHover === gIdx);

        // Staggered rise calculation for organic wave entry
        const groupDelay = (gIdx / groupCount) * 0.38;
        const groupDuration = 0.62;
        let gProg = 0;
        if (rawProgress >= groupDelay) {
          gProg = Math.min(1, (rawProgress - groupDelay) / groupDuration);
        }
        // Elastic / back-out overshoot curve
        const s = 1.25;
        let p = gProg;
        const eased = (p <= 0) ? 0 : (p === 1 ? 1 : (--p * p * ((s + 1) * p + s) + 1));

        config.datasets.forEach(function (ds, dIdx) {
          const offset = (dIdx - (dsCount - 1) / 2) * (barW + 4);
          const barX = groupX + offset - barW / 2;
          const val = ds.data[gIdx] || 0;
          const targetBarH = (val / maxVal) * chartH;
          const currentBarH = Math.max(0, targetBarH * Math.min(1.08, eased));
          const barY = pad.top + chartH - currentBarH;

          if (currentBarH > 0) {
            ctx.save();
            if (isHovered) {
              ctx.shadowColor = ds.color;
              ctx.shadowBlur = 12;
            }

            // High-fidelity fintech linear gradients
            const barGrad = ctx.createLinearGradient(barX, barY, barX, barY + currentBarH);
            if (dIdx === 0) {
              barGrad.addColorStop(0, '#2D55BD');
              barGrad.addColorStop(1, '#1A3372');
            } else {
              barGrad.addColorStop(0, '#FFBA3B');
              barGrad.addColorStop(1, '#D98404');
            }
            ctx.fillStyle = barGrad;
            drawRoundedRect(ctx, barX, barY, barW, currentBarH, 4);

            // Gloss cap highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
            drawRoundedRect(ctx, barX + 1, barY + 1, barW - 2, Math.min(3, currentBarH / 2), 2);

            ctx.restore();
          }
        });

        // X Label
        ctx.fillStyle = isHovered ? '#1F3C88' : 'rgba(31, 60, 136, 0.78)';
        ctx.font = isHovered ? 'bold 11px sans-serif' : '11px sans-serif';
        ctx.fillText(label, groupX, h - pad.bottom + 20);
      });

      // Hover Tooltip Display
      if (activeHover !== undefined && activeHover >= 0 && activeHover < groupCount) {
        const hGroupX = pad.left + activeHover * groupW + groupW / 2;
        const month = config.labels[activeHover];
        const inVal = config.datasets[0] ? (config.datasets[0].data[activeHover] || 0) : 0;
        const outVal = config.datasets[1] ? (config.datasets[1].data[activeHover] || 0) : 0;
        const diff = inVal - outVal;

        const tipW = Math.min(200, w - 20);
        const tipH = 46;
        const tipX = Math.max(pad.left, Math.min(w - pad.right - tipW, hGroupX - tipW / 2));
        const tipY = Math.max(6, pad.top - 18);

        ctx.save();
        ctx.fillStyle = '#13275c';
        ctx.shadowColor = 'rgba(19, 39, 92, 0.35)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        drawRoundedRect(ctx, tipX, tipY, tipW, tipH, 8);
        ctx.restore();

        // Tooltip text
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(month.toUpperCase() + ' CASHFLOW', tipX + 10, tipY + 15);

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#90b4ff';
        ctx.fillText('In: $' + inVal.toLocaleString(), tipX + 10, tipY + 34);

        ctx.fillStyle = '#ffcf70';
        ctx.fillText('Out: $' + outVal.toLocaleString(), tipX + 80, tipY + 34);

        ctx.fillStyle = diff >= 0 ? '#4ade80' : '#f87171';
        ctx.fillText((diff >= 0 ? '+$' : '-$') + Math.abs(diff).toLocaleString(), tipX + 150, tipY + 34);
      }
    }

    function renderBarFrame(now) {
      const elapsed = duration > 0 ? (now - startTime) : duration;
      const rawProgress = duration > 0 ? Math.min(1, elapsed / duration) : 1;

      renderBarScene(rawProgress, false);

      if (rawProgress < 1) {
        chartAnimationFrames[canvasId] = requestAnimationFrame(renderBarFrame);
      } else {
        delete chartAnimationFrames[canvasId];
      }
    }

    if (duration === 0) {
      renderBarFrame(performance.now());
    } else {
      chartAnimationFrames[canvasId] = requestAnimationFrame(renderBarFrame);
    }
  }

  function drawLineChart(canvasId, config) {
    const c = setupCanvas(canvasId);
    if (!c) return;
    const ctx = c.ctx;
    const w = c.width;
    const h = c.height;
    const pad = w < 400 ? { top: 20, right: 12, bottom: 42, left: 48 } : { top: 25, right: 20, bottom: 45, left: 60 };

    if (chartAnimationFrames[canvasId]) {
      cancelAnimationFrame(chartAnimationFrames[canvasId]);
      delete chartAnimationFrames[canvasId];
    }

    const maxVal = Math.max.apply(null, config.dataset) * 1.15 || 1000;
    const chartH = h - pad.top - pad.bottom;
    const chartW = w - pad.left - pad.right;
    const count = config.labels.length;
    const stepX = chartW / (count - 1);

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0 : 850;
    const startTime = performance.now();

    function renderLineFrame(now) {
      const elapsed = duration > 0 ? (now - startTime) : duration;
      const rawProgress = duration > 0 ? Math.min(1, elapsed / duration) : 1;
      const eased = 1 - Math.pow(1 - rawProgress, 3);

      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(31, 60, 136, 0.08)';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#1F3C88';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';

      for (let i = 0; i <= 4; i++) {
        const y = pad.top + chartH - (i / 4) * chartH;
        const val = Math.round((i / 4) * maxVal);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        ctx.fillText('$' + val.toLocaleString(), pad.left - 8, y + 4);
      }

      // Points
      const points = config.dataset.map(function (val, idx) {
        const targetH = (val / maxVal) * chartH;
        const currentH = targetH * eased;
        return {
          x: pad.left + idx * stepX,
          y: pad.top + chartH - currentH
        };
      });

      // Area fill
      ctx.beginPath();
      ctx.moveTo(points[0].x, pad.top + chartH);
      points.forEach(function (pt) { ctx.lineTo(pt.x, pt.y); });
      ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
      ctx.closePath();
      ctx.fillStyle = config.fillColor;
      ctx.fill();

      // Line stroke
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(function (pt) { ctx.lineTo(pt.x, pt.y); });
      ctx.strokeStyle = config.lineColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Dots and X labels
      ctx.textAlign = 'center';
      points.forEach(function (pt, idx) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#F5A623';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.fillStyle = '#1F3C88';
        ctx.fillText(config.labels[idx], pt.x, h - pad.bottom + 20);
      });

      if (rawProgress < 1) {
        chartAnimationFrames[canvasId] = requestAnimationFrame(renderLineFrame);
      } else {
        delete chartAnimationFrames[canvasId];
      }
    }

    if (duration === 0) {
      renderLineFrame(performance.now());
    } else {
      chartAnimationFrames[canvasId] = requestAnimationFrame(renderLineFrame);
    }
  }

  function drawDoughnutChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (canvas.offsetParent === null && canvas.offsetWidth === 0 && canvas.offsetHeight === 0) {
      return;
    }

    if ('IntersectionObserver' in window && !canvas.getAttribute('data-chart-observed')) {
      canvas.setAttribute('data-chart-observed', 'true');
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateDoughnutChart(canvasId, config);
          }
        });
      }, { threshold: 0.15 });
      const targetCard = canvas.closest('.card-premium, .chart-canvas-container') || canvas;
      observer.observe(targetCard);
      const rect = canvas.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        animateDoughnutChart(canvasId, config);
      }
      return;
    }

    animateDoughnutChart(canvasId, config);
  }

  function animateDoughnutChart(canvasId, config) {
    const c = setupCanvas(canvasId);
    if (!c) return;
    const ctx = c.ctx;
    const w = c.width;
    const h = c.height;

    const canvas = document.getElementById(canvasId);
    if (canvas && !canvas.getAttribute('data-chart-interactive')) {
      canvas.setAttribute('data-chart-interactive', 'true');
      canvas.style.cursor = 'pointer';
      canvas.addEventListener('click', function () {
        animateDoughnutChart(canvasId, config);
      });
      const card = canvas.closest('.card-premium');
      if (card) {
        const badge = card.querySelector('.badge');
        if (badge) {
          badge.style.cursor = 'pointer';
          badge.title = 'Click to replay animation';
          badge.addEventListener('click', function () {
            animateDoughnutChart(canvasId, config);
          });
        }
      }
    }

    if (chartAnimationFrames[canvasId]) {
      cancelAnimationFrame(chartAnimationFrames[canvasId]);
      delete chartAnimationFrames[canvasId];
    }

    const total = config.data.reduce(function (acc, val) { return acc + val; }, 0);
    const showSideLegend = w >= 520;
    const centerX = showSideLegend ? w * 0.38 : w * 0.5;
    const centerY = h * 0.5;
    const outerR = Math.max(25, Math.min(centerX, centerY) - (showSideLegend ? 16 : 14));
    const innerR = Math.max(12, outerR * 0.58);

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0 : 850;
    const startTime = performance.now();

    function renderDoughnutFrame(now) {
      const elapsed = duration > 0 ? (now - startTime) : duration;
      const rawProgress = duration > 0 ? Math.min(1, elapsed / duration) : 1;
      const eased = 1 - Math.pow(1 - rawProgress, 3);

      ctx.clearRect(0, 0, w, h);

      let startAngle = -Math.PI / 2;
      const maxSweep = Math.PI * 2 * eased;

      config.data.forEach(function (val, idx) {
        const sliceAngle = (val / total) * maxSweep;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerR, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = config.colors[idx % config.colors.length];
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        startAngle = endAngle;
      });

      // Center cutout label
      ctx.fillStyle = '#1F3C88';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(eased * 100) + '%', centerX, centerY - 8);
      ctx.font = '10px sans-serif';
      ctx.fillText('Total', centerX, centerY + 12);

      // Legend on the right side if width permits (on mobile, HTML legends below handle it)
      if (showSideLegend) {
        const legendX = w * 0.65;
        let legendY = 35;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '12px sans-serif';

        config.labels.forEach(function (lbl, idx) {
          ctx.fillStyle = config.colors[idx % config.colors.length];
          ctx.fillRect(legendX, legendY - 6, 12, 12);
          ctx.fillStyle = '#1F3C88';
          ctx.fillText(lbl, legendX + 20, legendY);
          legendY += 28;
        });
      }

      if (rawProgress < 1) {
        chartAnimationFrames[canvasId] = requestAnimationFrame(renderDoughnutFrame);
      } else {
        delete chartAnimationFrames[canvasId];
      }
    }

    if (duration === 0) {
      renderDoughnutFrame(performance.now());
    } else {
      chartAnimationFrames[canvasId] = requestAnimationFrame(renderDoughnutFrame);
    }
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (height <= 0) return;
    radius = Math.min(radius, height / 2, width / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  // -------------------------------------------------------------
  // 13. TOAST NOTIFICATION UTILITY
  // -------------------------------------------------------------
  function showToast(msg) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'global-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<i class="fa-solid fa-circle-info me-2 text-accent"></i> ' + escapeHtml(msg);
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3200);
  }

  // -------------------------------------------------------------
  // 14. BACK TO TOP BUTTON
  // -------------------------------------------------------------
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------------------------------------------------------------
  // 15. GLOBAL 404 REDIRECTION FOR CONTENT LINKS, BUTTONS & ICONS
  // -------------------------------------------------------------
  function init404Redirection() {
    // Excluded pages: Login page, Signup page, and 404 page
    const pathname = window.location.pathname.toLowerCase();
    const isExcludedPage = (
      pathname.endsWith('/login.html') || pathname.endsWith('login.html') ||
      pathname.endsWith('/signup.html') || pathname.endsWith('signup.html') ||
      pathname.endsWith('/404.html') || pathname.endsWith('404.html')
    );

    if (isExcludedPage) {
      return;
    }

    const isDashboard = (
      pathname.endsWith('/user-dashboard.html') || pathname.endsWith('user-dashboard.html') ||
      pathname.endsWith('/client-dashboard.html') || pathname.endsWith('client-dashboard.html')
    );

    // Target selector for links, buttons, and icons
    const interactiveSelector = [
      'a',
      'button',
      'i',
      'svg',
      '[class*="fa-"]',
      '.fa',
      '.fas',
      '.far',
      '.fab',
      '.icon-wrap',
      '.metric-icon-wrap',
      '.client-metric-icon',
      '.feature-icon',
      '.why-icon',
      '.stat-icon',
      '.service-icon',
      '.hero-service-chip',
      '.hero-contact-chip'
    ].join(', ');

    document.addEventListener('click', function (e) {
      const target = e.target.closest(interactiveSelector);
      if (!target) return;

      if (isDashboard) {
        // INSIDE BOTH DASHBOARDS:
        // 1. Exclude Sidebar Menus (sidebar navigation links that switch views)
        if (
          target.classList.contains('sidebar-nav-item') ||
          target.closest('.sidebar-nav-item') ||
          target.classList.contains('client-sidebar-nav-item') ||
          target.closest('.client-sidebar-nav-item') ||
          target.closest('.dash-sidebar-nav') ||
          target.closest('.client-sidebar-nav')
        ) {
          return;
        }

        // 2. Exclude mobile sidebar drawer toggles, close buttons & backdrops so users can open/close menus on mobile
        if (
          target.classList.contains('dash-sidebar-toggle') ||
          target.closest('.dash-sidebar-toggle') ||
          target.classList.contains('client-sidebar-toggle') ||
          target.closest('.client-sidebar-toggle') ||
          target.classList.contains('dash-sidebar-close') ||
          target.closest('.dash-sidebar-close') ||
          target.classList.contains('client-sidebar-close') ||
          target.closest('.client-sidebar-close') ||
          target.classList.contains('dash-sidebar-backdrop') ||
          target.closest('.dash-sidebar-backdrop') ||
          target.classList.contains('client-sidebar-backdrop') ||
          target.closest('.client-sidebar-backdrop')
        ) {
          return;
        }

        // 3. Exclude modal close buttons
        if (
          target.classList.contains('modal-close-btn') ||
          target.hasAttribute('data-close-modal') ||
          target.closest('[data-close-modal]')
        ) {
          return;
        }

        // 4. Exclude form submit buttons (must run form input validation first!)
        const submitBtn = target.closest('button[type="submit"]') || (target.tagName && target.tagName.toLowerCase() === 'button' && target.closest('form') && !target.getAttribute('type'));
        if (submitBtn) {
          return;
        }

        // All other links, buttons, and icons inside both dashboard pages go to 404.html!
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = '404.html';
        return;
      }

      // ON PUBLIC PAGES (index, about, service, blog, contact):
      // 1. Exclude Navbar, Navigation Links, Brand Logo, and Mobile Hamburger
      if (
        target.closest('.site-navbar') ||
        target.closest('.navbar') ||
        target.closest('.navbar-menu') ||
        target.closest('.mobile-nav') ||
        target.classList.contains('navbar-toggle') ||
        target.closest('.navbar-toggle') ||
        target.classList.contains('navbar-brand') ||
        target.closest('.navbar-brand') ||
        target.classList.contains('nav-link') ||
        target.closest('.nav-link')
      ) {
        return;
      }

      // 2. Exclude Footer Quick Links and Footer Brand Logo so users can navigate between pages
      const footerLink = target.closest('a');
      if (footerLink && (target.closest('.site-footer') || target.closest('footer'))) {
        const href = (footerLink.getAttribute('href') || '').trim();
        if (
          href === 'index.html' ||
          href === 'about.html' ||
          href === 'service.html' ||
          href === 'blog.html' ||
          href === 'contact.html'
        ) {
          return;
        }
      }

      // 3. Exclude UI controls: Accordion toggles, Modal close buttons
      if (
        target.classList.contains('faq-question') ||
        target.closest('.faq-question') ||
        target.classList.contains('modal-close-btn') ||
        target.hasAttribute('data-close-modal') ||
        target.closest('[data-close-modal]')
      ) {
        return;
      }

      // 4. Exclude blog category filter buttons (filter articles in place)
      if (
        target.classList.contains('blog-filter-btn') ||
        target.closest('.blog-filter-btn')
      ) {
        return;
      }

      // 5. Exclude Form submit buttons (must run input validation first!)
      const pubSubmitBtn = target.closest('button[type="submit"]') || (target.tagName && target.tagName.toLowerCase() === 'button' && target.closest('form') && !target.getAttribute('type'));
      if (pubSubmitBtn) {
        return;
      }

      // 6. Exclude mailto, tel, and maps external links
      const link = target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        if (
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('https://www.google.com/maps') ||
          href.startsWith('http://maps.google.com')
        ) {
          return;
        }
      }

      // All remaining content links, buttons, and icons on this page redirect to 404.html
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = '404.html';
    }, true);
  }

  // Window resize re-draws charts
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initCharts, 200);
  });

})();
