document.addEventListener('DOMContentLoaded', () => {
    // --- Global Navigation & UI Enhancements ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNavMenu = document.querySelector('.mobile-nav-menu');

    if (hamburgerMenu && mobileNavMenu) {
        hamburgerMenu.addEventListener('click', () => {
            mobileNavMenu.classList.toggle('open');
            hamburgerMenu.querySelector('i').classList.toggle('fa-bars');
            hamburgerMenu.querySelector('i').classList.toggle('fa-times');
        });
    }

    const mobileNavLinks = document.querySelectorAll('.mobile-nav-menu a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavMenu.classList.remove('open');
            hamburgerMenu.querySelector('i').classList.remove('fa-times');
            hamburgerMenu.querySelector('i').classList.add('fa-bars');
        });
    });

    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.header .nav-menu a, .mobile-nav-menu a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref) {
            const linkFileName = linkHref.split('/').pop();
            if (currentPath === linkFileName) {
                link.classList.add('active');
            } else if (currentPath === '' && linkFileName === 'index.html') {
                link.classList.add('active');
            }
        }
    });

    const textInputsWithMaxLength = document.querySelectorAll('textarea[maxlength], input[type="text"][maxlength], input[type="url"][maxlength], input[type="email"][maxlength]');
    textInputsWithMaxLength.forEach(input => {
        const charCountDisplay = document.querySelector(`.char-count[data-target="${input.id}"]`);
        if (charCountDisplay) {
            function updateCharCount() {
                const currentLength = input.value.length;
                const maxLength = input.getAttribute('maxlength');
                charCountDisplay.textContent = `${currentLength}/${maxLength}`;
            }
            input.addEventListener('input', updateCharCount);
            updateCharCount();
        }
    });

    // --- Data Source and Helper Functions ---
    let allTools = []; // Master list of tools loaded from JSON

    async function fetchToolsData() {
        try {
            const response = await fetch('tools.json');
            if (!response.ok) {
                if (response.status === 404 || response.headers.get('content-length') === '0') {
                    console.warn('tools.json not found or is empty. Initializing with an empty tool list.');
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.error('tools.json is not a valid JSON array. Initializing with empty list.');
                return [];
            }
            return data;
        } catch (error) {
            console.error('Error fetching tools data:', error);
            return [];
        }
    }

    // Function to render a single tool card
    function renderToolCard(tool, options = {}) {
        // options: { simple: true } for home page slider
        const shortDescription = tool.description ? tool.description.slice(0, 35).replace(/\s+$/, '') + (tool.description.length > 35 ? '…' : '') : '';
        if (options.simple) {
            // Restore original, larger, detailed card for home page slider
            const badgeHtml = tool.badge ? `<span class="badge ${tool.badge.toLowerCase().replace("'", "").replace(" ", "-")}">${tool.badge}</span>` : '';
            const ratingStars = tool.rating ? '<i class="fas fa-star" style="color:#fbbf24;"></i>'.repeat(Math.round(tool.rating)) : '';
            const ratingHtml = tool.rating ? `<span class="rating-stars">${ratingStars}</span> <span class="rating-count">(${tool.rating ? tool.rating.toFixed(1) : '0'})</span>` : '';
            return `
                <div class="tool-card slider-item" style="min-width:340px;max-width:380px;">
                    <div class="card-header">
                        <img src="${tool.imageUrl}" alt="${tool.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/333333?text=Image+Not+Found';" loading="lazy">
                        ${badgeHtml}
                    </div>
                    <div class="card-body">
                        <h4 style="font-size:1.18rem;">${tool.name}</h4>
                        <div class="rating" style="margin-bottom:0.3rem;">${ratingHtml}</div>
                        <p class="tool-description" style="font-size:1.01rem;line-height:1.5;max-height:3.2em;">${shortDescription}</p>
                        <button class="view-details-btn" onclick="window.open('${tool.websiteUrl}', '_blank')">View Details <i class="fas fa-arrow-right" style="color:#6366f1;"></i></button>
                    </div>
                </div>
            `;
        }
        // For tools page: concise info, no hashtags, no extra icons
        const featuresText = tool.features ? tool.features.join(', ') : '';
        const ratingStars = tool.rating ? '<i class="fas fa-star" style="color:#fbbf24;"></i>'.repeat(Math.round(tool.rating)) : '';
        const ratingHtml = tool.rating ? `<span class="rating-stars">${ratingStars}</span> <span class="rating-count">(${tool.rating ? tool.rating.toFixed(1) : '0'})</span>` : '';
        return `
            <div class="tool-card slider-item">
                <div class="card-header">
                    <img src="${tool.imageUrl}" alt="${tool.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/333333?text=Image+Not+Found';" loading="lazy">
                </div>
                <div class="card-body">
                    <h4>${tool.name}</h4>
                    <div style="font-size:0.93rem;color:var(--text-light);margin-bottom:0.2rem;">${tool.pricingModel ? tool.pricingModel : ''}</div>
                    <div style="font-size:0.93rem;color:var(--text-light);margin-bottom:0.2rem;">${featuresText}${featuresText && tool.category ? ' · ' : ''}${tool.category ? tool.category : ''}</div>
                    <div class="rating" style="margin-bottom:0.3rem;">${ratingHtml}</div>
                    <p class="tool-description">${shortDescription}</p>
                    <button class="view-details-btn" onclick="window.open('${tool.websiteUrl}', '_blank')">Visit <i class="fas fa-external-link-alt" style="color:#6366f1;"></i></button>
                </div>
            </div>
        `;
    }

    // Helper to get a suitable Font Awesome icon for categories
    function getCategoryIcon(category) {
        switch (category) {
            case 'Text Generation': return 'keyboard';
            case 'Image Generation': return 'image';
            case 'Video Editing': return 'video';
            case 'Audio Processing': return 'headphones';
            case 'Code Assistance': return 'code';
            case 'Data Analysis': return 'chart-area';
            case 'Marketing': return 'bullhorn';
            case 'Productivity': return 'cogs';
            case 'Education': return 'book';
            case 'Research': return 'flask';
            case 'Healthcare': return 'heartbeat';
            case 'AI Agents/Automation': return 'robot';
            case 'HR & Recruiting': return 'user-tie';
            case 'Sales': return 'handshake';
            case 'Security & Compliance': return 'shield-alt';
            case 'IT & Operations': return 'server';
            case 'Design': return 'palette';
            case 'Other': return 'th-large';
            default: return 'th-large';
        }
    }

    // --- Home Page Specific Functionality (index.html) ---
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        const heroSearchInput = document.getElementById('heroSearchInput');
        const heroSearchButton = document.getElementById('heroSearchButton');
        const editorChoiceCard = document.getElementById('editorChoiceCard');
        const hotRightNowSlider = document.getElementById('hotRightNowSlider');
        const toolsListedCount = document.getElementById('toolsListedCount');
        const categoriesCount = document.getElementById('categoriesCount');
        const homeCategoryGrid = document.getElementById('homeCategoryGrid');
        const newsletterEmailInput = document.getElementById('newsletterEmailInput');
        const subscribeButton = document.getElementById('subscribeButton');

        // Hero Search Bar functionality
        if (heroSearchButton && heroSearchInput) {
            const performSearch = () => {
                const query = heroSearchInput.value.trim();
                window.location.href = `tools.html?search=${encodeURIComponent(query)}`;
            };
            heroSearchButton.addEventListener('click', performSearch);
            heroSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Render Editor's Choice tool
        async function renderEditorChoice() {
            allTools = await fetchToolsData(); // Ensure allTools is populated
            const editorTool = allTools.find(tool => tool.badge === "Editor's Choice");

            if (editorTool && editorChoiceCard) {
                editorChoiceCard.innerHTML = `
                    <div class="card-image">
                        <img src="${editorTool.imageUrl}" alt="${editorTool.name}" onerror="this.onerror=null;this.src='https://placehold.co/450x300/CCCCCC/333333?text=Image+Not+Found';" loading="lazy">
                    </div>
                    <div class="card-content">
                        <h3>${editorTool.name}</h3>
                        <p class="tool-description">${editorTool.description}</p>
                        <div class="card-tags">
                            ${editorTool.features.map(feature => `<span class="tag">${feature}</span>`).join('')}
                            <span class="tag">${editorTool.category}</span>
                        </div>
                        <div class="card-actions">
                            <button class="view-details-btn" onclick="window.open('${editorTool.websiteUrl}', '_blank')"><i class="fas fa-eye"></i> View Details</button>
                            <button class="add-favorite-btn" onclick="alert('Added ${editorTool.name} to favorites! (Requires user account functionality)')"><i class="fas fa-heart"></i> Add to Favorites</button>
                        </div>
                    </div>
                `;
            } else if (editorChoiceCard) {
                editorChoiceCard.innerHTML = `
                    <div class="message-card" style="background-color: #fffbe2; border-color: #fde047; color: #a16207; width: 100%; margin: 1rem 0;">
                        <p><i class="fas fa-info-circle"></i> No Editor's Choice tool found yet! Add one via admin panel and set its badge.</p>
                    </div>
                `;
            }
        }

        // Render Hot Right Now tools for slider
        async function renderHotRightNowSlider() {
            allTools = await fetchToolsData(); // Ensure allTools is populated
            const hotTools = [...allTools].sort((a, b) => b.views - a.views).slice(0, 9); // Get top 9 most viewed

            if (hotTools.length > 0 && hotRightNowSlider) {
                hotRightNowSlider.innerHTML = hotTools.map(tool => renderToolCard(tool, { simple: true })).join('');
                startAutoSlide(); // Re-initiate auto-slide after content load
            } else if (hotRightNowSlider) {
                hotRightNowSlider.innerHTML = `
                    <div class="message-card" style="background-color: #e0f2fe; border-color: #60a5fa; color: #1e40af; width: 100%; margin: 1rem 0;">
                        <p><i class="fas fa-info-circle"></i> No trending tools to display yet. Add some tools with views!</p>
                    </div>
                `;
            }
        }

        // Update counts for Hero section
        function updateHeroStats() {
            if (toolsListedCount) {
                toolsListedCount.textContent = `${allTools.length}+`;
            }
            if (categoriesCount) {
                const uniqueCategories = new Set(allTools.map(tool => tool.category));
                categoriesCount.textContent = `${uniqueCategories.size}+`;
            }
        }

        // Populate Home Page Category Grid
        function populateHomeCategories() {
            if (!homeCategoryGrid) return;
            const categoriesMap = {};
            allTools.forEach(tool => {
                categoriesMap[tool.category] = (categoriesMap[tool.category] || 0) + 1;
            });

            const categoryHtml = Object.entries(categoriesMap).map(([category, count]) => `
                <div class="category-item">
                    <i class="fas fa-${getCategoryIcon(category)}"></i>
                    <h4>${category}</h4>
                    <span>${count} Tools</span>
                </div>
            `).join('');

            if (Object.keys(categoriesMap).length > 0) {
                homeCategoryGrid.innerHTML = categoryHtml;
            } else {
                homeCategoryGrid.innerHTML = `
                    <div class="message-card" style="background-color: #fffbe2; border-color: #fde047; color: #a16207; width: 100%; grid-column: 1 / -1;">
                        <p><i class="fas fa-info-circle"></i> No categories to display. Add some tools first!</p>
                    </div>
                `;
            }
        }


        // Slider functionality for hot-right-now-section
        const sliderWrapper = document.querySelector('.slider-wrapper');
        const prevBtn = document.querySelector('.slider-btn.prev-btn');
        const nextBtn = document.querySelector('.slider-btn.next-btn');
        let autoSlideInterval;

        if (sliderWrapper && prevBtn && nextBtn) {
            let scrollAmount = 0;
            const getCardWidth = () => {
                const firstCard = sliderWrapper.querySelector('.slider-item');
                return firstCard ? firstCard.offsetWidth + parseFloat(getComputedStyle(sliderWrapper).gap) : 300 + 24;
            };

            const slideNext = () => {
                scrollAmount += getCardWidth();
                if (scrollAmount >= sliderWrapper.scrollWidth - sliderWrapper.clientWidth + 1) {
                    scrollAmount = 0; // Loop back to start
                }
                sliderWrapper.scrollTo({ left: scrollAmount, behavior: 'smooth' });
            };

            const slidePrev = () => {
                scrollAmount -= getCardWidth();
                if (scrollAmount < 0) {
                    scrollAmount = sliderWrapper.scrollWidth - sliderWrapper.clientWidth; // Loop to end
                }
                sliderWrapper.scrollTo({ left: scrollAmount, behavior: 'smooth' });
            };

            nextBtn.addEventListener('click', () => { slideNext(); stopAutoSlide(); startAutoSlide(); });
            prevBtn.addEventListener('click', () => { slidePrev(); stopAutoSlide(); startAutoSlide(); });

            const startAutoSlide = () => {
                stopAutoSlide();
                autoSlideInterval = setInterval(slideNext, 2000); // 2 seconds
            };

            const stopAutoSlide = () => {
                clearInterval(autoSlideInterval);
            };

            sliderWrapper.addEventListener('mouseenter', stopAutoSlide);
            sliderWrapper.addEventListener('mouseleave', startAutoSlide);
        }

        // Newsletter Subscription
        if (subscribeButton && newsletterEmailInput) {
            subscribeButton.addEventListener('click', async () => {
                const email = newsletterEmailInput.value.trim();
                if (!email) {
                    alert('Please enter your email address.');
                    return;
                }
                if (!email.includes('@') || !email.includes('.')) {
                    alert('Please enter a valid email address.');
                    return;
                }

                try {
                    const response = await fetch('/api/subscribe-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    const result = await response.json();
                    if (response.ok) {
                        alert(result.message);
                        newsletterEmailInput.value = ''; // Clear input
                    } else {
                        alert('Subscription failed: ' + result.message);
                    }
                } catch (error) {
                    console.error('Error subscribing:', error);
                    alert('An error occurred during subscription. Please try again.');
                }
            });
        }


        // Initialize Home Page Content
        fetchToolsData().then(data => {
            allTools = data; // Assign fetched data to global allTools
            updateHeroStats();
            renderEditorChoice();
            renderHotRightNowSlider();
            populateHomeCategories();
        });
    }

    // --- Tools Page Specific Functionality (tools.html) ---
    if (window.location.pathname.includes('tools.html')) {
        const toolsListingGrid = document.getElementById('toolsListingGrid');
        const toolSearchInput = document.getElementById('toolSearchInput');
        const categoryFilterList = document.getElementById('categoryFilterList');
        const pricingFilterList = document.getElementById('pricingFilterList');
        const sortOrderSelect = document.getElementById('sortOrder');
        const showingResultsText = document.getElementById('showingResultsText');
        const totalToolsCountDisplay = document.getElementById('totalToolsCount');
        const noResultsMessage = document.getElementById('noResultsMessage');

        let filteredTools = []; // Tools currently filtered and displayed

        let currentFilters = {
            category: 'All',
            pricing: 'All',
            searchText: ''
        };
        let currentSort = 'highestRated';

        // Read search query from URL if coming from index.html
        const urlParams = new URLSearchParams(window.location.search);
        const initialSearchQuery = urlParams.get('search');
        if (initialSearchQuery && toolSearchInput) {
            currentFilters.searchText = decodeURIComponent(initialSearchQuery);
            toolSearchInput.value = currentFilters.searchText; // Populate search input
        }

        // Function to update the tools listing grid based on filters and sort
        function updateToolsListing() {
            if (!toolsListingGrid) return;

            filteredTools = allTools.filter(tool => {
                const matchesCategory = currentFilters.category === 'All' || tool.category === currentFilters.category;
                const matchesPricing = currentFilters.pricing === 'All' || tool.pricingModel === currentFilters.pricing;
                const matchesSearch = tool.name.toLowerCase().includes(currentFilters.searchText.toLowerCase()) ||
                                      tool.description.toLowerCase().includes(currentFilters.searchText.toLowerCase()) ||
                                      (tool.features && tool.features.some(f => f.toLowerCase().includes(currentFilters.searchText.toLowerCase())));
                return matchesCategory && matchesPricing && matchesSearch;
            });

            filteredTools.sort((a, b) => {
                if (currentSort === 'highestRated') {
                    return b.rating - a.rating;
                } else if (currentSort === 'mostPopular') {
                    return b.views - a.views;
                } else if (currentSort === 'newest') {
                    // Assuming 'id' contains a timestamp or is sequential enough.
                    // For truly newest, add a 'createdAt' timestamp to your tool objects.
                    return b.id.localeCompare(a.id); // Simple string comparison for IDs
                } else if (currentSort === 'alphabetical') {
                    return a.name.localeCompare(b.name);
                }
                return 0;
            });

            if (filteredTools.length > 0) {
                toolsListingGrid.innerHTML = filteredTools.map(renderToolCard).join('');
                noResultsMessage.style.display = 'none';
            } else {
                toolsListingGrid.innerHTML = '';
                noResultsMessage.style.display = 'block';
            }

            if (showingResultsText) {
                showingResultsText.textContent = `Showing ${filteredTools.length} of ${allTools.length} tools`;
            }
            if (totalToolsCountDisplay) {
                totalToolsCountDisplay.textContent = `Discover ${allTools.length} AI tools to transform your workflow.`;
            }
            updateCategoryCounts();
        }

        function updateCategoryCounts() {
            if (!categoryFilterList) return;

            const categories = {};
            allTools.forEach(tool => {
                categories[tool.category] = (categories[tool.category] || 0) + 1;
            });

            const existingDynamicCategories = categoryFilterList.querySelectorAll('li:not(:first-child)');
            existingDynamicCategories.forEach(li => li.remove());

            const allCategoryCountSpan = document.getElementById('allCategoryCount');
            if (allCategoryCountSpan) {
                allCategoryCountSpan.textContent = `(${allTools.length})`;
            }

            // Sort categories alphabetically before rendering
            const sortedCategories = Object.keys(categories).sort();

            sortedCategories.forEach(category => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = "#";
                a.dataset.category = category;
                const iconClass = getCategoryIcon(category);
                a.innerHTML = `<i class="fas fa-${iconClass}"></i> ${category} <span>(${categories[category]})</span>`;
                if (currentFilters.category === category) {
                    a.classList.add('active');
                }
                li.appendChild(a);
                categoryFilterList.appendChild(li);
            });

            attachFilterEventListeners();
        }

        function attachFilterEventListeners() {
            const categoryLinks = categoryFilterList ? categoryFilterList.querySelectorAll('a') : [];
            categoryLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    categoryLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    currentFilters.category = link.dataset.category;
                    updateToolsListing();
                });
            });

            const pricingLinks = pricingFilterList ? pricingFilterList.querySelectorAll('a') : [];
            pricingLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    pricingLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    currentFilters.pricing = link.dataset.pricing;
                    updateToolsListing();
                });
            });
        }

        if (toolSearchInput) {
            toolSearchInput.addEventListener('input', () => {
                currentFilters.searchText = toolSearchInput.value.trim();
                updateToolsListing();
            });
        }

        if (sortOrderSelect) {
            sortOrderSelect.addEventListener('change', () => {
                currentSort = sortOrderSelect.value;
                updateToolsListing();
            });
        }

        // Initialize Tools page content
        fetchToolsData().then(data => {
            allTools = data;
            updateToolsListing(); // This will trigger category and overall counts
        });
    }

    // --- Admin Add Tool Page (add-tool.html) Functionality ---
    if (window.location.pathname.includes('add-tool.html')) {
        const adminContent = document.getElementById('adminContent');
        const adminAuthMessage = document.getElementById('adminAuthMessage');
        const authMessageText = document.getElementById('authMessageText');
        const adminAuthButton = document.getElementById('adminAuthButton');
        const addToolForm = document.getElementById('addToolForm');

        // Note: ADMIN_FRONTEND_KEY is not strictly needed here as the key is prompted
        // and sent directly to the backend for verification.
        // const ADMIN_FRONTEND_KEY = 'your_super_secret_admin_key'; // Removed as it's not used for comparison

        // Function to attempt admin authentication
        async function authenticateAdmin() {
            // Show loading or prompt state
            if (authMessageText) {
                authMessageText.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Checking admin access...`;
                adminAuthMessage.style.display = 'flex';
                adminAuthMessage.style.backgroundColor = '#e0f2fe'; // Blue for info
                adminAuthMessage.style.borderColor = '#60a5fa';
                adminAuthMessage.style.color = '#1e40af';
                if (adminAuthButton) adminAuthButton.style.display = 'none'; // Hide button while checking
            }


            const storedKey = sessionStorage.getItem('adminKey'); // Check if key is already stored
            let keyToSend = storedKey;

            if (!keyToSend) {
                // If not stored, prompt the user for the key
                keyToSend = prompt("Please enter the admin key:");
                if (!keyToSend) { // User cancelled or entered empty
                    showAccessDenied('Authentication cancelled.');
                    return;
                }
            }

            try {
                const response = await fetch('/api/check-admin', {
                    method: 'GET',
                    headers: {
                        'X-Admin-Key': keyToSend // Send the key in a custom header
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.authenticated) {
                        sessionStorage.setItem('adminKey', keyToSend); // Store key if successful
                        showAccessGranted();
                    } else {
                        // If authentication failed, clear stored key (if any) and prompt again
                        sessionStorage.removeItem('adminKey');
                        showAccessDenied(result.message || 'Authentication failed.');
                    }
                } else {
                    // Handle HTTP errors (e.g., 500 server error)
                    const errorData = await response.json();
                    sessionStorage.removeItem('adminKey'); // Clear stored key on server error
                    showAccessDenied(errorData.message || 'Server error during authentication.');
                }
            } catch (error) {
                console.error('Error during admin authentication:', error);
                sessionStorage.removeItem('adminKey'); // Clear stored key on network error
                showAccessDenied('Could not connect to authentication server. Please try again or check server status.');
            }
        }

        // Functions to update UI based on authentication status
        function showAccessGranted() {
            if (adminContent) adminContent.style.display = 'block';
            if (adminAuthMessage) adminAuthMessage.style.display = 'none';
        }

        function showAccessDenied(message) {
            if (adminContent) adminContent.style.display = 'none';
            if (adminAuthMessage) {
                adminAuthMessage.style.display = 'flex';
                adminAuthMessage.style.backgroundColor = '#fee2e2'; // Red for error
                adminAuthMessage.style.borderColor = '#ef4444';
                adminAuthMessage.style.color = '#dc2626';
            }
            if (authMessageText) authMessageText.innerHTML = `<i class="fas fa-lock"></i> ${message}`;
            if (adminAuthButton) {
                adminAuthButton.style.display = 'block'; // Show button to retry
                adminAuthButton.textContent = 'Retry Authentication';
            }
        }

        // Initial check on page load for admin access
        authenticateAdmin();
        if (adminAuthButton) {
            adminAuthButton.addEventListener('click', authenticateAdmin); // Allow retry
        }

        // Handle form submission for Add Tool Form
        if (addToolForm) {
            addToolForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = new FormData(addToolForm);
                const toolData = {};
                for (let [key, value] of formData.entries()) {
                    toolData[key] = value;
                }

                if (toolData.features && toolData.features.trim() !== '') {
                    toolData.features = toolData.features.split(',').map(feature => feature.trim()).filter(feature => feature !== '');
                } else {
                    toolData.features = [];
                }

                toolData.rating = parseFloat(toolData.rating) || 0;
                toolData.views = parseInt(toolData.views, 10) || 0;

                // Ensure 'id' is generated here, or let backend do it, but send a placeholder if needed
                toolData.id = `${toolData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

                const adminKey = sessionStorage.getItem('adminKey'); // Get key from session storage

                try {
                    const response = await fetch('/api/add-tool', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Admin-Key': adminKey // Send admin key with the request
                        },
                        body: JSON.stringify(toolData),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        alert('Tool added successfully! Message: ' + result.message);
                        addToolForm.reset();
                        textInputsWithMaxLength.forEach(input => {
                            const charCountDisplay = document.querySelector(`.char-count[data-target="${input.id}"]`);
                            if (charCountDisplay) charCountDisplay.textContent = `0/${input.getAttribute('maxlength')}`;
                        });
                        console.log('Backend response:', result);
                    } else {
                        const errorData = await response.json();
                        alert('Failed to add tool: ' + (errorData.message || 'Unknown error'));
                        console.error('Backend error:', errorData);
                    }
                } catch (error) {
                    console.error('Error submitting form:', error);
                    alert('An error occurred while trying to add the tool. Ensure your Node.js server is running and accessible.');
                }
            });
        }
    }


    // --- Public Submit Tool Page (submit-tool.html) Functionality ---
    if (window.location.pathname.includes('submit-tool.html')) {
        const publicSubmitToolForm = document.getElementById('publicSubmitToolForm');

        if (publicSubmitToolForm) {
            publicSubmitToolForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = new FormData(publicSubmitToolForm);
                const submittedToolData = {};
                for (let [key, value] of formData.entries()) {
                    submittedToolData[key] = value;
                }

                if (submittedToolData.features && submittedToolData.features.trim() !== '') {
                    submittedToolData.features = submittedToolData.features.split(',').map(feature => feature.trim()).filter(feature => feature !== '');
                } else {
                    submittedToolData.features = [];
                }

                console.log('Sending public tool submission data to backend:', submittedToolData);

                try {
                    const response = await fetch('/api/submit-tool', { // Public submission endpoint
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(submittedToolData),
                    });

                    if (response.ok) {
                        const result = await response.json();
                        alert('Tool suggestion submitted successfully! Message: ' + result.message);
                        publicSubmitToolForm.reset();
                        textInputsWithMaxLength.forEach(input => {
                            const charCountDisplay = document.querySelector(`.char-count[data-target="${input.id}"]`);
                            if (charCountDisplay) charCountDisplay.textContent = `0/${input.getAttribute('maxlength')}`;
                        });
                        console.log('Backend response:', result);
                    } else {
                        const errorData = await response.json();
                        alert('Submission failed: ' + (errorData.message || 'Unknown error'));
                        console.error('Backend error:', errorData);
                    }
                } catch (error) {
                    console.error('Error submitting form:', error);
                    alert('An error occurred during submission. Ensure your Node.js server is running and accessible.');
                }
            });
        }
    }

    // Animated counter for Editor's Choice video section
    function animateCounter(id, target, duration) {
        const el = document.getElementById(id);
        if (!el) return;
        let start = 0;
        const increment = Math.ceil(target / (duration / 16));
        function update() {
            start += increment;
            if (start >= target) {
                el.textContent = target.toLocaleString();
            } else {
                el.textContent = start.toLocaleString();
                requestAnimationFrame(update);
            }
        }
        update();
    }
    document.addEventListener('DOMContentLoaded', function() {
        animateCounter('counter', 12000, 1800);
    });

    // Read More/Show Less toggle for tool descriptions
    function setupReadMoreToggles() {
        const maxLen = 15;
        document.querySelectorAll('.tool-description').forEach(desc => {
            const fullText = desc.textContent.trim();
            if (fullText.length > maxLen) {
                const shortText = fullText.slice(0, maxLen) + '...';
                desc.innerHTML = `<span class="desc-short">${shortText}</span><span class="desc-full" style="display:none;">${fullText}</span> <a href="#" class="read-more-toggle">Read More</a>`;
                const toggle = desc.querySelector('.read-more-toggle');
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    const shortSpan = desc.querySelector('.desc-short');
                    const fullSpan = desc.querySelector('.desc-full');
                    if (shortSpan.style.display !== 'none') {
                        shortSpan.style.display = 'none';
                        fullSpan.style.display = '';
                        toggle.textContent = 'Show Less';
                    } else {
                        shortSpan.style.display = '';
                        fullSpan.style.display = 'none';
                        toggle.textContent = 'Read More';
                    }
                });
            }
        });
    }
    document.addEventListener('DOMContentLoaded', function() {
        setupReadMoreToggles();
    });
});
