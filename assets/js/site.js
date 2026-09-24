/* ============================================================================
   WAY INTERNATIONAL SERVICES — interaction layer
   Everything here is an enhancement: the page is complete without it.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------------- theme */
  /* The inline head script already set data-theme before first paint, so this
     only has to handle switching, labelling, and remembering the choice. */
  (function () {
    var THEMES = { dark: '#08080C', light: '#F7F4EF' };
    var meta = document.querySelector('meta[name="theme-color"]');
    var toggles = document.querySelectorAll('[data-theme-toggle]');
    var stored = null;
    try { stored = localStorage.getItem('way-theme'); } catch (e) {}

    var current = function () {
      return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    };

    var paint = function (theme) {
      root.setAttribute('data-theme', theme);
      if (meta) meta.setAttribute('content', THEMES[theme]);
      var next = theme === 'dark' ? 'light' : 'dark';
      Array.prototype.forEach.call(toggles, function (btn) {
        btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
        btn.setAttribute('title', 'Switch to ' + next + ' theme');
      });
    };

    paint(current());

    Array.prototype.forEach.call(toggles, function (btn) {
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        paint(next);
        try { localStorage.setItem('way-theme', next); } catch (e) {}
      });
    });

    // With no explicit choice stored, keep following the OS as it changes.
    if (stored !== 'light' && stored !== 'dark' && window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: light)');
      var follow = function (e) {
        var pinned = null;
        try { pinned = localStorage.getItem('way-theme'); } catch (err) {}
        if (pinned === 'light' || pinned === 'dark') return;
        paint(e.matches ? 'light' : 'dark');
      };
      if (mq.addEventListener) mq.addEventListener('change', follow);
      else if (mq.addListener) mq.addListener(follow);
    }
  })();

  /* ------------------------------------------------------------ year stamp */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* --------------------------------------------------- header: stick, hide */
  var hdr = document.querySelector('.hdr');
  if (hdr) {
    var last = window.scrollY;
    var ticking = false;

    var onScroll = function () {
      var y = window.scrollY;
      hdr.classList.toggle('is-stuck', y > 24);
      // hide on the way down, reveal on the way up — but never over the menu
      if (!document.body.classList.contains('is-locked')) {
        hdr.classList.toggle('is-hidden', y > 420 && y > last + 4);
      }
      last = y;
      ticking = false;
    };

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* -------------------------------------------------------- mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');

  if (burger && menu) {
    var setMenu = function (open) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('is-locked', open);
      if (open) hdr && hdr.classList.remove('is-hidden');
      // stagger the links in
      Array.prototype.forEach.call(menu.querySelectorAll('.menu-list a'), function (a, i) {
        a.style.transitionDelay = open ? (80 + i * 55) + 'ms' : '0ms';
      });
    };

    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* ------------------------------------------------- reveal on first sight */
  var reveals = document.querySelectorAll('[data-rv], .hero-head, .rise');

  if (calm || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(reveals, function (el) {
      // children marked [data-stagger] inherit an increasing delay
      var kids = el.querySelectorAll('[data-rv]');
      if (el.hasAttribute('data-stagger')) {
        Array.prototype.forEach.call(kids, function (kid, i) {
          kid.style.setProperty('--d', (i * parseInt(el.dataset.stagger, 10)) + 'ms');
        });
      }
      io.observe(el);
    });
  }

  /* hero lines: give each line a stepped delay, then run on load */
  var heroHead = document.querySelector('.hero-head');
  if (heroHead) {
    Array.prototype.forEach.call(heroHead.querySelectorAll('.ln > span'), function (span, i) {
      span.style.setProperty('--d', (120 + i * 110) + 'ms');
    });
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { heroHead.classList.add('in'); });
    });
  }

  /* ------------------------------------------------ service card spotlight */
  if (fine && !calm) {
    Array.prototype.forEach.call(document.querySelectorAll('.svc'), function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* -------------------------------------------------------- magnetic buttons */
  if (fine && !calm) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-magnet]'), function (el) {
      var raf = null;
      var move = function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
          var dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
          el.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px)';
          raf = null;
        });
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', function () {
        if (raf) { window.cancelAnimationFrame(raf); raf = null; }
        el.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------ cursor halo */
  if (fine && !calm) {
    var halo = document.createElement('div');
    halo.className = 'halo';
    halo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(halo);

    var hx = 0, hy = 0, cx = 0, cy = 0, haloOn = false;

    window.addEventListener('pointermove', function (e) {
      hx = e.clientX; hy = e.clientY;
      if (!haloOn) { haloOn = true; cx = hx; cy = hy; halo.classList.add('on'); }
    }, { passive: true });

    (function loop() {
      cx += (hx - cx) * 0.085;
      cy += (hy - cy) * 0.085;
      halo.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)';
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------------------------------------------- marquee: duplicate track */
  Array.prototype.forEach.call(document.querySelectorAll('.marq-track'), function (track) {
    var first = track.firstElementChild;
    if (first) track.appendChild(first.cloneNode(true));   // seamless 50% loop
  });

  /* ------------------------------------------------- featured case slideshow */
  Array.prototype.forEach.call(document.querySelectorAll('[data-show]'), function (show) {
    var slides = show.querySelectorAll('[data-show-slide]');
    if (slides.length < 2) return;

    var dotsBox = show.querySelector('[data-show-dots]');
    var count   = show.querySelector('[data-show-count]');
    var wait    = parseInt(show.getAttribute('data-interval'), 10) || 7000;
    var at      = 0;
    var timer   = null;
    var dots    = [];
    var held    = false;   // pointer or focus is on the card
    var seen    = true;    // the card is on screen

    show.style.setProperty('--show-int', wait + 'ms');

    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    var draw = function () {
      Array.prototype.forEach.call(slides, function (slide, i) {
        var on = i === at;
        slide.classList.toggle('is-on', on);
        slide.setAttribute('aria-hidden', String(!on));
        // keep hidden slides out of the tab order without hiding them from AT
        Array.prototype.forEach.call(slide.querySelectorAll('a,button'), function (el) {
          if (on) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-on', i === at);
        if (i === at) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (count) count.textContent = pad(at + 1) + ' / ' + pad(slides.length);
    };

    var go = function (i) {
      at = (i + slides.length) % slides.length;
      draw();
      play();
    };

    var stop = function () {
      if (timer) { window.clearTimeout(timer); timer = null; }
      show.classList.remove('is-live');   // also resets the dot's progress fill
    };

    var play = function () {
      stop();
      if (calm || held || document.hidden || !seen) return;
      void show.offsetWidth;              // let the fill animation start over
      show.classList.add('is-live');
      timer = window.setTimeout(function () { go(at + 1); }, wait);
    };

    var hold = function (on) {
      held = on;
      if (on) stop(); else play();
    };

    /* dots — one per slide, labelled from the slide's own heading */
    if (dotsBox) {
      Array.prototype.forEach.call(slides, function (slide, i) {
        var head = slide.querySelector('h3');
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'show-dot';
        dot.setAttribute('aria-label', head ? head.textContent : 'Project ' + (i + 1));
        dot.addEventListener('click', function () { go(i); });
        dotsBox.appendChild(dot);
        dots.push(dot);
      });
    }

    var prev = show.querySelector('[data-show-prev]');
    var next = show.querySelector('[data-show-next]');
    if (prev) prev.addEventListener('click', function () { go(at - 1); });
    if (next) next.addEventListener('click', function () { go(at + 1); });

    /* let people read: pause on hover, on focus, and while the tab is away */
    show.addEventListener('pointerenter', function () { hold(true); });
    show.addEventListener('pointerleave', function () { hold(false); });
    show.addEventListener('focusin', function () { hold(true); });
    show.addEventListener('focusout', function () {
      if (!show.contains(document.activeElement)) hold(false);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else play();
    });

    show.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(at - 1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { go(at + 1); e.preventDefault(); }
    });

    /* swipe */
    var startX = null;
    show.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX;
    }, { passive: true });
    show.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 45) go(dx < 0 ? at + 1 : at - 1);
    }, { passive: true });

    /* only run while it is actually on screen */
    if ('IntersectionObserver' in window) {
      seen = false;
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          seen = entry.isIntersecting;
          if (seen) play(); else stop();
        });
      }, { threshold: 0.2 }).observe(show);
    }

    draw();
    play();
  });

  /* ------------------------------------------- FAQ: one panel open at a time */
  var faqs = document.querySelectorAll('.faq details');
  Array.prototype.forEach.call(faqs, function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      Array.prototype.forEach.call(faqs, function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ------------------------------- preselect the service named in ?service= */
  var svcField = document.getElementById('f-service');
  if (svcField && window.location.search) {
    var want = new URLSearchParams(window.location.search).get('service');
    if (want) {
      var match = Array.prototype.filter.call(svcField.options, function (o) {
        return o.value === want;
      })[0];
      if (match) svcField.value = match.value;
    }
  }

  /* ----------------------------------------------------------- contact form */
  var form = document.querySelector('[data-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      // No backend is wired up yet — hand the enquiry to the mail client so
      // nothing is lost, and tell the developer where to point it instead.
      e.preventDefault();
      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || '').toString().trim(); };

      var body = [
        'Name:    ' + get('name'),
        'Company: ' + get('company'),
        'Email:   ' + get('email'),
        'Budget:  ' + get('budget'),
        'Service: ' + get('service'),
        '',
        get('brief')
      ].join('\n');

      var to = form.getAttribute('data-form') || 'hello@wayinternational.services';
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent('New project enquiry — ' + (get('company') || get('name'))) +
        '&body=' + encodeURIComponent(body);

      var note = form.querySelector('.form-status');
      if (note) {
        note.hidden = false;
        note.textContent = 'Opening your mail app… if nothing happens, write to ' + to + ' directly.';
      }
    });
  }

  /* ------------------------------------------ mark the current nav section */
  var here = location.pathname.split('/').pop() || 'index.html';
  Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) {
    if (a.getAttribute('data-nav') === here.replace('.html', '')) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();
