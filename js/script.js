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
ScrollReveal().reveal('.img-box, .services-box, .portfolio-box, .contact form', { origin: 'bottom', interval: 200 });
ScrollReveal().reveal('.home-content h1, .about .img-box', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/*==================== typed js ====================*/
if(document.querySelector('.multiple-text')) {
    const typed = new Typed('.multiple-text', {
        strings: ['MCA Student', 'Data Analyst', 'Web Developer'],
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