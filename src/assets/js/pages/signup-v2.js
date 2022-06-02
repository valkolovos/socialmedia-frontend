"use strict";

// check for form validity
function checkValidity() {
    if ($('input[name="email"]').val() !== '' && $('input[name="displayName"]').val() !== ''
    && $('input[name="handle"]').val() !== '' && $('input[name="password"]').val() !== '') {
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
    if ($('input[name="email"]').val() === '') {
      $('.control.email').removeClass('has-success')
      $('.control.email').addClass('has-error')
    } else {
      $('.control.email').removeClass('has-error')
      $('.control.email').addClass('has-success')
    }
    checkValidity()
  })

  $('input[name="displayName"]').on('blur input', function() {
    if ($('input[name="displayName"]').val() === '') {
      $('.control.displayName').removeClass('has-success')
      $('.control.displayName').addClass('has-error')
    } else {
      $('.control.displayName').removeClass('has-error')
      $('.control.displayName').addClass('has-success')
    }
    checkValidity()
  })

  $('input[name="handle"]').on('blur input', function() {
    if ($('input[name="handle"]').val() === '') {
      $('.control.handle').removeClass('has-success')
      $('.control.handle').addClass('has-error')
    } else {
      $('.control.handle').removeClass('has-error')
      $('.control.handle').addClass('has-success')
    }
    checkValidity()
  })

  $('input[name="password"]').on('blur input', function() {
    if ($('input[name="password"]').val() === '') {
      $('.control.password').removeClass('has-success')
      $('.control.password').addClass('has-error')
    } else {
      $('.control.password').removeClass('has-error')
      $('.control.password').addClass('has-success')
    }
    checkValidity()
  })

  // set on-click action
  $('.login-form > .buttons > .button').on('click', function() {
    let url = __API_HOST__;
    if (!$('.buttons .button').hasClass('primary-button')) {
      return
    }
    $('.buttons .button').removeClass('primary-button');
    $('.buttons .button').addClass('dark-grey-button');
    signup(
        $('input[name="email"]').val(),
        $('input[name="displayName"]').val(),
        $('input[name="handle"]').val(),
        $('input[name="password"]').val(),
        function(response, status, xhr) {
          if (xhr.status == 200) {
            let bucketPath = __BUCKET_PATH__;
            window.localStorage.setItem("authToken", response.Authorization)
            window.localStorage.setItem("authExpires", response.expires)
            window.location.href = `${bucketPath}/navbar-v2-profile-friends.html`
          } else if (xhr.status == 202) {
            $('#signup-pending-modal-trigger').click();
          }
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
