/*==================== toggle icon navbar ====================*/
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

/*==================== scroll sections active link & sticky header ====================*/
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');
let header = document.querySelector('header');

window.onscroll = () => {
    let top = window.scrollY;

    sections.forEach(sec => {
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
                let target = document.querySelector('header nav a[href*=' + id + ']');
                if(target) target.classList.add('active');
            });
        };
    });

    /* sticky navbar */
    header.classList.toggle('sticky', top > 100);

    /* remove toggle icon and navbar when click navbar link (scroll) */
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

/*==================== scroll reveal ====================*/
ScrollReveal({ 
    reset: false, /* Professional sites typically only reveal once for smoothness */
    distance: '60px',
    duration: 1500,
    delay: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.img-box, .services-box, .portfolio-box, .experience-card, .contact form', { origin: 'bottom', interval: 200 });
ScrollReveal().reveal('.home-content h1, .about .img-box', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/*==================== typed js ====================*/
if(document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['Software Development Intern', 'Web Developer', 'AI Engineer', 'Cloud &amp; DevOps Enthusiast', 'Software Developer'],
        typeSpeed: 80,
        backSpeed: 60,
        backDelay: 1500,
        loop: true
    });
}

/*==================== Read More Logic ====================*/
const readMoreBtn = document.getElementById('read-more-btn');
const moreText = document.getElementById('more-text');

if (readMoreBtn && moreText) {
    readMoreBtn.addEventListener('click', () => {
        if (moreText.classList.contains('hidden')) {
            moreText.classList.remove('hidden');
            moreText.style.display = 'inline'; // fallback
            readMoreBtn.innerHTML = 'Read Less <i class="bx bx-collapse-vertical"></i>';
        } else {
            moreText.classList.add('hidden');
            moreText.style.display = 'none'; // fallback
            readMoreBtn.innerHTML = 'Read More <i class="bx bx-expand-vertical"></i>';
        }
    });
}

/*==================== Contact Form Logic ====================*/
const form = document.getElementById('contact-form');
const popup = document.getElementById('popup-message');
const popupText = document.getElementById('popup-text');

if (form && popup && popupText) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Change button state
        const btn = form.querySelector('.btn');
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = 'Sending... <i class="bx bx-loader-alt bx-spin"></i>';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';

        const formData = new FormData(form);

        fetch(form.action, { method: form.method, body: formData })
        .then(response => {
            if (response.ok) {
                form.reset();
                
                // Show popup
                popup.style.display = 'block';
                popup.style.animation = 'fadeInCenter 0.5s forwards';
                popupText.textContent = '✅ Message sent successfully!';

                setTimeout(() => {
                    popupText.textContent = 'Thank you for contacting me!';
                }, 2000);

                setTimeout(() => {
                    popup.style.animation = 'fadeOutCenter 0.5s forwards';
                    setTimeout(() => popup.style.display = 'none', 500);
                }, 5000);
            } else {
                alert('❌ Failed to send message. Please try again.');
            }
        })
        .catch(() => alert('Error! Please check your internet connection and try again.'))
        .finally(() => {
            // Restore button
            btn.innerHTML = originalBtnText;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        });
    });
}

/*==================== Particle Background Canvas ====================*/
const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 45;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.3 - 0.15;
            this.speedY = Math.random() * 0.3 - 0.15;
            this.color = 'rgba(168, 85, 247, ' + (Math.random() * 0.15 + 0.05) + ')';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            else if (this.x < 0) this.x = canvas.width;

            if (this.y > canvas.height) this.y = 0;
            else if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.strokeStyle = 'rgba(168, 85, 247, ' + (0.12 - distance / 1000) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

/*==================== Portfolio Filters ====================*/
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioBoxes = document.querySelectorAll('.portfolio-box');

if (filterButtons.length > 0 && portfolioBoxes.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            portfolioBoxes.forEach(box => {
                const category = box.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    box.style.display = 'block';
                } else {
                    box.style.display = 'none';
                }
            });
        });
    });
}

