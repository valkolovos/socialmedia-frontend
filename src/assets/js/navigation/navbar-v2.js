
/*! navbar-mobile.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Navbar mobile js file
========================================================================== */

"use strict";

function initNavbarV2() {
    if ($('.navbar-v2').length) {

        $('#open-mobile-search, .mobile-search .close-icon').on("click", function () {
            $('.mobile-search .input').val('');
            $('.top-nav').find('.left, .right, .mobile-search').toggleClass('is-hidden');
            $('.mobile-search .input').focus();
        });

        // Get current page URL
        var url = window.location.href;

        // remove # from URL
        url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));

        // remove parameters from URL
        url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));

        // select file name
        url = url.substr(url.lastIndexOf("/") + 1);

        // If file name not available
        if (url == '') {
            url = 'index.html';
        }

        $('.sub-nav li').removeClass('is-active');

        // Loop all menu items
        $('.sub-nav a').each(function () {

            // select href
            var href = $(this).attr('href');

            // Check filename
            if (url == href) {

                // Add active class
                $(this).closest('li').addClass('is-active');
            }
        });
    }
};

$(document).ready(function () {


})

function initFriendRequestDropdown(
    connections, confirmCallback=function(connectionId) { },
    declineCallback=function(connectionId) { }
) {
    let unreadConnections = false;
    // clear unread connections flag
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
    for (let i = 0; i < connections.length; i++) {
      if (connections[i].read === false) {
        unreadConnections = true
      }
      if (connections[i].status !== 'pending') {
        continue;
      }
      $('.is-friend-requests').append(buildFriendRequest(connections[i]));
      $(`#confirm-menu-${connections[i].id}`).click(function() {
          $(this).closest('.nav-drop').removeClass('is-active')
          let myConnection = connections[i];
          let confirmMenuButton = $(this);
          confirmConnection(this.dataset.connectionId, function(e) {
              confirmMenuButton.closest('.media').replaceWith(buildConnectedFriend(myConnection));
              $('a.is-friends').addClass('is-active');
              feather.replace();
          });
          confirmCallback(myConnection);
      });
      $(`#decline-menu-${connections[i].id}`).click(function() {
          $(this).closest('.nav-drop').removeClass('is-active')
          let myConnection = connections[i];
          let declineMenuButton = $(this);
          declineConnection(this.dataset.connectionId, function(e) {
              myConnection.status = 'connected';
              declineMenuButton.closest('.media').remove();
          });
          declineCallback(myConnection);
      });
    }
    if (unreadConnections) {
      $('a.is-friends').addClass('is-active')
    }
    feather.replace()
}

function buildFriendRequest(connection) {
    return `
        <div class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/bobby.jpg" alt="">
                </p>
            </figure>
            <div class="media-content">
                <p>${connection.display_name}</p>
                <span>${connection.handle}@${connection.host}</span>
            </div>
            <div class="media-right">
                <button id="confirm-menu-${connection.id}" class="button icon-button is-solid grey-button raised" data-connection-id="${connection.id}" ${connection.read ? 'data-read="true"' : ''}>
                    <i data-feather="user-plus"></i>
                </button>
                <button id="decline-menu-${connection.id}" class="button icon-button is-solid grey-button raised" data-connection-id="${connection.id}">
                    <i data-feather="user-minus"></i>
                </button>
            </div>
        </div>`;
}

function buildConnectedFriend(connection) {
  let bucketPath = __BUCKET_PATH__;
  return `
        <div class="media">
            <figure class="media-left">
                <p class="image">
                    <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/nelly.png" alt="">
                </p>
            </figure>
            <div class="media-content">
                <span>You are now friends with <a href="${bucketPath}/navbar-v2-feed.html?c_id=${connection.id}">${connection.display_name}</a>. Check their <a href="${bucketPath}/navbar-v2-feed.html?c_id=${connection.id}">profile</a>.</span>
            </div>
            <div class="media-right">
                <div class="added-icon">
                    <i data-feather="tag"></i>
                </div>
            </div>
        </div>`;
}

function buildNotificationCard(notification) {
    let bucketPath = __BUCKET_PATH__;
    return `
                <div class="media" data-notification-id="${notification.post_id}" data-reference-read="${notification.reference_read}">
                    <figure class="media-left">
                        <p class="image">
                            <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/david.jpg" alt="">
                        </p>
                    </figure>
                    <div class="media-content">
                        <span><a href="${bucketPath}/navbar-v2-feed.html?c_id=${notification.connection.id}">${notification.connection.display_name}</a> created a new <a href="${bucketPath}/navbar-v2-feed.html?c_id=${notification.connection.id}#${notification.post_id}">post</a><span>
                        <span class="time">${(createTime(notification.created)).message}</span>
                    </div>
                    <div class="media-right">
                        <div class="added-icon${notification.read === false ? " is-unread" : ""}">
                            <i data-feather="radio"></i>
                        </div>
                    </div>
                </div>`
}


function initPostDropdown(postReferences) {
    let unreadNotifications = false;
    for (let i = 0; i < postReferences.length; i++) {
      if (!unreadNotifications && postReferences[i].reference_read === false) {
        unreadNotifications = true;
      }
      $('.notifications').append(buildNotificationCard(postReferences[i]));
    }
    if (unreadNotifications) {
      $('a.is-notifications').addClass('is-active');
    }
    $('a.is-notifications').click(function() {
      $('a.is-notifications').removeClass('is-active');
      $('div[data-notification-id]').each(function() {
          if (this.dataset.referenceRead !== "true") {
            this.dataset.referenceRead = "true";
            markNotificationRead(this.dataset.notificationId, function() {
              console.log('marked notification read');
            });
          }
      });
    });
    feather.replace();
}
