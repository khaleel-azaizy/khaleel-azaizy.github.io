 // Theme Toggle
    const toggleBtn = document.querySelector('.theme-toggle');
    toggleBtn.addEventListener('click', () => {
      const body = document.body;
      body.dataset.theme = body.dataset.theme === 'light' ? 'dark' : 'light';
      toggleBtn.innerHTML = body.dataset.theme === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Smooth Section Scroll
    function scrollToSection(id) {
      document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
    }

    // Project card expand/collapse
    document.querySelectorAll('.card-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.card');
        card.classList.toggle('expanded');
      });
    });

    // Intersection Observer for animations
    document.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.hero-content, .card, .section-header, .skill-card, .about-text, .about-showcase, .project-card, #contact .contact-grid').forEach(el => observer.observe(el));
    });

    const nav = document.getElementById('navbar');
    const progress = document.getElementById('scrollProgress');
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
    function updateProgressOnly(){
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (docH ? (scrollTop / docH) * 100 : 0) + '%';
      nav.toggleAttribute('data-scrolled', scrollTop > 50);
    }
    window.addEventListener('scroll', updateProgressOnly, {passive:true});
    updateProgressOnly();

    // UPDATED IntersectionObserver based scrollspy (replaces previous initScrollSpy IIFE)
    (function initScrollSpy(){
      const sentinel = document.getElementById('top-sentinel');

      // Separate top & bottom nav link collections
      const topNavLinks = Array.from(document.querySelectorAll('#navbar .nav-links a'));
      const bottomNavLinks = Array.from(document.querySelectorAll('.bottom-nav-mobile .nav-links a'));
      const allNavLinks = [...topNavLinks, ...bottomNavLinks];

      const sectionIds = [...new Set(allNavLinks.map(l => l.getAttribute('href').slice(1)))];
      const watchedSections = sectionIds
        .map(id => document.getElementById(id))
        .filter(Boolean);

      function clearActive(){
        allNavLinks.forEach(l => l.classList.remove('active'));
      }

      const observer = new IntersectionObserver(()=> {
        // If sentinel fully visible at very top
        const sentinelRect = sentinel.getBoundingClientRect();
        const atTop = sentinelRect.top >= 0 && sentinelRect.bottom <= Math.min(120, window.innerHeight*0.25);

        if(atTop){
          clearActive();
          const firstContentId = '';
          const firstBottom = bottomNavLinks.find(l => l.getAttribute('href') === '#'+firstContentId);
          if(firstBottom) firstBottom.classList.add('active');
          return;
        }

        // Choose best section
        let best = null;
        watchedSections.forEach(sec=>{
          const r = sec.getBoundingClientRect();
          // Prefer sections whose top is above or near (<=140px)
          if(r.top <= 140){
            if(!best || r.top > best.rect.top) best = { id: sec.id, rect: r };
          } else if(!best && r.top < window.innerHeight*0.4){
            best = { id: sec.id, rect: r };
          }
        });

        clearActive();
        if(best){
          allNavLinks
            .filter(l => l.getAttribute('href').slice(1) === best.id)
            .forEach(l => l.classList.add('active'));
        }
      },{
        root:null,
        threshold:[0, .05],
        rootMargin:'-140px 0px -60% 0px'
      });

      observer.observe(sentinel);
      watchedSections.forEach(sec => observer.observe(sec));

      // Re-run after load/layout
      window.addEventListener('load', () => setTimeout(()=>observer.takeRecords(), 60));
    })();

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetId = btn.getAttribute('data-copy-target');
        const text = document.getElementById(targetId).innerText;
        try {
          await navigator.clipboard.writeText(text);
          const original = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => btn.innerHTML = original, 2000);
        } catch (err) {
          console.error('Copy failed', err);
        }
      });
    });

    const headerEl = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      headerEl.toggleAttribute('data-scrolled', window.scrollY > 50);
    });

    /* === NEW LOADER SCRIPT (replaces old simple timeout loader) === */
    (function enhancedLoader(){
      const screen = document.getElementById('loading-screen');
      if(!screen){
        document.body.classList.remove('preload');
        return;
      }
      const percentEl = document.getElementById('loaderPercent');
      const barEl = document.getElementById('loaderBar');
      const phaseEl = document.getElementById('loaderPhase');
      
      const shownKey = 'loaderShown';
      const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
     
     
      // Fast path (already seen loader)
      if(sessionStorage.getItem(shownKey)){
        screen.classList.add('hidden');
        document.body.classList.remove('preload'); // start hero animations immediately
        return;
      }

      let progress=0;
      const duration = reduced?400:(1600+Math.random()*600);
      const start = performance.now();

      function phaseFor(pct){
        for(const ph of phases){ if(pct<=ph.at) return ph.label; }
        return 'READY';
      }
      function frame(now){
        const t=Math.min(1,(now-start)/duration);
        const eased=1-Math.pow(1-t,3);
        progress = eased*100 - (Math.sin(now/180)*(1-t)*2);
        const pct=Math.max(0,Math.min(100,Math.round(progress)));
        if(percentEl) percentEl.textContent=pct+'%';
        if(barEl) barEl.style.width=pct+'%';
        if(phaseEl) phaseEl.textContent=phaseFor(pct);
        if(pct<100){ requestAnimationFrame(frame); } else finish();
      }
      function finish(){
        if(percentEl) percentEl.textContent='100%';
        if(barEl) barEl.style.width='100%';
        if(phaseEl) phaseEl.textContent='READY';
        setTimeout(()=>{
          screen.classList.add('hidden');
          sessionStorage.setItem(shownKey,'1');
          document.body.classList.remove('preload'); // RELEASE animations now
        }, reduced?100:450);
      }
      requestAnimationFrame(frame);
    })();

    /* Contact form mailto handler */
    (function initContactForm(){
      const form = document.getElementById('contactForm');
      if(!form) return;
      const statusEl = document.getElementById('formStatus');

      const fields = [
        { id:'cf-name',    test:v=>v.trim().length>=2,  msg:'Enter at least 2 chars' },
        { id:'cf-email',   test:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg:'Invalid email' },
        { id:'cf-subject', test:v=>v.trim().length>0,   msg:'Subject required' },
        { id:'cf-message', test:v=>v.trim().length>=10, msg:'Min 10 characters' }
      ];

      function setError(id, message){
        const input = document.getElementById(id);
        const wrap = input?.closest('.field');
        const err = document.querySelector(`[data-error-for="${id}"]`);
        if(wrap){
          if(message){
            wrap.classList.add('has-error');
            if(err) err.textContent = message;
          } else {
            wrap.classList.remove('has-error');
            if(err) err.textContent = '';
          }
        }
      }

      form.addEventListener('input', e=>{
        const f = fields.find(f=>f.id === e.target.id);
        if(f){
          setError(f.id, f.test(e.target.value) ? '' : f.msg);
        }
      });

      form.addEventListener('submit', e=>{
        e.preventDefault();
        let valid = true;
        fields.forEach(f=>{
          const val = document.getElementById(f.id).value;
            const ok = f.test(val);
            setError(f.id, ok ? '' : f.msg);
            valid = valid && ok;
        });
        if(!valid){
          statusEl.textContent = 'Fix highlighted fields';
          return;
        }
        const name    = document.getElementById('cf-name').value.trim();
        const email   = document.getElementById('cf-email').value.trim();
        const subject = document.getElementById('cf-subject').value.trim();
        const message = document.getElementById('cf-message').value.trim();

        const to = 'khaleelazaizy@gmail.com';
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\n\n${message}`
        );
        const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;

        statusEl.textContent = 'Opening email client...';
        // Small delay to allow user to read status
        setTimeout(()=>{ window.location.href = mailto; }, 150);
        form.reset();
        setTimeout(()=>{ statusEl.textContent = 'If your email client did not open, please send manually.'; }, 900);
      });
    })();

    /* Skills Filter Functionality */
    (function initSkillsFilter(){
      const filterButtons = document.querySelectorAll('.filter-btn');
      const skillCards = document.querySelectorAll('.skill-card');
      let isAnimating = false;
      
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          if (isAnimating) return; // Prevent rapid clicks
          
          const filterValue = btn.getAttribute('data-filter');
          
          // Update active button
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          isAnimating = true;
          
          // Clear any existing timeouts and reset all cards immediately
          skillCards.forEach(card => {
            card.style.transition = 'none';
            card.style.display = '';
            card.style.opacity = '';
            card.style.transform = '';
          });
          
          // Force reflow
          skillCards[0].offsetHeight;
          
          // Re-enable transitions
          skillCards.forEach(card => {
            card.style.transition = '';
          });
          
          // Filter skill cards
          setTimeout(() => {
            skillCards.forEach(card => {
              const cardCategory = card.getAttribute('data-category');
              
              if (filterValue === 'all' || cardCategory === filterValue) {
                // Show card
                card.style.display = '';
                if (card.classList.contains('visible')) {
                  card.style.opacity = '1';
                  card.style.transform = 'translateY(0)';
                }
              } else {
                // Hide card
                card.style.display = 'none';
              }
            });
            
            isAnimating = false;
          }, 50);
        });
      });
    })();

    /* Projects Section Functionality */
    (function initProjectsSection(){
      // Project card expand/collapse
      document.querySelectorAll('.btn-expand').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.project-card');
          card.classList.toggle('expanded');
        });
      });
      
      // Project filtering
      const filterButtons = document.querySelectorAll('.project-filter-btn');
      const projectCards = document.querySelectorAll('.project-card');
      
      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const filterValue = btn.getAttribute('data-filter');
          
          // Update active button
          filterButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          
          // Filter project cards with staggered animation
          projectCards.forEach((card, index) => {
            const cardCategory = card.getAttribute('data-category');
            
            if (filterValue === 'all' || cardCategory === filterValue) {
              // Show card with delay
              setTimeout(() => {
                card.style.display = '';
                card.style.transform = 'translateY(20px)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                  if (card.classList.contains('visible')) {
                    card.style.transform = 'translateY(0)';
                    card.style.opacity = '1';
                  }
                }, 50);
              }, index * 100);
            } else {
              // Hide card
              card.style.transform = 'translateY(-20px)';
              card.style.opacity = '0';
              setTimeout(() => {
                card.style.display = 'none';
              }, 300);
            }
          });
        });
      });
      
      // Staggered animation for project cards on initial load
      const projectObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, index * 150);
            projectObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      projectCards.forEach(card => {
        projectObserver.observe(card);
      });
    })();

    /* About Section Animations */
    (function initAboutAnimations(){
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
          
          element.textContent = current;
          
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            element.textContent = target;
          }
        }
        
        requestAnimationFrame(updateCounter);
      }
      
      // Intersection Observer for About Section
      const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Start counter animations when about section becomes visible
            if (entry.target.classList.contains('about-text')) {
              const counters = document.querySelectorAll('.stat-number');
              counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                setTimeout(() => {
                  animateCounter(counter, target);
                }, 500); // Delay to let the text animation start first
              });
            }
            
            aboutObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      
      // Observe about section elements
      const aboutText = document.querySelector('.about-text');
      const aboutShowcase = document.querySelector('.about-showcase');
      
      if (aboutText) aboutObserver.observe(aboutText);
      if (aboutShowcase) aboutObserver.observe(aboutShowcase);
      
      // Typewriter Effect
      function typewriterEffect() {
        const typewriterElement = document.querySelector('.typewriter-text');
        if (!typewriterElement) return;
        
        const texts = [
          'Artificial Intelligence, Machine Learning,',
          'React, Node.js, Python,',
          'cloud-based development, cybersecurity,',
          'modern web technologies,'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const originalText = typewriterElement.textContent;
        
        function type() {
          const currentText = texts[textIndex];
          
          if (isDeleting) {
            typewriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
          } else {
            typewriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
          }
          
          let typeSpeed = isDeleting ? 50 : 100;
          
          if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
          } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500; // Pause before typing next
          }
          
          setTimeout(type, typeSpeed);
        }
        
        // Start typewriter effect after a delay
        setTimeout(() => {
          type();
        }, 2000);
      }
      
      // Initialize typewriter effect when about section is visible
      setTimeout(typewriterEffect, 1000);
    })();