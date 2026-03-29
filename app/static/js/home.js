/* ═══════════════════════════════════════════
   GYMBHAI — home.js
   Home: quote, modals, workout tracker,
         consistency ring, weekly bars,
         water intake, steps, feedback
   ═══════════════════════════════════════════ */

(function () {

    /* ─────────────────────────────────────────
       DAILY QUOTE
    ───────────────────────────────────────── */
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteBtn = document.getElementById('quote-refresh-btn');

    if (quoteBtn) {
        quoteBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/daily-quote?refresh=1');
                const data = await res.json();
                if (quoteText) quoteText.textContent = data.quote;
                if (quoteAuthor) quoteAuthor.textContent = '— ' + data.author;
            } catch (e) { }
        });
    }

    /* ─────────────────────────────────────────
       MODALS
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

    const preTrigger = document.getElementById('pre-workout-trigger');
    const postTrigger = document.getElementById('post-workout-trigger');
    if (preTrigger) preTrigger.addEventListener('click', () => openModal('pre-modal-overlay'));
    if (postTrigger) postTrigger.addEventListener('click', () => openModal('post-modal-overlay'));

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });

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

    /* ── Pre-Workout Form ────────────────────── */
    const preForm = document.getElementById('pre-workout-form');
    if (preForm) {
        preForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = preForm.querySelector('.modal-submit-btn');
            if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

            const data = Object.fromEntries(new FormData(preForm).entries());
            try {
                const res = await fetch('/api/pre-modal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await res.json();

                if (json.status === 'already_submitted') {
                    if (btn) { btn.textContent = 'Already Logged Today'; btn.disabled = false; }
                    setTimeout(() => closeModal('pre-modal-overlay'), 1200);
                    return;
                }

                // Update water bar live
                if (json.water_today !== undefined) {
                    updateWaterUI(json.water_today);
                }

                if (btn) btn.textContent = '✓ Saved!';
                // Mark trigger as submitted
                const trigger = document.getElementById('pre-workout-trigger');
                if (trigger) {
                    trigger.classList.add('submitted');
                    trigger.querySelector('.bar-sub').textContent = '✓ Logged for today';
                }
                setTimeout(() => {
                    closeModal('pre-modal-overlay');
                }, 900);
            } catch (_) {
                if (btn) { btn.textContent = 'Error — Try Again'; btn.disabled = false; }
            }
        });
    }

    /* ── Post-Workout Form ───────────────────── */
    const postForm = document.getElementById('post-workout-form');
    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = postForm.querySelector('.modal-submit-btn');
            if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

            const data = Object.fromEntries(new FormData(postForm).entries());
            try {
                const res = await fetch('/api/post-modal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await res.json();

                if (json.status === 'already_submitted') {
                    if (btn) { btn.textContent = 'Already Logged Today'; btn.disabled = false; }
                    setTimeout(() => closeModal('post-modal-overlay'), 1200);
                    return;
                }

                if (btn) btn.textContent = '✓ Session Logged!';

                // Mark trigger as submitted
                const trigger = document.getElementById('post-workout-trigger');
                if (trigger) {
                    trigger.classList.add('submitted');
                    trigger.querySelector('.bar-sub').textContent = '✓ Session logged for today';
                }

                // Update feedback bar
                if (json.feedback) {
                    const feedbackBar = document.getElementById('feedback-bar');
                    const feedbackText = document.getElementById('feedback-text');
                    if (feedbackBar) feedbackBar.classList.remove('empty');
                    if (feedbackText) feedbackText.textContent = json.feedback;
                    else {
                        const fb = document.getElementById('feedback-bar');
                        if (fb) {
                            fb.innerHTML = `
                                <div class="feedback-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2a10 10 0 110 20A10 10 0 0112 2z"/>
                                        <path d="M12 8v4l3 3"/>
                                    </svg>
                                </div>
                                <div class="feedback-content">
                                    <div class="feedback-label">GymBhai AI Coach</div>
                                    <div class="feedback-text" id="feedback-text">${json.feedback}</div>
                                </div>`;
                            fb.classList.remove('empty');
                        }
                    }
                }

                // Update consistency score
                if (json.consistency_score !== undefined) {
                    setConsistencyScore(json.consistency_score);
                    const cFeedback = document.getElementById('consistency-feedback-text');
                    if (cFeedback && json.consistency_feedback) {
                        cFeedback.textContent = json.consistency_feedback;
                    }
                    const cbarFill = document.getElementById('consistency-bar-fill');
                    if (cbarFill) cbarFill.style.width = json.consistency_score + '%';
                    const cbarLabel = document.querySelector('.cbar-label span:last-child');
                    if (cbarLabel) cbarLabel.textContent = json.consistency_score + '%';
                }

                setTimeout(() => closeModal('post-modal-overlay'), 1200);
            } catch (_) {
                if (btn) { btn.textContent = 'Error — Try Again'; btn.disabled = false; }
            }
        });
    }

    /* ─────────────────────────────────────────
       WATER INTAKE — glass buttons
    ───────────────────────────────────────── */
    function updateWaterUI(count) {
        const waterCount = document.getElementById('water-count');
        const waterFill = document.getElementById('water-fill');
        if (waterCount) waterCount.textContent = count;
        if (waterFill) waterFill.style.width = Math.min(100, (count / 12) * 100) + '%';
        document.querySelectorAll('.glass-btn').forEach(btn => {
            const g = parseInt(btn.dataset.glass);
            btn.classList.toggle('filled', g <= count);
        });
    }

    document.querySelectorAll('.glass-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const glassNum = parseInt(btn.dataset.glass);
            const currentCount = parseInt(document.getElementById('water-count')?.textContent || '0');
            const newCount = (currentCount === glassNum) ? glassNum - 1 : glassNum;

            updateWaterUI(newCount);

            try {
                await fetch('/api/pre-modal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ water_intake: newCount, _water_only: true })
                });
            } catch (_) { }
        });
    });

    /* ─────────────────────────────────────────
       STEP COUNT
    ───────────────────────────────────────── */
    const stepsInput = document.getElementById('steps-input');
    const stepsSaveBtn = document.getElementById('steps-save-btn');
    const stepsDisplay = document.getElementById('steps-display');
    const stepsFill = document.getElementById('steps-fill');

    function updateStepsUI(steps) {
        if (stepsDisplay) stepsDisplay.textContent = steps.toLocaleString();
        if (stepsFill) stepsFill.style.width = Math.min(100, (steps / 10000) * 100) + '%';
    }

    if (stepsSaveBtn) {
        stepsSaveBtn.addEventListener('click', async () => {
            const steps = parseInt(stepsInput?.value || '0');
            if (isNaN(steps) || steps < 0) return;

            stepsSaveBtn.textContent = '✓';
            stepsSaveBtn.disabled = true;
            updateStepsUI(steps);

            try {
                await fetch('/api/steps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ steps })
                });
            } catch (_) { }

            setTimeout(() => {
                stepsSaveBtn.textContent = 'Save';
                stepsSaveBtn.disabled = false;
            }, 1500);
        });
    }

    if (stepsInput) {
        stepsInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') stepsSaveBtn?.click();
        });
    }

    /* ─────────────────────────────────────────
       TODAY'S WORKOUT TRACKER
    ───────────────────────────────────────── */
    const exerciseRows = document.querySelectorAll('.exercise-row');
    const ringFill = document.querySelector('.ring-fill');
    const ringLabel = document.querySelector('.ring-label');
    const totalExs = exerciseRows.length;

    function updateRing() {
        const done = document.querySelectorAll('.exercise-row.done').length;
        if (ringFill) {
            const pct = totalExs > 0 ? done / totalExs : 0;
            const offset = 138 - (138 * pct);
            ringFill.style.strokeDashoffset = offset;
        }
        if (ringLabel) {
            ringLabel.textContent = document.querySelectorAll('.exercise-row.done').length + '/' + totalExs;
        }
    }

    exerciseRows.forEach(row => {
        const check = row.querySelector('.ex-check');
        const setDots = row.querySelectorAll('.set-dot');
        const exName = row.dataset.exercise;

        setDots.forEach((dot, i) => {
            dot.addEventListener('click', async e => {
                e.stopPropagation();
                dot.classList.toggle('done');
                const isDone = dot.classList.contains('done');

                try {
                    await fetch('/api/workout-set', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ exercise: exName, set_index: i, completed: isDone })
                    });
                } catch (_) { }

                const doneDots = row.querySelectorAll('.set-dot.done').length;
                if (doneDots === setDots.length) {
                    row.classList.add('done');
                    if (check) check.innerHTML = checkSVG();
                } else {
                    row.classList.remove('done');
                    if (check) check.innerHTML = '';
                }
                updateRing();
            });
        });

        if (check) {
            check.addEventListener('click', async e => {
                e.stopPropagation();
                row.classList.toggle('done');
                const isDone = row.classList.contains('done');
                check.innerHTML = isDone ? checkSVG() : '';

                const promises = [];
                setDots.forEach((d, i) => {
                    d.classList.toggle('done', isDone);
                    promises.push(
                        fetch('/api/workout-set', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ exercise: exName, set_index: i, completed: isDone })
                        }).catch(() => { })
                    );
                });
                await Promise.all(promises);
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
       CONSISTENCY SCORE — set directly, no animation
    ───────────────────────────────────────── */
    const scoreRingFill = document.querySelector('.score-ring-fill');
    const scoreNum = document.querySelector('.score-num');
    const initialScore = parseInt(scoreNum ? scoreNum.dataset.score || scoreNum.textContent : 0);

    function setConsistencyScore(targetScore) {
        if (scoreRingFill) {
            const pct = targetScore / 100;
            const offset = 220 - (220 * pct);
            scoreRingFill.style.strokeDashoffset = offset;
        }
        if (scoreNum) {
            scoreNum.textContent = targetScore;
        }
    }

    /* Consistency bar widths */
    document.querySelectorAll('.cbar-fill[data-pct]').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
    });

    /* Weekly bar heights */
    document.querySelectorAll('.day-bar[data-h]').forEach(bar => {
        bar.style.height = bar.dataset.h + '%';
    });

    /* Set on load */
    setConsistencyScore(initialScore);

})();