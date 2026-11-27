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

            // Get certificate title from data-cert-title, sibling or closest card header
            const box = btn.closest('.services-box');
            const expCard = btn.closest('.experience-card');
            const customTitle = btn.getAttribute('data-cert-title');
            const rawTitle = customTitle || (box ? box.querySelector('h3')?.textContent : null) || (expCard ? expCard.querySelector('h3')?.textContent : null) || 'Certificate Preview';
            const title = rawTitle.replace(/[\[\]]/g, '').trim();
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
// Set window.PORTFOLIO_CHAT_API_URL before this script for deployment; local default is for development.
const CHAT_API_URL = (window.PORTFOLIO_CHAT_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

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
let isChatRequestPending = false;
const chatHistory = [];
const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;

function updateChatStatus() {
    if (!chatStatusText) return;
    chatStatusText.textContent = 'FastAPI + Gemini assistant';
    chatStatusText.style.color = '#10b981';
}

if (chatBtn && chatContainer && closeChat && chatMessages && chatForm && chatInput) {
    updateChatStatus();
    // This control only existed for saving a browser-side Gemini key, which is no longer used.
    if (chatKeyBtn) chatKeyBtn.hidden = true;

    chatBtn.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!chatContainer.classList.contains('hidden')) {
            chatInput.focus();
            updateChatStatus();
            if (chatBadge) chatBadge.style.display = 'none';
            if (!isChatInitialized) initializeChat();
        }
    });

    closeChat.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            if (query) handleUserMessage(query);
        });
    });

    chatForm.addEventListener('submit', event => {
        event.preventDefault();
        const query = chatInput.value.trim();
        if (query) {
            handleUserMessage(query);
            chatInput.value = '';
        }
    });

    function initializeChat() {
        isChatInitialized = true;
        showBotResponse("Hi, I'm Jaison's AI Assistant! I can answer questions about the education, skills, internships, projects, certificates, and contact details documented on this portfolio. What would you like to know?");
    }

    async function handleUserMessage(message) {
        if (isChatRequestPending) return;
        if (message.length > MAX_MESSAGE_LENGTH) {
            showBotResponse(`Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`);
            return;
        }

        isChatRequestPending = true;
        addMessage(message, 'user');
        const typingId = showTypingIndicator();

        try {
            const reply = await getAIResponse(message);
            chatHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: reply }
            );
            if (chatHistory.length > MAX_HISTORY_MESSAGES) {
                chatHistory.splice(0, chatHistory.length - MAX_HISTORY_MESSAGES);
            }
            showBotResponse(reply);
        } catch (error) {
            console.error('Chat request failed:', error);
            showBotResponse(error.message || 'The assistant is temporarily unavailable. Please try again.');
        } finally {
            removeTypingIndicator(typingId);
            isChatRequestPending = false;
        }
    }

    function addMessage(text, sender) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        if (sender === 'bot') {
            bubble.innerHTML = formatBotMessage(text);
        } else {
            bubble.textContent = text;
        }

        const timestamp = document.createElement('span');
        timestamp.className = 'message-time';
        timestamp.textContent = time;
        wrapper.append(bubble, timestamp);
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showBotResponse(text) {
        addMessage(text, 'bot');
        const links = chatMessages.querySelectorAll('.message-wrapper.bot:last-child a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                const targetSection = document.querySelector(link.getAttribute('href'));
                if (targetSection) {
                    if (window.innerWidth <= 450) chatContainer.classList.add('hidden');
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    function escapeHTML(text) {
        return text.replace(/[&<>"']/g, character => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[character]);
    }

    function formatBotMessage(text) {
        let formatted = escapeHTML(text);
        formatted = formatted.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|#[\w-]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        return formatted.replace(/\n/g, '<br>');
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper bot';
        wrapper.id = id;
        wrapper.innerHTML = '<div class="message-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
        chatMessages.appendChild(wrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    async function getAIResponse(query) {
        let response;
        try {
            response = await fetch(`${CHAT_API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: query,
                    history: chatHistory.slice(-MAX_HISTORY_MESSAGES)
                })
            });
        } catch (error) {
            if (error instanceof TypeError) {
                throw new Error(`Can't connect to the chat API at ${CHAT_API_URL}. Check that FastAPI is running and that CORS_ALLOWED_ORIGINS includes this page's exact origin (${window.location.origin}). For GitHub Pages, configure window.PORTFOLIO_CHAT_API_URL to your deployed HTTPS API.`);
            }
            throw error;
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            if (response.status === 503) {
                throw new Error('The chat service is not configured yet. Please try again later.');
            }
            if (response.status === 502) {
                throw new Error(typeof data.detail === 'string' ? data.detail : 'The AI assistant is temporarily unavailable. Please try again shortly.');
            }
            if (response.status === 422) {
                throw new Error('Please send a message of 2,000 characters or fewer.');
            }
            throw new Error('Could not reach the chat service. Please try again later.');
        }
        if (typeof data.reply !== 'string' || !data.reply.trim()) {
            throw new Error('The assistant returned an empty response. Please try again.');
        }
        return data.reply.trim();
    }
}
