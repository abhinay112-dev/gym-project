/* ═══════════════════════════════════════════
   GYMBHAI — progress.js
   No animations, no glow, simple alerts
   ═══════════════════════════════════════════ */

(function () {

    /* ── Consistency Score Ring ─────────────── */
    const scoreRingFill = document.querySelector('.score-ring-fill');
    const scoreNum = document.querySelector('.score-num');
    const initialScore = parseInt(scoreNum ? scoreNum.dataset.score || scoreNum.textContent : 0);

    if (scoreRingFill) {
        const pct = initialScore / 100;
        const offset = 220 - (220 * pct);
        scoreRingFill.style.strokeDashoffset = offset;
    }

    if (scoreNum) {
        scoreNum.textContent = initialScore;
    }

    /* ── cbar-fill widths ── */
    document.querySelectorAll('.cbar-fill[data-pct]').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
    });

    /* ── Mood fill bars ─────────────────────── */
    document.querySelectorAll('.mood-fill[data-pct]').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
    });

    /* ── Workout type fill bars ─────────────── */
    document.querySelectorAll('.wtype-bar-fill[data-pct]').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
    });

    /* ── Delete / Reset buttons → simple alert ── */
    document.querySelectorAll('[data-confirm]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const msg = this.dataset.confirm || 'Are you sure?';
            alert(msg + '\n\nThis action cannot be undone.');
        });
    });

    document.querySelectorAll('.btn-delete, .btn-reset').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const action = this.classList.contains('btn-reset') ? 'reset' : 'delete';
            alert('Confirm: You are about to ' + action + ' this data. Click OK to proceed.');
        });
    });

})();
/* ── Monthly Calendar ───────────────────── */
(function () {
    const grid = document.getElementById("calGrid");
    const monthLabel = document.getElementById("calMonth");
    const prev = document.getElementById("calPrev");
    const next = document.getElementById("calNext");

    if (!grid) return;

    const logs = JSON.parse(grid.dataset.logs || "{}");

    let current = new Date();

    function render(date) {
        grid.innerHTML = "";

        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthLabel.textContent = date.toLocaleString("default", {
            month: "long",
            year: "numeric"
        });

        const todayStr = new Date().toISOString().slice(0, 10);

        // previous month filler
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.className = "cal-day other-month";
            grid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const el = document.createElement("div");
            el.className = "cal-day";
            el.textContent = d;

            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // apply status from backend
            if (logs[fullDate]) {
                el.classList.add(logs[fullDate]); // active / partial / missed
            }

            if (fullDate === todayStr) {
                el.classList.add("today");
            }

            grid.appendChild(el);
        }
    }

    prev.onclick = () => {
        current.setMonth(current.getMonth() - 1);
        render(current);
    };

    next.onclick = () => {
        current.setMonth(current.getMonth() + 1);
        render(current);
    };

    render(current);
})();