/*==================== Project Details Modal ====================*/
const projectsData = {
    hostel: {
        title: 'Hostel Management System',
        tags: ['Django', 'Python', 'SQL', 'HTML5', 'CSS3', 'Bootstrap'],
        desc: 'A full-featured web application designed to streamline student hostel operations. It automates room allocations, student registrations, fee tracking, and complaint lodging, replacing manual paper records with a secure database-driven dashboard.',
        challenges: 'Implemented relational models to prevent double-booking of rooms and created visual dashboard analytics using Django query aggregation. Enhanced student-to-warden feedback loop through automatic notifications.',
        github: 'https://github.com/JaisonGeorge04/Hostel-Management-System.git',
        live: ''
    },
    cancer: {
        title: 'Breast Cancer Prediction System',
        tags: ['Python', 'Streamlit', 'Scikit-Learn', 'Machine Learning', 'Gradient Boosting'],
        desc: 'A diagnostic decision-support system that uses a Gradient Boosting machine learning model to classify breast tumors as benign or malignant based on cellular features. Built with Streamlit for a clean, accessible UI.',
        challenges: 'Fine-tuned model hyperparameters to achieve high classification accuracy while maintaining computational efficiency. Handled features scaling and missing value imputation pipelines securely using Scikit-Learn.',
        github: 'https://github.com/JaisonGeorge04/Breast_Cancer_Prediction_System',
        live: 'https://breastcancerpredictionsystem-7ao7uxnm8cwekhbzzk5vks.streamlit.app/'
    },
    loan: {
        title: 'Loan Management System',
        tags: ['Django', 'Python', 'PostgreSQL', 'REST APIs', 'JS'],
        desc: 'A professional platform for managing loan applications, credit evaluation, and payment tracking. Features multi-user role-based dashboards for loan officers, managers, and clients, ensuring transparency and data integrity.',
        challenges: 'Constructed an amortization calculator algorithm that computes monthly interest and principal schedules dynamically. Securely implemented credit score evaluation gates using mocked external API integrations.',
        github: 'https://github.com/JaisonGeorge04/Loan-Management-System',
        live: ''
    },
    flashcard: {
        title: 'Smart FlashCard Generator',
        tags: ['JavaScript', 'HTML5', 'CSS3', 'Local Storage', 'Responsive Design'],
        desc: 'An interactive frontend web application that allows users to create, organize, and study digital flashcards. Uses localStorage to persist user collections across sessions, complete with study performance progress tracking.',
        challenges: 'Crafted smooth CSS 3D card-flip transitions for a tactile feel. Optimized bulk CSV importing and exporting mechanisms to let users share card sets easily.',
        github: 'https://github.com/JaisonGeorge04/smart-flashcard-generator.git',
        live: ''
    },
    analyzer: {
        title: 'AI Resume Analyzer & Optimizer',
        tags: ['React', 'FastAPI', 'Python', 'Gemini AI', 'Vite', 'REST APIs'],
        desc: 'An AI-powered web application that analyzes resumes against job descriptions, calculates ATS compatibility scores, identifies missing keywords, and provides AI-generated recommendations to improve resume quality. Features an interactive dark-mode interface with real-time analysis and document parsing for PDF and DOCX files.',
        challenges: 'Developed a full-stack AI application using React and FastAPI with Google Gemini AI integration for intelligent resume evaluation. Implemented ATS match scoring, keyword gap analysis, PDF/DOCX parsing, Google XYZ bullet-point optimization, and a mock offline analysis mode while designing responsive REST API workflows and a modern glassmorphism UI.',
        github: 'https://github.com/JaisonGeorge04/AI-Resume-Analyzer.git',
        live: 'https://ai-resume-analyzer-ten-roan.vercel.app'
    }
};

const modal = document.getElementById('project-modal');
const closeModal = document.querySelector('.close-modal');

if (modal && closeModal) {
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const box = btn.closest('.portfolio-box');
            if (!box) return;
            const projectId = box.getAttribute('data-project');
            const data = projectsData[projectId];
            if (!data) return;

            // Fill Modal content
            document.getElementById('modal-title').textContent = data.title;
            document.getElementById('modal-desc').textContent = data.desc;
            document.getElementById('modal-challenges').textContent = data.challenges;

            // Render tags
            const tagsContainer = document.getElementById('modal-tags');
            tagsContainer.innerHTML = '';
            data.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'modal-tag';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });

            // Action Buttons
            const ghBtn = document.getElementById('modal-github');
            const liveBtn = document.getElementById('modal-live');

            if (data.github) {
                ghBtn.style.display = 'inline-flex';
                ghBtn.href = data.github;
            } else {
                ghBtn.style.display = 'none';
            }

            if (data.live) {
                liveBtn.style.display = 'inline-flex';
                liveBtn.href = data.live;
            } else {
                liveBtn.style.display = 'none';
            }

            // Open Modal
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        });
    });

    const closeFunction = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    };

    closeModal.addEventListener('click', closeFunction);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFunction();
        }
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeFunction();
        }
    });
}

/*==================== Certificate Preview Modal ====================*/
const certModal = document.getElementById('cert-modal');
const closeCertModal = document.getElementById('close-cert-modal');

