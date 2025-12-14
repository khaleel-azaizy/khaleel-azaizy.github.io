document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.section');
    const totalSections = sections.length;
    // Keep breakpoint behavior consistent with CSS: mobile/tablet styles apply at <= 1024px.
    const DESKTOP_BREAKPOINT = 1025;
    const isEnhancedScroll = () => window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches;
    let enhancedScrollEnabled = isEnhancedScroll();
    let currentSection = 0;
    
    function resetSectionsStyles() {
        sections.forEach(section => {
            section.style.transform = '';
            section.style.zIndex = '';
            section.classList.remove('active', 'next', 'prev');
        });
    }
    
    // Initialize sections
    function initSections() {
        if (!enhancedScrollEnabled) {
            resetSectionsStyles();
            return;
        }

        sections.forEach((section, index) => {
            section.style.transform = '';
            section.classList.remove('active', 'next', 'prev');
            
            if (index === 0) {
                section.classList.add('active');
                section.style.transform = 'translateY(0)';
                section.style.zIndex = 10;
            } else {
                section.classList.add('next');
                section.style.transform = 'translateY(100vh)';
                section.style.zIndex = 5;
            }
        });
    }
    
    // Update sections based on scroll
    function updateSections() {
        const scrollTop = window.pageYOffset;
        updateNavbarState();

        if (!enhancedScrollEnabled) {
            const viewportMidpoint = scrollTop + window.innerHeight * 0.5;
            let actualCurrentSection = 0;

            sections.forEach((section, index) => {
                if (section.offsetTop <= viewportMidpoint) {
                    actualCurrentSection = index;
                }
            });

            currentSection = actualCurrentSection;
            updateCurrentSectionIndicator(actualCurrentSection);
            return;
        }

        const windowHeight = window.innerHeight;
        const sectionTransitionHeight = windowHeight * 1.2;
        const currentSectionIndex = Math.floor(scrollTop / sectionTransitionHeight);
        const actualCurrentSection = Math.min(currentSectionIndex, totalSections - 1);
        const sectionScrollProgress = (scrollTop % sectionTransitionHeight) / sectionTransitionHeight;

        currentSection = actualCurrentSection;
        updateCurrentSectionIndicator(actualCurrentSection);
        
        sections.forEach((section, index) => {
            if (index < actualCurrentSection) {
                section.style.transform = 'translateY(0)';
                section.style.zIndex = 1;
            } else if (index === actualCurrentSection) {
                section.style.transform = 'translateY(0)';
                section.style.zIndex = 10;
            } else if (index === actualCurrentSection + 1) {
                const translateY = 100 - (sectionScrollProgress * 100);
                section.style.transform = `translateY(${translateY}vh)`;
                section.style.zIndex = 15;
            } else {
                section.style.transform = 'translateY(100vh)';
                section.style.zIndex = 1;
            }
        });
    }
    
    // Update current section indicator in header
    function updateCurrentSectionIndicator(sectionIndex) {
        const sectionNames = ['Home', 'About', 'Projects', 'Skills', 'Education', 'Contact'];
        const currentSectionName = document.querySelector('.current-section-name');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        // Update section name indicator
        if (currentSectionName) {
            currentSectionName.textContent = sectionNames[sectionIndex] || 'Home';
        }
        
        // Update active nav link
        navLinks.forEach((link, index) => {
            link.classList.remove('active');
            if (index === sectionIndex) {
                link.classList.add('active');
            }
        });
    }
    
    
    // Throttle scroll events for better performance
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateSections();
                ticking = false;
            });
            ticking = true;
        }
    }

    function handleResize() {
        const shouldEnable = isEnhancedScroll();
        if (shouldEnable !== enhancedScrollEnabled) {
            enhancedScrollEnabled = shouldEnable;
            if (enhancedScrollEnabled) {
                initSections();
            } else {
                resetSectionsStyles();
            }
        }
        updateSections();
    }
    
    // Event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Initialize
    initSections();
    updateSections();
    
    // Initialize section indicator
    updateCurrentSectionIndicator(0);

    // Mobile + desktop nav click handling: prevent default anchor jumps (hash jumps)
    // and avoid double-triggering inline onclick handlers.
    document.querySelectorAll('#navbar .nav-links a[data-section]').forEach(link => {
        link.removeAttribute('onclick');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const sectionIndex = Number(link.getAttribute('data-section'));
            if (Number.isFinite(sectionIndex)) {
                scrollToSection(sectionIndex);
            }
        });
    });
    
    // Optional: Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' && currentSection < totalSections - 1) {
            scrollToSection(currentSection + 1);
        } else if (e.key === 'ArrowUp' && currentSection > 0) {
            scrollToSection(currentSection - 1);
        }
    });
});

