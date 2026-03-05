// Navbar scroll effect
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('navbar');
            if (window.scrollY > 20) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });

        // Demo Section Tab Logic
        const demoData = {
            'presc': {
                input: 'Amoxicillin 500mg TID x 7d, Pantoprazole 40mg QD AC',
                output: '<strong>💊 Amoxicillin 500mg (Antibiotic)</strong><br>Take 1 pill three times a day for 7 days. Finish the entire course even if you feel better.<br><br><strong>💊 Pantoprazole 40mg (Antacid)</strong><br>Take 1 pill once a day before meals. Helps reduce stomach acid.'
            },
            'lab': {
                input: 'HbA1c: 7.8%, LDL: 145 mg/dL, TSH: 0.3 mIU/L',
                output: '<span style="color:var(--accent-red)">⚠️ HbA1c: 7.8% (High)</span> - Indicates poor blood sugar control. Target is < 5.7%.<br><br><span style="color:var(--accent-red)">⚠️ LDL: 145 mg/dL (Borderline High)</span> - "Bad" cholesterol is elevated. Target is < 100 mg/dL.<br><br><span style="color:var(--accent-green)">✓ TSH: 0.3 mIU/L (Normal)</span> - Thyroid function is within normal range.'
            },
            'symp': {
                input: 'Chest pain when breathing deeply, mild fever, cough for 3 days',
                output: '<strong>🩺 AI Assessment: Moderate Urgency</strong><br>Your symptoms (chest pain with breathing, fever, cough) could indicate a respiratory infection such as pleurisy or pneumonia. <br><br><strong>Action:</strong> Please consult a doctor within 24 hours. If chest pain becomes severe or you have shortness of breath at rest, go to the Emergency Room.'
            },
            'ask': {
                input: 'Can I take ibuprofen with my blood pressure medication?',
                output: '<strong>⚠️ Caution Recommended</strong><br>Ibuprofen (an NSAID) can reduce the effectiveness of many blood pressure medications (like ACE inhibitors, ARBs, or diuretics) and may increase your blood pressure. <br><br><strong>Action:</strong> Consider Acetaminophen (Tylenol) for pain instead, and consult your pharmacist or doctor before taking Ibuprofen.'
            }
        };

        let currentTab = 'presc';

        function switchTab(tabId) {
            currentTab = tabId;
            // Update active button state
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            // Update input text and hide previous results
            document.getElementById('demo-input-text').innerText = demoData[tabId].input;
            document.getElementById('demo-result').style.display = 'none';
        }

        function simulateAnalysis() {
            const btn = event.target;
            const originalText = btn.innerText;

            // Loading state
            btn.innerText = 'Analyzing...';
            btn.style.opacity = '0.8';
            document.getElementById('demo-result').style.display = 'none';

            // Simulate API delay
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.opacity = '1';

                // Show result
                const resultDiv = document.getElementById('demo-result');
                const resultText = document.getElementById('demo-result-text');

                resultText.innerHTML = demoData[currentTab].output;
                resultDiv.style.display = 'block';

                // Add a small fade-in effect
                resultDiv.animate([
                    { opacity: 0, transform: 'translateY(10px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], { duration: 400, easing: 'ease-out' });

            }, 1200);
        }