if (certModal && closeCertModal) {
    const certViewer = certModal.querySelector('.cert-viewer-container');
    const certTitle = document.getElementById('cert-modal-title');
    const certDownload = document.getElementById('cert-download-link');

    document.querySelectorAll('.view-cert-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const certPath = btn.getAttribute('href');
            if (!certPath) return;

            // Get certificate title from sibling or closest box header
            const box = btn.closest('.services-box');
            const title = box ? box.querySelector('h3').textContent : 'Certificate Preview';
            certTitle.textContent = title;

            // Prepare preview viewer content based on file type
            certViewer.innerHTML = '';
            if (certPath.toLowerCase().endsWith('.pdf')) {
                const iframe = document.createElement('iframe');
                iframe.src = certPath;
                iframe.title = title;
                certViewer.appendChild(iframe);
            } else {
                const img = document.createElement('img');
                img.src = certPath;
                img.alt = title;
                certViewer.appendChild(img);
            }

            // Update original download/link button
            certDownload.href = certPath;

            // Open Certificate Modal
            certModal.style.display = 'flex';
            setTimeout(() => certModal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        });
    });

    const closeCertFunction = () => {
        certModal.classList.remove('active');
        setTimeout(() => {
            certModal.style.display = 'none';
            // Clear viewer memory
            certViewer.innerHTML = '';
        }, 300);
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    };

    closeCertModal.addEventListener('click', closeCertFunction);

    // Close on background click
    window.addEventListener('click', (e) => {
        if (e.target === certModal) {
            closeCertFunction();
        }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certModal.classList.contains('active')) {
            closeCertFunction();
        }
    });
}

/*==================== WhatsApp Privacy Helper ====================*/
function openWhatsApp(customMsg) {
    // Encoded in Base64 so phone number is completely hidden from GitHub source code
    const token = 'OTE4OTIxNDM5MTY4';
    const num = window.atob(token);
    const msg = customMsg || "Hi Jaison, I saw your portfolio and would like to connect regarding an opportunity!";
    const url = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

/*==================== AI Chatbot Logic ====================*/
// Insert your Gemini API Key here. For a public site, restrict it by domain in Google Cloud Console.
const GEMINI_API_KEY = ''; // Add your API key here if using AI chatbot

const chatBtn = document.getElementById('ai-chat-btn');
const chatContainer = document.getElementById('ai-chat-container');
const closeChat = document.getElementById('close-chat');
const chatKeyBtn = document.getElementById('chat-key-btn');
const chatStatusText = document.getElementById('chat-status-text');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');
const chatBadge = document.querySelector('.chat-badge-dot');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

let isChatInitialized = false;

function updateChatStatus() {
    const activeKey = (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY.trim() !== '') 
        ? GEMINI_API_KEY.trim() 
        : localStorage.getItem('GEMINI_API_KEY');

    if (chatStatusText) {
        if (activeKey) {
            chatStatusText.innerHTML = "⚡ Live Gemini AI Active";
            chatStatusText.style.color = "#10b981";
        } else {
            chatStatusText.innerHTML = "Executive Recruiter AI";
            chatStatusText.style.color = "#a855f7";
        }
    }
}

if (chatKeyBtn) {
    chatKeyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentKey = localStorage.getItem('GEMINI_API_KEY') || GEMINI_API_KEY || '';
        const userKey = prompt("🔑 Google Gemini API Key Setup:\n\nPaste your free Gemini API Key below to enable Live Generative AI mode.\n(Leave blank and click OK to reset to built-in Recruiter AI):", currentKey);

        if (userKey !== null) {
            const trimmed = userKey.trim();
            if (trimmed) {
                localStorage.setItem('GEMINI_API_KEY', trimmed);
                alert("✅ Gemini API Key saved! Live Generative AI Mode is now ACTIVE.");
            } else {
                localStorage.removeItem('GEMINI_API_KEY');
                alert("ℹ️ Key reset. Switched to built-in Executive Recruiter AI Mode.");
            }
            updateChatStatus();
        }
    });
}

