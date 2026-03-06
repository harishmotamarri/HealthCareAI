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

        // Initialize Global Search Input
        const globalSearch = document.getElementById('global-search');
        const suggestionsBox = document.getElementById('global-search-suggestions');

        const searchSections = [
            { id: 'dashboard', title: 'Dashboard', icon: '📊', keywords: ['home', 'main', 'dash'] },
            { id: 'analyzer', title: 'Report Analyzer', icon: '📄', keywords: ['upload', 'pdf', 'scan'] },
            { id: 'reports', title: 'Medical Reports', icon: '📁', keywords: ['history', 'past', 'records'] },
            { id: 'symptoms', title: 'Symptom Checker', icon: '🩺', keywords: ['check', 'health', 'sick'] },
            { id: 'hospitals', title: 'Hospital Finder', icon: '🏥', keywords: ['clinic', 'doctor', 'find'] },
            { id: 'firstaid', title: 'First Aid Guide', icon: '🚑', keywords: ['emergency', 'help', 'guide'] }
        ];

        if (globalSearch && suggestionsBox) {
            // Handle input typing
            globalSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                suggestionsBox.innerHTML = '';

                if (query.length === 0) {
                    suggestionsBox.style.display = 'none';
                    return;
                }

                const matches = searchSections.filter(section =>
                    section.title.toLowerCase().includes(query) ||
                    section.keywords.some(k => k.includes(query))
                );

                if (matches.length > 0) {
                    // Limit to top 3 suggestions
                    matches.slice(0, 3).forEach(match => {
                        const div = document.createElement('div');
                        div.className = 'search-suggestion-item';
                        div.innerHTML = `<span style="margin-right: 8px;">${match.icon}</span> ${match.title}`;
                        div.addEventListener('click', () => {
                            this.navigate(match.id);
                            globalSearch.value = '';
                            suggestionsBox.style.display = 'none';
                        });
                        suggestionsBox.appendChild(div);
                    });
                    suggestionsBox.style.display = 'flex';
                } else {
                    const div = document.createElement('div');
                    div.className = 'search-suggestion-item empty';
                    div.style.cursor = 'default';
                    div.textContent = 'No matching sections';
                    suggestionsBox.appendChild(div);
                    suggestionsBox.style.display = 'flex';
                }
            });

            // Handle clicking outside to close
            document.addEventListener('click', (e) => {
                if (!globalSearch.contains(e.target) && !suggestionsBox.contains(e.target)) {
                    suggestionsBox.style.display = 'none';
                }
            });

            globalSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.toLowerCase().trim();
                    let target = null;

                    if (query.includes('dash') || query.includes('home')) target = 'dashboard';
                    else if (query.includes('analyz') || query.includes('upload')) target = 'analyzer';
                    else if (query.includes('report') || query.includes('medical') || query.includes('histor')) target = 'reports';
                    else if (query.includes('symptom') || query.includes('check')) target = 'symptoms';
                    else if (query.includes('hospital') || query.includes('find') || query.includes('clinic')) target = 'hospitals';
                    else if (query.includes('first') || query.includes('aid') || query.includes('emerg')) target = 'firstaid';

                    if (target) {
                        this.navigate(target);
                        e.target.value = ''; // clean input
                        globalSearch.blur(); // remove focus
                        suggestionsBox.style.display = 'none';
                    } else if (query.length > 0) {
                        e.target.style.border = '1px solid #ef4444';
                        setTimeout(() => e.target.style.border = '1px solid var(--border-color)', 1000);
                    }
                }
            });
        }
    }
};

