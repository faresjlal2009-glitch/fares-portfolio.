
/* =====================================================
   FARES JLAL - معرض أعمال مصمم جرافيك
   ملف الوظائف التفاعلية (JavaScript)
   ===================================================== */

// ===================== انتظار تحميل الصفحة =====================
document.addEventListener('DOMContentLoaded', function() {

    // ===== استدعاء جميع الوظائف =====
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initPortfolioFilter();
    initScrollAnimations();
    initActiveNavLink();
});


// ===================== شريط التنقل عند التمرير =====================
function initNavbar() {
    var navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}


// ===================== قائمة الموبايل =====================
function initMobileMenu() {
    var menuToggle = document.getElementById('menuToggle');
    var navLinks = document.getElementById('navLinks');
    var navLinkItems = document.querySelectorAll('.nav-link');

    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');

        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    navLinkItems.forEach(function(link) {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}


// ===================== التمرير السلس للأقسام =====================
function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            var targetId = this.getAttribute('href');
            var targetSection = document.querySelector(targetId);

            if (targetSection) {
                var navbarHeight = document.getElementById('navbar').offsetHeight;
                var targetPosition = targetSection.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}


// ===================== تصفية/تصنيف الأعمال =====================
function initPortfolioFilter() {
    var filterButtons = document.querySelectorAll('.filter-btn');
    var portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {

            filterButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            var selectedFilter = this.getAttribute('data-filter');

            portfolioItems.forEach(function(item) {
                var itemCategory = item.getAttribute('data-category');

                if (selectedFilter === 'all' || itemCategory === selectedFilter) {
                    item.style.display = '';
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}


// ===================== تحديد الرابط النشط في التنقل =====================
function initActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', function() {
        var current = '';
        var navbarHeight = document.getElementById('navbar').offsetHeight;

        sections.forEach(function(section) {
            var sectionTop = section.offsetTop - navbarHeight - 100;
            var sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}


// ===================== تأثيرات الظهور عند التمرير =====================
function initScrollAnimations() {
    var animatedElements = document.querySelectorAll(
        '.about-text, .skills-section, .portfolio-item, .contact-info, .contact-socials'
    );

    animatedElements.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    function checkVisibility() {
        var windowHeight = window.innerHeight;
        var triggerPoint = windowHeight * 0.85;

        animatedElements.forEach(function(el) {
            var elementTop = el.getBoundingClientRect().top;

            if (elementTop < triggerPoint) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    }

    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
}


// ===================== تحديث السنة الحالية في التذييل =====================
var currentYearElement = document.getElementById('currentYear');
if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

// ===================== تأثير الحركة للأعمال عند التصفية =====================
var styleSheet = document.createElement('style');
styleSheet.textContent = '@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(styleSheet);

/* ===================== تحميل الأعمال من Supabase ===================== */

(function () {
    const SUPABASE_URL = 'https://oyxctzzcpszatzczyvqg.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_AAAHBKHFSJYHdZNP8fcEXw_d3fdiuMf';

    const categoryNames = {
        logos: 'الشعارات',
        branding: 'الهويات البصرية',
        'social-media': 'تصاميم السوشيال ميديا',
        thumbnails: 'صور مصغرات يوتيوب',
        other: 'أعمال أخرى'
    };

    async function loadPortfolioFromSupabase() {
        const grid = document.getElementById('portfolioGrid');

        if (!grid || !window.supabase) {
            console.error('تعذر العثور على شبكة الأعمال أو مكتبة Supabase.');
            return;
        }

        try {
            const client = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

            const { data, error } = await client
                .from('portfolio_items')
                .select('id, title, description, category, image_url')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // عرض الأعمال الحقيقية التي تحتوي على صورة فقط.
            const items = (data || []).filter(item =>
                item.image_url &&
                item.image_url.trim() !== ''
            );

            // إزالة البطاقات القديمة والتجريبية.
            grid.replaceChildren();

            items.forEach(item => {
                const card = document.createElement('article');
                card.className = 'portfolio-item';
                card.dataset.category = item.category || 'other';

                const imageBox = document.createElement('div');
                imageBox.className = 'portfolio-image-placeholder';

                const img = document.createElement('img');
                img.src = item.image_url;
                img.alt = item.title || 'عمل من معرض فارس جلال';
                img.loading = 'lazy';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';

                // إخفاء البطاقة إذا تعذر تحميل الصورة.
                img.addEventListener('error', () => {
                    card.remove();
                }, { once: true });

                imageBox.appendChild(img);

                const overlay = document.createElement('div');
                overlay.className = 'portfolio-overlay';

                const title = document.createElement('h3');
                title.className = 'portfolio-item-title';
                title.textContent = item.title || 'عمل جديد';

                const category = document.createElement('span');
                category.className = 'portfolio-item-category';
                category.textContent =
                    categoryNames[item.category] || 'أعمال أخرى';

                overlay.append(title, category);
                card.append(imageBox, overlay);
                grid.appendChild(card);
            });

            
            // تشغيل أزرار تصنيف الأعمال
            const filterButtons = document.querySelectorAll(
                '.filter-btn, .portfolio-filter, [data-filter]'
            );

            function applyPortfolioFilter(filter) {
                grid.querySelectorAll('.portfolio-item').forEach(card => {
                    const matches =
                        filter === 'all' ||
                        filter === '*' ||
                        card.dataset.category === filter;

                    card.style.display = matches ? '' : 'none';
                });
            }

            filterButtons.forEach(button => {
                // تجنب إضافة مستمع مكرر عند إعادة تحميل الأعمال
                if (button.dataset.portfolioFilterReady === 'true') return;
                button.dataset.portfolioFilterReady = 'true';

                button.addEventListener('click', function () {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');

                    const filter = this.dataset.filter ||
                        this.dataset.category ||
                        'all';

                    applyPortfolioFilter(filter);
                });
            });

            // فتح صورة العمل بحجم أكبر عند الضغط عليها
            grid.querySelectorAll('.portfolio-item img').forEach(img => {
                img.style.cursor = 'zoom-in';

                img.addEventListener('click', function () {
                    const lightbox = document.createElement('div');
                    lightbox.className = 'portfolio-lightbox';

                    const largeImage = document.createElement('img');
                    largeImage.src = this.src;
                    largeImage.alt = this.alt;

                    const closeButton = document.createElement('button');
                    closeButton.type = 'button';
                    closeButton.className = 'portfolio-lightbox-close';
                    closeButton.textContent = '×';
                    closeButton.setAttribute('aria-label', 'إغلاق الصورة');

                    lightbox.append(largeImage, closeButton);
                    document.body.appendChild(lightbox);

                    function closeLightbox() {
                        lightbox.remove();
                        document.removeEventListener('keydown', onKeyDown);
                    }

                    function onKeyDown(event) {
                        if (event.key === 'Escape') closeLightbox();
                    }

                    closeButton.addEventListener('click', closeLightbox);

                    lightbox.addEventListener('click', function (event) {
                        if (event.target === lightbox) closeLightbox();
                    });

                    document.addEventListener('keydown', onKeyDown);
                });
            });

            // تطبيق التصنيف النشط بعد تحميل الأعمال
            const activeFilter = document.querySelector(
                '.filter-btn.active, .portfolio-filter.active, [data-filter].active'
            );

            if (activeFilter) {
                applyPortfolioFilter(
                    activeFilter.dataset.filter ||
                    activeFilter.dataset.category ||
                    'all'
                );
            }

            console.log('تم تحميل الأعمال:', items.length);


        } catch (error) {
            console.error('خطأ في تحميل الأعمال من Supabase:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            loadPortfolioFromSupabase
        );
    } else {
        loadPortfolioFromSupabase();
    }
})();
