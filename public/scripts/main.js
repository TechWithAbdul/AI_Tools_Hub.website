document.addEventListener('DOMContentLoaded', () => {
    // --- Global Navigation & UI Enhancements ---
    // Mobile navigation toggle
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNavMenu = document.querySelector('.mobile-nav-menu');

    if (hamburgerMenu && mobileNavMenu) {
        hamburgerMenu.addEventListener('click', () => {
            mobileNavMenu.classList.toggle('open');
            // Toggle between hamburger and 'X' icon
            hamburgerMenu.querySelector('i').classList.toggle('fa-bars');
            hamburgerMenu.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Close mobile menu when a link is clicked
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-menu a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavMenu.classList.remove('open');
            hamburgerMenu.querySelector('i').classList.remove('fa-times');
            hamburgerMenu.querySelector('i').classList.add('fa-bars');
        });
    });

    // Active link highlighting for header
    const currentPath = window.location.pathname.split('/').pop(); // Get filename
    const navLinks = document.querySelectorAll('.header .nav-menu a, .mobile-nav-menu a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        // Check if linkHref exists and if currentPath includes the link's filename
        if (linkHref) {
            const linkFileName = linkHref.split('/').pop();
            if (currentPath === linkFileName) {
                link.classList.add('active');
            } else if (currentPath === '' && linkFileName === 'index.html') { // Special handling for root/index
                link.classList.add('active');
            }
        }
    });

    // Character count for text areas and inputs with maxlength (Apply to submit-tool and add-tool pages)
    const textInputsWithMaxLength = document.querySelectorAll('textarea[maxlength], input[type="text"][maxlength]');
    textInputsWithMaxLength.forEach(input => {
        const charCountDisplay = document.querySelector(`.char-count[data-target="${input.id}"]`);
        if (charCountDisplay) {
            function updateCharCount() {
                const currentLength = input.value.length;
                const maxLength = input.getAttribute('maxlength');
                charCountDisplay.textContent = `${currentLength}/${maxLength}`;
            }
            input.addEventListener('input', updateCharCount);
            // Initialize on load
            updateCharCount();
        }
    });

    // --- Handle form submission for Add Tool Form (from add-tool.html) ---
    const addToolForm = document.getElementById('addToolForm');
    if (addToolForm) {
        addToolForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const formData = new FormData(addToolForm);
            const toolData = {};
            for (let [key, value] of formData.entries()) {
                toolData[key] = value;
            }

            // Convert features string to an array if it exists and is not empty
            if (toolData.features && toolData.features.trim() !== '') {
                toolData.features = toolData.features.split(',').map(feature => feature.trim()).filter(feature => feature !== '');
            } else {
                toolData.features = []; // Ensure it's an empty array if no features
            }

            // Convert rating and views to numbers, default to 0 if not provided or invalid
            toolData.rating = parseFloat(toolData.rating) || 0;
            toolData.views = parseInt(toolData.views, 10) || 0;

            // Generate a simple ID for the new tool (best to do this on the backend for uniqueness)
            // For now, a client-side timestamp based ID
            toolData.id = `${toolData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;


            console.log('Sending tool data to backend:', toolData);

            try {
                const response = await fetch('/api/add-tool', { // This is your Node.js backend endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(toolData),
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('Tool added successfully! Message: ' + result.message);
                    addToolForm.reset(); // Clear the form
                    // Reset character counts after reset
                    textInputsWithMaxLength.forEach(input => {
                        const charCountDisplay = document.querySelector(`.char-count[data-target="${input.id}"]`);
                        if (charCountDisplay) {
                            charCountDisplay.textContent = `0/${input.getAttribute('maxlength')}`;
                        }
                    });
                    console.log('Backend response:', result);
                } else {
                    const errorData = await response.json();
                    alert('Failed to add tool: ' + (errorData.message || 'Unknown error'));
                    console.error('Backend error:', errorData);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('An error occurred while trying to add the tool. Check your server.');
            }
        });
    }

    // --- Hot Right Now Slider Functionality (Home Page) ---
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const prevBtn = document.querySelector('.slider-btn.prev-btn');
    const nextBtn = document.querySelector('.slider-btn.next-btn');

    if (sliderWrapper && prevBtn && nextBtn) {
        let scrollAmount = 0;
        // Calculate card width dynamically, assuming uniform card sizes
        const firstCard = document.querySelector('.slider-item');
        const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 300 + 24; // Card width + gap (1.5rem = 24px) or default

        nextBtn.addEventListener('click', () => {
            scrollAmount += cardWidth;
            if (scrollAmount >= sliderWrapper.scrollWidth - sliderWrapper.clientWidth + 1) { // +1 for slight tolerance
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
            stopAutoSlide(); // Clear any existing interval first
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
