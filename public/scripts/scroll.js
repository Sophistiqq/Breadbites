window.onload = function() {
    const heroSection = document.querySelector('.hero-section');
    gsap.from(heroSection, { opacity: 0, duration: 1, y: -50 });

    const secondSection = document.querySelector('.second-section');
    gsap.from(secondSection, { 
        opacity: 0, 
        duration: 1, 
        y: -50, 
        scrollTrigger: {
            trigger: secondSection,
            start: 'top center',
            end: 'bottom center',
            toggleActions: 'play none none none'
        } 
    });

    const about = document.querySelector('.about-section');
    gsap.from(about, { 
        opacity: 0, 
        duration: 1, 
        y: -50, 
        scrollTrigger: {
            trigger: about,
            start: 'top center',
            end: 'bottom center',
            toggleActions: 'play none none none'
        } 
    }); 
};