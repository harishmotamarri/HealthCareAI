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
            { id: 'reports', title: 'Medical Reports', icon: '📁', keywords: ['upload', 'pdf', 'scan', 'history', 'past', 'records'] },
            { id: 'symptoms', title: 'Symptom Checker', icon: '🩺', keywords: ['check', 'health', 'sick'] },
            { id: 'hospitals', title: 'Hospital Finder', icon: '🏥', keywords: ['clinic', 'doctor', 'find'] },
            { id: 'firstaid', title: 'First Aid Guide', icon: '🚑', keywords: ['emergency', 'help', 'guide'] },
            { id: 'medications', title: 'Medication Planner', icon: '💊', keywords: ['medicine', 'prescription', 'pill', 'drug', 'reminder', 'medication'] },
            { id: 'insurances', title: 'Claim Insurances', icon: '🛡️', keywords: ['insurance', 'claim', 'coverage', 'policy', 'health'] }
        ];

        if (globalSearch && suggestionsBox) {
            // Helper to show default suggestions
            const showDefaultSuggestions = () => {
                suggestionsBox.innerHTML = '<div class="search-suggestion-header">Related Searches</div>';
                searchSections.slice(0, 3).forEach(match => {
                    const div = document.createElement('div');
                    div.className = 'search-suggestion-item';
                    div.innerHTML = `<span style="margin-right: 8px;">${match.icon}</span> ${match.title}`;
                    div.addEventListener('click', () => {
                        this.navigate(match.id);
                        globalSearch.value = '';
                        globalSearch.blur();
                        suggestionsBox.style.display = 'none';
                    });
                    suggestionsBox.appendChild(div);
                });
                suggestionsBox.style.display = 'flex';
            };

            // Show defaults on focus only if there's a query
            globalSearch.addEventListener('focus', (e) => {
                if (e.target.value.trim().length > 0) {
                    globalSearch.dispatchEvent(new Event('input'));
                }
            });

            // Handle input typing
            globalSearch.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();

                if (query.length === 0) {
                    showDefaultSuggestions();
                    return;
                }

                suggestionsBox.innerHTML = '';

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
                    else if (query.includes('analyz') || query.includes('upload')) target = 'reports';
                    else if (query.includes('report') || query.includes('medical') || query.includes('histor')) target = 'reports';
                    else if (query.includes('symptom') || query.includes('check')) target = 'symptoms';
                    else if (query.includes('hospital') || query.includes('find') || query.includes('clinic')) target = 'hospitals';
                    else if (query.includes('first') || query.includes('aid') || query.includes('emerg')) target = 'firstaid';
                    else if (query.includes('med') || query.includes('pill') || query.includes('prescript') || query.includes('remind')) target = 'medications';

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

            // Voice Search Implementation
            const micBtn = document.getElementById('global-search-mic-btn');
            if (micBtn) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.continuous = false;
                    recognition.interimResults = false;
                    recognition.lang = 'en-US';

                    let isListening = false;

                    const toggleListening = () => {
                        if (isListening) {
                            recognition.stop();
                        } else {
                            recognition.start();
                        }
                    };

                    micBtn.addEventListener('click', toggleListening);

                    recognition.onstart = () => {
                        isListening = true;
                        micBtn.style.color = 'var(--primary)';
                        micBtn.style.background = 'rgba(0, 229, 163, 0.1)';
                        globalSearch.placeholder = "Listening...";
                    };

                    recognition.onresult = (event) => {
                        const transcript = event.results[0][0].transcript;
                        globalSearch.value = transcript;
                        // Trigger input event to show suggestions
                        globalSearch.dispatchEvent(new Event('input', { bubbles: true }));
                    };

                    recognition.onend = () => {
                        isListening = false;
                        micBtn.style.color = 'var(--text-muted)';
                        micBtn.style.background = 'none';
                        globalSearch.placeholder = "Search sections...";
                    };

                    recognition.onerror = (event) => {
                        console.error("Speech recognition error:", event.error);
                        isListening = false;
                        micBtn.style.color = 'var(--text-muted)';
                        micBtn.style.background = 'none';
                        globalSearch.placeholder = "Search sections...";
                    };
                } else {
                    micBtn.style.display = 'none';
                    console.warn("Speech Recognition API not supported in this browser.");
                }
            }
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
    const darkModeToggle = document.getElementById('settings-dark-toggle');
    const rootElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'dark';

    function applyTheme(theme) {
        rootElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (darkModeToggle) {
            darkModeToggle.classList.toggle('on', theme === 'dark');
        }
    }

    // Set initial theme
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const newTheme = rootElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            const newTheme = rootElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // --- 0b. Emergency Contact (localStorage) ---
    const ecName = document.getElementById('emergency-contact-name');
    const ecPhone = document.getElementById('emergency-contact-phone');
    const ecSaveBtn = document.getElementById('emergency-save-btn');
    const ecMsg = document.getElementById('emergency-save-msg');

    if (ecName && ecPhone) {
        const saved = JSON.parse(localStorage.getItem('emergencyContact') || '{}');
        if (saved.name) ecName.value = saved.name;
        if (saved.phone) ecPhone.value = saved.phone;

        ecSaveBtn.addEventListener('click', () => {
            const name = ecName.value.trim();
            const phone = ecPhone.value.trim();
            if (!name || !phone) {
                alert('Please fill in both name and phone number.');
                return;
            }
            localStorage.setItem('emergencyContact', JSON.stringify({ name, phone }));
            ecMsg.style.display = 'block';
            setTimeout(() => { ecMsg.style.display = 'none'; }, 3000);
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

    // --- 2. Health Assistant Chatbot + Optional Symptom Checker ---
    const aiState = {
        selectedSymptoms: new Set(),
        severity: 5,
        duration: '1-3 days',
        isAnalyzing: false
    };

    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const activeChipsContainer = document.getElementById('active-symptoms-list');
    const checkBtn = document.getElementById('check-symptoms-btn');
    const severitySlider = document.getElementById('severity-slider');
    const severityVal = document.getElementById('severity-val');

    function formatAIResponse(rawText) {
        const lines = rawText.trim().split('\n').filter(l => l.trim() !== '');
        const sectionIcons = {
            "possible issue": "🔍", "what it means": "💡", "what this means": "💡",
            "what you can do": "✅", "see a doctor if": "⚠️"
        };
        let html = '', inList = false;
        lines.forEach(line => {
            let trimmed = line.trim();
            trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            const headerMatch = trimmed.match(/^#{1,4}\s+(.+)/);
            if (headerMatch) {
                if (inList) { html += '</ul>'; inList = false; }
                const title = headerMatch[1].trim();
                const key = title.toLowerCase().replace(/[^a-z\s]/g, '').trim();
                const icon = sectionIcons[key] || '📋';
                html += `<h3>${icon} ${title}</h3>`;
                return;
            }
            const bulletMatch = trimmed.match(/^[-•]\s+(.+)/);
            if (bulletMatch) {
                if (!inList) { html += '<ul>'; inList = true; }
                html += `<li>${bulletMatch[1]}</li>`;
                return;
            }
            if (trimmed) {
                if (inList) { html += '</ul>'; inList = false; }
                html += `<p>${trimmed}</p>`;
            }
        });
        if (inList) html += '</ul>';
        return html;
    }

    function addChatBubble(type, content, isHtml) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${type}`;

        if (type === 'assistant') {
            bubble.innerHTML = `
                <div class="bubble-avatar">✨</div>
                <div class="bubble-content">${isHtml ? content : '<p>' + content + '</p>'}</div>
                <button class="bubble-read-btn" title="Read aloud">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                </button>
            `;
            const readBtn = bubble.querySelector('.bubble-read-btn');
            readBtn.addEventListener('click', function () {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                    readBtn.classList.remove('speaking');
                    return;
                }
                const text = bubble.querySelector('.bubble-content').textContent;
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = () => readBtn.classList.remove('speaking');
                readBtn.classList.add('speaking');
                window.speechSynthesis.speak(utterance);
            });
        } else {
            bubble.innerHTML = `<div class="bubble-content"><p>${content}</p></div>`;
        }

        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'chat-bubble assistant typing-indicator';
        typing.id = 'typing-bubble';
        typing.innerHTML = `
            <div class="bubble-avatar">✨</div>
            <div class="bubble-content"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        `;
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typing-bubble');
        if (el) el.remove();
    }

    async function sendToAPI(payload) {
        const response = await fetch('/api/check-symptoms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Server error');
        return data.analysis;
    }

    // Chat send (free-text question)
    async function handleChatSend() {
        const text = chatInput.value.trim();
        if (!text || aiState.isAnalyzing) return;

        addChatBubble('user', text);
        chatInput.value = '';
        aiState.isAnalyzing = true;
        chatSendBtn.disabled = true;
        addTypingIndicator();

        try {
            const analysis = await sendToAPI({ message: text });
            removeTypingIndicator();
            addChatBubble('assistant', formatAIResponse(analysis), true);
        } catch (err) {
            removeTypingIndicator();
            addChatBubble('assistant', '<p>Sorry, I couldn\'t process that. Please try again.</p>', true);
        } finally {
            aiState.isAnalyzing = false;
            chatSendBtn.disabled = false;
            chatInput.focus();
        }
    }

    chatSendBtn.addEventListener('click', handleChatSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChatSend();
    });

    // --- Voice input (Web Speech API) ---
    const chatVoiceBtn = document.getElementById('chat-voice-btn');
    if (chatVoiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        let isListening = false;

        chatVoiceBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
                return;
            }
            chatInput.value = '';
            chatInput.placeholder = 'Listening...';
            chatVoiceBtn.classList.add('listening');
            isListening = true;
            recognition.start();
        });

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            chatInput.value = transcript;
        };

        recognition.onend = () => {
            isListening = false;
            chatVoiceBtn.classList.remove('listening');
            chatInput.placeholder = 'Ask a health question...';
            if (chatInput.value.trim()) {
                handleChatSend();
            }
        };

        recognition.onerror = (event) => {
            isListening = false;
            chatVoiceBtn.classList.remove('listening');
            chatInput.placeholder = 'Ask a health question...';
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                chatInput.value = '';
                chatInput.placeholder = 'Voice input not available — type instead';
            }
        };
    } else if (chatVoiceBtn) {
        chatVoiceBtn.style.display = 'none';
    }

    // --- Symptom pill logic (optional section) ---
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

    document.querySelectorAll('.symptom-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            toggleAISymptom(btn.getAttribute('data-symptom'));
        });
    });

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

    // Symptom analyze button → sends to chat
    if (checkBtn) {
        checkBtn.addEventListener('click', async () => {
            if (aiState.selectedSymptoms.size === 0) {
                alert('Please select at least one symptom.');
                return;
            }

            const symptoms = Array.from(aiState.selectedSymptoms);
            const duration = document.getElementById('symptom-duration').value;

            // Show user message in chat
            addChatBubble('user', '🩺 ' + symptoms.join(', ') + ' — Severity: ' + aiState.severity + '/10, Duration: ' + duration);

            aiState.isAnalyzing = true;
            checkBtn.innerHTML = '<span class="spinner"></span> Analyzing...';
            checkBtn.disabled = true;
            addTypingIndicator();

            // Scroll chat into view
            chatMessages.scrollIntoView({ behavior: 'smooth' });

            try {
                const analysis = await sendToAPI({
                    symptoms: symptoms,
                    severity: aiState.severity,
                    duration: duration
                });
                removeTypingIndicator();
                addChatBubble('assistant', formatAIResponse(analysis), true);

                // Increment Symptom Check count in Profile and Dashboard
                const profileSymptomsCount = document.getElementById('profile-symptoms-count');
                const dashSymptomsCount = document.getElementById('dash-symptoms-count');
                if (profileSymptomsCount) {
                    profileSymptomsCount.textContent = parseInt(profileSymptomsCount.textContent) + 1;
                }
                if (dashSymptomsCount) {
                    dashSymptomsCount.textContent = parseInt(dashSymptomsCount.textContent) + 1;
                }

            } catch (err) {
                removeTypingIndicator();
                addChatBubble('assistant', '<p>Sorry, something went wrong. Please try again.</p>', true);
            } finally {
                aiState.isAnalyzing = false;
                checkBtn.innerHTML = 'Analyze My Symptoms';
                checkBtn.disabled = false;
            }
        });
    }

    // --- Profile View Tabs Logic ---
    const tabProfileReports = document.getElementById('tab-profile-reports');
    const tabProfileSymptoms = document.getElementById('tab-profile-symptoms');

    if (tabProfileReports && tabProfileSymptoms) {
        tabProfileReports.addEventListener('click', () => {
            tabProfileReports.style.color = 'var(--primary)';
            tabProfileReports.style.borderBottom = '2px solid var(--primary)';

            tabProfileSymptoms.style.color = 'var(--text-muted)';
            tabProfileSymptoms.style.borderBottom = 'none';

            // Reload reports when Reports tab is clicked
            loadReportsList();
        });

        tabProfileSymptoms.addEventListener('click', () => {
            tabProfileSymptoms.style.color = 'var(--primary)';
            tabProfileSymptoms.style.borderBottom = '2px solid var(--primary)';

            tabProfileReports.style.color = 'var(--text-muted)';
            tabProfileReports.style.borderBottom = 'none';

            // Show placeholder for symptom history since we don't have a backend table for it yet
            const profileContent = document.getElementById('profile-dynamic-content');
            if (profileContent) {
                profileContent.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px 0;">No saved symptom history available.</p>';
            }
        });
    }

    // --- 2b. Medical Reports Feature ---
    // Helper to get auth headers for API calls
    async function getAuthHeaders() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) return {};
        return { 'Authorization': 'Bearer ' + session.access_token };
    }

    const reportFileInput = document.getElementById('report-file-input');
    const reportBrowseBtn = document.getElementById('report-browse-btn');
    const reportDropZone = document.getElementById('report-drop-zone');
    const uploadProgress = document.getElementById('upload-progress');
    const uploadBarFill = document.getElementById('upload-bar-fill');
    const uploadStatusText = document.getElementById('upload-status-text');
    const reportsList = document.getElementById('reports-list');
    const noReportsMsg = document.getElementById('no-reports-msg');
    const reportAskInput = document.getElementById('report-ask-input');
    const reportAskBtn = document.getElementById('report-ask-btn');
    const reportAskAnswer = document.getElementById('report-ask-answer');
    const reportDetailContent = document.getElementById('report-detail-content');
    const backToReports = document.getElementById('back-to-reports');

    // Navigate back from report detail to reports list
    if (backToReports) {
        backToReports.addEventListener('click', () => {
            appRouter.navigate('reports');
        });
    }

    // Browse button triggers file input
    if (reportBrowseBtn && reportFileInput) {
        reportBrowseBtn.addEventListener('click', () => reportFileInput.click());
    }

    // Drag & drop
    if (reportDropZone) {
        reportDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            reportDropZone.classList.add('drag-over');
        });
        reportDropZone.addEventListener('dragleave', () => {
            reportDropZone.classList.remove('drag-over');
        });
        reportDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            reportDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                uploadReport(e.dataTransfer.files[0]);
            }
        });
    }

    // File input change
    if (reportFileInput) {
        reportFileInput.addEventListener('change', () => {
            if (reportFileInput.files.length > 0) {
                uploadReport(reportFileInput.files[0]);
                reportFileInput.value = '';
            }
        });
    }

    async function uploadReport(file) {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.type)) {
            alert('Only PDF, JPG, PNG, WEBP files are allowed.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Max 10MB.');
            return;
        }

        // Show progress
        uploadProgress.style.display = 'block';
        uploadBarFill.style.width = '0%';
        uploadStatusText.textContent = 'Uploading & analyzing with AI...';

        // Animate progress bar
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 8;
            if (progress > 90) progress = 90;
            uploadBarFill.style.width = progress + '%';
        }, 300);

        const formData = new FormData();
        formData.append('report', file);

        try {
            const authHeaders = await getAuthHeaders();
            const res = await fetch('/api/reports/upload', {
                method: 'POST',
                headers: authHeaders,
                body: formData
            });
            const data = await res.json();

            clearInterval(progressInterval);
            uploadBarFill.style.width = '100%';
            uploadStatusText.textContent = 'Analysis complete!';

            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setTimeout(() => {
                uploadProgress.style.display = 'none';
                loadReportsList();
                // Show the detail view of the just-uploaded report
                showReportDetail(data.report);
            }, 800);
        } catch (err) {
            clearInterval(progressInterval);
            uploadProgress.style.display = 'none';
            alert('Upload failed: ' + err.message);
        }
    }

    // Load and render reports list
    async function loadReportsList() {
        try {
            const authHeaders = await getAuthHeaders();
            const res = await fetch('/api/reports', { headers: authHeaders });
            const data = await res.json();

            // Profile references
            const profileContent = document.getElementById('profile-dynamic-content');
            const profileReportsCount = document.getElementById('profile-reports-count');
            const dashReportsCount = document.getElementById('dash-reports-count'); // Main dashboard counter

            if (!data.reports || data.reports.length === 0) {
                reportsList.innerHTML = '';
                noReportsMsg.style.display = 'block';
                reportsList.appendChild(noReportsMsg);

                if (profileContent) {
                    profileContent.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding: 20px 0;">No reports found</p>';
                }
                if (profileReportsCount) profileReportsCount.textContent = '0';
                if (dashReportsCount) dashReportsCount.textContent = '0';
                return;
            }

            // Update Reports Counts
            if (profileReportsCount) profileReportsCount.textContent = data.reports.length;
            if (dashReportsCount) dashReportsCount.textContent = data.reports.length;

            noReportsMsg.style.display = 'none';
            const htmlFragments = data.reports.map(r => {
                const date = new Date(r.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const sizeKB = (r.fileSize / 1024).toFixed(0);
                const icon = r.mimeType === 'application/pdf' ? '📑' : '🖼️';
                return `
                    <div class="report-card" data-id="${r.id}">
                        <div style="display:flex; align-items:center; gap:16px; flex:1; cursor:pointer;" onclick="window.viewReport('${r.id}')">
                            <div class="report-icon">${icon}</div>
                            <div style="flex:1; min-width:0;">
                                <h4 style="margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.fileName}</h4>
                                <p style="margin:4px 0 0; font-size:0.82rem; color:var(--text-muted);">${r.reportType} &bull; ${date} &bull; ${sizeKB} KB</p>
                            </div>
                        </div>
                        <div style="display:flex; gap:8px; align-items:center;">
                            <button class="btn-view-report" onclick="window.viewReport('${r.id}')" title="View analysis">View</button>
                            <button class="btn-delete-report" onclick="window.deleteReport('${r.id}')" title="Delete">&times;</button>
                        </div>
                    </div>
                `;
            });

            reportsList.innerHTML = htmlFragments.join('');

            // Also populate the miniature view for the Profile section
            if (profileContent) {
                profileContent.innerHTML = data.reports.map(r => {
                    const date = new Date(r.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return `
                        <div class="card"
                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; cursor:pointer;" onclick="window.viewReport('${r.id}')">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div class="action-icon" style="margin:0;">📄</div>
                                <div>
                                    <h4 style="margin-bottom: 4px; font-size: 1rem;">${r.fileName}</h4>
                                    <p style="font-size: 0.85rem; color: var(--text-muted);">${date}</p>
                                </div>
                            </div>
                            <span style="color: var(--text-muted); font-size: 1.5rem;">›</span>
                        </div>
                    `;
                }).join('');
            }

        } catch (err) {
            reportsList.innerHTML = '<p style="color:#ef4444; text-align:center;">Failed to load reports.</p>';
        }
    }

    // View a single report detail
    window.viewReport = async function (id) {
        const authHeaders = await getAuthHeaders();
        fetch('/api/reports', { headers: authHeaders }).then(r => r.json()).then(data => {
            const report = data.reports.find(r => r.id === id);
            if (report) showReportDetail(report);
        });
    };

    function showReportDetail(report) {
        const date = new Date(report.uploadedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const analysisHtml = formatAIResponse(report.analysis);

        reportDetailContent.innerHTML = `
            <div class="report-detail-header">
                <div>
                    <h2 style="margin:0 0 4px;">${report.fileName}</h2>
                    <p style="color:var(--text-muted); margin:0; font-size:0.9rem;">${report.reportType} &bull; Uploaded ${date}</p>
                </div>
            </div>
            <div class="card report-analysis-card" style="margin-top:20px;">
                <h3 style="margin-bottom:16px; display:flex; align-items:center; gap:8px;">🤖 AI Analysis</h3>
                <div class="report-analysis-body">${analysisHtml}</div>
            </div>
        `;

        // Switch to report detail view
        appRouter.navigate('report-detail');
    }

    // Delete a report
    window.deleteReport = async function (id) {
        if (!confirm('Delete this report?')) return;
        try {
            const authHeaders = await getAuthHeaders();
            await fetch('/api/reports/' + id, { method: 'DELETE', headers: authHeaders });
            loadReportsList();
        } catch (err) {
            alert('Failed to delete report.');
        }
    };

    // Ask AI about reports
    async function handleReportAsk() {
        const question = reportAskInput.value.trim();
        if (!question) return;

        reportAskBtn.disabled = true;
        reportAskAnswer.style.display = 'block';
        reportAskAnswer.innerHTML = '<div style="display:flex; align-items:center; gap:10px;"><span class="report-spinner"></span> Thinking...</div>';

        try {
            const authHeaders = await getAuthHeaders();
            const res = await fetch('/api/reports/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({ question })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error');

            reportAskAnswer.innerHTML = `<div class="report-ai-answer">${formatAIResponse(data.answer)}</div>`;
        } catch (err) {
            reportAskAnswer.innerHTML = `<p style="color:#ef4444;">Failed to get answer: ${err.message}</p>`;
        } finally {
            reportAskBtn.disabled = false;
            reportAskInput.value = '';
        }
    }

    if (reportAskBtn) reportAskBtn.addEventListener('click', handleReportAsk);
    if (reportAskInput) reportAskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleReportAsk(); });

    // Voice Input for Ask Reports
    const reportAskMicBtn = document.getElementById('report-ask-mic-btn');
    if (reportAskMicBtn && reportAskInput) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            let isListening = false;

            const toggleListening = () => {
                if (isListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            };

            reportAskMicBtn.addEventListener('click', toggleListening);

            recognition.onstart = () => {
                isListening = true;
                reportAskMicBtn.style.color = 'var(--primary)';
                reportAskMicBtn.style.background = 'rgba(0, 229, 163, 0.1)';
                reportAskInput.placeholder = "Listening...";
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                reportAskInput.value = transcript;
                // Automatically submit the question
                handleReportAsk();
            };

            recognition.onend = () => {
                isListening = false;
                reportAskMicBtn.style.color = 'var(--text-muted)';
                reportAskMicBtn.style.background = 'none';
                reportAskInput.placeholder = 'e.g. "What\'s my cholesterol trend?" or "Summarize all my reports"';
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                isListening = false;
                reportAskMicBtn.style.color = 'var(--text-muted)';
                reportAskMicBtn.style.background = 'none';
                reportAskInput.placeholder = 'e.g. "What\'s my cholesterol trend?" or "Summarize all my reports"';
            };
        } else {
            reportAskMicBtn.style.display = 'none';
        }
    }

    // Load reports on page load
    loadReportsList();

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

        // Store current card's phone for "Call Now" button
        if (cardElement && cardElement.dataset.phone) {
            modal.dataset.currentPhone = cardElement.dataset.phone;
        }

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

    // Attach click listeners to all Details buttons, phone buttons, and add directions
    const allHospitalCards = document.querySelectorAll('.hospital-card');
    allHospitalCards.forEach(card => {
        const detailsBtn = card.querySelector('.hospital-details-btn');
        const phoneBtn = card.querySelector('.hospital-call-btn');

        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(card);
            });
        }

        // 📞 button on card → call the hospital
        if (phoneBtn) {
            phoneBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const phone = card.dataset.phone;
                if (phone) window.location.href = 'tel:' + phone;
            });
        }

        // Clicking the card body opens modal (but not from buttons)
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            openModal(card);
        });
    });

    // Modal "Call Now" and "Get Directions" buttons
    const modalCallBtn = document.getElementById('modal-call-btn');
    const modalDirBtn = document.getElementById('modal-directions-btn');

    if (modalCallBtn) {
        modalCallBtn.addEventListener('click', () => {
            const phone = modal.dataset.currentPhone;
            if (phone) window.location.href = 'tel:' + phone;
        });
    }

    if (modalDirBtn) {
        modalDirBtn.addEventListener('click', () => {
            const address = document.getElementById('modal-hospital-address').innerText;
            if (address) {
                window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address), '_blank');
            }
        });
    }

    // Close modal if clicking outside the content box
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Add event listener to "Call Now" button to increment Appointments stat
        const callNowBtn = modal.querySelector('.btn-primary');
        if (callNowBtn) {
            callNowBtn.addEventListener('click', () => {
                const dashAppointmentsCount = document.getElementById('dash-appointments-count');
                if (dashAppointmentsCount) {
                    dashAppointmentsCount.textContent = parseInt(dashAppointmentsCount.textContent) + 1;
                }

                // Visual feedback
                const originalText = callNowBtn.innerHTML;
                callNowBtn.innerHTML = '📞 Calling...';
                setTimeout(() => {
                    callNowBtn.innerHTML = originalText;
                }, 2000);
            });
        }
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
    // Using allHospitalCards declared earlier
    const hospitalsCount = document.getElementById('hospitals-count');

    function getCardDistance(card) {
        const match = card.innerText.match(/([\d\.]+)\s*(mi|km)/);
        return match ? parseFloat(match[1]) : 9999;
    }

    function filterHospitals() {
        if (!allHospitalCards) return;

        const query = hospitalSearch ? hospitalSearch.value.toLowerCase() : '';
        const specialty = hospitalSpecialty ? hospitalSpecialty.value : 'All Specialties';
        const distanceFilter = hospitalDistance ? hospitalDistance.value : 'Any Distance';
        const ratingFilter = hospitalRating ? hospitalRating.value : 'Any Rating';

        let visibleCount = 0;

        allHospitalCards.forEach(card => {
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
            if (isVisible && distanceFilter === 'Within 5 km') {
                if (getCardDistance(card) > 5) isVisible = false;
            } else if (isVisible && distanceFilter === 'Within 10 km') {
                if (getCardDistance(card) > 10) isVisible = false;
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

        // Sort by distance (ascending) when selected
        if (distanceFilter === 'Sort by Distance') {
            const grid = document.getElementById('hospital-cards-grid');
            const cards = Array.from(allHospitalCards);
            cards.sort((a, b) => getCardDistance(a) - getCardDistance(b));
            cards.forEach(card => grid.appendChild(card));
        }

        // Update hospitals found count text
        if (hospitalsCount) {
            hospitalsCount.innerText = `${visibleCount} hospital${visibleCount !== 1 ? 's' : ''} found`;
        }
    }

    if (hospitalSearch) hospitalSearch.addEventListener('input', filterHospitals);
    if (hospitalSpecialty) hospitalSpecialty.addEventListener('change', filterHospitals);
    if (hospitalDistance) hospitalDistance.addEventListener('change', filterHospitals);
    if (hospitalRating) hospitalRating.addEventListener('change', filterHospitals);

    // Voice Input for Hospital Search
    const hospitalSearchMicBtn = document.getElementById('hospital-search-mic-btn');
    if (hospitalSearchMicBtn && hospitalSearch) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            let isListening = false;

            const toggleListening = () => {
                if (isListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            };

            hospitalSearchMicBtn.addEventListener('click', toggleListening);

            recognition.onstart = () => {
                isListening = true;
                hospitalSearchMicBtn.style.color = 'var(--primary)';
                hospitalSearchMicBtn.style.background = 'rgba(0, 229, 163, 0.1)';
                hospitalSearch.placeholder = "Listening...";
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                hospitalSearch.value = transcript;
                filterHospitals();
            };

            recognition.onend = () => {
                isListening = false;
                hospitalSearchMicBtn.style.color = 'var(--text-muted)';
                hospitalSearchMicBtn.style.background = 'none';
                hospitalSearch.placeholder = "Search hospitals, clinics...";
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                isListening = false;
                hospitalSearchMicBtn.style.color = 'var(--text-muted)';
                hospitalSearchMicBtn.style.background = 'none';
                hospitalSearch.placeholder = "Search hospitals, clinics...";
            };
        } else {
            hospitalSearchMicBtn.style.display = 'none';
        }
    }

    // --- 7. Daily Health Tips Functionality ---
    const healthTips = [
        {
            icon: '💧',
            title: 'Stay Hydrated',
            desc: 'Drink at least 8 glasses of water daily for optimal health.'
        },
        {
            icon: '🚶',
            title: 'Keep Moving',
            desc: 'Aim for at least 30 minutes of moderate physical activity every day.'
        },
        {
            icon: '😴',
            title: 'Get Enough Sleep',
            desc: 'Adults need 7-9 hours of quality sleep per night for proper recovery.'
        }
    ];

    const tipIcon = document.getElementById('daily-tip-icon');
    const tipTitle = document.getElementById('daily-tip-title');
    const tipDesc = document.getElementById('daily-tip-desc');
    const tipDots = document.querySelectorAll('.tip-dot');

    let currentTipIndex = 0;

    function updateDailyTip(index) {
        if (!tipIcon || !tipTitle || !tipDesc) return;

        currentTipIndex = index;

        // Add fade out effect
        tipIcon.style.opacity = 0;
        tipTitle.style.opacity = 0;
        tipDesc.style.opacity = 0;

        setTimeout(() => {
            tipIcon.innerText = healthTips[index].icon;
            tipTitle.innerText = healthTips[index].title;
            tipDesc.innerText = healthTips[index].desc;

            // Add fade in effect
            tipIcon.style.opacity = 1;
            tipTitle.style.opacity = 1;
            tipDesc.style.opacity = 1;
        }, 150);

        tipDots.forEach((dot, i) => {
            if (i === index) {
                dot.style.background = 'var(--primary)';
            } else {
                dot.style.background = 'rgba(255,255,255,0.2)';
            }
        });
    }

    if (tipDots.length > 0) {
        let tipInterval;

        function autoRotateTip() {
            let nextIndex = (currentTipIndex + 1) % healthTips.length;
            updateDailyTip(nextIndex);
        }

        tipDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.getAttribute('data-index'));
                updateDailyTip(index);
                // Reset interval to avoid switching immediately after user clicks
                clearInterval(tipInterval);
                tipInterval = setInterval(autoRotateTip, 2000);
            });
        });

        // Auto rotate tips
        tipInterval = setInterval(autoRotateTip, 2000);
    }

    // ============================================================
    //  SECTION 7 — FIRST AID IMAGE ANALYZER
    // ============================================================
    (function initFirstAid() {
        const uploadZone = document.getElementById('fa-upload-zone');
        const fileInput = document.getElementById('fa-file-input');
        const cameraBtn = document.getElementById('fa-camera-btn');
        const browseBtn = document.getElementById('fa-browse-btn');
        const previewWrap = document.getElementById('fa-preview');
        const previewImg = document.getElementById('fa-preview-img');
        const removeImgBtn = document.getElementById('fa-remove-img');
        const analyzeBtn = document.getElementById('fa-analyze-btn');
        const loadingEl = document.getElementById('fa-loading');
        const resultsEl = document.getElementById('fa-results');
        const uploadCard = document.getElementById('fa-upload-card');
        const resetBtn = document.getElementById('fa-reset-btn');

        if (!uploadZone) return; // guard

        let selectedFile = null;

        // --- Drag & drop ---
        uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
        uploadZone.addEventListener('drop', e => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) handleFileSelected(file);
        });

        // --- Browse ---
        browseBtn.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('click', (e) => {
            if (e.target === uploadZone || e.target.closest('.fa-upload-icon') || e.target.closest('h3') || e.target.closest('p')) {
                fileInput.click();
            }
        });
        fileInput.addEventListener('change', () => {
            if (fileInput.files[0]) handleFileSelected(fileInput.files[0]);
        });

        // --- Camera (opens browser camera via getUserMedia) ---
        const cameraOverlay = document.getElementById('fa-camera-overlay');
        const cameraVideo = document.getElementById('fa-camera-video');
        const cameraCanvas = document.getElementById('fa-camera-canvas');
        const cameraClose = document.getElementById('fa-camera-close');
        const cameraCapture = document.getElementById('fa-camera-capture');
        const cameraSwitch = document.getElementById('fa-camera-switch');
        let cameraStream = null;
        let facingMode = 'environment';

        async function startCamera() {
            // Stop any existing stream
            stopCamera();
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
                    audio: false
                });
                cameraVideo.srcObject = cameraStream;
            } catch (err) {
                // If environment camera fails, try without constraint
                try {
                    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    cameraVideo.srcObject = cameraStream;
                } catch (err2) {
                    alert('Could not access camera. Please check permissions.');
                    closeCameraModal();
                }
            }
        }

        function stopCamera() {
            if (cameraStream) {
                cameraStream.getTracks().forEach(t => t.stop());
                cameraStream = null;
            }
            if (cameraVideo) cameraVideo.srcObject = null;
        }

        function closeCameraModal() {
            stopCamera();
            if (cameraOverlay) cameraOverlay.style.display = 'none';
        }

        cameraBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (cameraOverlay) {
                cameraOverlay.style.display = 'flex';
                startCamera();
            }
        });

        if (cameraClose) cameraClose.addEventListener('click', closeCameraModal);
        if (cameraOverlay) cameraOverlay.addEventListener('click', (e) => {
            if (e.target === cameraOverlay) closeCameraModal();
        });

        if (cameraSwitch) cameraSwitch.addEventListener('click', () => {
            facingMode = facingMode === 'environment' ? 'user' : 'environment';
            startCamera();
        });

        if (cameraCapture) cameraCapture.addEventListener('click', () => {
            if (!cameraVideo || !cameraVideo.videoWidth) return;
            cameraCanvas.width = cameraVideo.videoWidth;
            cameraCanvas.height = cameraVideo.videoHeight;
            cameraCanvas.getContext('2d').drawImage(cameraVideo, 0, 0);
            cameraCanvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
                    handleFileSelected(file);
                }
                closeCameraModal();
            }, 'image/jpeg', 0.9);
        });

        function handleFileSelected(file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File too large. Maximum size is 10MB.');
                return;
            }
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                uploadZone.style.display = 'none';
                previewWrap.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }

        // --- Remove image ---
        removeImgBtn.addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            previewImg.src = '';
            previewWrap.style.display = 'none';
            uploadZone.style.display = 'flex';
        });

        // --- Analyze ---
        analyzeBtn.addEventListener('click', async () => {
            if (!selectedFile) return;
            previewWrap.style.display = 'none';
            loadingEl.style.display = 'flex';
            resultsEl.style.display = 'none';

            try {
                const formData = new FormData();
                formData.append('injury', selectedFile);

                const resp = await fetch('/api/firstaid/analyze', { method: 'POST', body: formData });
                const data = await resp.json();

                if (!resp.ok) throw new Error(data.error || 'Analysis failed');

                renderResults(data.analysis);
            } catch (err) {
                alert('Error: ' + err.message);
                previewWrap.style.display = 'flex';
            } finally {
                loadingEl.style.display = 'none';
            }
        });

        // --- Reset ---
        resetBtn.addEventListener('click', () => {
            selectedFile = null;
            fileInput.value = '';
            previewImg.src = '';
            previewWrap.style.display = 'none';
            uploadZone.style.display = 'flex';
            uploadCard.style.display = '';
            resultsEl.style.display = 'none';
        });

        // --- Render Results ---
        function renderResults(a) {
            // Severity banner
            const banner = document.getElementById('fa-severity-banner');
            const indicator = document.getElementById('fa-severity-indicator');
            const colorMap = { green: '#22c55e', yellow: '#eab308', red: '#f97316' };
            const bgMap = { green: 'rgba(34,197,94,0.08)', yellow: 'rgba(234,179,8,0.08)', red: 'rgba(249,115,22,0.08)' };
            const borderMap = { green: 'rgba(34,197,94,0.25)', yellow: 'rgba(234,179,8,0.25)', red: 'rgba(249,115,22,0.25)' };
            const labelMap = { green: 'MILD', yellow: 'MODERATE', red: 'SEVERE' };
            const c = a.warning_color || 'green';

            banner.style.background = bgMap[c];
            banner.style.borderColor = borderMap[c];
            indicator.style.background = colorMap[c];
            indicator.style.boxShadow = `0 0 16px ${colorMap[c]}`;

            // Severity tag
            const tag = document.getElementById('fa-severity-tag');
            tag.textContent = labelMap[c];
            tag.style.background = colorMap[c];
            tag.style.color = c === 'yellow' ? '#000' : '#fff';

            document.getElementById('fa-injury-type').textContent = a.injury_type || '—';
            document.getElementById('fa-injury-desc').textContent = a.description || '—';

            // Score ring
            const score = a.severity_score ?? 0;
            document.getElementById('fa-score-num').textContent = score;
            const ringFill = document.getElementById('fa-ring-fill');
            ringFill.style.stroke = colorMap[c];
            ringFill.setAttribute('stroke-dasharray', `${score * 10}, 100`);
            document.querySelector('.fa-ring-bg').style.stroke = borderMap[c];

            // Steps with stagger animation
            const stepsList = document.getElementById('fa-steps-list');
            stepsList.innerHTML = (a.first_aid_steps || []).map((s, i) =>
                `<li style="animation-delay:${i * 0.08}s"><span class="fa-step-num">${i + 1}</span><span>${escHtml(s)}</span></li>`
            ).join('');

            // Warning signs
            const warnList = document.getElementById('fa-warn-list');
            warnList.innerHTML = (a.warning_signs || []).map((w, i) =>
                `<li style="animation-delay:${i * 0.08}s"><span class="fa-dot" style="background:${colorMap[c]}"></span><span>${escHtml(w)}</span></li>`
            ).join('');

            // See doctor
            const docList = document.getElementById('fa-doctor-list');
            docList.innerHTML = (a.see_doctor_when || []).map((d, i) =>
                `<li style="animation-delay:${i * 0.08}s"><span class="fa-dot" style="background:#3b82f6"></span><span>${escHtml(d)}</span></li>`
            ).join('');

            // Do NOT
            const donotList = document.getElementById('fa-donot-list');
            donotList.innerHTML = (a.do_not || []).map((d, i) =>
                `<li style="animation-delay:${i * 0.08}s"><span class="fa-dot" style="background:#f97316"></span><span>${escHtml(d)}</span></li>`
            ).join('');

            // Color-code section cards by severity
            document.querySelector('.fa-warn-card').style.borderTop = `3px solid ${colorMap[c]}`;
            document.querySelector('.fa-doctor-card').style.borderTop = '3px solid #3b82f6';
            document.querySelector('.fa-steps-card').style.borderTop = `3px solid ${colorMap[c]}`;

            uploadCard.style.display = 'none';
            resultsEl.style.display = 'block';
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function escHtml(str) {
            const d = document.createElement('div');
            d.textContent = str;
            return d.innerHTML;
        }
    })();

    // ===================== MEDICATION PLANNER =====================
    (function initMedicationPlanner() {
        const medList = document.getElementById('med-list');
        const medEmptyState = document.getElementById('med-empty-state');
        const medActiveCount = document.getElementById('med-active-count');
        const scheduleSection = document.getElementById('med-schedule-section');
        const scheduleTimeline = document.getElementById('med-schedule-timeline');
        const manualAddBtn = document.getElementById('med-manual-add-btn');

        if (!medList) return;

        let medications = [];
        const notifiedSet = new Set(); // track already-notified times this session

        // --- API helpers ---
        async function fetchMedications() {
            try {
                const headers = await getAuthHeaders();
                if (!headers.Authorization) { medications = []; renderMedications(); return; }
                const resp = await fetch('/api/medications', { headers });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error);
                medications = data.medications || [];
            } catch (err) {
                console.error('Failed to load medications:', err);
                medications = [];
            }
            renderMedications();
        }

        async function apiAddMedication(med) {
            try {
                const headers = await getAuthHeaders();
                headers['Content-Type'] = 'application/json';
                const resp = await fetch('/api/medications', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(med)
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error);
                return data.medication;
            } catch (err) {
                console.error('Failed to add medication:', err);
                alert('Failed to save medication. Please try again.');
                return null;
            }
        }

        async function apiDeleteMedication(id) {
            try {
                const headers = await getAuthHeaders();
                const resp = await fetch('/api/medications/' + id, { method: 'DELETE', headers });
                if (!resp.ok) { const d = await resp.json(); throw new Error(d.error); }
            } catch (err) {
                console.error('Failed to delete medication:', err);
                alert('Failed to remove medication. Please try again.');
            }
        }

        function escMed(str) {
            const d = document.createElement('div');
            d.textContent = str || '';
            return d.innerHTML;
        }

        function getTimesForFrequency(freq) {
            switch (freq) {
                case 'Once daily': return ['08:00 AM'];
                case 'Twice daily': return ['08:00 AM', '08:00 PM'];
                case 'Thrice daily': return ['08:00 AM', '02:00 PM', '08:00 PM'];
                case 'Every 6 hours': return ['06:00 AM', '12:00 PM', '06:00 PM', '12:00 AM'];
                case 'Every 8 hours': return ['08:00 AM', '04:00 PM', '12:00 AM'];
                case 'As needed': return ['As needed'];
                default: return ['08:00 AM'];
            }
        }

        // --- Render medication cards ---
        function renderMedications() {
            medList.innerHTML = '';

            if (medications.length === 0) {
                medEmptyState.style.display = 'block';
                medActiveCount.textContent = '0 active';
                scheduleSection.style.display = 'none';
                return;
            }

            medEmptyState.style.display = 'none';
            medActiveCount.textContent = `${medications.length} active`;

            medications.forEach((med) => {
                const card = document.createElement('div');
                card.className = 'med-card';
                const nextReminder = getTimesForFrequency(med.frequency)[0];
                card.innerHTML = `
                    <div class="med-card-header">
                        <div>
                            <div class="med-card-name">${escMed(med.name)}</div>
                            <div class="med-card-dosage">${escMed(med.dosage)}</div>
                        </div>
                        <span style="font-size:1.5rem;">💊</span>
                    </div>
                    <div class="med-card-details">
                        <span class="med-card-tag">${escMed(med.frequency)}</span>
                        <span class="med-card-tag timing">${escMed(med.timing)}</span>
                        ${med.duration ? `<span class="med-card-tag duration">${escMed(med.duration)}</span>` : ''}
                    </div>
                    <div class="med-card-reminder">🔔 Next: ${escMed(nextReminder)}</div>
                    <div class="med-card-actions">
                        <button class="med-taken-action">✅ Taken</button>
                        <button class="med-delete-btn" data-id="${med.id}">🗑️ Remove</button>
                    </div>
                `;
                medList.appendChild(card);
            });

            medList.querySelectorAll('.med-delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.dataset.id;
                    btn.disabled = true;
                    btn.textContent = '⏳';
                    await apiDeleteMedication(id);
                    await fetchMedications();
                });
            });

            medList.querySelectorAll('.med-taken-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.textContent = '✅ Taken!';
                    btn.style.color = '#22c55e';
                    btn.style.borderColor = '#22c55e';
                    btn.disabled = true;
                });
            });

            renderSchedule(medications);
        }

        // --- Render today's schedule ---
        function renderSchedule(meds) {
            if (meds.length === 0) { scheduleSection.style.display = 'none'; return; }
            scheduleSection.style.display = 'block';
            scheduleTimeline.innerHTML = '';

            const timeSlots = [];
            meds.forEach(med => {
                getTimesForFrequency(med.frequency).forEach(time => {
                    timeSlots.push({ time, name: med.name, dosage: med.dosage, timing: med.timing });
                });
            });
            timeSlots.sort((a, b) => a.time.localeCompare(b.time));

            timeSlots.forEach(slot => {
                const item = document.createElement('div');
                item.className = 'med-timeline-item';
                item.innerHTML = `
                    <div class="med-timeline-time">${slot.time}</div>
                    <div class="med-timeline-name">${escMed(slot.name)}</div>
                    <div class="med-timeline-dose">${escMed(slot.dosage)} — ${escMed(slot.timing)}</div>
                    <button class="med-taken-btn">Mark as Taken</button>
                `;
                item.querySelector('.med-taken-btn').addEventListener('click', function () {
                    this.classList.add('taken');
                    this.textContent = '✅ Taken';
                    item.classList.add('taken');
                });
                scheduleTimeline.appendChild(item);
            });
        }

        // --- Prescription Upload ---
        const prescriptionFileInput = document.getElementById('prescription-file-input');
        const prescriptionBrowseBtn = document.getElementById('prescription-browse-btn');
        const prescriptionUploadStatus = document.getElementById('prescription-upload-status');
        const prescriptionDropZone = document.getElementById('prescription-drop-zone');

        async function handlePrescriptionUpload(file) {
            const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
            if (!allowed.includes(file.type)) {
                alert('Only PDF, JPG, PNG, WEBP files are allowed.');
                prescriptionFileInput.value = '';
                return;
            }

            prescriptionBrowseBtn.style.display = 'none';
            prescriptionUploadStatus.style.display = 'flex';

            const formData = new FormData();
            formData.append('prescription', file);

            try {
                const headers = await getAuthHeaders();
                const resp = await fetch('/api/prescriptions/extract', {
                    method: 'POST',
                    headers: { 'Authorization': headers.Authorization || '' },
                    body: formData
                });

                const data = await resp.json();
                if (!resp.ok) throw new Error(data.error || 'Failed to analyze prescription');

                const meds = data.medicines || [];
                if (meds.length === 0) {
                    alert('No medicines found in the prescription.');
                } else {
                    for (const med of meds) {
                        await apiAddMedication({
                            name: med.name,
                            dosage: med.dosage,
                            frequency: med.frequency,
                            timing: med.timing,
                            duration: med.duration
                        });
                    }
                    await fetchMedications();
                    alert(`Successfully added ${meds.length} medicine(s) from prescription!`);
                }
            } catch (err) {
                console.error('Prescription analyze error:', err);
                alert('Failed to analyze prescription: ' + err.message);
            } finally {
                prescriptionFileInput.value = '';
                prescriptionBrowseBtn.style.display = 'inline-block';
                prescriptionUploadStatus.style.display = 'none';
            }
        }

        if (prescriptionBrowseBtn && prescriptionFileInput) {
            prescriptionBrowseBtn.addEventListener('click', () => prescriptionFileInput.click());

            prescriptionFileInput.addEventListener('change', () => {
                if (prescriptionFileInput.files.length > 0) {
                    handlePrescriptionUpload(prescriptionFileInput.files[0]);
                }
            });
        }

        // Drag & Drop for Prescription Planner
        if (prescriptionDropZone) {
            prescriptionDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                prescriptionDropZone.classList.add('drag-over');
            });
            prescriptionDropZone.addEventListener('dragleave', () => {
                prescriptionDropZone.classList.remove('drag-over');
            });
            prescriptionDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                prescriptionDropZone.classList.remove('drag-over');
                if (e.dataTransfer.files.length > 0) {
                    handlePrescriptionUpload(e.dataTransfer.files[0]);
                }
            });
        }

        // --- Manual add ---
        manualAddBtn.addEventListener('click', async () => {
            const name = document.getElementById('med-manual-name').value.trim();
            const dosage = document.getElementById('med-manual-dosage').value.trim();
            const frequency = document.getElementById('med-manual-frequency').value;
            const timing = document.getElementById('med-manual-timing').value;
            if (!name) { alert('Please enter a medicine name.'); return; }
            manualAddBtn.disabled = true;
            manualAddBtn.textContent = 'Saving...';
            const saved = await apiAddMedication({ name, dosage: dosage || '1 tablet', frequency, timing });
            manualAddBtn.disabled = false;
            manualAddBtn.textContent = 'Add';
            if (saved) {
                document.getElementById('med-manual-name').value = '';
                document.getElementById('med-manual-dosage').value = '';
                await fetchMedications();
            }
        });

        // --- Medication Alert Popup ---
        function showMedAlertPopup(medsList) {
            // Remove existing popup if any
            const old = document.getElementById('med-alert-popup');
            if (old) old.remove();

            const medsHtml = medsList.map(m =>
                `<div class="med-alert-item">
                    <span class="med-alert-pill">💊</span>
                    <div>
                        <strong>${escMed(m.name)}</strong>
                        <span class="med-alert-detail">${escMed(m.dosage)} — ${escMed(m.timing)}</span>
                    </div>
                </div>`
            ).join('');

            const popup = document.createElement('div');
            popup.id = 'med-alert-popup';
            popup.className = 'med-alert-overlay';
            popup.innerHTML = `
                <div class="med-alert-box">
                    <div class="med-alert-header">
                        <div class="med-alert-icon-ring">
                            <span class="med-alert-icon">💊</span>
                        </div>
                        <h2>Time for Your Medicine!</h2>
                        <p>Don't forget to take the following:</p>
                    </div>
                    <div class="med-alert-list">${medsHtml}</div>
                    <div class="med-alert-actions">
                        <button class="btn btn-primary med-alert-taken-btn" style="flex:2; padding:12px;">✅ I've Taken It</button>
                        <button class="btn btn-outline med-alert-snooze-btn" style="flex:1; padding:12px;">⏰ Snooze 5m</button>
                    </div>
                </div>
            `;
            document.body.appendChild(popup);

            // Play alert sound
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = 880;
                osc.type = 'sine';
                gain.gain.value = 0.3;
                osc.start();
                setTimeout(() => { osc.stop(); ctx.close(); }, 300);
                setTimeout(() => {
                    const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
                    const osc2 = ctx2.createOscillator();
                    const gain2 = ctx2.createGain();
                    osc2.connect(gain2);
                    gain2.connect(ctx2.destination);
                    osc2.frequency.value = 1100;
                    osc2.type = 'sine';
                    gain2.gain.value = 0.3;
                    osc2.start();
                    setTimeout(() => { osc2.stop(); ctx2.close(); }, 300);
                }, 350);
            } catch (e) { /* audio not supported */ }

            popup.querySelector('.med-alert-taken-btn').addEventListener('click', () => {
                popup.classList.add('med-alert-closing');
                setTimeout(() => popup.remove(), 300);
            });

            popup.querySelector('.med-alert-snooze-btn').addEventListener('click', () => {
                popup.classList.add('med-alert-closing');
                setTimeout(() => popup.remove(), 300);
                // Re-trigger after 5 min
                setTimeout(() => showMedAlertPopup(medsList), 5 * 60 * 1000);
            });
        }

        // --- Check reminders every 30s ---
        function checkMedReminders() {
            if (medications.length === 0) return;
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const dateKey = now.toDateString();

            const dueMeds = [];
            medications.forEach(med => {
                getTimesForFrequency(med.frequency).forEach(t => {
                    const notifKey = `${dateKey}-${med.id}-${t}`;
                    if (t === currentTime && !notifiedSet.has(notifKey)) {
                        notifiedSet.add(notifKey);
                        dueMeds.push(med);
                    }
                });
            });

            if (dueMeds.length > 0) {
                // Browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    dueMeds.forEach(med => {
                        new Notification('💊 MediEase Medication Reminder', {
                            body: `Time to take ${med.name} — ${med.dosage} (${med.timing})`,
                            icon: 'assets/img/favicon.png',
                            requireInteraction: true
                        });
                    });
                }
                // In-app popup
                showMedAlertPopup(dueMeds);
            }
        }

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setInterval(checkMedReminders, 30000);

        // Initial load from Supabase
        fetchMedications();
    })();

    // ===================== INSURANCE DASHBOARD =====================
    (function initInsuranceDashboard() {
        const insTabs = document.querySelectorAll('.ins-tab');
        const insContents = document.querySelectorAll('.ins-tab-content');

        // Tab switching
        insTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                insTabs.forEach(t => {
                    t.classList.remove('active');
                    t.style.color = 'var(--text-muted)';
                    t.style.borderBottom = 'none';
                });
                tab.classList.add('active');
                tab.style.color = 'var(--primary)';
                tab.style.borderBottom = '2px solid var(--primary)';

                insContents.forEach(c => c.style.display = 'none');
                document.getElementById(tab.dataset.target).style.display = 'block';
            });
        });

        // Add Policy logic
        const savePolBtn = document.getElementById('ins-pol-save-btn');
        if (savePolBtn) {
            savePolBtn.addEventListener('click', async () => {
                const provider = document.getElementById('ins-pol-provider').value;
                const number = document.getElementById('ins-pol-number').value;
                const holder = document.getElementById('ins-pol-holder').value;
                const coverage = document.getElementById('ins-pol-coverage').value;
                const expiry = document.getElementById('ins-pol-expiry').value;
                const type = document.getElementById('ins-pol-type').value;

                if (!provider || !number || !coverage || !expiry) {
                    alert('Please fill out all required fields.');
                    return;
                }

                savePolBtn.disabled = true;
                savePolBtn.textContent = 'Saving...';

                try {
                    const headers = await getAuthHeaders();
                    headers['Content-Type'] = 'application/json';
                    const res = await fetch('/api/insurance/policies', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            provider_name: provider,
                            policy_number: number,
                            policy_holder_name: holder,
                            coverage_amount: coverage,
                            expiry_date: expiry,
                            policy_type: type
                        })
                    });

                    if (!res.ok) throw new Error(await res.text());

                    document.getElementById('add-policy-modal').style.display = 'none';
                    alert('Policy saved successfully!');
                    loadPolicies();
                } catch (e) {
                    alert('Error saving policy: ' + e.message);
                } finally {
                    savePolBtn.disabled = false;
                    savePolBtn.textContent = 'Save Policy';
                }
            });
        }

        async function loadPolicies() {
            try {
                const headers = await getAuthHeaders();
                if (!headers.Authorization) return;
                const res = await fetch('/api/insurance/policies', { headers });
                if (!res.ok) return;
                const data = await res.json();

                const list = document.getElementById('ins-policies-list');
                const noPolicies = document.getElementById('ins-no-policies');
                const select = document.getElementById('ins-claim-policy-select');

                if (data.policies && data.policies.length > 0) {
                    if (noPolicies) noPolicies.style.display = 'none';
                    list.querySelectorAll('.added-policy-card').forEach(c => c.remove());
                    if (select) select.innerHTML = '<option value="">-- Choose Policy --</option>';

                    data.policies.forEach(p => {
                        const card = document.createElement('div');
                        card.className = 'card added-policy-card';
                        card.innerHTML = `
                            <div style="display:flex; justify-content:space-between;">
                                <div>
                                    <h3 style="margin-bottom:4px;">${p.provider_name}</h3>
                                    <p style="color:var(--text-muted); font-size:0.85rem;">${p.policy_number}</p>
                                </div>
                                <span style="background:rgba(0,229,163,0.1); color:var(--primary); padding:4px 8px; border-radius:12px; font-size:0.8rem;">${p.policy_type}</span>
                            </div>
                            <div style="margin-top:16px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <span style="color:var(--text-muted); font-size:0.85rem;">Coverage</span>
                                    <span style="font-weight:600;">₹${p.coverage_amount}</span>
                                </div>
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <span style="color:var(--text-muted); font-size:0.85rem;">Expiry</span>
                                    <span>${p.expiry_date}</span>
                                </div>
                            </div>
                        `;
                        list.insertBefore(card, noPolicies);

                        if (select) {
                            const opt = document.createElement('option');
                            opt.value = p.id;
                            opt.textContent = `${p.provider_name} (${p.policy_number})`;
                            opt.dataset.coverage = p.coverage_amount;
                            select.appendChild(opt);
                        }
                    });
                } else {
                    if (noPolicies) noPolicies.style.display = 'block';
                }
            } catch (e) {
                console.error('Error loading policies:', e);
            }
        }

        // Claim Form Interactions
        const claimPolicySelect = document.getElementById('ins-claim-policy-select');
        const coverageInfo = document.getElementById('ins-claim-coverage-info');
        if (claimPolicySelect) {
            claimPolicySelect.addEventListener('change', () => {
                const opt = claimPolicySelect.selectedOptions[0];
                if (opt && opt.value) {
                    coverageInfo.style.display = 'block';
                    coverageInfo.innerHTML = `<strong>Total Coverage:</strong> ₹${opt.dataset.coverage} <br> <span style="font-size:0.85rem; color:var(--text-muted);">Used coverage will be calculated soon.</span>`;
                } else {
                    coverageInfo.style.display = 'none';
                }
            });
        }

        // OCR Upload
        const docDropZone = document.getElementById('ins-doc-drop-zone');
        const docFileInput = document.getElementById('ins-doc-file-input');
        const docBrowseBtn = document.getElementById('ins-doc-browse-btn');
        const docStatus = document.getElementById('ins-doc-upload-status');

        if (docBrowseBtn && docFileInput) {
            docBrowseBtn.addEventListener('click', () => docFileInput.click());

            const handleDocUpload = async () => {
                if (docFileInput.files.length === 0) return;

                docBrowseBtn.style.display = 'none';
                docStatus.style.display = 'flex';

                try {
                    const formData = new FormData();
                    formData.append('document', docFileInput.files[0]);

                    const headers = await getAuthHeaders();
                    const res = await fetch('/api/claims/analyze-document', {
                        method: 'POST',
                        headers: { 'Authorization': headers.Authorization || '' },
                        body: formData
                    });

                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();

                    if (data.extracted) {
                        if (data.extracted.hospital_name && !document.getElementById('ins-claim-hospital').value) document.getElementById('ins-claim-hospital').value = data.extracted.hospital_name;
                        if (data.extracted.bill_amount && !document.getElementById('ins-claim-total-cost').value) {
                            document.getElementById('ins-claim-total-cost').value = data.extracted.bill_amount;
                            document.getElementById('ins-claim-requested').value = data.extracted.bill_amount;
                        }
                        if (data.extracted.treatment_date && !document.getElementById('ins-claim-admin-date').value) {
                            // Basic ISO format check
                            const d = new Date(data.extracted.treatment_date);
                            if (!isNaN(d)) document.getElementById('ins-claim-admin-date').value = d.toISOString().split('T')[0];
                        }
                    }

                    list.innerHTML += `<div style="padding:8px; background:var(--bg-body); border-radius:4px; display:flex; justify-content:space-between; font-size:0.85rem;">
                        <span>📄 ${docFileInput.files[0].name}</span>
                        <span style="color:var(--primary);">Analyzed ✅</span>
                    </div>`;

                } catch (e) {
                    alert('Error analyzing document: ' + e.message);
                } finally {
                    docBrowseBtn.style.display = 'inline-block';
                    docStatus.style.display = 'none';
                    docFileInput.value = '';
                }
            };

            docBrowseBtn.addEventListener('click', () => docFileInput.click());

            docFileInput.addEventListener('change', () => {
                if (docFileInput.files.length > 0) handleDocUpload();
            });

            if (docDropZone) {
                docDropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    docDropZone.style.borderColor = 'var(--primary)';
                    docDropZone.style.background = 'rgba(0, 229, 163, 0.05)';
                });
                docDropZone.addEventListener('dragleave', () => {
                    docDropZone.style.borderColor = 'var(--border-color)';
                    docDropZone.style.background = 'transparent';
                });
                docDropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    docDropZone.style.borderColor = 'var(--border-color)';
                    docDropZone.style.background = 'transparent';
                    if (e.dataTransfer.files.length > 0) {
                        docFileInput.files = e.dataTransfer.files;
                        handleDocUpload();
                    }
                });
            }
        }

        // Eligibility Check
        const checkEligBtn = document.getElementById('ins-check-eligibility-btn');
        if (checkEligBtn) {
            checkEligBtn.addEventListener('click', async () => {
                const diagnosis = document.getElementById('ins-claim-diagnosis').value;
                const requested = document.getElementById('ins-claim-requested').value;
                const treatmentType = document.getElementById('ins-claim-treatment-type').value;
                const policyOpt = claimPolicySelect.selectedOptions[0];

                if (!diagnosis || !requested || !policyOpt || !policyOpt.value) {
                    alert('Please select policy, enter diagnosis and requested amount first.');
                    return;
                }

                checkEligBtn.disabled = true;
                checkEligBtn.innerHTML = '<span class="report-spinner" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></span> Checking...';

                try {
                    const headers = await getAuthHeaders();
                    headers['Content-Type'] = 'application/json';
                    const res = await fetch('/api/claims/eligibility', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            diagnosis,
                            treatment_type: treatmentType,
                            requested_amount: requested,
                            coverage_amount: policyOpt.dataset.coverage
                        })
                    });

                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();

                    const resBox = document.getElementById('ins-eligibility-result');
                    resBox.style.display = 'block';

                    let coverageColor = data.eligibility.coverage_status.toLowerCase().includes('not') ? '#ef4444' : 'var(--primary)';

                    resBox.innerHTML = `
                        <h4 style="margin-bottom:8px; display:flex; justify-content:space-between;">
                            <span>Coverage Status: <strong style="color:${coverageColor}">${data.eligibility.coverage_status}</strong></span>
                            <span style="color:var(--text-muted); font-size:0.85rem;">Confidence: ${data.eligibility.confidence}%</span>
                        </h4>
                        <p style="margin-bottom:8px;">Estimated Payable: <strong>₹${data.eligibility.estimated_payable_amount}</strong></p>
                        ${data.eligibility.missing_requirements && data.eligibility.missing_requirements.length > 0 ?
                            `<p style="font-size:0.85rem; color:#f59e0b;">Missing requirements: ${data.eligibility.missing_requirements.join(', ')}</p>` : ''}
                    `;
                } catch (e) {
                    alert('Eligibility check failed: ' + e.message);
                } finally {
                    checkEligBtn.disabled = false;
                    checkEligBtn.innerHTML = '<span style="font-size:1.1rem; margin-right:6px;">✨</span> Check AI Eligibility';
                }
            });
        }

        // Claim Submission
        const submitClaimBtn = document.getElementById('ins-submit-claim-btn');
        if (submitClaimBtn) {
            submitClaimBtn.addEventListener('click', async () => {
                const opt = claimPolicySelect.selectedOptions[0];
                if (!opt || !opt.value) return alert('Select a policy.');

                submitClaimBtn.disabled = true;
                submitClaimBtn.textContent = 'Submitting...';

                try {
                    const headers = await getAuthHeaders();
                    headers['Content-Type'] = 'application/json';
                    const res = await fetch('/api/claims/submit', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            policy_id: opt.value,
                            hospital_name: document.getElementById('ins-claim-hospital').value,
                            doctor_name: document.getElementById('ins-claim-doctor').value,
                            diagnosis: document.getElementById('ins-claim-diagnosis').value,
                            treatment_type: document.getElementById('ins-claim-treatment-type').value,
                            admission_date: document.getElementById('ins-claim-admin-date').value,
                            discharge_date: document.getElementById('ins-claim-discharge-date').value,
                            total_medical_cost: document.getElementById('ins-claim-total-cost').value,
                            claim_amount: document.getElementById('ins-claim-requested').value
                        })
                    });
                    if (!res.ok) throw new Error(await res.text());

                    alert('Claim Submitted Successfully!');
                    // Clear form
                    document.getElementById('ins-claim-hospital').value = '';
                    document.getElementById('ins-claim-doctor').value = '';
                    document.getElementById('ins-claim-diagnosis').value = '';
                    document.getElementById('ins-claim-admin-date').value = '';
                    document.getElementById('ins-claim-discharge-date').value = '';
                    document.getElementById('ins-claim-total-cost').value = '';
                    document.getElementById('ins-claim-requested').value = '';
                    document.getElementById('ins-eligibility-result').style.display = 'none';

                    // Switch to status tab
                    insTabs[2].click();
                    loadClaims();
                } catch (e) {
                    alert('Failed to submit claim: ' + e.message);
                } finally {
                    submitClaimBtn.disabled = false;
                    submitClaimBtn.textContent = 'Submit Claim';
                }
            });
        }

        async function loadClaims() {
            try {
                const headers = await getAuthHeaders();
                if (!headers.Authorization) return;
                const res = await fetch('/api/claims/list', { headers });
                if (!res.ok) return;
                const data = await res.json();

                const statusList = document.getElementById('ins-active-claims-list');
                const historyTbody = document.getElementById('ins-history-tbody');
                const noStatus = document.getElementById('ins-no-active-claims');

                if (data.claims && data.claims.length > 0) {
                    statusList.querySelectorAll('.claim-status-card').forEach(c => c.remove());
                    historyTbody.innerHTML = '';

                    let activeCount = 0;
                    data.claims.forEach(c => {
                        // History row
                        const tr = document.createElement('tr');
                        tr.style.borderBottom = '1px solid var(--border-color)';
                        const tsDate = new Date(c.created_at).toLocaleDateString();
                        tr.innerHTML = `
                            <td style="padding:16px;">${c.id.split('-')[0].toUpperCase()}</td>
                            <td style="padding:16px;">${c.hospital_name || 'N/A'}</td>
                            <td style="padding:16px;">${tsDate}</td>
                            <td style="padding:16px;">₹${c.claim_amount || 0}</td>
                            <td style="padding:16px;">₹${c.approved_amount || 0}</td>
                            <td style="padding:16px;">
                                <span class="small-tag" style="font-size:0.8rem; background:rgba(0,229,163,0.1); color:var(--primary);">${c.status}</span>
                            </td>
                        `;
                        historyTbody.appendChild(tr);

                        // Active tracker
                        if (c.status !== 'Paid' && c.status !== 'Rejected') {
                            activeCount++;
                            const statusCard = document.createElement('div');
                            statusCard.className = 'card claim-status-card';

                            // naive visual progress
                            const steps = ['Submitted', 'Under Review', 'Documents Verified', 'Approved', 'Paid'];
                            const curIdx = steps.indexOf(c.status) >= 0 ? steps.indexOf(c.status) : 0;

                            let progressHtml = steps.map((s, i) => {
                                const isDone = i <= curIdx;
                                const isCur = i === curIdx;
                                return `<div style="flex:1; text-align:center;">
                                    <div style="width:20px; height:20px; border-radius:50%; margin:0 auto 8px; background:${isDone ? 'var(--primary)' : 'var(--bg-card)'}; border: 2px solid ${isDone ? 'var(--primary)' : 'var(--border-color)'};"></div>
                                    <span style="font-size:0.75rem; color:${isCur ? 'var(--primary)' : 'var(--text-muted)'}; white-space:nowrap;">${s}</span>
                                </div>`;
                            }).join('<div style="height:2px; flex:1; background:var(--border-color); margin-top:10px;"></div>');

                            statusCard.innerHTML = `
                                <div style="display:flex; justify-content:space-between; margin-bottom: 20px;">
                                    <div>
                                        <h3 style="margin-bottom:4px;">${c.hospital_name || 'Claim'} - ₹${c.claim_amount}</h3>
                                        <p style="color:var(--text-muted); font-size:0.85rem;">Claim ID: ${c.id.split('-')[0].toUpperCase()}</p>
                                    </div>
                                    <span class="small-tag" style="background:rgba(0,229,163,0.1); color:var(--primary);">Status: ${c.status}</span>
                                </div>
                                <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-top: 24px; padding: 0 10px;">
                                    ${progressHtml}
                                </div>
                            `;
                            statusList.appendChild(statusCard);
                        }
                    });

                    if (activeCount === 0 && noStatus) noStatus.style.display = 'block';
                    else if (noStatus) noStatus.style.display = 'none';

                } else {
                    if (noStatus) noStatus.style.display = 'block';
                    historyTbody.innerHTML = '<tr><td colspan="6" style="padding:24px; text-align:center; color:var(--text-muted);">No past claims found</td></tr>';
                }
            } catch (e) { console.error(e); }
        }

        setTimeout(() => {
            loadPolicies();
            loadClaims();
        }, 1500);

    })();

});