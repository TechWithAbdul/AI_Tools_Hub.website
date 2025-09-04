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
            const response = await fetch('/api/tools');
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
        // Card badges
        const trendingBadge = tool.badge ? `<span class="trending-badge" style="position:absolute;top:0.8rem;right:0.8rem;z-index:2;background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%);color:#fff;font-size:0.75rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:0.6rem;box-shadow:0 2px 8px rgba(245,158,11,0.3);">${tool.badge}</span>` : '';
        const ratingBadge = tool.rating ? `<span class="rating-badge" style="position:absolute;top:0.8rem;left:0.8rem;z-index:2;background:#fff;color:#222;padding:0.2rem 0.6rem;border-radius:0.6rem;font-weight:600;font-size:0.85rem;box-shadow:0 2px 6px rgba(0,0,0,0.07);"><i class='fas fa-star' style='color:#fbbf24;'></i> ${tool.rating.toFixed(1)}</span>` : '';
        const categoryBadge = tool.category ? `<span class="category-badge" style="color:#6366f1;font-weight:600;font-size:0.85rem;">${tool.category}</span>` : '';
        const pricingBadge = tool.pricingModel ? `<span class="pricing-badge" style="background:#d1fae5;color:#059669;font-size:0.85rem;font-weight:600;padding:0.2rem 0.6rem;border-radius:0.6rem;margin-left:0.4rem;">${tool.pricingModel}</span>` : '';
        const usersHtml = tool.views ? `<span class="users-count" style="color:#6366f1;font-size:0.85rem;"><i class="fas fa-users"></i> ${tool.views.toLocaleString()} users</span>` : '';
        const detailLink = `<a href="https://www.google.com/search?q=${encodeURIComponent(tool.name + ' ' + (tool.category || 'AI tool'))}" target="_blank" rel="noopener" class="view-details-btn" style="color:#fff;background:linear-gradient(90deg,#a855f7 0%,#6366f1 100%);font-weight:600;float:right;font-size:0.85rem;padding:0.45rem 0.8rem;border-radius:0.55rem;">View Details <i class="fas fa-arrow-right"></i></a>`;
        
        // Compute best-guess image source: provided imageUrl, else Clearbit logo of website domain
        let computedLogo = '';
        try {
            if (tool.websiteUrl) {
                const urlObj = new URL(tool.websiteUrl);
                const host = urlObj.hostname;
                computedLogo = `https://logo.clearbit.com/${host}?size=256`;
            }
        } catch (_) {}
        const imageSrc = (tool.imageUrl && tool.imageUrl.trim() !== '') ? tool.imageUrl : (computedLogo || 'assets/logos/artools-ai.svg');
        
        // Card image
        const imageHtml = `<div style="position:relative;width:100%;height:120px;overflow:hidden;border-top-left-radius:0.9rem;border-top-right-radius:0.9rem;background:#f3f4f6;">
            <img src="${imageSrc}" alt="${tool.name}" style="width:100%;height:100%;object-fit:contain;display:block;background:#fff;transition:transform .2s ease;" onerror="if(this.dataset.fallback!=='1'){this.dataset.fallback='1';try{const u=new URL('${tool.websiteUrl||''}');this.src='https://www.google.com/s2/favicons?domain='+u.hostname+'&sz=128';}catch(e){this.src='assets/logos/artools-ai.svg';}}" loading="lazy">
            ${trendingBadge}${ratingBadge}
        </div>`;
        
        // Card content
        return `
        <div class="tool-card slider-item" style="background:#fff;border-radius:0.9rem;box-shadow:0 2px 8px rgba(99,102,241,0.07);padding:0;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;min-height:240px;border:1px solid #e5e7eb;">
            ${imageHtml}
            <div style="padding:1rem 1rem 0.7rem 1rem;flex:1;display:flex;flex-direction:column;gap:0.3rem;">
                <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.2rem;">${categoryBadge}${pricingBadge}</div>
                <div style="font-size:1rem;font-weight:700;color:#1f2937;margin-bottom:0.1rem;">${tool.name}</div>
                <div style="color:#4b5563;font-size:0.9rem;margin-bottom:0.2rem;line-height:1.4;max-height:2.8em;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${tool.description}</div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:auto;margin-bottom:0.2rem;">
                    ${usersHtml}
                    ${detailLink}
                </div>
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
        const hotRightNowGrid = document.getElementById('hotRightNowGrid');
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

        // Render Editor's Choice tools as a single card, swapping content with slide animation and swipe/drag support
        async function renderEditorChoiceSingleCard() {
            allTools = await fetchToolsData();
            const editorTools = allTools.filter(tool => ["Editor's Choice", "Trending", "New"].includes(tool.badge)).slice(0, 4);
            const cardContainer = document.getElementById('editorChoiceCard');
            const dots = document.getElementById('editorChoiceDots');
            if (!cardContainer || !dots) return;
            if (editorTools.length === 0) {
                cardContainer.innerHTML = `<div class='message-card' style='background:#fffbe2;border-color:#fde047;color:#a16207;width:100%;margin:1rem 0;padding:2rem 1rem;text-align:center;border-radius:1rem;'>No Editor's Choice tools found yet!</div>`;
                dots.innerHTML = '';
                return;
            }
            let current = 0;
            let animating = false;
            function renderCard(idx, direction = 0) {
                // direction: 0 = instant, 1 = right, -1 = left
                const tool = editorTools[idx];
                // Compute best-guess image source for editor card
                let computedLogo = '';
                try {
                    if (tool.websiteUrl) {
                        const u = new URL(tool.websiteUrl);
                        computedLogo = `https://logo.clearbit.com/${u.hostname}?size=256`;
                    }
                } catch (_) {}
                const editorImageSrc = (tool.imageUrl && tool.imageUrl.trim() !== '') ? tool.imageUrl : (computedLogo || 'assets/logos/artools-ai.svg');
                const cardHtml = `
                <div class="editor-choice-slide" style="display:flex;align-items:center;justify-content:space-between;width:100%;max-width:820px;background:linear-gradient(135deg,#fafbff 0%,#f3e8ff 100%);border-radius:1.5rem;box-shadow:0 8px 32px rgba(99,102,241,0.12);padding:2.2rem 2.5rem;gap:2.5rem;border:2px solid #e5e7eb;">
                    <div style="flex:1;display:flex;flex-direction:column;justify-content:center;min-width:0;">
                        <div style="margin-bottom:0.7rem;">
                            <span class='tag' style='background:#eef2ff;color:#6366f1;font-size:1rem;font-weight:600;padding:0.4rem 1.1rem;border-radius:0.7rem;margin-right:0.7rem;box-shadow:0 2px 8px rgba(99,102,241,0.1);'>${tool.category || ''}</span>
                            <span class='trending-badge' style='background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%);color:#fff;font-size:0.8rem;font-weight:700;padding:0.3rem 0.8rem;border-radius:0.8rem;box-shadow:0 4px 12px rgba(245,158,11,0.3);animation:pulse 2s infinite;'>🔥 Featured</span>
                    </div>
                        <h3 style="font-size:2rem;font-weight:800;margin-bottom:0.7rem;color:#1f2937;background:linear-gradient(135deg,#a855f7 0%,#6366f1 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${tool.name}</h3>
                        <p style="font-size:1.08rem;color:#4b5563;margin-bottom:1.1rem;line-height:1.6;">${tool.description}</p>
                        <div style="display:flex;align-items:center;gap:1.1rem;margin-bottom:1.1rem;flex-wrap:wrap;">
                            <span style="color:#fbbf24;font-size:1.1rem;font-weight:700;"><i class='fas fa-star'></i> ${tool.rating ? tool.rating.toFixed(1) : '4.5'}</span>
                            <span style="color:#6b7280;font-size:1rem;"><i class='fas fa-users'></i> ${tool.views ? tool.views.toLocaleString() + ' users' : '1K+ users'}</span>
                            ${tool.pricingModel ? `<span class='tag' style='background:#d1fae5;color:#059669;font-size:1rem;font-weight:600;padding:0.3rem 1rem;border-radius:0.7rem;box-shadow:0 2px 8px rgba(5,150,105,0.1);'>${tool.pricingModel}</span>` : ''}
                        </div>
                        <div style="display:flex;gap:1.1rem;flex-wrap:wrap;">
                            <a href="${tool.websiteUrl}" class="view-details-btn" style="background:linear-gradient(90deg,#a855f7 0%,#6366f1 100%);color:#fff;font-weight:600;padding:0.8rem 2rem;border-radius:0.7rem;font-size:1.1rem;box-shadow:0 4px 16px rgba(99,102,241,0.2);transition:all 0.3s ease;">Learn More <i class="fas fa-arrow-right"></i></a>
                            <a href="${tool.websiteUrl}" class="add-favorite-btn" style="background:#fff;color:#8b5cf6;border:2px solid #8b5cf6;font-weight:600;padding:0.8rem 2rem;border-radius:0.7rem;font-size:1.1rem;transition:all 0.3s ease;">Visit Website <i class="fas fa-external-link-alt"></i></a>
                        </div>
                    </div>
                    <div style="flex:1;display:flex;align-items:center;justify-content:center;min-width:0;">
                        <img src="${editorImageSrc}" alt="${tool.name}" style="width:320px;height:200px;object-fit:contain;border-radius:1.1rem;box-shadow:0 8px 24px rgba(99,102,241,0.15);border:4px solid #eef2ff;margin-left:1.5rem;background:#fff;" onerror="if(this.dataset.fallback!=='1'){this.dataset.fallback='1';try{const u=new URL('${tool.websiteUrl||''}');this.src='https://www.google.com/s2/favicons?domain='+u.hostname+'&sz=128';}catch(e){this.src='assets/logos/artools-ai.svg';}}">
                    </div>
                    </div>
                `;
                cardContainer.innerHTML = cardHtml;
                /* Flip animation removed to keep image persistent */
                Array.from(dots.children).forEach((dot, i) => {
                    dot.style.background = i === idx ? '#6366f1' : '#e5e7eb';
                });
            }
            function animateTo(next, direction) {
                if (animating || next === current) return;
                animating = true;
                const oldCard = cardContainer.firstElementChild;
                if (oldCard) {
                    oldCard.classList.remove('editor-choice-flip-in');
                    oldCard.classList.add('editor-choice-flip-out');
                }
                setTimeout(() => {
                    renderCard(next, direction);
                    animating = false;
                }, 500);
                current = next;
            }
            // Render dots
            dots.innerHTML = editorTools.map((_, i) => `<span class="carousel-dot" data-index="${i}" style="width:13px;height:13px;border-radius:50%;background:#e5e7eb;display:inline-block;cursor:pointer;"></span>`).join('');
            renderCard(current, 0);
            // Auto-advance
            let interval = setInterval(() => {
                animateTo((current + 1) % editorTools.length, 1);
            }, 4000);
            // Dots click
            Array.from(dots.children).forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    if (i === current) return;
                    clearInterval(interval);
                    animateTo(i, i > current ? 1 : -1);
                    interval = setInterval(() => {
                        animateTo((current + 1) % editorTools.length, 1);
                    }, 4000);
                });
            });
            // Touch/drag/mouse swipe
            let startX = 0, dx = 0, dragging = false;
            cardContainer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; });
            cardContainer.addEventListener('touchmove', e => { if (!dragging) return; dx = e.touches[0].clientX - startX; });
            cardContainer.addEventListener('touchend', () => {
                if (Math.abs(dx) > 50) {
                    clearInterval(interval);
                    if (dx < 0) animateTo((current + 1) % editorTools.length, 1);
                    else animateTo((current - 1 + editorTools.length) % editorTools.length, -1);
                    interval = setInterval(() => {
                        animateTo((current + 1) % editorTools.length, 1);
                    }, 4000);
                }
                dragging = false; dx = 0;
            });
            // Mouse drag for desktop
            let mouseDown = false, mouseStartX = 0, mouseDx = 0;
            cardContainer.addEventListener('mousedown', e => { mouseDown = true; mouseStartX = e.clientX; });
            cardContainer.addEventListener('mousemove', e => { if (!mouseDown) return; mouseDx = e.clientX - mouseStartX; });
            cardContainer.addEventListener('mouseup', () => {
                if (Math.abs(mouseDx) > 50) {
                    clearInterval(interval);
                    if (mouseDx < 0) animateTo((current + 1) % editorTools.length, 1);
                    else animateTo((current - 1 + editorTools.length) % editorTools.length, -1);
                    interval = setInterval(() => {
                        animateTo((current + 1) % editorTools.length, 1);
                    }, 4000);
                }
                mouseDown = false; mouseDx = 0;
            });
            cardContainer.addEventListener('mouseleave', () => { mouseDown = false; mouseDx = 0; });
        }

        // Render Hot Right Now tools for grid (not slider)
        async function renderHotRightNowGrid() {
            allTools = await fetchToolsData(); // Ensure allTools is populated
            const hotTools = [...allTools].sort((a, b) => b.views - a.views).slice(0, 6); // Get top 6 most viewed

            if (hotTools.length > 0 && hotRightNowGrid) {
                hotRightNowGrid.innerHTML = hotTools.map(tool => `<div class='hot-grid-item'>${renderToolCard(tool, { simple: true })}</div>`).join('');
            } else if (hotRightNowGrid) {
                hotRightNowGrid.innerHTML = `
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

        // Populate Home Page Category Grid with smaller cards
        function populateHomeCategories() {
            if (!homeCategoryGrid) return;
            const categoriesMap = {};
            allTools.forEach(tool => {
                categoriesMap[tool.category] = (categoriesMap[tool.category] || 0) + 1;
            });

            const categoryHtml = Object.entries(categoriesMap).map(([category, count]) => `
                <a href="tools.html?category=${encodeURIComponent(category)}" class="category-link">
                <div class="category-item" style="padding:1.2rem 0.8rem;text-align:center;">
                    <i class="fas fa-${getCategoryIcon(category)}" style="font-size:1.8rem;color:#6366f1;margin-bottom:0.7rem;"></i>
                    <h4 style="font-size:1rem;font-weight:600;margin-bottom:0.3rem;color:#1f2937;">${category}</h4>
                    <span style="font-size:0.8rem;color:#6b7280;">${count} Tools</span>
                </div>
                </a>
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
            renderEditorChoiceSingleCard();
            renderHotRightNowGrid();
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

        // Read search and category query from URL if coming from index.html
        const urlParams = new URLSearchParams(window.location.search);
        const initialSearchQuery = urlParams.get('search');
        const initialCategoryQuery = urlParams.get('category');
        if (initialSearchQuery && toolSearchInput) {
            currentFilters.searchText = decodeURIComponent(initialSearchQuery);
            toolSearchInput.value = currentFilters.searchText; // Populate search input
        }
        if (initialCategoryQuery) {
            currentFilters.category = decodeURIComponent(initialCategoryQuery);
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


    // --- Public Submit Tool Page (submit.html) Functionality ---
    if (false) {
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

// --- Submit Tool Form Interactivity & Validation ---
(function() {
    const form = document.getElementById('publicSubmitToolForm');
    if (!form) return;
    const submitBtn = document.getElementById('submitToolBtn');
    const formMessage = document.getElementById('formMessage');
    const progressBar = document.getElementById('formProgressBar');
    const imageUrlInput = document.getElementById('submitImageUrl');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const charCountShortDesc = document.querySelector('.char-count[data-target="submitShortDescription"]');
    const requiredFields = [
        'submitToolName',
        'submitShortDescription',
        'submitDetailedDescription',
        'submitWebsiteUrl',
        'submitToolCategory',
        'submitPricingModel',
        'submitYourName',
        'submitYourEmail'
    ];
    // Helper: Show error for a field
    function showError(fieldId, message) {
        const errorDiv = document.getElementById('error-' + fieldId);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
    // Helper: Hide error for a field
    function hideError(fieldId) {
        const errorDiv = document.getElementById('error-' + fieldId);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    }
    // Helper: Validate a single field
    function validateField(field) {
        const id = field.id;
        const value = field.value.trim();
        if (field.required && !value) {
            showError(id, 'This field is required.');
            return false;
        }
        if (id === 'submitShortDescription' && value.length > 160) {
            showError(id, 'Must be 160 characters or less.');
            return false;
        }
        if (id === 'submitWebsiteUrl' || id === 'submitImageUrl') {
            if (value && !/^https?:\/\//.test(value)) {
                showError(id, 'Please enter a valid URL (must start with http or https).');
                return false;
            }
        }
        if (id === 'submitYourEmail') {
            if (value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
                showError(id, 'Please enter a valid email address.');
                return false;
            }
        }
        hideError(id);
        return true;
    }
    // Validate all fields
    function validateForm() {
        let firstError = null;
        let valid = true;
        requiredFields.forEach(id => {
            const field = document.getElementById(id);
            if (field && !validateField(field)) {
                valid = false;
                if (!firstError) firstError = field;
            }
        });
        return { valid, firstError };
    }
    // Live validation
    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('input', () => {
                validateField(field);
                updateSubmitState();
            });
        }
    });
    // Character count for short description
    if (charCountShortDesc) {
        const input = document.getElementById('submitShortDescription');
        input.addEventListener('input', () => {
            charCountShortDesc.textContent = `${input.value.length}/160`;
        });
    }
    // Image preview
    if (imageUrlInput && imagePreviewContainer) {
        imageUrlInput.addEventListener('input', () => {
            const url = imageUrlInput.value.trim();
            imagePreviewContainer.innerHTML = '';
            imagePreviewContainer.style.display = 'none';
            if (/^https?:\/\/.+\.(jpg|jpeg|png|svg|webp|gif)$/i.test(url)) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Tool Preview';
                img.onload = () => {
                    imagePreviewContainer.style.display = 'flex';
                };
                img.onerror = () => {
                    imagePreviewContainer.style.display = 'none';
                };
                imagePreviewContainer.appendChild(img);
            }
        });
    }
    // Info tooltips (handled by CSS :hover/:focus)
    // Progress bar animation
    function setProgress(percent) {
        if (progressBar) {
            progressBar.style.display = 'block';
            progressBar.style.width = percent + '%';
        }
    }
    function hideProgress() {
        if (progressBar) {
            progressBar.style.display = 'none';
            progressBar.style.width = '0';
        }
    }
    // Enable/disable submit button
    function updateSubmitState() {
        const { valid } = validateForm();
        if (submitBtn) submitBtn.disabled = !valid;
    }
    // Auto-scroll to first error
    function scrollToFirstError(firstError) {
        if (firstError && typeof firstError.scrollIntoView === 'function') {
            setTimeout(() => {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }, 150);
        }
    }
    // Show form message
    function showFormMessage(type, message) {
        if (!formMessage) return;
        formMessage.className = 'form-message ' + type;
        formMessage.textContent = message;
        formMessage.style.display = 'block';
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
    // Handle form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const { valid, firstError } = validateForm();
        if (!valid) {
            showFormMessage('error', 'Please fix the errors highlighted below.');
            scrollToFirstError(firstError);
            return;
        }
        setProgress(30);
        submitBtn.disabled = true;
        showFormMessage('success', 'Submitting your tool...');

        const formData = new FormData(form);
        const submittedToolData = {};
        for (let [key, value] of formData.entries()) {
            submittedToolData[key] = value;
        }
        // Map fields to backend expectations
        submittedToolData.description = submittedToolData.shortDescription || submittedToolData.detailedDescription || '';
        if (submittedToolData.features) {
            submittedToolData.features = submittedToolData.features
                .split('\n')
                .map(f => f.trim())
                .filter(Boolean);
        } else {
            submittedToolData.features = [];
        }
        if (submittedToolData.tags) {
            submittedToolData.tags = submittedToolData.tags
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);
        }

        fetch('/api/submit-tool', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submittedToolData)
        })
        .then(async (response) => {
            const result = await response.json().catch(() => ({}));
            if (response.ok) {
                setProgress(100);
                showFormMessage('success', result.message || '🎉 Tool submitted successfully! Thank you for sharing with the community.');
                form.reset();
                if (imagePreviewContainer) {
                    imagePreviewContainer.innerHTML = '';
                    imagePreviewContainer.style.display = 'none';
                }
            } else {
                showFormMessage('error', 'Submission failed: ' + (result.message || 'Unknown error'));
            }
        })
        .catch((err) => {
            console.error('Error submitting form:', err);
            showFormMessage('error', 'An error occurred during submission. Ensure the server is running.');
        })
        .finally(() => {
            setTimeout(() => {
                hideProgress();
                submitBtn.disabled = false;
                updateSubmitState();
            }, 800);
        });
    });
    // Reset form state
    form.addEventListener('reset', function() {
        setTimeout(() => {
            requiredFields.forEach(id => hideError(id));
            if (formMessage) formMessage.style.display = 'none';
            if (imagePreviewContainer) {
                imagePreviewContainer.innerHTML = '';
                imagePreviewContainer.style.display = 'none';
            }
            hideProgress();
            updateSubmitState();
        }, 100);
    });
    // Initial state
    updateSubmitState();
})();

// --- About Page Real-Time Dashboard Update ---
(function() {
    if (!window.location.pathname.includes('about.html')) return;
    const toolsCountEl = document.getElementById('aboutToolsCount');
    const categoriesCountEl = document.getElementById('aboutCategoriesCount');
    if (!toolsCountEl || !categoriesCountEl) return;
    fetch('/api/tools')
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data)) return;
            toolsCountEl.textContent = data.length;
            const categories = new Set();
            data.forEach(tool => {
                if (tool.category) categories.add(tool.category);
            });
            categoriesCountEl.textContent = categories.size;
        })
        .catch(() => {
            toolsCountEl.textContent = '0';
            categoriesCountEl.textContent = '0';
        });
})();
