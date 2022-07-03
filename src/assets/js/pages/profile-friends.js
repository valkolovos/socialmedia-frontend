/*! profile-friends.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Friends page js file
========================================================================== */

// check for form validity
function checkValidity() {
    if ($('input[name="handle"]').val() !== '' && $('input[name="host"]').val() !== '') {
      $('#add-connection-modal > .modal-content > .card > .card-footer > .button').removeClass('dark-grey-button')
      $('#add-connection-modal > .modal-content > .card > .card-footer > .button').addClass('primary-button')
      $('.card-footer .button').addClass('primary-button')
    } else {
      $('#add-connection-modal > .modal-content > .card > .card-footer > .button').removeClass('primary-button')
      $('#add-connection-modal > .modal-content > .card > .card-footer > .button').addClass('dark-grey-button')
    }
}

$(document).ready(function(){

    "use strict";

    if ($('#profile-friends').length){

        // put friend loading code here
        let connectionInfo = getConnectionInfo(buildAndActivateConnectionCards);
        $('#timeline-profile-name').html(JSON.parse(window.localStorage.getItem('profile')).display_name);
        $('#timeline-profile-handle').html(JSON.parse(window.localStorage.getItem('profile')).handle);

        $('input[name="handle"]').on('blur input', function() {
          if ($('input[name="host"]').val() === '') {
            $('.new-connection-form .form-panel .field .handle').removeClass('has-success')
            $('.new-connection-form .form-panel .field .handle').addClass('has-error')
          } else {
            $('.new-connection-form .form-panel .field .handle').removeClass('has-error')
            $('.new-connection-form .form-panel .field .handle').addClass('has-success')
          }
          checkValidity()
        })

        $('input[name="host"]').on('blur input', function() {
          if ($('input[name="password"]').val() === '') {
            $('.new-connection-form .form-panel .field .host').removeClass('has-success')
            $('.new-connection-form .form-panel .field .host').addClass('has-error')
          } else {
            $('.new-connection-form .form-panel .field .host').removeClass('has-error')
            $('.new-connection-form .form-panel .field .host').addClass('has-success')
          }
          checkValidity()
        })

        // set on-click action
        $('#add-connection-modal > .modal-content > .card > .card-footer > .button').on('click', function() {
          let url = __API_HOST__;
          if ($('#add-connection-modal > .modal-content > .card > .card-footer > .button').hasClass('primary-button')) {
            requestConnection($('input[name="handle"]').val(), $('input[name="host"]').val(), function() {
              $('.new-connection-form').replaceWith('<p>Your connection request has been sent</p>');
              $('.card-footer .button').addClass('is-hidden');
            });
          }
        });

    }

})

function buildLinkHtml(connection) {
    let linkHtml;
    if (connection.status === 'connected') {
      linkHtml = '<div class="star-friend"><i data-feather="star"></i></div>';
    } else if (connection.status === 'pending') {
      linkHtml = `<div class="pending-friend"><div class="pending-confirm has-tooltip" data-title="Confirm connection" id="confirm-${connection.id}" data-connection-id="${connection.id}"><i data-feather="plus-circle"></i></div><div class="pending-decline has-tooltip" data-title="Decline connection" id="decline-${connection.id}" data-connection-id="${connection.id}"><i data-feather="x-circle"></i></div></div>`;
    }
    return linkHtml;
}

function buildConnectionHtml(connection) {
    // add class 'is-active' to 'star-friend'
    let linkHtml = buildLinkHtml(connection);
    let unreadNotifications = 0;
    for (let i = 0; i < connection.post_references.length; i++) {
        if (connection.post_references[i].read !== true) {
            unreadNotifications++;
        }
    }
    let cardHtml = `
                        <div class="column is-3">
                            <a class="friend-item has-text-centered" ${connection.status === 'connected' ? `data-connection-id="${connection.id}"` : ''}>
                                ${linkHtml}
                                <div class="avatar-wrap">
                                    <div class="circle"></div>
                                    <div class="chat-button">
                                        <i data-feather="message-circle"></i>
                                    </div>
                                    <img src="https://via.placeholder.com/150x150" data-demo-src="assets/img/avatars/milly.jpg" data-user-popover="7" alt="">
                                </div>
                                <h3>${connection.display_name}</h3>
                                <p>${connection.handle}</p>
                                <div class="friend-stats">
                                    <!--
                                    <div class="stat-block">
                                        <label>Friends</label>
                                        <div class="stat-number">
                                            478
                                        </div>
                                    </div>
                                    -->
                                    <div class="stat-block">
                                        <label>Posts</label>
                                        <div class="stat-number">
                                            ${connection.total_post_count} (${unreadNotifications})
                                        </div>
                                    </div>
                                    <!--
                                    <div class="stat-block">
                                        <label>Likes</label>
                                        <div class="stat-number">
                                            899
                                        </div>
                                    </div>
                                    -->
                                </div>
                            </a>
                        </div>`
  return cardHtml
}

