/*
 * Background: the classic DOOM fire effect (a heat-diffusion cellular automaton),
 * with spectral-theory formulas that simply fade in and out in place.
 *
 * Formulas are typeset once by MathJax (tex-svg) and cloned; the fire works without it.
 */
(function () {
    'use strict';

    var host = document.getElementById('spectral-bg');
    if (!host) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -------------------------------------------------------------------- fire */
    var canvas = document.createElement('canvas');
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, heat, img, px, extraDecay = 0;

    // 37-step palette: black -> dark red -> red -> orange -> pale yellow
    var STOPS = [[0, 8, 4, 5], [0.25, 70, 6, 4], [0.55, 190, 30, 8], [0.8, 255, 110, 20], [1, 255, 235, 170]];
    var LEVELS = 37, palette = [];
    (function buildPalette() {
        for (var i = 0; i < LEVELS; i++) {
            var t = i / (LEVELS - 1), a = STOPS[0], b = STOPS[1];
            for (var s = 1; s < STOPS.length; s++) { if (t <= STOPS[s][0]) { a = STOPS[s - 1]; b = STOPS[s]; break; } }
            var k = (t - a[0]) / (b[0] - a[0] || 1);
            palette.push([a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k]);
        }
    })();

    function resize() {
        var cell = window.innerWidth < 700 ? 5 : 6;
        W = Math.max(40, Math.ceil(window.innerWidth / cell));
        H = Math.max(40, Math.ceil(window.innerHeight / cell));
        canvas.width = W; canvas.height = H;
        heat = new Uint8Array(W * H);
        img = ctx.createImageData(W, H);
        px = img.data;
        for (var x = 0; x < W; x++) heat[(H - 1) * W + x] = LEVELS - 1;   // fuel row
        // base decay is ~0.5 per row; add enough that flames reach about 40% of the screen height
        extraDecay = Math.max(0, Math.min(1, (LEVELS - 1) / (0.4 * H) - 0.5));
    }

    function step() {
        for (var x = 0; x < W; x++) {
            for (var y = 1; y < H; y++) {
                var src = y * W + x;
                var h = heat[src];
                if (h === 0) { heat[src - W] = 0; continue; }
                var r = (Math.random() * 3) | 0;
                var dst = src - r + 1;                         // wind drift
                var v = h - (r & 1) - (Math.random() < extraDecay ? 1 : 0);
                if (v < 0) v = 0;          // Uint8Array would wrap -1 to 255 and break the palette lookup
                heat[(dst < W ? src : dst) - W] = v;
            }
        }
    }

    function draw() {
        var p = 0;
        for (var i = 0; i < W * H; i++) {
            var c = palette[heat[i]];
            px[p] = c[0]; px[p + 1] = c[1]; px[p + 2] = c[2]; px[p + 3] = 255;
            p += 4;
        }
        ctx.putImageData(img, 0, 0);
    }

    resize();
    var running = true, last = 0;
    function loop(now) {
        if (!running) return;
        if (now - last > 40) { last = now; step(); draw(); }    // ~25 fps, like the original
        requestAnimationFrame(loop);
    }
    if (reduceMotion) {
        for (var n = 0; n < 90; n++) step();
        draw();
    } else {
        requestAnimationFrame(loop);
        document.addEventListener('visibilitychange', function () {
            running = !document.hidden;
            if (running) requestAnimationFrame(loop);
        });
    }
    var rz;
    window.addEventListener('resize', function () {
        clearTimeout(rz);
        rz = setTimeout(function () {
            resize();
            if (reduceMotion) { for (var n = 0; n < 90; n++) step(); draw(); }
        }, 150);
    });

    /* ---------------------------------------------------------------- formulas */
    var layer = document.createElement('div');
    layer.id = 'spectral-formulas';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    var TEX = [
        String.raw`T=\sum_{n}\lambda_n\langle\cdot,e_n\rangle e_n`,
        String.raw`T=\int_{\sigma(T)}\lambda\,dE(\lambda)`,
        String.raw`\sigma(T)=\{\lambda\in\mathbb{C}:T-\lambda I\ \text{not invertible}\}`,
        String.raw`R(\lambda;T)=(T-\lambda I)^{-1}`,
        String.raw`T=T^{*}\ \Rightarrow\ \sigma(T)\subset\mathbb{R}`,
        String.raw`\langle Tx,y\rangle=\langle x,T^{*}y\rangle`,
        String.raw`r(T)=\lim_{n\to\infty}\|T^{n}\|^{1/n}`,
        String.raw`-\Delta u=\lambda u,\quad u|_{\partial\Omega}=0`,
        String.raw`\lambda_{m,n}=\pi^{2}(m^{2}+n^{2})`,
        String.raw`\lambda_k=\min_{\dim V=k}\ \max_{u\in V\setminus\{0\}}\frac{\langle-\Delta u,u\rangle}{\|u\|^{2}}`,
        String.raw`N(\lambda)\sim\frac{\omega_d\,|\Omega|}{(2\pi)^d}\,\lambda^{d/2}`,
        String.raw`\sum_{k}e^{-t\lambda_k}\sim(4\pi t)^{-d/2}|\Omega|\quad(t\to0^{+})`,
        String.raw`e^{-tH}=\int e^{-t\lambda}\,dE(\lambda)`,
        String.raw`\phi(T)=\int\phi(\lambda)\,dE(\lambda)`,
        String.raw`P_\Gamma=\frac{1}{2\pi i}\oint_\Gamma(z-T)^{-1}dz`,
        String.raw`\sigma_{\mathrm{ess}}(T+K)=\sigma_{\mathrm{ess}}(T)\ \ (K\ \text{compact})`,
        String.raw`\lambda_1\le\lambda_2\le\cdots\to\infty`,
        String.raw`\lambda_1(\Omega)\ge\lambda_1(\Omega^{*})`,
        String.raw`\frac{\langle Tx,x\rangle}{\langle x,x\rangle}\in[\lambda_{\min},\lambda_{\max}]`,
        String.raw`\|f\|_{2}=\|\hat f\|_{2}`,
        String.raw`\hat f(\xi)=\int f(x)e^{-2\pi i x\xi}dx`,
        String.raw`-\tfrac{\hbar^{2}}{2m}\psi''+V\psi=E\psi`,
        String.raw`H=\overline{\operatorname{span}\{e_n\}}`,
        String.raw`\operatorname{Tr}e^{-t\Delta}=\sum_k e^{-t\lambda_k}`
    ];

    var cache = [], boxes = [], live = 0, MAX_LIVE = window.innerWidth < 700 ? 3 : 6, lastIdx = -1;

    function mathReady(cb) {
        var tries = 0;
        (function poll() {
            var M = window.MathJax;
            if (M && M.startup && M.startup.promise && M.tex2svg) {
                M.startup.promise.then(cb).catch(function () {});
            } else if (tries++ < 150) {
                setTimeout(poll, 200);
            }
        })();
    }

    function typesetAll() {
        TEX.forEach(function (tex) {
            try {
                var svg = window.MathJax.tex2svg(tex, { display: false }).querySelector('svg');
                if (svg) cache.push(svg);
            } catch (e) { /* skip a formula that fails to parse */ }
        });
    }

    function spawn() {
        if (!cache.length || live >= MAX_LIVE) return;
        var idx;
        do { idx = Math.floor(Math.random() * cache.length); } while (idx === lastIdx && cache.length > 1);
        lastIdx = idx;

        var dur = 7 + Math.random() * 5;
        var el = document.createElement('div');
        el.className = 'sf';
        el.style.visibility = 'hidden';
        el.style.fontSize = (16 + Math.random() * 10) + 'px';
        el.style.setProperty('--dur', dur + 's');
        el.appendChild(cache[idx].cloneNode(true));
        layer.appendChild(el);

        // Find a spot that doesn't overlap any formula currently on screen.
        var vw = window.innerWidth, vh = window.innerHeight;
        var w = el.offsetWidth, h = el.offsetHeight, PAD = 28, placed = false;
        for (var tries = 0; tries < 30 && !placed; tries++) {
            var left = 16 + Math.random() * Math.max(1, vw - w - 32);
            var top = 16 + Math.random() * Math.max(1, vh * 0.62 - h);     // upper area, above the flames
            var clear = true;
            for (var i = 0; i < boxes.length; i++) {
                var b = boxes[i];
                if (left < b.r + PAD && left + w > b.l - PAD && top < b.b + PAD && top + h > b.t - PAD) { clear = false; break; }
            }
            if (clear) {
                el.style.left = left + 'px';
                el.style.top = top + 'px';
                el.style.visibility = '';
                var box = { l: left, t: top, r: left + w, b: top + h };
                boxes.push(box);
                live++;
                placed = true;
                setTimeout(function () {
                    el.remove(); live--;
                    boxes.splice(boxes.indexOf(box), 1);
                }, dur * 1000 + 100);
            }
        }
        if (!placed) el.remove();           // no room right now; try again on the next tick
    }

    mathReady(function () {
        typesetAll();
        if (!cache.length) return;
        if (reduceMotion) { for (var i = 0; i < 4; i++) spawn(); return; }
        for (var j = 0; j < 4; j++) setTimeout(spawn, j * 600);
        setInterval(function () { if (!document.hidden) spawn(); }, 1400);
    });
})();
