/**
 * Application Router & State Manager
 * Handles navigation between landing page and internal views without refreshing.
 */
const appRouter = {
    // 1. Switch from Landing Page to Main App
    login: function () {
        document.getElementById('landing-layout').classList.remove('active');
        document.getElementById('landing-layout').style.display = 'none';

        const appLayout = document.getElementById('app-layout');
        appLayout.style.display = 'flex';
        // Small delay to allow display:flex to apply before adding active class for animations if needed
        setTimeout(() => appLayout.classList.add('active'), 10);
    },

    // 2. Navigate between internal sidebar views
    navigate: function (targetViewId) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });

        // Remove active state from all sidebar items
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });

        // Show the target view
        const targetView = document.getElementById(targetViewId);
        if (targetView) targetView.classList.add('active');

        // Update the Sidebar active state
        const targetNav = document.querySelector(`.nav-item[data-target="${targetViewId}"]`);
        if (targetNav) {
            targetNav.classList.add('active');
            // Update Topbar Title
            document.getElementById('current-page-title').textContent = targetNav.textContent.trim();
        }
    },

    // 3. Initialize event listeners
    init: function () {
        // Attach click listeners to all sidebar items
        document.querySelectorAll('.nav-item').forEach(item => {
            // Don't route if it's the emergency button
            if (!item.classList.contains('emergency-btn')) {
                item.addEventListener('click', (e) => {
                    const target = e.currentTarget.getAttribute('data-target');
                    this.navigate(target);
                });
            }
        });

        // Initialize Symptom Pill toggles
        document.querySelectorAll('.pill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('selected');
            });
        });
    }
};

// Boot up the application logic when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    appRouter.init();
});

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Router Logic (Sidebar Navigation) ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const topbarTitle = document.getElementById('topbar-title');
    const linkTriggers = document.querySelectorAll('.link-trigger'); // Quick action cards & back links
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);

    function toggleSidebar() {
        sidebarToggle.classList.toggle('is-active');
        if (window.innerWidth <= 768) {
            // Mobile behavior (overlay)
            sidebar.classList.toggle('sidebar-open');
            overlay.classList.toggle('active');
        } else {
            // Desktop behavior (push)
            sidebar.classList.toggle('collapsed');
        }
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    overlay.addEventListener('click', toggleSidebar);

    function switchView(targetId) {
        // Hide all views
        viewSections.forEach(view => view.classList.remove('active'));
        // Remove active state from sidebar
        navItems.forEach(nav => nav.classList.remove('active'));

        // Show target view
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.add('active');
        }

        // Highlight Sidebar and Change Title
        const matchingNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (matchingNav) {
            matchingNav.classList.add('active');
            topbarTitle.innerText = matchingNav.innerText.trim();
        } else if (targetId === 'profile') {
            topbarTitle.innerText = 'Profile';
        }

        // Close mobile sidebar on view switch
        if (window.innerWidth <= 768 && sidebar.classList.contains('sidebar-open')) {
            toggleSidebar();
        }
    }

    // Attach click events to sidebar
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (targetId) switchView(targetId);
        });
    });

    // Attach click events to dashboard cards/back buttons
    linkTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.getAttribute('data-target');
            if (targetId) switchView(targetId);
        });
    });

    // --- 2. Symptom Checker Pills ---
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pill.classList.toggle('selected');
        });
    });

    // --- 3. Settings Toggles ---
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('on');
        });
    });

    // --- 4. Hospital Modal Functions ---
    const modal = document.getElementById('hospitalModal');

    // Expose functions globally so inline onclick handlers in HTML can use them
    window.openModal = function () {
        modal.classList.add('active');
    }

    window.closeModal = function () {
        modal.classList.remove('active');
    }

    // Close modal if clicking outside the content box
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

});