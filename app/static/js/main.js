/* ═══════════════════════════════════════════
   GYMBHAI — main.js
   Shared: sidebar toggle, avatar dropdown
   ═══════════════════════════════════════════ */

(function () {
    /* ── Sidebar toggle ── */
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    let leaveTimer;

    menuBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });

    sidebar.addEventListener('mouseleave', () => {
        leaveTimer = setTimeout(() => document.body.classList.remove('sidebar-open'), 300);
    });
    sidebar.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
    menuBtn.addEventListener('mouseleave', () => {
        leaveTimer = setTimeout(() => document.body.classList.remove('sidebar-open'), 300);
    });
    menuBtn.addEventListener('mouseenter', () => clearTimeout(leaveTimer));

    document.querySelectorAll('.sb-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    /* ── Avatar dropdown ── */
    const avatarWrapper = document.getElementById('avatarWrapper');
    const avatarBtn = document.getElementById('avatarBtn');

    avatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        avatarWrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!avatarWrapper.contains(e.target)) {
            avatarWrapper.classList.remove('open');
        }
    });
})();