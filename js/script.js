(function () {
  'use strict';

  var root = document.documentElement;
  var navbar = document.getElementById('navbar');
  var nav = document.getElementById('nav');
  var menuToggle = document.getElementById('menuToggle');
  var themeToggle = document.getElementById('themeToggle');
  var toTop = document.getElementById('toTop');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero role typing effect ---------- */
  var typedRole = document.querySelector('.hero__typed');
  if (typedRole && !reduceMotion) {
    var roleText = typedRole.textContent;
    var roleIndex = 0;
    var deletingRole = false;
    typedRole.textContent = '';
    function typeRole() {
      if (!deletingRole) {
        roleIndex += 1;
        typedRole.textContent = roleText.slice(0, roleIndex);
        if (roleIndex === roleText.length) {
          deletingRole = true;
          window.setTimeout(typeRole, 1400);
          return;
        }
        window.setTimeout(typeRole, 65);
        return;
      }

      roleIndex -= 1;
      typedRole.textContent = roleText.slice(0, roleIndex);
      if (roleIndex === 0) {
        deletingRole = false;
        window.setTimeout(typeRole, 400);
        return;
      }
      window.setTimeout(typeRole, 35);
    }
    window.setTimeout(typeRole, 250);
  }

  /* ---------- Theme toggle ---------- */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0e17' : '#f6f7fb');
  }
  applyTheme(root.getAttribute('data-theme') || 'dark');

  themeToggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    navbar.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuToggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('is-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1120) setMenu(false);
  });

  /* ---------- Navbar border + back-to-top visibility ---------- */
  function onScroll() {
    var y = window.scrollY;
    navbar.classList.toggle('is-scrolled', y > 10);
    toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Active nav link (scroll spy) ---------- */
  // Sections without their own nav link (education, certifications, activities)
  // declare which link they belong to with data-nav-group.
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('section[data-nav-group]'));

  function setActive(group) {
    links.forEach(function (link) {
      var active = link.getAttribute('data-nav') === group;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }

  function updateActive() {
    var marker = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= marker) current = s; });
    // At the very bottom, force the last section
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections[sections.length - 1];
    setActive(current.getAttribute('data-nav-group'));
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- Scroll-triggered reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Contact form (frontend only) ---------- */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var RECIPIENT = 'mohammaddalimasud1010@gmail.com';

  function setError(input, message) {
    var field = input.closest('.field');
    field.classList.toggle('has-error', Boolean(message));
    document.getElementById(input.id + '-error').textContent = message || '';
    if (message) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }

  function validate() {
    var name = form.elements.name;
    var email = form.elements.email;
    var message = form.elements.message;
    var firstInvalid = null;

    var nameOk = name.value.trim().length >= 2;
    setError(name, nameOk ? '' : 'Enter your name (at least 2 characters).');
    if (!nameOk) firstInvalid = firstInvalid || name;

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    setError(email, emailOk ? '' : 'Enter a valid email address, like name@example.com.');
    if (!emailOk) firstInvalid = firstInvalid || email;

    var msgOk = message.value.trim().length >= 10;
    setError(message, msgOk ? '' : 'Write a message of at least 10 characters.');
    if (!msgOk) firstInvalid = firstInvalid || message;

    return firstInvalid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.className = 'form__status';
    var invalid = validate();
    if (invalid) {
      statusEl.textContent = 'Fix the highlighted fields and try again.';
      statusEl.classList.add('is-error');
      invalid.focus();
      return;
    }
    var subject = 'Portfolio message from ' + form.elements.name.value.trim();
    var body = form.elements.message.value.trim() + '\n\n' + form.elements.name.value.trim() + '\n' + form.elements.email.value.trim();
    window.location.href = 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    statusEl.textContent = 'Your email app should open with the message ready to send. If it does not, email ' + RECIPIENT + ' directly.';
    statusEl.classList.add('is-success');
    form.reset();
  });

  // Clear a field's error as soon as the person edits it
  Array.prototype.forEach.call(form.querySelectorAll('input, textarea'), function (input) {
    input.addEventListener('input', function () { setError(input, ''); });
  });

  /* ---------- Video thumbnail / preview state ---------- */
  var videoFrame = document.querySelector('.video-cv__frame');
  var videoVideo = document.querySelector('.video-cv__video');
  var videoEmbed = document.querySelector('.video-cv__embed');
  var videoPlayButton = document.querySelector('.video-cv__play');

  if (videoFrame && videoPlayButton) {
    var videoSrc = videoFrame.getAttribute('data-video-src');

    function startVideo() {
      if (videoFrame.classList.contains('is-playing')) return;
      videoFrame.classList.add('is-playing');
      videoPlayButton.setAttribute('aria-label', 'Video is playing');

      if (videoVideo) {
        var playPromise = videoVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch(function () {
            // Handled if browser policies require direct user activation
          });
        }
      } else if (videoEmbed && videoSrc) {
        videoEmbed.style.display = 'block';
        videoEmbed.setAttribute('src', videoSrc);
      }
    }

    videoPlayButton.addEventListener('click', function (e) {
      e.stopPropagation();
      startVideo();
    });

    // Prevent accidental mobile scroll taps from starting video:
    var touchMoved = false;
    videoFrame.addEventListener('touchstart', function () {
      touchMoved = false;
    }, { passive: true });

    videoFrame.addEventListener('touchmove', function () {
      touchMoved = true;
    }, { passive: true });

    videoFrame.addEventListener('touchend', function (e) {
      if (!touchMoved && !videoFrame.classList.contains('is-playing')) {
        startVideo();
      }
    });

    videoFrame.addEventListener('click', function (e) {
      if (e.target !== videoVideo && e.target !== videoEmbed && !videoFrame.classList.contains('is-playing')) {
        startVideo();
      }
    });

    if (videoVideo) {
      videoVideo.addEventListener('ended', function () {
        videoFrame.classList.remove('is-playing');
        videoPlayButton.setAttribute('aria-label', 'Play video introduction');
      });

      // If video element fails to load any source, fallback to Google Drive iframe
      videoVideo.addEventListener('error', function () {
        if (videoEmbed && videoSrc) {
          videoVideo.style.display = 'none';
          videoEmbed.style.display = 'block';
          videoEmbed.setAttribute('src', videoSrc);
        }
      });
    }

    if (videoEmbed) {
      videoEmbed.addEventListener('load', function () {
        var currentSrc = videoEmbed.getAttribute('src');
        if (currentSrc && currentSrc !== '' && currentSrc !== 'about:blank') {
          videoFrame.classList.add('is-playing');
        }
      });
      videoEmbed.addEventListener('error', function () {
        videoFrame.classList.remove('is-playing');
      });
    }
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
