document.addEventListener('DOMContentLoaded', function() {
    // Efecto de scroll suave
    document.querySelectorAll('.scroll-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animación al hacer scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-step, .feature-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('visible');
                
                if (element.classList.contains('feature-card')) {
                    const index = Array.from(element.parentElement.children).indexOf(element);
                    element.style.transitionDelay = `${index * 0.1}s`;
                }
            }
        });
    };

    // Efecto hover para tarjetas
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        const icon = card.querySelector('.feature-icon');
        icon.style.transition = 'all 0.3s ease';
        
        card.addEventListener('mouseenter', () => {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            icon.style.color = '#0e6a0e';
        });
        
        card.addEventListener('mouseleave', () => {
            icon.style.transform = 'scale(1) rotate(0)';
            icon.style.color = '';
        });
    });

    // Efecto ripple para botones
    document.querySelectorAll('.ripple').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
                if (this.href) {
                    window.location.href = this.href;
                }
            }, 600);
        });
    });

    // Animación de los miembros del equipo
    document.querySelectorAll('.team-members li').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `all 0.5s ease ${index * 0.2}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 500 + (index * 200));
    });

    // Inicializar animaciones
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
    // Efecto de consola Xbox en el título
    const title = document.querySelector('.hero-section h1');
    if (title) {
        let colors = ['#107c10', '#0e6a0e', '#0c580c', '#0a4a0a'];
        let counter = 0;
        
        setInterval(() => {
            title.style.textShadow = `0 0 10px ${colors[counter % colors.length]}`;
            counter++;
        }, 1000);
    }
});