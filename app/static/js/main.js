
(function () {

    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-open'));
    }


    const wrapper = document.getElementById('avatarWrapper');
    const btn = document.getElementById('avatarBtn');
    if (btn) {
        btn.addEventListener('click', e => { e.stopPropagation(); wrapper.classList.toggle('open'); });
        document.addEventListener('click', e => { if (!wrapper.contains(e.target)) wrapper.classList.remove('open'); });
    }

    const streakEl = document.getElementById('streak-count');
    if (streakEl) {
        const v = parseInt(streakEl.dataset.streak, 10);
        streakEl.textContent = isNaN(v) ? 0 : v;
    }
})();