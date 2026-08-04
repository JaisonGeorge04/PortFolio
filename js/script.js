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

/*==================== AI Chatbot Logic ====================*/
// Insert your Gemini API Key here. For a public site, restrict it by domain in Google Cloud Console.
const GEMINI_API_KEY = ''; // Add your API key here if using AI chatbot

const chatBtn = document.getElementById('ai-chat-btn');
const chatContainer = document.getElementById('ai-chat-container');
const closeChat = document.getElementById('close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-input-form');
const chatInput = document.getElementById('chat-input');
const chatBadge = document.querySelector('.chat-badge-dot');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

let isChatInitialized = false;

if (chatBtn && chatContainer && closeChat && chatMessages && chatForm && chatInput) {
    // Toggle chat visibility
    chatBtn.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden')) {
            chatInput.focus();
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
        return `You are Jaison George's professional AI assistant for his portfolio website.
Answer questions accurately and politely based ONLY on the following context. Do not make up information.
Keep responses concise, friendly, and well-formatted using basic HTML (like <strong> for emphasis and <br> for new lines) or just plain text.
If a question is completely unrelated to Jaison or tech, steer the conversation back to his portfolio.

Context about Jaison George:
- MCA graduate (2025) from LEAD College, B.Sc. CS from St. Thomas College.
- Skills: Python, JavaScript, SQL, Java, HTML/CSS, Django, Streamlit, React, AWS, Docker, Jenkins, Git, AI Integration, Cybersecurity.
- Projects: Hostel Management System (Django/SQL), Breast Cancer Prediction (ML/Streamlit), Loan Management System (Django/Postgres), Smart Flashcards (JS/CSS).
- Certificates: TCS iON Smart Home Security, Prompt Engineering, Cybersecurity, Digital Marketing.
- Contact: jaisongeorge699@gmail.com, LinkedIn, GitHub. Resume is available to download.`;
    }

    async function getAIResponse(query) {
        // Use Gemini API if key is provided
        if (GEMINI_API_KEY && GEMINI_API_KEY.trim() !== '') {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: getSystemPrompt() + "\n\nUser Question: " + query }] }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates && data.candidates[0].content.parts[0].text) {
                        let aiText = data.candidates[0].content.parts[0].text;
                        // Format markdown-like response to HTML for the chat UI
                        aiText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        aiText = aiText.replace(/\n/g, '<br>');
                        return aiText;
                    }
                } else {
                    console.error("Gemini API Error:", response.statusText);
                }
            } catch (error) {
                console.error("Gemini API Request Failed:", error);
            }
        }

        // Fallback to static predefined rules if API fails or no key
        return getStaticFallbackResponse(query);
    }

    function getStaticFallbackResponse(query) {
        const text = query.toLowerCase().trim();

        // 1. Specific project queries first
        if (text.includes('hostel')) {
            return `<strong>Hostel Management System</strong> is a full-featured Django web application Jaison built to automate room allocations, warden notifications, and payment tracking. <br><br>🔗 Code: <a href="https://github.com/JaisonGeorge04/Hostel-Management-System.git" target="_blank">GitHub Repository</a><br>📂 Or click "Details" under the <a href="#project">Projects</a> section!`;
        }
        if (text.includes('cancer') || text.includes('breast') || text.includes('tumor')) {
            return `<strong>Breast Cancer Prediction System</strong> is an ML diagnostic dashboard Jaison developed. It uses Scikit-Learn (Gradient Boosting) to analyze tumor features and Streamlit for the user interface.<br><br>🔗 Demo: <a href="https://breastcancerpredictionsystem-7ao7uxnm8cwekhbzzk5vks.streamlit.app/" target="_blank">Live App</a><br>🔗 Code: <a href="https://github.com/JaisonGeorge04/Breast_Cancer_Prediction_System" target="_blank">GitHub Repository</a>`;
        }
        if (text.includes('loan')) {
            return `<strong>Loan Management System</strong> is a Django & PostgreSQL application Jaison created for credit score checking, payment amortization calendars, and role-based officer/client views.<br><br>🔗 Code: <a href="https://github.com/JaisonGeorge04/Loan-Management-System" target="_blank">GitHub Repository</a>`;
        }
        if (text.includes('flashcard')) {
            return `<strong>Smart FlashCard Generator</strong> is an interactive JS/CSS web app built to explore client-side storage, featuring custom 3D card flipping animations.<br><br>🔗 Code: <a href="https://github.com/JaisonGeorge04/smart-flashcard-generator.git" target="_blank">GitHub Repository</a>`;
        }

        // 2. Main intent queries
        if (text.includes('who are you') || text.includes('what is your name') || text.includes('who made you')) {
            return `I'm Jaison's custom AI portfolio assistant! I can guide you through his projects, credentials, technical stack, or assist you in reaching out to him.`;
        }
        
        if (/\b(hello|hi|hey|greetings|yo)\b/.test(text)) {
            return `Hello! 👋 How can I help you learn more about Jaison's professional background today?`;
        }

        if (text.includes('who is jaison') || text.includes('about jaison') || text.includes('profile') || text.includes('tell me about') || text.includes('who is he')) {
            return `Jaison George is an MCA graduate and Software Developer who excels at building Python, Django, SQL, and JS applications. He is passionate about Artificial Intelligence (GenAI integrations), cloud infrastructure, and cybersecurity.<br><br>Explore the <a href="#about">About Me</a> section to read his bio.`;
        }

        if (text.includes('skill') || text.includes('skills') || text.includes('technolog') || text.includes('language') || text.includes('framework') || text.includes('stack') || text.includes('python') || text.includes('django') || text.includes('aws') || text.includes('devops')) {
            return `Jaison's core skills are:<br>• 🐍 <strong>Languages:</strong> Python, JavaScript, SQL, Java, HTML5/CSS3<br>• ⚙️ <strong>Frameworks:</strong> Django, Streamlit, React, REST APIs<br>• ☁️ <strong>DevOps/Cloud:</strong> AWS, Docker, Jenkins, Terraform, Git<br>• 🤖 <strong>AI & Security:</strong> GenAI Integrations, Prompt Engineering, Cybersecurity, Smart Home/IoT security.<br><br>Check out the <a href="#skills">Skills</a> section for the full visual breakdown!`;
        }

        if (text.includes('project') || text.includes('projects') || text.includes('portfolio') || text.includes('work') || text.includes('app') || text.includes('apps')) {
            return `Jaison has designed and deployed several software applications:<br>• 🏢 <strong>Hostel Management System</strong> (Django, relational SQL, booking dashboard)<br>• 🔬 <strong>Breast Cancer Classifier</strong> (Gradient Boosting model + Streamlit)<br>• 💳 <strong>Loan Management Platform</strong> (Django/PostgreSQL + amortization math)<br>• 🎴 <strong>Smart FlashCards</strong> (Vanilla JS + LocalStorage + 3D card layouts)<br><br>You can click on any card in the <a href="#project">Projects</a> section to open details and code links.`;
        }

        if (text.includes('education') || text.includes('college') || text.includes('school') || text.includes('university') || text.includes('mca') || text.includes('bsc') || text.includes('study') || text.includes('lead') || text.includes('st thomas')) {
            return `Jaison's academic background includes:<br>• 🎓 <strong>Master of Computer Applications (MCA)</strong> (2025 - Present) at LEAD College, Palakkad. Focusing on Advanced App Development and Data Analytics.<br>• 🎓 <strong>B.Sc. in Computer Science</strong> (2022 - 2025) at St. Thomas College, Kozhencherry.<br><br>View his career timeline in the <a href="#journey">Journey</a> section!`;
        }

        if (text.includes('certificate') || text.includes('certif') || text.includes('course') || text.includes('tcs') || text.includes('prompt engineering') || text.includes('security')) {
            return `Jaison holds multiple certifications:<br>• 🛡️ <strong>TCS iON Industry Project:</strong> Smart Home Ecosystem Security.<br>• 🧠 <strong>Prompt Engineering:</strong> Structuring AI inputs.<br>• 💻 <strong>Cybersecurity:</strong> Fundamentals of network & data protection.<br>• 📈 <strong>Digital Marketing:</strong> SEO and strategy fundamentals.<br><br>View and download credentials in the <a href="#certificates">Certificates</a> section!`;
        }

        if (text.includes('contact') || text.includes('email') || text.includes('phone') || text.includes('linkedin') || text.includes('github') || text.includes('message') || text.includes('hire') || text.includes('reach')) {
            return `Here are the ways you can reach Jaison:<br>• 📧 Email: <a href="mailto:jaisongeorge699@gmail.com">jaisongeorge699@gmail.com</a><br>• 💼 LinkedIn: <a href="http://www.linkedin.com/in/jaison-george-887891310" target="_blank">LinkedIn Profile</a><br>• 🐙 GitHub: <a href="https://github.com/JaisonGeorge04" target="_blank">GitHub Profile</a><br>• ✉️ Directly send a message via the form in the <a href="#contact">Contact</a> section!`;
        }

        if (text.includes('resume') || text.includes('cv')) {
            return `You can view or download Jaison's professional resume here:<br><a href="files/JaisonGeorge Resume.pdf" target="_blank" class="btn" style="color:#fff; padding: 0.6rem 1.6rem; font-size:1.2rem; display:inline-flex; margin-top:0.5rem;">Download Resume <i class='bx bx-download'></i></a>`;
        }

        // 3. General Fallback
        return `I'm not completely sure about that, but Jaison is skilled in <strong>Python, Django, AWS, and Generative AI</strong>. <br><br>Would you like to hear about his <strong>projects</strong>, see his <strong>skills</strong>, check his <strong>certificates</strong>, or get his <strong>contact</strong> info?`;
    }
}


