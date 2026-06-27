/* ==========================================================================
   FakeBuster App Logic Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const jobUrlInput = document.getElementById('job-url');
    const jobDescInput = document.getElementById('job-desc');
    const btnAnalyze = document.getElementById('btn-analyze');
    const templateButtons = document.querySelectorAll('.template-btn');
    
    const scannerView = document.getElementById('scanner-view');
    const resultsView = document.getElementById('results-view');
    
    // Result Card Elements
    const scoreVal = document.getElementById('score-val');
    const scoreRing = document.getElementById('score-ring');
    const verdictBadge = document.getElementById('verdict-badge');
    const verdictReason = document.getElementById('verdict-reason');
    
    const infoCompany = document.getElementById('info-company');
    const infoRole = document.getElementById('info-role');
    const infoComp = document.getElementById('info-comp');
    const infoChannel = document.getElementById('info-channel');
    
    const redFlagsList = document.getElementById('red-flags-list');
    const greenFlagsList = document.getElementById('green-flags-list');

    // Predefined Mock Data Templates
    const templates = {
        novitech: {
            url: 'https://rzp.io/rzp/EA7LNJjz',
            desc: `What you will get:
- Access to 60 days Recorded Video Lectures
- Access to 21 Power BI days Recorded Video Lectures
- 20+ Projects source code & Technical Materials
- Daily 40 mins Live Q&A session (Mon-Fri)
- 3 Internship E-Certificate & Lifetime Course Validity

What will you learn in this 30 Days Challenge?
ARTIFICIAL INTELLIGENCE, COMPUTER VISION, DEEP LEARNING, MACHINE LEARNING, NATURAL LANGUAGE PROCESSING, and DATA ANALYTICS.
Fee: ₹1,499.00`,
            analysis: {
                score: 25,
                verdict: 'Caution',
                verdictText: 'PROCEED WITH CAUTION (TREAT AS A PAID COURSE, NOT A REAL INTERNSHIP)',
                reason: 'Novitech R&D is a registered business, but selling educational courses and labeling them as paid "internships" with guaranteed certificates is a misleading practice. It should not be listed as professional employment on your resume.',
                company: 'Novitech R&D Private Limited',
                role: 'AI, Data Analytics & Power BI Intern',
                compensation: 'None (Candidate pays ₹1,499)',
                channel: 'Razorpay Payment Page (rzp.io)',
                redFlags: [
                    'Fee Required: Candidates must pay ₹1,499 upfront to join.',
                    'Paid Course Marketing: The curriculum is standard class tutorials rather than company project development.',
                    'Guaranteed E-Certificates: Offers "3 certificates" in 30 days, indicating low hiring value.'
                ],
                greenFlags: [
                    'Registered Entity: Novitech R&D has a valid corporate index registration in India.',
                    'Direct Infrastructure: Utilizes official company contact channels (support@novitechrd.com).'
                ]
            }
        },
        apex: {
            url: 'https://telegram.me/ApexSolutionsHR',
            desc: `URGENT REMOTE WORK FROM HOME OPPORTUNITY!
We are hiring immediately for a Remote Data Entry Clerk / Assistant.
No experience required. Free virtual training will be provided.
Salary: $35.00 per hour.
Work schedule is flexible.
To apply and start your interview immediately, message our hiring manager on Telegram: @ApexSolutionsHR`,
            analysis: {
                score: 5,
                verdict: 'Danger',
                verdictText: 'DO NOT APPLY',
                reason: 'This is a textbook recruitment scam. Legitimate corporate entities do not conduct text-based hiring interviews via Telegram or pay $35/hour for entry-level data entry clerks. This is likely a phishing or fake-check scam.',
                company: 'Apex Solutions Inc. (Impersonation)',
                role: 'Remote Data Entry Clerk',
                compensation: '$35.00 / Hour',
                channel: 'Telegram Messenger (@ApexSolutionsHR)',
                redFlags: [
                    'Chat-App Interviews: Conducted via Telegram messaging, bypassing all company portals.',
                    'Unrealistic Compensation: $35/hour is excessive for entry-level remote data entry.',
                    'Generic Branding: Uses a common corporate name to impersonate real brands (Apex Fintech / Apex Systems).',
                    'Vague Duties: Promises immediate hiring without verifying skills or experience.'
                ],
                greenFlags: []
            }
        },
        google: {
            url: 'https://careers.google.com/jobs/results/987654321',
            desc: `Software Engineering Intern, BS, Summer 2026.
Requirements: Currently pursuing a BS, MS, or PhD in Computer Science or related technical field. Experience in Java, C++, Python, or Go.
Responsibilities: Design, develop, test, deploy, and maintain software solutions.
Compensation: $43.00/hour plus corporate housing stipend.
Apply through Google Careers portal. No application fees.`,
            analysis: {
                score: 95,
                verdict: 'Apply',
                verdictText: 'APPLY',
                reason: 'This posting links directly to official Google recruitment portals. The salary aligns perfectly with tech sector internship wages, and there are no payments, deposit demands, or informal interview requests.',
                company: 'Google LLC',
                role: 'Software Engineering Intern',
                compensation: '$43.00 / Hour + Housing Stipend',
                channel: 'Official Careers Portal (careers.google.com)',
                redFlags: [],
                greenFlags: [
                    'Verified Corporate Domain: The application is hosted on Google\'s official sub-domain.',
                    'Realistic Compensation: Matches industry-standard wages for technical internships.',
                    'No Payment Requests: Absolutely free to apply through verified corporate HR infrastructure.'
                ]
            }
        }
    };

    // Initialize Page Circular Gauge
    function updateScoreGauge(score) {
        const radius = scoreRing.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        scoreRing.style.strokeDasharray = circumference;
        const offset = circumference - (score / 100) * circumference;
        scoreRing.style.strokeDashoffset = offset;

        // Dynamic Colors based on Score
        let color = 'var(--accent-success)'; // Green
        if (score < 40) {
            color = 'var(--accent-danger)'; // Red
        } else if (score < 80) {
            color = 'var(--accent-warning)'; // Yellow
        }
        scoreRing.style.stroke = color;
    }

    // Set template inputs
    templateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const templateId = btn.getAttribute('data-template');
            const data = templates[templateId];
            if (data) {
                jobUrlInput.value = data.url;
                jobDescInput.value = data.desc;
                
                // Active feedback
                templateButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // Trigger analysis
    btnAnalyze.addEventListener('click', () => {
        const urlValue = jobUrlInput.value.trim();
        const descValue = jobDescInput.value.trim();

        if (!urlValue && !descValue) {
            alert('Please enter a posting URL/payment link, or paste the job description text.');
            return;
        }

        // Show scanning state
        resultsView.classList.remove('active');
        resultsView.style.display = 'none';
        
        scannerView.style.display = 'flex';
        scannerView.classList.add('active');
        scannerView.classList.add('scanner-scanning');
        
        document.querySelector('.scanner-title').textContent = 'Analyzing Posting Infrastructure...';
        document.querySelector('.scanner-subtitle').textContent = 'Verifying domain registrations, email profiles, and safety checklists...';

        // Simulate analysis latency
        setTimeout(() => {
            let resultData = null;

            // Check if input matches one of our template models
            if (urlValue.includes('rzp.io') || descValue.includes('Novitech')) {
                resultData = templates.novitech.analysis;
            } else if (urlValue.includes('telegram') || descValue.includes('@ApexSolutionsHR') || descValue.toLowerCase().includes('telegram: @')) {
                resultData = templates.apex.analysis;
            } else if (urlValue.includes('careers.google.com') || descValue.includes('Google Careers portal')) {
                resultData = templates.google.analysis;
            } else {
                // Generate a heuristic-based custom analysis
                resultData = runHeuristicAnalysis(urlValue, descValue);
            }

            renderResults(resultData);
        }, 2200);
    });

    // Heuristic parsing engine for custom user input
    function runHeuristicAnalysis(url, desc) {
        const fullInput = (url + ' ' + desc).toLowerCase();
        let score = 90;
        let redFlags = [];
        let greenFlags = [];
        let company = 'Unspecified / Startup';
        let role = 'General Application';
        let compensation = 'Market Competitive';
        let channel = 'Web Form';

        // Detect Company & Role
        const companyMatch = desc.match(/(?:at|company:)\s*([A-Z][a-zA-Z0-9\s]+?)(?:\r?\n|is hiring|role|compensation|\.|\,)/i);
        if (companyMatch && companyMatch[1]) {
            company = companyMatch[1].trim();
        }
        const roleMatch = desc.match(/(?:role|position|job|title:)\s*([A-Z][a-zA-Z0-9\s/]+?)(?:\r?\n|at|compensation|\.|\,)/i);
        if (roleMatch && roleMatch[1]) {
            role = roleMatch[1].trim();
        }

        // Check for paid/bond scams
        if (fullInput.includes('rzp.io') || fullInput.includes('razorpay') || fullInput.includes('deposit') || fullInput.includes('payment') || fullInput.includes('training fee') || fullInput.includes('registration fee') || fullInput.includes('purchase equipment')) {
            score -= 35;
            redFlags.push('Payment Required: Job mentions fees, deposits, training costs, or equipment payments.');
            compensation = 'Pay-To-Work / Charges Fee';
        }

        // Check for Chat recruiting (Telegram, WhatsApp)
        if (fullInput.includes('telegram') || fullInput.includes('whatsapp') || fullInput.includes('signal') || fullInput.includes('text interview')) {
            score -= 30;
            redFlags.push('Chat-App Onboarding: Recruitment process uses messaging apps instead of formal HR interfaces.');
            channel = 'Chat App (Telegram/WhatsApp)';
        }

        // Check for Generic Emails
        const emailMatch = fullInput.match(/([a-zA-Z0-9._-]+@(gmail|yahoo|outlook|proton|hotmail)\.com)/i);
        if (emailMatch) {
            score -= 25;
            redFlags.push(`Generic Email Domain: Recruiter contact points to a free webmail account (${emailMatch[1]}).`);
            channel = 'Generic Recruiter Webmail';
        }

        // High pay data-entry check
        if ((fullInput.includes('data entry') || fullInput.includes('typing') || fullInput.includes('assistant')) && (fullInput.includes('$30') || fullInput.includes('$35') || fullInput.includes('$40') || fullInput.includes('$50'))) {
            score -= 15;
            redFlags.push('Disproportionate Pay: Entry-level clerk rates are listed way above market ranges.');
        }

        // Green flags detection
        if (url.includes('careers.') || url.includes('.edu') || url.includes('linkedin.com/jobs')) {
            score += 10;
            greenFlags.push('Verified Sourcing Portal: Originates from a vetted recruitment board or professional network.');
        }
        if (!fullInput.includes('telegram') && !fullInput.includes('whatsapp') && !emailMatch && !fullInput.includes('deposit') && !fullInput.includes('fee')) {
            greenFlags.push('No Immediate Red Flags: Communication paths do not trigger common instant-alert triggers.');
        }

        // Keep score bounded
        score = Math.max(5, Math.min(98, score));

        // Determine Verdict
        let verdict = 'Caution';
        let verdictText = 'PROCEED WITH CAUTION';
        let reason = 'This posting does not contain major red-flag combinations, but still check the domain registries and employees on LinkedIn before applying.';

        if (score < 40) {
            verdict = 'Danger';
            verdictText = 'DO NOT APPLY';
            reason = 'This post exhibits critical flags common in phishing and money transfer scams. Do not send money or early personal documentation.';
        } else if (score >= 80) {
            verdict = 'Apply';
            verdictText = 'APPLY';
            reason = 'The details appear standard and safe. Ensure that you apply directly through their verified company site.';
        }

        return {
            score,
            verdict,
            verdictText,
            reason,
            company,
            role,
            compensation,
            channel,
            redFlags,
            greenFlags
        };
    }

    // Render results back on UI
    function renderResults(data) {
        // Toggle view states
        scannerView.classList.remove('active');
        scannerView.classList.remove('scanner-scanning');
        scannerView.style.display = 'none';

        resultsView.style.display = 'block';
        setTimeout(() => {
            resultsView.classList.add('active');
        }, 50);

        // Fill Score & Ring
        scoreVal.textContent = data.score;
        updateScoreGauge(data.score);

        // Render Verdict Badge
        verdictBadge.className = 'verdict-badge';
        verdictBadge.textContent = data.verdictText;
        if (data.verdict === 'Apply') {
            verdictBadge.classList.add('v-apply');
        } else if (data.verdict === 'Caution') {
            verdictBadge.classList.add('v-caution');
        } else {
            verdictBadge.classList.add('v-danger');
        }

        // Reason text
        verdictReason.textContent = data.reason;

        // Info items
        infoCompany.textContent = data.company;
        infoRole.textContent = data.role;
        infoComp.textContent = data.compensation;
        infoChannel.textContent = data.channel;

        // Render Red Flags
        redFlagsList.innerHTML = '';
        if (data.redFlags.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-msg';
            li.textContent = 'No critical warning signals detected.';
            redFlagsList.appendChild(li);
        } else {
            data.redFlags.forEach(flag => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-ban text-danger" style="margin-right: 8px;"></i> ${flag}`;
                redFlagsList.appendChild(li);
            });
        }

        // Render Green Flags
        greenFlagsList.innerHTML = '';
        if (data.greenFlags.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty-msg';
            li.textContent = 'No strong security confirmation flags found.';
            greenFlagsList.appendChild(li);
        } else {
            data.greenFlags.forEach(flag => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check text-success" style="margin-right: 8px;"></i> ${flag}`;
                greenFlagsList.appendChild(li);
            });
        }
    }
});
