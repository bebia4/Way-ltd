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

  /* ------------------------------------------ case figure slideshow */
  /* Crossfades the slides in a [data-slides] figure. Picture slides are held
     for data-hold; film slides run to their own end and then hand over. It
     only ever plays while the card is on screen, the tab is visible, and
     nobody is hovering or tabbing through it. With prefers-reduced-motion
     nothing advances or plays on its own: the dots become a manual picker
     and the films get their native controls. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-slides]'), function (box) {
    var slides = box.querySelectorAll('.slide');
    if (slides.length < 2) return;

    var dots = box.querySelectorAll('[data-slide-to]');
    var hold = parseInt(box.getAttribute('data-hold'), 10) || 6000;
    var at = 0, timer = null, paused = false, onScreen = true;

    var filmIn = function (i) { return slides[i].querySelector('video'); };
    var idle = function () { return calm || paused || !onScreen || document.hidden; };
    var clear = function () { if (timer) { window.clearTimeout(timer); timer = null; } };

    var next = function () { show(at + 1); };
    var after = function (ms) { clear(); timer = window.setTimeout(next, ms); };

    var run = function () {
      clear();
      var film = filmIn(at);
      if (idle()) { if (film) film.pause(); return; }
      if (!film) { after(hold); return; }

      film.muted = true;                       // autoplay is only allowed muted
      var playing = film.play();
      if (playing && playing.catch) {
        playing.catch(function () { after(hold); });   // refused: fall back to the clock
      }
      // backstop, so a clip that never fires 'ended' cannot strand the carousel
      after(Math.max(hold, ((film.duration || 10) - (film.currentTime || 0)) * 1000 + 1500));
    };

    var show = function (n) {
      at = (n + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (slide, i) {
        var on = i === at;
        var film = slide.querySelector('video');
        slide.classList.toggle('is-on', on);
        slide.setAttribute('aria-hidden', String(!on));
        if (film && !on) {
          film.pause();
          try { film.currentTime = 0; } catch (e) {}
        }
      });
      Array.prototype.forEach.call(dots, function (dot, i) {
        dot.setAttribute('aria-current', String(i === at));
      });
      // start fetching the clip that is coming up, so the cut is not a stall
      var soon = filmIn((at + 1) % slides.length);
      if (soon && soon.preload !== 'auto') soon.preload = 'auto';
      run();
    };

    Array.prototype.forEach.call(slides, function (slide) {
      var film = slide.querySelector('video');
      if (!film) return;
      if (calm) { film.setAttribute('controls', ''); return; }
      film.addEventListener('ended', next);
      film.addEventListener('error', function () { if (!idle()) after(hold); });
    });

    Array.prototype.forEach.call(dots, function (dot, i) {
      dot.addEventListener('click', function () { show(i); });
    });

    var hold_ = function (on) { paused = on; run(); };
    box.addEventListener('pointerenter', function () { hold_(true); });
    box.addEventListener('pointerleave', function () { hold_(false); });
    box.addEventListener('focusin', function () { hold_(true); });
    box.addEventListener('focusout', function () { hold_(false); });
    document.addEventListener('visibilitychange', run);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        // isIntersecting is true at a single visible pixel, which is not
        // enough to be worth playing — go by how much of the card is showing.
        onScreen = entries[0].intersectionRatio >= 0.25;
        run();
      }, { threshold: [0, 0.25, 0.6] }).observe(box);
    }

    show(0);
  });

  /* ------------------------------------------- a lone film in a case figure */
  /* Loops quietly while it is on screen and the tab is in front, and does
     nothing at all if the visitor asked for less motion — they get the
     poster frame and native controls instead. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-film]'), function (film) {
    if (calm) { film.setAttribute('controls', ''); return; }
    film.muted = true;

    var onScreen = true;
    var run = function () {
      if (onScreen && !document.hidden) {
        var playing = film.play();
        if (playing && playing.catch) playing.catch(function () {});
      } else {
        film.pause();
      }
    };

    document.addEventListener('visibilitychange', run);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].intersectionRatio >= 0.25;
        run();
      }, { threshold: [0, 0.25, 0.6] }).observe(film);
    }

    run();
  });

  /* ---------------------------------------------- marquee: duplicate track */
  Array.prototype.forEach.call(document.querySelectorAll('.marq-track'), function (track) {
    var first = track.firstElementChild;
    if (first) track.appendChild(first.cloneNode(true));   // seamless 50% loop
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
