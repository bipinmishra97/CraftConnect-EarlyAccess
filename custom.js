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

  const SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbz_D6kvlFOriJRHkYf-N1DBLnwuJM3YG_hNKP81JEBvSrSfbwmTXgrRXQf2ehK_LcxB/exec';

  // Simple email regex (client-side only)
  function isEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  document.addEventListener('submit', async (evt) => {
    const form = evt.target;
    const formIds = ['hero-email-form', 'newsletter-email-form'];

    // Check if the submitted form is one we care about
    if (formIds.includes(form.id)) {
      evt.preventDefault();

      const emailInput = form.querySelector('[type="email"]');
      const msg = form.querySelector('.msg'); //|| document.getElementById('msg');
      msg.textContent = '';
      const email = emailInput.value.trim();
      if (!email) {
        msg.textContent = 'Please enter your email.';
        emailInput.focus();
        return;
      }
      if (!isEmail(email)) {
        msg.textContent = 'Please enter a valid email address.';
        emailInput.focus();
        return;
      }

      // Disable UI while submitting
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      try {
        // Use application/x-www-form-urlencoded body (Apps Script handles both)
        const token = grecaptcha.getResponse();
        if (!token) {
          msg.textContent = 'Please complete the reCAPTCHA.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Notify Me';
          return;
        }

        const body = new URLSearchParams({ email, token }).toString();

        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        });

        // Try to parse JSON response, but handle non-JSON gracefully
        let data = null;
        try {
          data = await res.json();
        } catch (e) {
          /* ignore */
        }

        if (res.ok && data && data.status === 'success') {
          msg.textContent = 'Thanks — you are subscribed!';
          emailInput.value = '';
        } else if (res.ok && data && data.status === 'error') {
          msg.textContent =
            'Error: ' + (data.message || 'Unable to save your email.');
        } else if (!res.ok) {
          msg.textContent = 'Server error. Try again later.';
        } else {
          // Fallback: success if server returned 200 but no JSON
          msg.textContent = 'Thanks — saved!';
          emailInput.value = '';
        }
      } catch (err) {
        console.error(err);
        msg.textContent =
          'Network or CORS error. Check Apps Script deployment and the URL.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
      }
    }
  });
});