// Navigation function for smooth scrolling to sections
function scrollToSection(sectionIndex) {
    const enhanced = window.matchMedia('(min-width: 1025px)').matches;

    const targetSection = document.querySelector(`.section[data-section="${sectionIndex}"]`);
    if (!targetSection) {
        return false;
    }

    if (enhanced) {
        const windowHeight = window.innerHeight;
        const targetScroll = sectionIndex * windowHeight * 1.2;
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    } else {
        // Offset scroll so the fixed navbar doesn't cover the section heading on mobile.
        const navbar = document.getElementById('navbar');
        const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
        const navbarTop = navbar ? (parseFloat(getComputedStyle(navbar).top) || 0) : 0;
        const navOffset = navbarRect ? (navbarRect.height + navbarTop + 12) : 0;

        const targetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth'
        });
    }

    return false;
}

function updateNavbarState() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
        return;
    }

    navbar.classList.add('navbar-compact');
}

// Loader handling
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.remove('loader-hidden');
    }
});

const LOADER_MIN_DURATION = 1500;

window.addEventListener('load', function() {
    const loader = document.getElementById('loader');
    if (!loader) {
        document.body.classList.add('loader-finished');
        return;
    }

    setTimeout(() => {
        loader.classList.add('loader-hidden');
        document.body.classList.add('loader-finished');
    }, LOADER_MIN_DURATION);
});

// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Create mailto link
            const mailtoLink = `mailto:khaleelazaizy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\nMessage:\n${message}`)}`;
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Show success message
            const button = contactForm.querySelector('button[type="submit"]');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            button.style.background = '#4CAF50';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                contactForm.reset();
            }, 3000);
        });
    }
    
});

// Projects slider functionality
let currentSlide = 0;
let totalProjects = 0;
let maxSlides = 0;
let cachedProjectWidth = 0;
let sliderElement = null;
let projectsGridElement = null;
let sliderDragInitialized = false;
let isDraggingSlider = false;
let pointerCaptured = false;
let dragStartX = 0;
let sliderCurrentTranslate = 0;
let sliderPreviousTranslate = 0;
let activePointerId = null;
let sliderRecentlyDragged = false;
const DRAG_THRESHOLD_RATIO = 0.25;
let sliderIndicatorsContainer = null;
let sliderIndicatorButtons = [];

function calculateProjectWidth() {
    const cards = document.querySelectorAll('.project-card');

    if (cards.length >= 2) {
        return Math.abs(cards[1].offsetLeft - cards[0].offsetLeft);
    }

    if (cards.length === 1) {
        return cards[0].getBoundingClientRect().width;
    }

    return window.innerWidth <= 768 ? document.body.clientWidth : 412;
}

function getVisibleProjectsCount() {
    if (window.innerWidth <= 768) {
        return 1;
    }
    if (window.innerWidth <= 1024) {
        return 2;
    }
    return 3;
}

// Initialize slider
function initProjectsSlider() {
    projectsGridElement = document.querySelector('.projects-grid');
    sliderElement = document.querySelector('.projects-slider');
    const projectCards = document.querySelectorAll('.project-card');
    totalProjects = projectCards.length;
    const visibleProjects = getVisibleProjectsCount();
    maxSlides = Math.max(0, totalProjects - visibleProjects);
    currentSlide = Math.min(currentSlide, maxSlides);
    
    // Set initial position
    updateSliderPosition();
    updateSliderButtons();
    buildSliderIndicators();

    if (!sliderDragInitialized && sliderElement && projectsGridElement) {
        setupSliderDrag();
        sliderDragInitialized = true;
    }
}

// Update slider position
function updateSliderPosition() {
    if (!projectsGridElement) {
        projectsGridElement = document.querySelector('.projects-grid');
    }
    if (!projectsGridElement) {
        return;
    }

    cachedProjectWidth = calculateProjectWidth();
    const translateX = -(currentSlide * cachedProjectWidth);
    projectsGridElement.style.transition = 'transform 0.45s ease';
    projectsGridElement.style.transform = `translateX(${translateX}px)`;
    sliderCurrentTranslate = translateX;
    sliderPreviousTranslate = translateX;
    updateSliderIndicators();
}

// Slide projects
function slideProjects(direction) {
    const newSlide = currentSlide + direction;
    
    // Check bounds
    if (newSlide >= 0 && newSlide <= maxSlides) {
        currentSlide = newSlide;
        updateSliderPosition();
    }
    
    // Update button states
    updateSliderButtons();
}

// Update slider button states
function updateSliderButtons() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn && nextBtn) {
        prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
        prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
        
        nextBtn.style.opacity = currentSlide === maxSlides ? '0.5' : '1';
        nextBtn.style.pointerEvents = currentSlide === maxSlides ? 'none' : 'auto';
    }
}

function buildSliderIndicators() {
    sliderIndicatorsContainer = document.querySelector('.slider-indicators');
    sliderIndicatorButtons = [];

    if (!sliderIndicatorsContainer) {
        return;
    }

    const totalSlides = Math.max(0, maxSlides) + 1;
    sliderIndicatorsContainer.innerHTML = '';

    if (totalSlides <= 1) {
        sliderIndicatorsContainer.classList.add('is-hidden');
        return;
    }

    sliderIndicatorsContainer.classList.remove('is-hidden');

    for (let i = 0; i < totalSlides; i++) {
        const indicatorButton = document.createElement('button');
        indicatorButton.type = 'button';
        indicatorButton.className = 'slider-indicator';
        indicatorButton.setAttribute('role', 'tab');
        indicatorButton.setAttribute('aria-label', `Go to slide ${i + 1}`);
        indicatorButton.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
        indicatorButton.addEventListener('click', () => {
            if (currentSlide === i) {
                return;
            }
            currentSlide = i;
            updateSliderPosition();
            updateSliderButtons();
        });

        sliderIndicatorsContainer.appendChild(indicatorButton);
        sliderIndicatorButtons.push(indicatorButton);
    }

    updateSliderIndicators();
}

function updateSliderIndicators() {
    if (!sliderIndicatorButtons || sliderIndicatorButtons.length === 0) {
        return;
    }

    sliderIndicatorButtons.forEach((button, index) => {
        const isActive = index === currentSlide;
        if (isActive) {
            button.classList.add('is-active');
            button.setAttribute('aria-selected', 'true');
        } else {
            button.classList.remove('is-active');
            button.setAttribute('aria-selected', 'false');
        }
    });
}

function setupSliderDrag() {
    if (!sliderElement || !projectsGridElement) {
        return;
    }

    const DRAG_ACTIVATION_THRESHOLD = 6;

    const handlePointerDown = (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }

        if (!projectsGridElement) {
            projectsGridElement = document.querySelector('.projects-grid');
        }

        if (!projectsGridElement) {
            return;
        }

        isDraggingSlider = true;
        sliderRecentlyDragged = false;
        pointerCaptured = false;
        dragStartX = event.clientX;
        sliderPreviousTranslate = sliderCurrentTranslate;
        activePointerId = event.pointerId;
        if (!cachedProjectWidth) {
            cachedProjectWidth = calculateProjectWidth();
        }
        document.body.classList.add('slider-no-select');
    };

    const handlePointerMove = (event) => {
        if (!isDraggingSlider || !projectsGridElement) {
            return;
        }

        const deltaX = event.clientX - dragStartX;

        if (!pointerCaptured && Math.abs(deltaX) > DRAG_ACTIVATION_THRESHOLD) {
            pointerCaptured = true;
            sliderRecentlyDragged = true;
            try {
                if (activePointerId !== null) {
                    sliderElement.setPointerCapture(activePointerId);
                }
            } catch (err) {
                // Pointer capture not supported; ignore
            }
            projectsGridElement.style.transition = 'none';
            sliderElement.classList.add('is-dragging');
            projectsGridElement.classList.add('is-dragging');
        }

        if (!pointerCaptured) {
            return;
        }

        if (event.pointerType === 'touch') {
            event.preventDefault();
        }

        if (!cachedProjectWidth) {
            cachedProjectWidth = calculateProjectWidth();
        }

        const maxTranslate = -(Math.max(maxSlides, 0) * cachedProjectWidth);
        let nextTranslate = sliderPreviousTranslate + deltaX;
        nextTranslate = Math.max(maxTranslate, Math.min(0, nextTranslate));
        sliderCurrentTranslate = nextTranslate;
        projectsGridElement.style.transform = `translateX(${nextTranslate}px)`;
    };

    const endPointerInteraction = () => {
        if (!isDraggingSlider) {
            return;
        }

        document.body.classList.remove('slider-no-select');

        if (pointerCaptured) {
            try {
                if (activePointerId !== null) {
                    sliderElement.releasePointerCapture(activePointerId);
                }
            } catch (err) {
                // Ignore release errors
            }
        }

        if (projectsGridElement) {
            projectsGridElement.classList.remove('is-dragging');
            projectsGridElement.style.transition = '';
        }
        sliderElement.classList.remove('is-dragging');

        const wasDragging = pointerCaptured;

        isDraggingSlider = false;
        pointerCaptured = false;
        activePointerId = null;

        if (!wasDragging) {
            sliderRecentlyDragged = false;
            return;
        }

        const width = cachedProjectWidth || calculateProjectWidth();
        const movedBy = sliderCurrentTranslate - sliderPreviousTranslate;
        const threshold = width * DRAG_THRESHOLD_RATIO;

        if (Math.abs(movedBy) > threshold) {
            if (movedBy < 0 && currentSlide < maxSlides) {
                currentSlide++;
            } else if (movedBy > 0 && currentSlide > 0) {
                currentSlide--;
            }
        }

        updateSliderPosition();
        updateSliderButtons();

        setTimeout(() => {
            sliderRecentlyDragged = false;
        }, 0);
    };

    const handlePointerLeave = () => {
        if (!pointerCaptured) {
            endPointerInteraction();
        }
    };

    sliderElement.addEventListener('pointerdown', handlePointerDown);
    sliderElement.addEventListener('pointermove', handlePointerMove);
    sliderElement.addEventListener('pointerup', endPointerInteraction);
    sliderElement.addEventListener('pointerleave', handlePointerLeave);
    sliderElement.addEventListener('pointercancel', endPointerInteraction);

    projectsGridElement.addEventListener('click', (event) => {
        if (sliderRecentlyDragged) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, true);
}


// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for CSS to load
    setTimeout(() => {
        initProjectsSlider();
        
    }, 100);
});

// Handle window resize
window.addEventListener('resize', function() {
    // Recalculate slider on resize
    setTimeout(() => {
        initProjectsSlider();
        updateSliderButtons();
    }, 100);
});

/* === ENHANCED ANIMATIONS SYSTEM === */

// Intersection Observer for animations
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special handling for stat counters
                if (entry.target.classList.contains('stat-item')) {
                    animateCounter(entry.target.querySelector('.stat-number'), 20);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Observe all animatable elements
    document.querySelectorAll(`
        .hero-content, 
        .about-text, 
        .education-info,
        .stat-item,
        .section-header, 
        .skill-card, 
        .project-card, 
        .education-card,
        .contact-info,
        .contact-form,
        .social-links
    `).forEach(el => observer.observe(el));
});

// Animated Counter Function
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOutCubic);
        
        element.textContent = current + '+';
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Staggered animations for skills and projects
function initStaggeredAnimations() {
    // Skills staggered animation
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillCards = entry.target.querySelectorAll('.skill-card');
                skillCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, index * 100);
                });
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    const skillsSection = document.querySelector('.skills-grid');
    if (skillsSection) skillsObserver.observe(skillsSection);
    
    // Projects staggered animation
    const projectsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const projectCards = entry.target.querySelectorAll('.project-card');
                projectCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, index * 200);
                });
                projectsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) projectsObserver.observe(projectsGrid);
}

// Floating icons animation in hero section
function initFloatingIconsAnimation() {
    const floatingIcons = document.querySelectorAll('.floating-icon');
    
    floatingIcons.forEach((icon, index) => {
        // Initial animation delay
        setTimeout(() => {
            icon.style.animationPlayState = 'running';
        }, index * 200);
        
        // Add random gentle movements
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 20;
            icon.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 500);
    });
}

// Education cards hover effects
function initEducationAnimations() {
    const educationText = document.querySelector('.education-text');
    
    if (educationText) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(educationText);
    }
}

// Break about text into small segments for localized glow effect
function segmentAboutText() {
    const aboutText = document.querySelector('.about-text');
    if (!aboutText) return;

    const lines = aboutText.querySelectorAll('.intro-line');
    const getTextNodes = (root) => {
        const nodes = [];
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    if (!node.parentElement) return NodeFilter.FILTER_REJECT;
                    if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
                    if (node.parentElement.closest('.highlight')) return NodeFilter.FILTER_REJECT;
                    if (node.parentElement.closest('.glow-segment')) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }
        return nodes;
    };

    lines.forEach((line) => {
        const textNodes = getTextNodes(line);
        textNodes.forEach((node) => {
            const parts = node.textContent.split(/(\s+)/);
            const fragment = document.createDocumentFragment();

            parts.forEach((part) => {
                if (!part) return;
                if (/^\s+$/.test(part)) {
                    fragment.appendChild(document.createTextNode(part));
                } else {
                    const span = document.createElement('span');
                    span.className = 'glow-segment';
                    span.textContent = part;
                    fragment.appendChild(span);
                }
            });

            node.parentNode.replaceChild(fragment, node);
        });
    });
}

// Spotlight effect over About text
function initAboutCursorEffect() {
    const aboutText = document.querySelector('.about-text');
    if (!aboutText) return;

    const highlightables = Array.from(aboutText.querySelectorAll('.glow-segment, .about-text .highlight'));
    if (!highlightables.length) return;
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    let rafId;
    let idleTimeout;
    let autoplayId;
    let isAutoplay = false;
    let interactiveMode = false;
    const radius = 200;
    const IDLE_DELAY = 2000;
    const AUTOPLAY_DURATION = 6000;

    const setAllGlow = (value) => {
        highlightables.forEach((el) => el.style.setProperty('--glow', value));
    };

    const clearGlow = () => {
        if (rafId) cancelAnimationFrame(rafId);
        setAllGlow('0');
    };

    const applyGlow = (clientX, clientY) => {
        if (!interactiveMode) return;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            highlightables.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
                const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
                const distance = Math.hypot(dx, dy);

                if (distance >= radius) {
                    el.style.setProperty('--glow', '0');
                } else {
                    const normalized = 1 - Math.pow(distance / radius, 2);
                    el.style.setProperty('--glow', Math.max(0, normalized).toFixed(3));
                }
            });
        });
    };

    const stopAutoplay = () => {
        if (!interactiveMode || !isAutoplay) return;
        isAutoplay = false;
        if (autoplayId) {
            cancelAnimationFrame(autoplayId);
            autoplayId = null;
        }
    };

    const startAutoplay = () => {
        if (!interactiveMode || isAutoplay) return;
        isAutoplay = true;
        idleTimeout = null;

        const step = (timestamp) => {
            if (!isAutoplay) return;

            const rect = aboutText.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) {
                clearGlow();
                autoplayId = requestAnimationFrame(step);
                return;
            }

            const padding = Math.min(80, rect.width * 0.15);
            const paddingY = Math.min(60, rect.height * 0.2);
            const minX = rect.left + padding;
            const maxX = rect.right - padding;

            if (minX >= maxX) {
                const fallbackY = rect.top + rect.height * 0.4;
                applyGlow(rect.left + rect.width / 2, fallbackY);
            } else {
                const progress = (timestamp % AUTOPLAY_DURATION) / AUTOPLAY_DURATION;
                const eased = 0.5 - Math.cos(progress * Math.PI * 2) / 2;
                const oscillation = Math.sin(progress * Math.PI * 2);

                const sweepX = minX + (maxX - minX) * eased;
                const baseY = rect.top + rect.height * 0.4;
                const amplitude = Math.min(rect.height * 0.25, 140);
                let sweepY = baseY + oscillation * amplitude;
                sweepY = Math.max(rect.top + paddingY, Math.min(rect.bottom - paddingY, sweepY));

                applyGlow(sweepX, sweepY);
            }

            autoplayId = requestAnimationFrame(step);
        };

        autoplayId = requestAnimationFrame(step);
    };

    const scheduleAutoplay = () => {
        if (!interactiveMode || isAutoplay) return;
        if (idleTimeout) clearTimeout(idleTimeout);
        idleTimeout = setTimeout(startAutoplay, IDLE_DELAY);
    };

    const cancelIdleTimer = () => {
        if (idleTimeout) {
            clearTimeout(idleTimeout);
            idleTimeout = null;
        }
    };

    const handlePointerActivity = (event) => {
        if (!interactiveMode) return;
        stopAutoplay();
        cancelIdleTimer();
        applyGlow(event.clientX, event.clientY);
        scheduleAutoplay();
    };

    const handlePointerLeave = () => {
        if (!interactiveMode) return;
        stopAutoplay();
        cancelIdleTimer();
        clearGlow();
        scheduleAutoplay();
    };

    const enableInteractiveMode = () => {
        if (interactiveMode) return;
        interactiveMode = true;
        setAllGlow('0');
        scheduleAutoplay();
        aboutText.addEventListener('pointermove', handlePointerActivity);
        aboutText.addEventListener('pointerenter', handlePointerActivity);
        aboutText.addEventListener('pointerleave', handlePointerLeave);
    };

    const disableInteractiveMode = () => {
        if (!interactiveMode) return;
        interactiveMode = false;
        stopAutoplay();
        cancelIdleTimer();
        if (rafId) cancelAnimationFrame(rafId);
        aboutText.removeEventListener('pointermove', handlePointerActivity);
        aboutText.removeEventListener('pointerenter', handlePointerActivity);
        aboutText.removeEventListener('pointerleave', handlePointerLeave);
    };

    const applyAlwaysGlow = () => {
        disableInteractiveMode();
        aboutText.classList.add('always-glow');
        setAllGlow('1');
    };

    const applyInteractiveGlow = () => {
        aboutText.classList.remove('always-glow');
        enableInteractiveMode();
    };

    const handleViewportChange = () => {
        if (mobileQuery.matches) {
            applyAlwaysGlow();
        } else {
            applyInteractiveGlow();
        }
    };

    handleViewportChange();

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', handleViewportChange);
    } else {
        mobileQuery.addListener(handleViewportChange);
    }

    document.addEventListener('visibilitychange', () => {
        if (!interactiveMode) return;
        if (document.hidden) {
            stopAutoplay();
            cancelIdleTimer();
            clearGlow();
        } else {
            scheduleAutoplay();
        }
    });
}

// Copy to Clipboard Function
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // Add the 'copied' class for visual feedback
        button.classList.add('copied');
        const originalIcon = button.innerHTML;
        
        // Change icon to checkmark
        button.innerHTML = '<i class="fas fa-check"></i>';
        
        // Revert after 2 seconds
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = originalIcon;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    // Delay to ensure all elements are loaded
    setTimeout(() => {
        segmentAboutText();
        initStaggeredAnimations();
        initFloatingIconsAnimation();
        initEducationAnimations();
        initAboutCursorEffect();
    }, 500);
});