// Boot up the application logic when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    appRouter.init();
});

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';

    // Set initial theme
    rootElement.setAttribute('data-theme', savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = rootElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            rootElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

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
        // General / Systemic
        { name: "Headache", icon: "🤕" },
        { name: "Fever", icon: "🌡️" },
        { name: "Fatigue", icon: "🛌" },
        { name: "Chills", icon: "🥶" },
        { name: "Sweating", icon: "💦" },
        { name: "Body Aches", icon: "💪" },
        { name: "Weakness", icon: "🔋" },

        // Respiratory / ENT
        { name: "Cough", icon: "🌬️" },
        { name: "Sore Throat", icon: "🗣️" },
        { name: "Shortness of Breath", icon: "🫁" },
        { name: "Runny Nose", icon: "🤧" },
        { name: "Congestion", icon: "👃" },
        { name: "Loss of Smell", icon: "🚫👃" },

        // Gastrointestinal
        { name: "Nausea", icon: "🤢" },
        { name: "Vomiting", icon: "🤮" },
        { name: "Diarrhea", icon: "🚽" },
        { name: "Stomach Ache", icon: "😖" },
        { name: "Heartburn", icon: "🔥" },
        { name: "Loss of Appetite", icon: "🍽️" },

        // Cardiovascular / Neurological
        { name: "Chest Pain", icon: "🫀" },
        { name: "Palpitations", icon: "💓" },
        { name: "Dizziness", icon: "😵" },
        { name: "Fainting", icon: "💫" },
        { name: "Confusion", icon: "❓" },
        { name: "Numbness", icon: "🧊" },

        // Musculoskeletal / Skin
        { name: "Joint Pain", icon: "🦴" },
        { name: "Muscle Cramps", icon: "🦵" },
        { name: "Back Pain", icon: "🧍" },
        { name: "Rash", icon: "🔴" },
        { name: "Itching", icon: "🤏" },
        // Vision / Eye
        { name: "Blurry Vision", icon: "👓" },
        { name: "Red Eye", icon: "👁️" }
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
        if (severitySlider) { severitySlider.value = 5; aiState.severity = 5; severityVal.innerText = '5/10'; severityVal.style.color = '#f59e0b'; }
    });

    function formatAIResponse(rawText) {
        const lines = rawText.trim().split('\n').filter(l => l.trim() !== '');

        const sectionIcons = {
            "possible issue": "🔍",
            "what it means": "💡",
            "what this means": "💡",
            "what you can do": "✅",
            "see a doctor if": "⚠️"
        };

        let html = '';
        let inList = false;

        lines.forEach(line => {
            let trimmed = line.trim();

            // Bold
            trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Section header (### Header)
            const headerMatch = trimmed.match(/^#{1,4}\s+(.+)/);
            if (headerMatch) {
                if (inList) { html += '</ul>'; inList = false; }
                const title = headerMatch[1].trim();
                const key = title.toLowerCase().replace(/[^a-z\s]/g, '').trim();
                const icon = sectionIcons[key] || '📋';
                html += `<h3>${icon} ${title}</h3>`;
                return;
            }

            // Bullet point (- item or • item)
            const bulletMatch = trimmed.match(/^[-•]\s+(.+)/);
            if (bulletMatch) {
                if (!inList) { html += '<ul>'; inList = true; }
                html += `<li>${bulletMatch[1]}</li>`;
                return;
            }

            // Regular paragraph text
            if (trimmed) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<p>${trimmed}</p>`;
            }
        });

        if (inList) html += '</ul>';
        return html;
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
                    resultContent.innerHTML = formatAIResponse(data.analysis);
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
    window.openModal = function (cardElement) {
        if (!modal) return;

        // If a card element was passed, extract its data to populate the modal
        if (cardElement) {
            const nameEl = cardElement.querySelector('h3');
            const addressEl = cardElement.querySelector('p:nth-of-type(2)');
            const ratingReviewsEl = cardElement.querySelector('p:nth-of-type(1)');
            const distWaitOpenEl = cardElement.querySelector('div:nth-of-type(2)');
            const tagsContainer = cardElement.querySelector('div:nth-of-type(3)');

            if (nameEl) document.getElementById('modal-hospital-name').innerText = nameEl.innerText;
            if (addressEl) document.getElementById('modal-hospital-address').innerText = addressEl.innerText;

            if (ratingReviewsEl) {
                const text = ratingReviewsEl.innerText;
                const ratingMatch = text.match(/★\s*([\d\.]+)/);
                const reviewsMatch = text.match(/\(([^)]+)\)/);

                if (ratingMatch) document.getElementById('modal-hospital-rating').innerText = `${ratingMatch[1]} ★`;
                if (reviewsMatch) document.getElementById('modal-hospital-reviews').innerText = reviewsMatch[1];
            }

            if (distWaitOpenEl) {
                const spans = distWaitOpenEl.querySelectorAll('span');
                if (spans.length >= 3) {
                    document.getElementById('modal-hospital-distance').innerText = spans[0].innerText;
                    document.getElementById('modal-hospital-wait').innerText = spans[1].innerText;
                    // The 3rd span is opening hours, we'll add it as a tag
                    const openTag = document.createElement('span');
                    openTag.className = 'small-tag';
                    openTag.style.background = 'rgba(0, 229, 163, 0.1)';
                    openTag.style.color = 'var(--primary)';
                    openTag.innerText = `Open ${spans[2].innerText}`;

                    const modalTags = document.getElementById('modal-hospital-tags');
                    if (modalTags) {
                        modalTags.innerHTML = ''; // clear old tags
                        modalTags.appendChild(openTag);
                    }
                }
            }

            if (tagsContainer) {
                const modalTags = document.getElementById('modal-hospital-tags');
                if (modalTags) {
                    // Clone all tags from the card (except the +1 more, we'll just clone them all for now)
                    const tags = tagsContainer.querySelectorAll('.small-tag');
                    tags.forEach(tag => {
                        if (!tag.innerText.includes('+')) {
                            const newTag = tag.cloneNode(true);
                            modalTags.appendChild(newTag);
                        }
                    });
                }
            }
        }

        modal.classList.add('active');
    }

    window.closeModal = function () {
        if (modal) modal.classList.remove('active');
    }

    // Attach click listeners to all Details buttons
    const allHospitalCards = document.querySelectorAll('.hospital-card');
    allHospitalCards.forEach(card => {
        const detailsBtn = card.querySelector('button.btn-primary');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent triggering the card's onclick if it has one
                openModal(card);
            });
        }

        // Ensure the card itself is also clickable if we want
        card.addEventListener('click', () => {
            openModal(card);
        });
    });

    // Close modal if clicking outside the content box
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // --- 5. Locate Me Functionality ---
    const locateMeBtn = document.getElementById('locate-me-btn');
    const locationDisplay = document.getElementById('user-location-display');
    const locationText = document.getElementById('location-text');

    if (locateMeBtn) {
        locateMeBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locationDisplay.style.display = 'flex';
                locationText.innerText = 'Fetching location...';
                locateMeBtn.disabled = true;

                navigator.geolocation.getCurrentPosition(async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await response.json();

                        let locationName = 'Unknown Location';
                        if (data && data.address) {
                            locationName = data.address.city || data.address.town || data.address.village || data.address.county || 'Your Location';
                        }
                        locationText.innerText = `Current Location: ${locationName} (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
                    } catch (err) {
                        console.error('Error fetching location name:', err);
                        locationText.innerText = `Current Location: Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
                    } finally {
                        locateMeBtn.disabled = false;
                    }
                }, (error) => {
                    console.error('Geolocation error:', error);
                    let errMsg = 'Failed to get location.';
                    if (error.code === 1) errMsg = 'Location access denied by user.';
                    else if (error.code === 2) errMsg = 'Position unavailable.';
                    else if (error.code === 3) errMsg = 'Location request timed out.';
                    locationText.innerText = errMsg;
                    locateMeBtn.disabled = false;
                });
            } else {
                locationDisplay.style.display = 'flex';
                locationText.innerText = 'Geolocation is not supported by your browser.';
            }
        });
    }

    // --- 6. Hospital Filtering Functionality ---
    const hospitalSearch = document.getElementById('hospital-search');
    const hospitalSpecialty = document.getElementById('hospital-specialty');
    const hospitalDistance = document.getElementById('hospital-distance');
    const hospitalRating = document.getElementById('hospital-rating');
    const hospitalCards = document.querySelectorAll('.hospital-card');
    const hospitalsCount = document.getElementById('hospitals-count');

    function filterHospitals() {
        if (!hospitalCards) return;

        const query = hospitalSearch ? hospitalSearch.value.toLowerCase() : '';
        const specialty = hospitalSpecialty ? hospitalSpecialty.value : 'All Specialties';
        const distanceFilter = hospitalDistance ? hospitalDistance.value : 'Any Distance';
        const ratingFilter = hospitalRating ? hospitalRating.value : 'Any Rating';

        let visibleCount = 0;

        hospitalCards.forEach(card => {
            let isVisible = true;

            // 1. Search Filter
            if (query) {
                const cardText = card.innerText.toLowerCase();
                if (!cardText.includes(query)) isVisible = false;
            }

            // 2. Specialty Filter
            if (isVisible && specialty !== 'All Specialties') {
                const tags = Array.from(card.querySelectorAll('.small-tag')).map(t => t.innerText.toLowerCase());
                if (!tags.includes(specialty.toLowerCase())) isVisible = false;
            }

            // 3. Distance Filter
            if (isVisible && distanceFilter !== 'Any Distance') {
                const distanceMatch = card.innerText.match(/([\d\.]+)\s*(mi|km)/);
                if (distanceMatch) {
                    let dist = parseFloat(distanceMatch[1]);
                    // No conversion needed, unit is km

                    if (distanceFilter === 'Within 5 km' && dist > 5) isVisible = false;
                    if (distanceFilter === 'Within 10 km' && dist > 10) isVisible = false;
                }
            }

            // 4. Rating Filter
            if (isVisible && ratingFilter !== 'Any Rating') {
                const ratingMatch = card.innerText.match(/★\s*([\d\.]+)/);
                if (ratingMatch) {
                    const rating = parseFloat(ratingMatch[1]);
                    if (ratingFilter === '4+ Stars' && rating < 4.0) isVisible = false;
                    if (ratingFilter === '3.5+ Stars' && rating < 3.5) isVisible = false;
                }
            }

            if (isVisible) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update hospitals found count text
        if (hospitalsCount) {
            hospitalsCount.innerText = `${visibleCount} hospital${visibleCount !== 1 ? 's' : ''} found`;
        }
    }

    if (hospitalSearch) hospitalSearch.addEventListener('input', filterHospitals);
    if (hospitalSpecialty) hospitalSpecialty.addEventListener('change', filterHospitals);
    if (hospitalDistance) hospitalDistance.addEventListener('change', filterHospitals);
    if (hospitalRating) hospitalRating.addEventListener('change', filterHospitals);

});