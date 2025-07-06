(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      let action = form.getAttribute('action');
      let recaptcha = form.getAttribute('data-recaptcha-site-key');

      if (!action) {
        displayError(form, 'The form action property is not set!');
        return;
      }

      form.querySelector('.loading').classList.add('d-block');
      form.querySelector('.error-message').classList.remove('d-block');
      form.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData(form);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha.execute(recaptcha, {
                  action: 'php_email_form_submit'
                })
                .then(token => {
                  formData.set('recaptcha-response', token);
                  submitForm(form, action, formData);
                });
            } catch (error) {
              displayError(form, error);
            }
          });
        } else {
          displayError(form, 'The reCaptcha javascript API url is not loaded!');
        }
      } else {
        submitForm(form, action, formData);
      }
    });
  });

  function submitForm(form, action, formData) {
    fetch(action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => response.json())
      .then(data => {
        form.querySelector('.loading').classList.remove('d-block');

        if (data.ok) {
          form.querySelector('.sent-message').classList.add('d-block');
          form.querySelector('.error-message').classList.remove('d-block');
          form.reset();
        } else {
          throw new Error(data.error || 'Form submission failed.');
        }
      })
      .catch((error) => {
        displayError(form, error.message || error);
      });
  }

  function displayError(form, error) {
    form.querySelector('.loading').classList.remove('d-block');
    form.querySelector('.error-message').innerHTML = error;
    form.querySelector('.error-message').classList.add('d-block');
    form.querySelector('.sent-message').classList.remove('d-block');
  }

})();