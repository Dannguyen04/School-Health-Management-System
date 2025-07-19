// Scroll animation utilities for homepage
export const initScrollAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-fade-in-up");

                // Add stagger animation for child elements
                const staggerItems =
                    entry.target.querySelectorAll(".stagger-item");
                staggerItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add("visible");
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return observer;
};

export const initParallaxEffect = () => {
    window.addEventListener("scroll", () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll(".parallax");

        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + index * 0.1;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
};

export const initTextReveal = () => {
    const textElements = document.querySelectorAll(".text-reveal");

    const textObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                }
            });
        },
        { threshold: 0.5 }
    );

    textElements.forEach((el) => textObserver.observe(el));
};

export const initCounterAnimation = () => {
    const counters = document.querySelectorAll(".counter");

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const target = parseInt(
                        entry.target.getAttribute("data-target")
                    );
                    const duration = 2000; // 2 seconds
                    const increment = target / (duration / 16); // 60fps
                    let current = 0;

                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        entry.target.textContent =
                            Math.floor(current).toLocaleString();
                    }, 16);

                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
};

export const initHoverEffects = () => {
    // Add hover effects to cards
    const cards = document.querySelectorAll(".card-hover");
    cards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-8px) scale(1.02)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "translateY(0) scale(1)";
        });
    });
};

export const initSmoothScroll = () => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });
};

export const initLoadingStates = () => {
    // Add loading states to buttons
    const buttons = document.querySelectorAll(".btn-primary");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            if (!button.classList.contains("loading")) {
                button.classList.add("loading");
                button.innerHTML =
                    '<span class="loading-dots">Đang xử lý</span>';

                // Remove loading state after animation
                setTimeout(() => {
                    button.classList.remove("loading");
                    button.innerHTML =
                        button.getAttribute("data-original-text") ||
                        "Bắt đầu ngay";
                }, 2000);
            }
        });
    });
};

// Initialize all animations
export const initAllAnimations = () => {
    initScrollAnimations();
    initParallaxEffect();
    initTextReveal();
    initCounterAnimation();
    initHoverEffects();
    initSmoothScroll();
    initLoadingStates();
};

export default initAllAnimations;
