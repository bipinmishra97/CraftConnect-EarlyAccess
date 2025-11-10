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
    'https://script.google.com/macros/s/AKfycbxTsN8u6DwsDHpi41m0AOJ59bjzfPHScwxfNtmupZA708ajI-JVmERwtfSpE_MCNAp3/exec';

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
        // Get reCAPTCHA token before sending
        const token = await grecaptcha.execute(
          '6LcD7wcsAAAAAP1DjhC-XbsVRGIPEz1uA9nA9RUH',
          {
            action: 'newsletter',
          }
        );

        const body = new URLSearchParams({
          email,
          token, // send token to server
        }).toString();

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
          msg.textContent = '';
          showSuccessPopup(); // Show popup instead of text feedback
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

  // Popup logic
  function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  // Popup elements
  const popupOverlay = document.getElementById('successPopup');
  const closeButtons = document.querySelectorAll('#popupClose'); // All close buttons

  if (popupOverlay) {
    // Function to close popup
    const closePopup = () => {
      popupOverlay.hidden = true;
      document.body.style.overflow = 'auto';
    };

    // Close on any close button click
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', closePopup);
    });

    // Close when clicking outside the popup box
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        closePopup();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closePopup();
      }
    });
  }
});
