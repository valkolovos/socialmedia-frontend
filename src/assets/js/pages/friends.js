/*! friends.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Friends page js file
========================================================================== */

$(document).ready(function(){

    "use strict";

    if ($('#friends-page').length){

        //Hide loader
        $('.subloader').removeClass('is-active');

        //Init combo box
        initComboBox();

        //Init image combo box
        initImageComboBox();

        //Enable full text search function
        function enableSearch() {
            $('.friend-card').addClass('textFilter-target')
            $('.friend-card').find(' .friend-info h3,  .friend-info p').addClass('textFilter-match');
        }

        enableSearch();

        //Init search filter
        initTextFilter();

        //Friend menu tabs
        $('.option-tabs.is-friends .option-tab').on('click', function(){
            callLoader(800);
            var targetTab = $(this).attr('data-tab');
            $(this).siblings('.option-tab').removeClass('is-active');
            $(this).addClass('is-active');
            setTimeout(function(){
                $('.card-row-wrap').removeClass('is-active');
                $('#' + targetTab).addClass('is-active');
            }, 200)
        })

        //Star a friend
        $('.star-friend').on('click', function () {
            $(this).toggleClass('is-active');
        })

        // put friend loading code here
        let connectionInfo = getConnectionInfo();

        //Call loader
        function callLoader(t){
            $('.subloader').addClass('is-active');
            setTimeout(function(){
                $('.subloader').removeClass('is-active');
            }, t)
        }

    }

})

function buildConnectionHtml(connection) {
    // add class 'is-active' to 'star-friend'
    let linkHtml
    if (connection.status === 'connected') {
      linkHtml = '<div class="star-friend"><i data-feather="star"></i></div>'
    } else if (connection.status === 'pending') {
      linkHtml = '<div class="pending-friend"><i data-feather="loader"></i></div>'
    }
    let cardHtml = `
<div class="card-flex friend-card" ${connection.status === 'connected' ? `data-connection-id="${connection.id}` : ''}">
    ${linkHtml}
    <div class="img-container">
        <img class="avatar" src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/dan.jpg"
            alt="">
        <!--
        <img class="country" src="assets/img/icons/flags/united-states-of-america.svg" alt="">
        -->
    </div>
    <div class="friend-info">
        <h3>${connection.display_name}</h3>
        <p>${connection.handle}</p>
    </div>
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
            <label>Unread Posts</label>
            <div class="stat-number">
                ${connection.unread_message_count}
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
</div>`
  return cardHtml
}

function getConnectionInfo() {
    let connectionInfo
    let url = __API_HOST__;
    $.ajax(
      {
        url: `${url}/get-connection-info`,
        cache: false,
        async: false,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
          $('.is-friend-count').html(`${response.length} friends`)
          for (let i = 0; i < response.length; i++) {
            console.log(response[i]);
            $('#all-friends div.card-row').append(buildConnectionHtml(response[i]));
            $('.star-friend').on('click', function () {
                $(this).toggleClass('is-active');
            });
            feather.replace()
          }
          $('.friend-card').click(function() {
              if ($(this).data().connectionId !== undefined) {
                  window.location = `/navbar-v1-feed.html?c_id=${$(this).data().connectionId}`;
              }
          });
        },
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
            console.log(jqxhr.responseText)
          }
        }
      }
   )
   return connectionInfo
};

