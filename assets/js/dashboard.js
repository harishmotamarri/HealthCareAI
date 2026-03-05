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
            // Title stays as MediEase, no change needed here
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

        // Highlight Sidebar (Title stays constant as MediEase)
        const matchingNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if (matchingNav) {
            matchingNav.classList.add('active');
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

    // --- 2. Symptom Checker - AI Assistant Redesign logic ---
    const aiState = {
        selectedSymptoms: new Set(),
        severity: 5,
        duration: '1-3 days',
        isAnalyzing: false
    };

    const symptomSearchInput = document.getElementById('symptom-search');
    const suggestionsBox = document.getElementById('search-suggestions');
    const activeChipsContainer = document.getElementById('active-symptoms-list');
    const checkBtn = document.getElementById('check-symptoms-btn');
    const resultOverlay = document.getElementById('symptom-result');
    const resultContent = document.getElementById('symptom-analysis-content');
    const severitySlider = document.getElementById('severity-slider');
    const severityVal = document.getElementById('severity-val');

    const symptomsWithIcons = [
        { name: "Headache", icon: "🤕" },
        { name: "Fever", icon: "🌡️" },
        { name: "Cough", icon: "🌬️" },
        { name: "Fatigue", icon: "🛌" },
        { name: "Nausea", icon: "🤢" },
        { name: "Chest Pain", icon: "🫀" },
        { name: "Dizziness", icon: "😵" },
        { name: "Sore Throat", icon: "🗣️" },
        { name: "Body Aches", icon: "💪" },
        { name: "Shortness of Breath", icon: "🫁" }
    ];

    function renderChips() {
        if (aiState.selectedSymptoms.size === 0) {
            activeChipsContainer.innerHTML = '';
            return;
        }

        activeChipsContainer.innerHTML = Array.from(aiState.selectedSymptoms).map(symptom => `
            <div class="chip">
                <span>${symptom}</span>
                <span class="close" onclick="window.removeAISymptom('${symptom}')">✕</span>
            </div>
        `).join('');
    }

    function toggleAISymptom(symptom) {
        if (aiState.selectedSymptoms.has(symptom)) {
            aiState.selectedSymptoms.delete(symptom);
        } else {
            aiState.selectedSymptoms.add(symptom);
        }
        renderChips();
        updateGridSelection();
    }

    function updateGridSelection() {
        document.querySelectorAll('.symptom-card-btn').forEach(btn => {
            const sym = btn.getAttribute('data-symptom');
            btn.classList.toggle('selected', aiState.selectedSymptoms.has(sym));
        });
    }

    window.removeAISymptom = (s) => toggleAISymptom(s);

    // Grid Buttons
    document.querySelectorAll('.symptom-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleAISymptom(btn.getAttribute('data-symptom'));
        });
    });

    // Search Logic
    symptomSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) {
            suggestionsBox.style.display = 'none';
            return;
        }

        const matches = symptomsWithIcons.filter(s => 
            s.name.toLowerCase().includes(query) && !aiState.selectedSymptoms.has(s.name)
        );

        if (matches.length > 0) {
            suggestionsBox.innerHTML = matches.map(s => `<div>${s.icon} ${s.name}</div>`).join('');
            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }
    });

    suggestionsBox.addEventListener('click', (e) => {
        const text = e.target.innerText.split(' ').slice(1).join(' '); // Remove icon
        if (text) {
            toggleAISymptom(text);
            symptomSearchInput.value = '';
            suggestionsBox.style.display = 'none';
        }
    });

    // Slider
    if (severitySlider) {
        severitySlider.addEventListener('input', () => {
            aiState.severity = severitySlider.value;
            severityVal.innerText = `${aiState.severity}/10`;
            let color = '#22c55e';
            if (aiState.severity > 3) color = '#f59e0b';
            if (aiState.severity > 7) color = '#ef4444';
            severityVal.style.color = color;
        });
    }

    const closeResultBtn = document.getElementById('close-result');
    if (closeResultBtn) {
        closeResultBtn.addEventListener('click', () => {
            resultOverlay.style.display = 'none';
        });
    }

    // Reset Flow
    document.getElementById('new-check-btn').addEventListener('click', () => {
        resultOverlay.style.display = 'none';
        aiState.selectedSymptoms.clear();
        renderChips();
        updateGridSelection();
        symptomSearchInput.value = '';
    });

    function formatAIResponse(text) {
        // Clean white space
        let formatted = text.trim();
        
        // Define section headers we expect
        const sections = [
            "Possible Issue",
            "What It Means",
            "What You Can Do",
            "See a Doctor If"
        ];

        // Replace section names with styled icons + headings
        const icons = {
            "Possible Issue": "🔍",
            "What It Means": "💡",
            "What You Can Do": "✅",
            "See a Doctor If": "⚠️"
        };

        sections.forEach(section => {
            const regex = new RegExp(`(${section})`, 'gi');
            formatted = formatted.replace(regex, `<h3>${icons[section]} $1</h3>`);
        });

        // Convert bullet points to list items
        formatted = formatted.replace(/•\s*(.*?)(?=<br>|<h3>|$)/g, '<li>$1</li>');
        
        // Wrap groups of <li> in <ul>
        formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');

        // Bold refinement
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        return formatted;
    }

    // API Call
    if (checkBtn) {
        checkBtn.addEventListener('click', async () => {
            if (aiState.selectedSymptoms.size === 0) {
                alert('Please select or search for at least one symptom.');
                return;
            }

            aiState.isAnalyzing = true;
            checkBtn.innerHTML = '<span class="spinner"></span> Analyzing Symptoms...';
            checkBtn.disabled = true;

            const duration = document.getElementById('symptom-duration').value;

            try {
                const response = await fetch('http://localhost:3000/api/check-symptoms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        symptoms: Array.from(aiState.selectedSymptoms),
                        severity: aiState.severity,
                        duration: duration
                    })
                });

                const data = await response.json();
                
                if (data.analysis) {
                    resultContent.innerHTML = formatAIResponse(data.analysis.replace(/\n/g, '<br>'));
                    resultOverlay.style.display = 'flex';
                } else {
                    resultContent.innerHTML = '<h3>⚠️ Error</h3><p>Sorry, I encountered an error during analysis. Please try again.</p>';
                    resultOverlay.style.display = 'flex';
                }
            } catch (err) {
                console.error(err);
                resultContent.innerHTML = '<h3>⚠️ Connection Error</h3><p>Failed to connect to MediEase AI. Please ensure the server is running.</p>';
                resultOverlay.style.display = 'flex';
            } finally {
                aiState.isAnalyzing = false;
                checkBtn.innerHTML = 'Check My Symptoms';
                checkBtn.disabled = false;
            }
        });
    }

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