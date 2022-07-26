import {logIn} from '../api.js'

// check for form validity
function checkValidity() {
    if ($('input[name="email"]').val() !== '' && $('input[name="password"]').val() !== '') {
      $('.buttons .button').removeClass('dark-grey-button')
      $('.buttons .button').addClass('primary-button')
    } else {
      $('.buttons .button').removeClass('primary-button')
      $('.buttons .button').addClass('dark-grey-button')
    }
}

$(document).ready(function () {

  "use strict";

  $('input[name="email"]').on('blur input', function() {
    $('h3.form-subtitle-error').text('')
    $('h3.form-subtitle-error').addClass('is-hidden')
    if ($('input[name="email"]').val() === '') {
      $('.login-form .form-panel .field .email').removeClass('has-success')
      $('.login-form .form-panel .field .email').addClass('has-error')
    } else {
      $('.login-form .form-panel .field .email').removeClass('has-error')
      $('.login-form .form-panel .field .email').addClass('has-success')
    }
    checkValidity()
  })

  $('input[name="email"],input[name="password"]').keypress(function(e) {
    if (e.which == 13) {
        $('.login-form > .buttons > .button').click();
    }
  });

  $('input[name="password"]').on('blur input', function() {
    $('h3.form-subtitle-error').text('')
    $('h3.form-subtitle-error').addClass('is-hidden')
    if ($('input[name="password"]').val() === '') {
      $('.login-form .form-panel .field .password').removeClass('has-success')
      $('.login-form .form-panel .field .password').addClass('has-error')
    } else {
      $('.login-form .form-panel .field .password').removeClass('has-error')
      $('.login-form .form-panel .field .password').addClass('has-success')
    }
    checkValidity()
  })

  // set on-click action
  $('.login-form > .buttons > .button').on('click', function() {
    let url = __API_HOST__;
    if (!$('.buttons .button').hasClass('primary-button')) {
      return
    }
    logIn($('input[name="email"]').val(), $('input[name="password"]').val(),
        function(response, status, xhr) {
          let bucketPath = __BUCKET_PATH__;
          window.localStorage.setItem("authToken", response.Authorization)
          window.localStorage.setItem("authExpires", response.expires)
          window.location.href = `${bucketPath}/navbar-v2-profile-friends.html`
        },
        function(jqxhr, status, errorThrown) {
          if (jqxhr.status == 400 || jqxhr.status == 401) {
            $('h3.form-subtitle-error').text(jqxhr.responseText)
            $('h3.form-subtitle-error').removeClass('is-hidden')
          }
        }
    );
  });

})
