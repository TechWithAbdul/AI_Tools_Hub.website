document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav-menu');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    // Slider functionality for "Hot Right Now" section
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const prevBtn = document.querySelector('.slider-btn.prev-btn');
    const nextBtn = document.querySelector('.slider-btn.next-btn');

    if (sliderWrapper && prevBtn && nextBtn) {
        let scrollAmount = 0;
        const cardWidth = document.querySelector('.slider-item').offsetWidth + 24; // Card width + gap (1.5rem = 24px)

        nextBtn.addEventListener('click', () => {
            scrollAmount += cardWidth;
            if (scrollAmount > sliderWrapper.scrollWidth - sliderWrapper.clientWidth) {
                scrollAmount = 0; // Loop back to start
            }
            sliderWrapper.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        prevBtn.addEventListener('click', () => {
            scrollAmount -= cardWidth;
            if (scrollAmount < 0) {
                scrollAmount = sliderWrapper.scrollWidth - sliderWrapper.clientWidth; // Loop to end
            }
            sliderWrapper.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

        // Optional: Auto-slide
        let autoSlideInterval;
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                nextBtn.click(); // Trigger click on next button
            }, 5000); // Change slide every 5 seconds
        };

        const stopAutoSlide = () => {
            clearInterval(autoSlideInterval);
        };

        // Start auto-slide on load
        startAutoSlide();

        // Stop auto-slide on user interaction and restart after a delay
        sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
        sliderWrapper.addEventListener('mouseleave', startAutoSlide);
        prevBtn.addEventListener('click', () => { stopAutoSlide(); startAutoSlide(); });
        nextBtn.addEventListener('click', () => { stopAutoSlide(); startAutoSlide(); });
    }
});