if (chatBtn && chatContainer && closeChat && chatMessages && chatForm && chatInput) {
    updateChatStatus();
    // Toggle chat visibility
    chatBtn.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden')) {
            chatInput.focus();
            updateChatStatus();
            if (chatBadge) chatBadge.style.display = 'none'; // Hide notification dot
            if (!isChatInitialized) {
                initializeChat();
            }
        }
    });

    closeChat.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // Handle suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            if (query) {
                handleUserMessage(query);
            }
        });
    });

    // Handle form submit
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (query) {
            handleUserMessage(query);
            chatInput.value = '';
        }
    });

    function initializeChat() {
        isChatInitialized = true;
        showBotResponse("Hi, I'm Jaison's AI Assistant! 🤖<br><br>I can answer questions about Jaison's skills, latest projects, career journey, certificates, or provide his contact details.<br><br>What would you like to explore?");
    }

    async function handleUserMessage(message) {
        // Add user message to UI
        addMessage(message, 'user');
        
        // Show typing indicator and get bot response
        const typingId = showTypingIndicator();
        
        const reply = await getAIResponse(message);
        
        removeTypingIndicator(typingId);
        showBotResponse(reply);
    }

    function addMessage(text, sender) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${sender}`;
        
        wrapper.innerHTML = `
            <div class="message-bubble">${text}</div>
            <span class="message-time">${time}</span>
        `;
        
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showBotResponse(text) {
        addMessage(text, 'bot');
        
        // Setup click listeners for any links inside the bot message that point to sections
        const links = chatMessages.querySelectorAll('.message-wrapper.bot:last-child a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Close chat drawer on mobile to let user see section
                    if (window.innerWidth <= 450) {
                        chatContainer.classList.add('hidden');
                    }
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper bot';
        wrapper.id = id;
        
        wrapper.innerHTML = `
            <div class="message-bubble">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }

    function getSystemPrompt() {
        return `You are Jaison George's Executive AI Recruiter Representative on his personal portfolio website.
Your mission is to represent Jaison professionally, accurately, and persuasively to recruiters, hiring managers, and prospective employers.

CRITICAL DIRECTIVES:
1. Grounding & Accuracy: Only answer based on verified facts about Jaison George provided below. Do not fabricate work experience or degrees not listed.
2. Self-Introduction / "Who is Jaison?": Always present his complete, articulate introduction:
   "Hi, my name is Jaison George. I am currently completing my Master of Computer Applications (MCA) under Calicut University (LEAD College, Autonomous, Palakkad). My MCA coursework and exams are completed, and I am actively seeking software engineering roles, Python/Django backend developer positions, full-stack, AI/ML, or DevOps opportunities. I completed my B.Sc in Computer Science from St. Thomas College, Kozhencherry. My key projects include a Django Hostel Management System, a Breast Cancer ML Prediction Tool, a Loan Management Platform, and a Smart FlashCard App. I have hands-on skills in Python, Django, SQL, React, AWS, Docker, Jenkins, and Cybersecurity. I am immediately available with zero notice period and open to Remote, Hybrid, Onsite work, and relocation anywhere."
3. Executive Tone: Speak as Jaison's confident, articulate, and highly professional AI Executive Representative.
4. Response Formatting: Use clean markdown styling (bolding, lists, and line breaks).

VERIFIED CANDIDATE PROFILE (JAISON GEORGE):
- Full Name: Jaison George
- Current Title: Software Developer | Python & Django Developer | AI Engineer | Cloud & DevOps Enthusiast
- Education:
  • Master of Computer Applications (MCA) (2025 - Present) — LEAD College (Autonomous), Palakkad (Affiliated with Calicut University). Coursework & exams completed. Focus: Software Architecture, Database Engineering & Data Analytics.
  • B.Sc. in Computer Science (2022 - 2025) — St. Thomas College, Kozhencherry. Focus: Algorithms, Data Structures & OS.
- Technical Skillset:
  • Programming Languages: Python, JavaScript, SQL (PostgreSQL, SQLite), Java, HTML5, CSS3
  • Backend & Frameworks: Django, REST APIs, Streamlit, React.js
  • Cloud & DevOps: AWS (EC2, S3, Cloud Native, Security), Docker, Jenkins CI/CD, Terraform, Git, GitHub, Linux CLI
  • AI, ML & Security: Generative AI, Prompt Engineering, Scikit-Learn (ML), Cybersecurity, Smart Home/IoT Security
- Key Portfolio Projects:
  1. Hostel Management System (Django, SQL, HTML/CSS) — Automates room allocations, student records, fee tracking & warden dashboards. GitHub: https://github.com/JaisonGeorge04/Hostel-Management-System.git
  2. Breast Cancer Prediction System (Python, Scikit-Learn, Streamlit) — Diagnostic decision support tool using Gradient Boosting ML model. Live Demo: https://breastcancerpredictionsystem-7ao7uxnm8cwekhbzzk5vks.streamlit.app/ | GitHub: https://github.com/JaisonGeorge04/Breast_Cancer_Prediction_System
  3. Loan Management System (Django, PostgreSQL, JS) — Financial platform calculating amortization schedules & credit scoring. GitHub: https://github.com/JaisonGeorge04/Loan-Management-System
  4. Smart FlashCard Generator (Vanilla JS, HTML/CSS) — Interactive frontend app with 3D CSS card animation & LocalStorage persistence. GitHub: https://github.com/JaisonGeorge04/smart-flashcard-generator.git
  5. AI Resume Analyzer & Optimizer (React, FastAPI, Python, Gemini AI, Vite, REST APIs) — Full-stack AI application calculating ATS compatibility scores, keyword gaps, PDF/DOCX parsing & Google XYZ bullet optimization. Live Demo: https://ai-resume-analyzer-ten-roan.vercel.app | GitHub: https://github.com/JaisonGeorge04/AI-Resume-Analyzer.git
- Professional Certifications:
  • TCS iON Industry Project: Securing Smart Home Ecosystems (90 Hours)
  • Prompt Engineering for Generative AI
  • Cybersecurity Fundamentals
  • Digital Marketing & Web Strategy
- Work & Hiring Terms:
  • Availability / Notice Period: Immediate Joiner (0 days notice period)
  • Work Preference: Open to Remote, Hybrid, or Onsite (Office) roles
  • Relocation: Open to relocate anywhere across India (Bangalore, Kochi, Trivandrum, Hyderabad, Pune, Chennai, Mumbai) or internationally
  • Target Roles: Software Engineer / Developer, Python / Django Backend Engineer, Full-Stack Developer, AI/ML Associate, Cloud / DevOps Associate
- Contact Details:
  • Email: jaisongeorge699@gmail.com
  • WhatsApp: Quick Chat button on portfolio (openWhatsApp helper)
  • LinkedIn: linkedin.com/in/jaison-george-887891310
  • GitHub: github.com/JaisonGeorge04
  • Resume: Available for download on portfolio (files/JaisonGeorge Resume.pdf)`;
    }

    function parseMarkdownToHTML(text) {
        if (!text) return '';
        let formatted = text;
        // Bold **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Markdown Links [text](url)
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        // Bullet list items (* or -)
        formatted = formatted.replace(/^[\*\-]\s+(.*)$/gm, '• $1');
        // Headers ### Header
        formatted = formatted.replace(/^###?\s+(.*)$/gm, '<strong>$1</strong>');
        // Newlines to line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    async function getAIResponse(query) {
        // Check for Gemini API Key in constant or localStorage
        const apiKey = (typeof GEMINI_API_KEY !== 'undefined' && GEMINI_API_KEY.trim() !== '') 
            ? GEMINI_API_KEY.trim() 
            : localStorage.getItem('GEMINI_API_KEY');

        if (apiKey) {
            // Models to try in order of preference
            const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

            for (const model of models) {
                try {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: {
                                parts: [{ text: getSystemPrompt() }]
                            },
                            contents: [
                                { role: 'user', parts: [{ text: "Recruiter Question: " + query }] }
                            ]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                            const rawText = data.candidates[0].content.parts[0].text;
                            return parseMarkdownToHTML(rawText);
                        }
                    } else {
                        const errData = await response.json().catch(() => ({}));
                        console.warn(`Gemini API (${model}) returned HTTP ${response.status}:`, errData);
                        if (errData.error && errData.error.message) {
                            console.error("Gemini API Error Detail:", errData.error.message);
                        }
                    }
                } catch (error) {
                    console.warn(`Gemini API call failed for ${model}:`, error);
                }
            }

            console.warn("Live Gemini API unavailable or key invalid. Falling back to built-in Executive Recruiter AI matcher.");
        }

        // Use Executive Recruiter AI Matcher (Offline / No Key required)
        return getStaticFallbackResponse(query);
    }

    function getStaticFallbackResponse(query) {
        const text = query.toLowerCase().trim();

        // 1. Recruiter Core Intent: Why Hire Jaison / Value Proposition
        if (text.includes('why hire') || text.includes('why should') || text.includes('reasons to hire') || text.includes('why choose') || text.includes('value') || text.includes('why jaison')) {
            return `<strong>Why Jaison George is a Strong Hire:</strong><br><br>• 🚀 <strong>Solid Academic Foundation:</strong> MCA Graduate with deep Computer Science fundamentals.<br>• ⚙️ <strong>Production-Ready Backend:</strong> Hands-on experience with Python, Django, REST APIs, and relational SQL.<br>• 🤖 <strong>AI & ML Capabilities:</strong> Deployed real-world ML diagnostic tools (Gradient Boosting) and GenAI integrations.<br>• ☁️ <strong>Cloud & DevOps Awareness:</strong> Practical exposure to AWS, Docker, Jenkins CI/CD, and TCS iON cybersecurity principles.<br>• ⚡ <strong>Immediate Availability:</strong> Ready to onboard immediately with zero notice period.<br><br>Would you like to schedule an interview or explore his <a href="#project">Projects</a>?`;
        }

        // 2. Availability, Notice Period & Onboarding
        if (text.includes('notice') || text.includes('available') || text.includes('availability') || text.includes('start date') || text.includes('when can') || text.includes('join') || text.includes('onboard')) {
            return `⚡ <strong>Immediate Availability!</strong><br><br>Jaison has completed his degree program and is available to join your team <strong>immediately with zero notice period</strong>. He is open to full-time roles, internships, or contract positions.`;
        }

        // 3. Location, Relocation & Work Mode (Remote / Hybrid / Onsite)
        if (text.includes('relocat') || text.includes('location') || text.includes('remote') || text.includes('hybrid') || text.includes('onsite') || text.includes('office') || text.includes('wfh') || text.includes('city') || text.includes('bangalore') || text.includes('cochin') || text.includes('kochi') || text.includes('trivandrum') || text.includes('hyderabad') || text.includes('pune') || text.includes('chennai')) {
            return `📍 <strong>Work Location & Relocation Flexibility:</strong><br><br>Jaison is highly flexible regarding work environments:<br>• ✅ <strong>Remote / Work From Home</strong><br>• ✅ <strong>Hybrid Setup</strong><br>• ✅ <strong>Onsite / Office</strong><br><br>He is fully willing to <strong>relocate anywhere in India or internationally</strong> for suitable opportunities.`;
        }

        // 4. Target Roles & Positions Sought
        if (text.includes('role') || text.includes('roles') || text.includes('position') || text.includes('positions') || text.includes('job type') || text.includes('seeking') || text.includes('looking for') || text.includes('target role')) {
            return `🎯 <strong>Roles Jaison is Seeking:</strong><br><br>• 💻 <strong>Software Engineer / Developer</strong><br>• 🐍 <strong>Python / Django Backend Engineer</strong><br>• 🌐 <strong>Full-Stack Web Developer</strong><br>• 🤖 <strong>AI / Machine Learning Associate</strong><br>• ☁️ <strong>Cloud & DevOps Associate</strong>`;
        }

        // 5. Strengths & Core Competencies
        if (text.includes('strength') || text.includes('strengths') || text.includes('strongest') || text.includes('best skill') || text.includes('superpower') || text.includes('advantage')) {
            return `🌟 <strong>Jaison's Core Strengths:</strong><br><br>1. <strong>Backend Architecture:</strong> Writing clean, maintainable Python/Django code with optimized SQL databases.<br>2. <strong>AI & Data Integration:</strong> Bridging machine learning algorithms with accessible Web UIs (Streamlit/React).<br>3. <strong>Agile Learning:</strong> Rapidly mastering new cloud and DevOps tools (AWS, Docker, Jenkins) to solve real business problems.`;
        }

        // 6. Weakness / Areas of Growth
        if (text.includes('weakness') || text.includes('weaknesses') || text.includes('improvement') || text.includes('flaw')) {
            return `💡 <strong>Growth Mindset & Attention to Detail:</strong><br><br>Jaison tends to be a perfectionist when designing user interfaces and data schemas, sometimes spending extra time testing rare edge cases. To balance this, he utilizes structured task management and agile sprint deadlines to deliver projects on time.`;
        }

        // 7. Salary & Package Expectations
        if (text.includes('salary') || text.includes('ctc') || text.includes('compensation') || text.includes('package') || text.includes('pay') || text.includes('expected')) {
            return `💼 <strong>Compensation & Package:</strong><br><br>Jaison is focused on joining an innovative team where he can contribute and grow. He is open to standard industry-competitive packages appropriate for entry-to-mid level Software Developer roles, and happy to discuss details during an interview.`;
        }

        // 8. Technical Deep Dive: Python & Backend
        if (text.includes('python') || text.includes('django') || text.includes('backend') || text.includes('api') || text.includes('apis') || text.includes('rest') || text.includes('database') || text.includes('postgres') || text.includes('sql')) {
            return `🐍 <strong>Backend & Database Mastery:</strong><br><br>Jaison excels in Python ecosystem development:<br>• <strong>Frameworks:</strong> Django & REST Framework<br>• <strong>Databases:</strong> PostgreSQL, SQL query optimization, ORM design<br>• <strong>Key Apps Built:</strong> Loan Management System (amortization engines) & Hostel Management Platform.<br><br>Explore the <a href="#skills">Skills</a> or <a href="#project">Projects</a> section for details!`;
        }

        // 9. Technical Deep Dive: AI, ML & GenAI
        if (text.includes('machine learning') || text.includes('ml') || text.includes('genai') || text.includes('ai') || text.includes('artificial intelligence') || text.includes('scikit') || text.includes('streamlit') || text.includes('prompt')) {
            return `🤖 <strong>AI & Machine Learning Capabilities:</strong><br><br>• <strong>Generative AI & Prompt Engineering:</strong> Designing structured context prompts & LLM integration workflows.<br>• <strong>Machine Learning:</strong> Built the <em>Breast Cancer Prediction System</em> using Scikit-Learn Gradient Boosting, achieving high diagnostic accuracy and deployed on Streamlit.<br><br>Check out the live model in the <a href="#project">Projects</a> section!`;
        }

        // 10. Technical Deep Dive: Cloud, DevOps & Security
        if (text.includes('cloud') || text.includes('aws') || text.includes('docker') || text.includes('jenkins') || text.includes('devops') || text.includes('terraform') || text.includes('git') || text.includes('github') || text.includes('ci/cd') || text.includes('pipeline') || text.includes('linux') || text.includes('cyber') || text.includes('security') || text.includes('tcs')) {
            return `☁️ <strong>Cloud, DevOps & Security Stack:</strong><br><br>• <strong>Cloud & Infra:</strong> AWS (EC2, S3), Docker Containerization, Terraform IaC<br>• <strong>CI/CD & Version Control:</strong> Jenkins Automation, Git, GitHub Workflows, Linux CLI<br>• <strong>Security Certification:</strong> TCS iON Industry Project (Smart Home Ecosystem Security - 90 Hours).`;
        }

        // 11. Specific Projects
        if (text.includes('hostel')) {
            return `🏢 <strong>Hostel Management System</strong><br><br>A full-featured Django web application built by Jaison to automate room allocations, student registration, fee tracking, and warden notifications.<br><br>🔗 Code: <a href="https://github.com/JaisonGeorge04/Hostel-Management-System.git" target="_blank">GitHub Repository</a>`;
        }
        if (text.includes('cancer') || text.includes('breast') || text.includes('tumor')) {
            return `🔬 <strong>Breast Cancer Prediction System</strong><br><br>A diagnostic decision-support system using a Gradient Boosting ML model to classify tumor features, with an interactive Streamlit UI.<br><br>🔗 Demo: <a href="https://breastcancerpredictionsystem-7ao7uxnm8cwekhbzzk5vks.streamlit.app/" target="_blank">Live App</a> | 🔗 Code: <a href="https://github.com/JaisonGeorge04/Breast_Cancer_Prediction_System" target="_blank">GitHub</a>`;
        }
        if (text.includes('loan')) {
            return `💳 <strong>Loan Management System</strong><br><br>A Django & PostgreSQL financial application for credit evaluation, payment tracking, and dynamic amortization schedule calculations.<br><br>🔗 Code: <a href="https://github.com/JaisonGeorge04/Loan-Management-System" target="_blank">GitHub Repository</a>`;
        }
        if (text.includes('flashcard')) {
            return `🎴 <strong>Smart FlashCard Generator</strong><br><br>An interactive frontend application featuring custom 3D card flipping, study tracking, and LocalStorage data persistence.<br><br>🔗 Code: <a href="https://github.com/JaisonGeorge04/smart-flashcard-generator.git" target="_blank">GitHub Repository</a>`;
        }
        if (text.includes('analyzer') || text.includes('ats') || (text.includes('resume') && text.includes('ai'))) {
            return `📄 <strong>AI Resume Analyzer & Optimizer</strong><br><br>Full-stack AI web application built with React, FastAPI, Python & Gemini AI. Analyzes resumes against job descriptions, calculates ATS compatibility scores, parses PDF/DOCX files, performs keyword gap analysis, and optimizes bullet points using Google XYZ formula.<br><br>🔗 Demo: <a href="https://ai-resume-analyzer-ten-roan.vercel.app" target="_blank">Live App</a> | 🔗 Code: <a href="https://github.com/JaisonGeorge04/AI-Resume-Analyzer.git" target="_blank">GitHub</a>`;
        }

        // 12. General Projects Overview
        if (text.includes('project') || text.includes('projects') || text.includes('portfolio') || text.includes('work') || text.includes('app') || text.includes('apps')) {
            return `📂 <strong>Jaison's Key Featured Projects:</strong><br><br>1. 📄 <strong>AI Resume Analyzer & Optimizer</strong> (React + FastAPI + Gemini AI)<br>2. 🏢 <strong>Hostel Management System</strong> (Django + SQL)<br>3. 🔬 <strong>Breast Cancer ML Predictor</strong> (Gradient Boosting + Streamlit)<br>4. 💳 <strong>Loan Management System</strong> (Django + PostgreSQL)<br>5. 🎴 <strong>Smart FlashCards App</strong> (JS + LocalStorage)<br><br>Click on any card in the <a href="#project">Projects</a> section for live demos and code links!`;
        }

        // 13. Education & Qualifications
        if (text.includes('education') || text.includes('qualification') || text.includes('qualifications') || text.includes('degree') || text.includes('graduat') || text.includes('academic') || text.includes('academics') || text.includes('college') || text.includes('school') || text.includes('university') || text.includes('mca') || text.includes('bsc') || text.includes('b.sc') || text.includes('study') || text.includes('studies') || text.includes('lead') || text.includes('st thomas')) {
            return `🎓 <strong>Academic Credentials & Qualifications:</strong><br><br>• 🎓 <strong>Master of Computer Applications (MCA)</strong> (2025 - Present)<br>LEAD College (Autonomous), Palakkad — Focus on Advanced App Dev & Data Analytics.<br><br>• 🎓 <strong>Bachelor of Science in Computer Science (B.Sc. CS)</strong> (2022 - 2025)<br>St. Thomas College, Kozhencherry.<br><br>View details in the <a href="#journey">Journey</a> section!`;
        }

        // 14. Certifications
        if (text.includes('certificate') || text.includes('certif') || text.includes('course') || text.includes('tcs') || text.includes('prompt engineering') || text.includes('security')) {
            return `📜 <strong>Professional Certifications:</strong><br><br>• 🛡️ <strong>TCS iON Industry Project:</strong> Securing Smart Home Ecosystems (90 Hours)<br>• 🧠 <strong>Prompt Engineering:</strong> Structuring AI LLM Prompts<br>• 💻 <strong>Cybersecurity Fundamentals:</strong> Network & System Defense<br>• 📈 <strong>Digital Marketing:</strong> SEO & Web Strategy<br><br>View & download credentials in the <a href="#certificates">Certificates</a> section!`;
        }

        // 15. Soft Skills & Team Dynamics
        if (text.includes('soft skill') || text.includes('teamwork') || text.includes('communication') || text.includes('problem solving') || text.includes('adaptable') || text.includes('adaptability') || text.includes('collaboration')) {
            return `🤝 <strong>Soft Skills & Work Ethic:</strong><br><br>• 🗣️ <strong>Clear Technical Communication:</strong> Translating complex data into user-friendly software.<br>• 🧠 <strong>Analytical Problem Solving:</strong> Structured approach to debugging & algorithm optimization.<br>• 🔄 <strong>Adaptability:</strong> Thrives in fast-paced teams and eager to learn new tech stacks.`;
        }

        // 16. Contact & Resume
        if (text.includes('whatsapp') || text.includes('chat') || text.includes('contact') || text.includes('email') || text.includes('phone') || text.includes('linkedin') || text.includes('github') || text.includes('hire') || text.includes('reach') || text.includes('mail') || text.includes('touch')) {
            return `📬 <strong>Get in Touch with Jaison:</strong><br><br>• 💬 <strong>WhatsApp Quick Chat:</strong> <a href="javascript:void(0)" onclick="openWhatsApp()">Chat on WhatsApp</a><br>• 📧 Email: <a href="mailto:jaisongeorge699@gmail.com">jaisongeorge699@gmail.com</a><br>• 💼 LinkedIn: <a href="http://www.linkedin.com/in/jaison-george-887891310" target="_blank">LinkedIn Profile</a><br>• 🐙 GitHub: <a href="https://github.com/JaisonGeorge04" target="_blank">GitHub Profile</a><br>• ✉️ Or fill out the form in the <a href="#contact">Contact</a> section!`;
        }

        if (text.includes('resume') || text.includes('cv')) {
            return `📄 <strong>Download Jaison's Resume:</strong><br><br><a href="files/JaisonGeorge Resume.pdf" target="_blank" class="btn" style="color:#fff; padding: 0.6rem 1.6rem; font-size:1.2rem; display:inline-flex; margin-top:0.5rem;">Download Resume <i class='bx bx-download'></i></a>`;
        }

        // 17. Greetings & Bot Identity
        if (/\b(hello|hi|hey|greetings|yo)\b/.test(text)) {
            return `Hello! 👋 I'm Jaison's Executive AI Representative.<br><br>I'm here to assist recruiters and hiring managers with any questions about Jaison's experience, technical skills, projects, availability, or contact details. How can I help you today?`;
        }

        if (text.includes('introduce') || text.includes('self intro') || text.includes('tell me about yourself') || text.includes('introduction') || text.includes('who is jaison') || text.includes('about jaison') || text.includes('tell me about jaison') || text.includes('bio')) {
            return `👋 <strong>Jaison George's Self-Introduction:</strong><br><br>"Hi, my name is <strong>Jaison George</strong>. I am currently pursuing a Master of Computer Applications (MCA) under <strong>Calicut University (LEAD College, Autonomous)</strong>. My MCA coursework and semester examinations are over, and now I am moving on to internships and placements. I completed my Bachelor of Science in Computer Science from St. Thomas College, Kozhencherry.<br><br>During my academic journey, I built several projects. One of my main projects is the <strong>Hostel Management System</strong>, which helps hostel administrators manage student accommodation and maintain records. Through this project, I gained practical experience in software development, database management, and problem-solving. Apart from this, I have built several other projects, including a <strong>Loan Management System</strong>, a <strong>Breast Cancer Prediction System</strong>, and my personal portfolio.<br><br>In terms of technical skills, I have knowledge of <strong>Python, HTML, CSS, JavaScript, React, and SQL</strong>. I also have hands-on experience with <strong>AWS</strong> in Cloud Native, Cloud Security, and DevOps.<br><br>I am a quick learner, adaptable, and self-motivated, eager to contribute my skills to an organization and grow professionally while working confidently as part of a team."`;
        }

        if (text.includes('who are you') || text.includes('what is your name') || text.includes('who made you')) {
            return `I am Jaison George's Executive AI Representative! Built to give recruiters instant, comprehensive answers about Jaison's candidate profile, software projects, and technical skills.`;
        }

        // 18. Smart Recruiter Smart Summary Fallback
        return `I'm Jaison's Executive AI Representative! 🤖<br><br>Here is a quick summary for recruiters:<br>• 🎓 <strong>Highest Qualification:</strong> MCA (Calicut University / LEAD College)<br>• 💻 <strong>Tech Stack:</strong> Python, React, SQL, HTML/CSS, AWS (Cloud Native/Security/DevOps)<br>• ⚡ <strong>Availability:</strong> Immediate (Zero notice period)<br>• 📍 <strong>Work Preference:</strong> Open to Remote, Hybrid, Onsite & Relocation<br><br>Feel free to ask me for Jaison's <strong>self introduction</strong>, <strong>projects</strong>, <strong>skills</strong>, <strong>strengths</strong>, or <strong>contact info</strong>!`;
    }
}



