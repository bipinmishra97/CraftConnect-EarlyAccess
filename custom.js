document.addEventListener('DOMContentLoaded', () => {
  // Scroll detection
  (function () {
    const SCROLL_THRESHOLD = 20;
    const body = document.body;
    let isScrolled = false;

    window.addEventListener(
      'scroll',
      () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        if (scrollTop > SCROLL_THRESHOLD && !isScrolled) {
          body.classList.add('scrolled');
          isScrolled = true;
        } else if (scrollTop <= SCROLL_THRESHOLD && isScrolled) {
          body.classList.remove('scrolled');
          isScrolled = false;
        }
      },
      { passive: true }
    );
  })();

  // Smooth scroll
  const scrollButton = document.getElementById('scrollButton');

  if (scrollButton) {
    scrollButton.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent default jump

      // Scroll to the newsletter section
      const target = document.getElementById('newsletter');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