function confirmClick(connection, confirmButton) {
    let friendCard = $(confirmButton).closest('.column.is-3');
    confirmButton.closest('.pending-friend').remove();
    confirmConnection(confirmButton.dataset.connectionId, function(e) {
        connection.status = 'connected';
        let connectionHtml = buildConnectionHtml(connection);
        friendCard.replaceWith(connectionHtml);
        // turn on star button
        $(`a[data-connection-id="${connection.id}"] .star-friend`).on('click', function (e) {
            $(confirmButton).toggleClass('is-active');
            e.stopPropagation();
        });
        // link card to feed page
        $(`a.friend-item[data-connection-id="${connection.id}"]`).click(function() {
            let bucketPath = __BUCKET_PATH__;
            if ($(this).data().connectionId !== undefined) {
              window.location = `${bucketPath}/navbar-v2-feed.html?c_id=${$(this).data().connectionId}`;
            }
        });
        feather.replace();
    });
}

function declineClick(connection, declineButton) {
    declineConnection(declineButton.dataset.connectionId, function(e) {
        $(declineButton).closest('.column.is-3').remove();
    });
}

function buildAndActivateConnectionCards(response) {
    let connections = response.connections;
    $('#timeline-profile-friendcount').html(`${connections.length}`)
    for (let i = 0; i < connections.length; i++) {
      $('.friends-grid > .columns').append(buildConnectionHtml(connections[i]));
      $(`a[data-connection-id="${connections[i].id}"] .star-friend`).on('click', function (e) {
          $(this).toggleClass('is-active');
          e.stopPropagation();
      });
      initTooltips(`#confirm-${connections[i].id}, #decline-${connections[i].id}`)
      $(`#confirm-${connections[i].id}`).click(function() {
        confirmClick(connections[i], this);
        // added this _outside_ of the click handler to avoid an endless circle
        let confirmMenuButton = $(`#confirm-menu-${connections[i].id}`);
        confirmMenuButton.closest('.media').replaceWith(buildConnectedFriend(connections[i]));
      });
      $(`#decline-${connections[i].id}`).click(function() {
        declineClick(connections[i], this);
        // added this _outside_ of the click handler to avoid an endless circle
        let declineMenuButton = $(`#decline-menu-${connections[i].id}`);
        declineMenuButton.closest('.media').remove();
      });
    }
    initFriendRequestDropdown(
      connections,
      function(connection) {
          confirmClick(connection, $(`#confirm-${connection.id}`)[0]);
      },
      function(connection) {
          declineClick(connection, $(`#decline-${connection.id}`)[0]);
      }
    );
    initPostDropdown(response.post_references);
    /*
    $('a.is-friends').click(function() {
      $('a.is-friends').removeClass('is-active');
      $('.is-friend-requests').find('.button[data-connection-id]').each(function() {
        if (this.id.startsWith('confirm') && !this.dataset.read) {
          this.dataset.read = true;
          markConnectionRead(this.dataset.connectionId, function() {
            console.log('marked connection read');
          });
        }
      });
    });
    */
    $('a.friend-item[data-connection-id]').click(function() {
        let bucketPath = __BUCKET_PATH__;
        if ($(this).data().connectionId !== undefined) {
          window.location = `${bucketPath}/navbar-v2-feed.html?c_id=${$(this).data().connectionId}`;
        }
    });
    feather.replace()
}


