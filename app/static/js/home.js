/* ═══════════════════════════════════════════
   GYMBHAI — home.js
   Home: quote refresh, modals, workout tracker,
         consistency ring, weekly bars
   ═══════════════════════════════════════════ */

(function () {

    /* ─────────────────────────────────────────
       DAILY QUOTE
    ───────────────────────────────────────── */
    const quoteText   = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteBtn    = document.getElementById('quote-refresh-btn');

    if (quoteBtn) {
        quoteBtn.addEventListener('click', async () => {
            if (quoteBtn.classList.contains('spinning')) return;
            quoteBtn.classList.add('spinning');

            quoteText  && quoteText.classList.add('fading');
            quoteAuthor && quoteAuthor.classList.add('fading');

            try {
                const res  = await fetch('/api/daily-quote?refresh=1');
                const data = await res.json();

                setTimeout(() => {
                    if (quoteText)   quoteText.textContent   = data.quote;
                    if (quoteAuthor) quoteAuthor.textContent = '— ' + data.author;
                    quoteText   && quoteText.classList.remove('fading');
                    quoteAuthor && quoteAuthor.classList.remove('fading');
                }, 350);
            } catch (e) {
                quoteText   && quoteText.classList.remove('fading');
                quoteAuthor && quoteAuthor.classList.remove('fading');
            }

            setTimeout(() => quoteBtn.classList.remove('spinning'), 600);
        });
    }

    /* ─────────────────────────────────────────
       MODALS (Pre / Post Workout)
    ───────────────────────────────────────── */
    function openModal(id) {
        const overlay = document.getElementById(id);
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeModal(id) {
        const overlay = document.getElementById(id);
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    /* Open triggers */
    const preTrigger  = document.getElementById('pre-workout-trigger');
    const postTrigger = document.getElementById('post-workout-trigger');
    if (preTrigger)  preTrigger.addEventListener('click',  () => openModal('pre-modal-overlay'));
    if (postTrigger) postTrigger.addEventListener('click', () => openModal('post-modal-overlay'));

    /* Close buttons */
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.dataset.closeModal);
        });
    });

    /* Close on overlay click */
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) closeModal(overlay.id);
        });
    });

    /* Range sliders — live value update */
    document.querySelectorAll('input[type="range"][data-val-target]').forEach(range => {
        const target = document.getElementById(range.dataset.valTarget);
        if (target) {
            const update = () => {
                const suffix = range.dataset.suffix || '';
                target.textContent = range.value + suffix;
            };
            range.addEventListener('input', update);
            update();
        }
    });

    /* Form submissions */
    const preForm  = document.getElementById('pre-workout-form');
    const postForm = document.getElementById('post-workout-form');

    function handleFormSubmit(form, modalId, successMsg) {
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.modal-submit-btn');
            if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                await fetch('/api/' + modalId, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (_) { /* graceful fail */ }

            setTimeout(() => {
                if (btn) { btn.textContent = successMsg; }
                setTimeout(() => {
                    closeModal(modalId + '-overlay');
                    form.reset();
                    if (btn) { btn.textContent = 'Save'; btn.disabled = false; }
                }, 900);
            }, 400);
        });
    }

    handleFormSubmit(preForm,  'pre-modal',  '✓ Saved!');
    handleFormSubmit(postForm, 'post-modal', '✓ Logged!');

    /* ─────────────────────────────────────────
       TODAY'S WORKOUT TRACKER
    ───────────────────────────────────────── */
    const exerciseRows = document.querySelectorAll('.exercise-row');
    const ringFill     = document.querySelector('.ring-fill');
    const ringLabel    = document.querySelector('.ring-label');
    const totalExs     = exerciseRows.length;

    function updateRing() {
        const done = document.querySelectorAll('.exercise-row.done').length;
        if (ringFill) {
            const pct = done / totalExs;
            const offset = 138 - (138 * pct);
            ringFill.style.strokeDashoffset = offset;
        }
        if (ringLabel) {
            const done2 = document.querySelectorAll('.exercise-row.done').length;
            ringLabel.textContent = done2 + '/' + totalExs;
        }
    }

    exerciseRows.forEach(row => {
        const check   = row.querySelector('.ex-check');
        const setDots = row.querySelectorAll('.set-dot');
        let   dotsDone = 0;

        /* Toggle sets */
        setDots.forEach((dot, i) => {
            dot.addEventListener('click', e => {
                e.stopPropagation();
                dot.classList.toggle('done');
                dotsDone = row.querySelectorAll('.set-dot.done').length;
                if (dotsDone === setDots.length) {
                    row.classList.add('done');
                    if (check) check.innerHTML = checkSVG();
                } else {
                    row.classList.remove('done');
                    if (check) check.innerHTML = '';
                }
                updateRing();
            });
        });

        /* Toggle whole exercise */
        if (check) {
            check.addEventListener('click', e => {
                e.stopPropagation();
                row.classList.toggle('done');
                const isDone = row.classList.contains('done');
                check.innerHTML = isDone ? checkSVG() : '';
                setDots.forEach(d => d.classList.toggle('done', isDone));
                dotsDone = isDone ? setDots.length : 0;
                updateRing();
            });
        }
    });

    function checkSVG() {
        return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/></svg>`;
    }

    updateRing();

    /* ─────────────────────────────────────────
       CONSISTENCY SCORE ANIMATION
    ───────────────────────────────────────── */
    const scoreRingFill = document.querySelector('.score-ring-fill');
    const scoreNum      = document.querySelector('.score-num');
    const score         = parseInt(scoreNum ? scoreNum.dataset.score || scoreNum.textContent : 0);

    function animateConsistency() {
        if (!scoreRingFill || !score) return;
        const pct    = score / 100;
        const offset = 220 - (220 * pct);
        scoreRingFill.style.strokeDashoffset = offset;

        /* Animate number */
        if (scoreNum) {
            let cur = 0;
            const step = score / 60;
            const interval = setInterval(() => {
                cur = Math.min(cur + step, score);
                scoreNum.textContent = Math.round(cur);
                if (cur >= score) clearInterval(interval);
            }, 16);
        }
    }

    /* Consistency bar widths */
    document.querySelectorAll('.cbar-fill[data-pct]').forEach(bar => {
        setTimeout(() => {
            bar.style.width = bar.dataset.pct + '%';
        }, 200);
    });

    /* Weekly bars heights */
    document.querySelectorAll('.day-bar[data-h]').forEach(bar => {
        bar.style.height = bar.dataset.h + '%';
    });

    /* Trigger animations on page load */
    setTimeout(animateConsistency, 300);

})();
