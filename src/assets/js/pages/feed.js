/*! feed.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Feed page js file
========================================================================== */

$(document).ready(function () {

    "use strict";

    getConnectionInfo(function(response) {
      console.log(response)
      // TODO: handle connection scroll
    });

    if ($('#post-data').length) {
        let messageResponse = getConnectionMessages();
    } else if ($('.profile-timeline').length) {
        let messages = getMessages();
    }

    if ($('#activity-feed').length) {

        //Feed v1 left menu
        if ($('.feed-menu-v1').length){
            $('.feed-menu-v1 .main-menu li.is-active').find('.submenu').slideDown();
            $('.feed-menu-v1 .main-menu li').on('click', function(){
                //$('.submenu').slideUp();
                $(this).siblings('li').removeClass('is-active').find('.submenu').slideUp();
                $(this).addClass('is-active').find('.submenu').slideDown();
            })
        }
    }

    if ($('#share-modal').length){
        //Share modal main dropdown
        $('.share-dropdown').on('click', function () {
            $(this).toggleClass('is-active');
        })

        //Share modal main dropdown
        $('.share-dropdown .dropdown-item').on('click', function () {
            var targetSharingChannel = $(this).attr('data-target-channel');
            var channelIcon = $(this).find('i').attr('class');
            var channelName = $(this).find('h3').text();

            if (targetSharingChannel !== undefined) {
                $('.share-dropdown .button').find('i').removeClass().addClass(channelIcon);
                $('.share-dropdown .button').find('span').text(channelName);
                $('.share-channel-control').addClass('is-hidden');
                $('.footer-action.is-active').removeClass('is-active');
                $('#share-to-' + targetSharingChannel).removeClass('is-hidden').find('input').focus();
            }

        })

        //Share modal page selector subdropdown
        $('.page-dropdown').on('click', function () {
            $(this).toggleClass('is-active');
        })

        //Share modal footer actions
        $('.action-wrap .footer-action').on('click', function () {
            var targetAction = $(this).attr('data-target-action');

            $('.footer-action.is-active').removeClass('is-active');
            $(this).addClass('is-active');

            if (targetAction !== undefined) {
                //$('.share-channel-control').addClass('is-hidden');
                $('.bottom-share-inputs .field').addClass('is-hidden');
                $('#action-' + targetAction).removeClass('is-hidden').find('input').focus();
            }

        })
    }

    if ($('.feed-slider-wrapper').length) {
        $('.feed-slider-inner').slick({
            centerMode: true,
            centerPadding: '10px',
            slidesToShow: 3,
            prevArrow: "<div class='slick-custom is-prev'><i class='mdi mdi-chevron-left'></i></div>",
            nextArrow: "<div class='slick-custom is-next'><i class='mdi mdi-chevron-right'></i></div>",
            responsive: [
              {
                breakpoint: 768,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '40px',
                  slidesToShow: 3
                }
              },
              {
                breakpoint: 480,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: '40px',
                  slidesToShow: 1
                }
              }
            ]
        });
    }

});

function postComment(t) {
    let url = __API_HOST__;
    let messageId = t.dataset.messageId;
    let submitData = new FormData();
    let urlParams = new URLSearchParams(window.location.search);
    let files = $(`#${messageId}-upload-input`).first()[0].files;
    submitData.append('comment', $(`#comment-${messageId}`).val());
    submitData.append('connectionId', urlParams.get("c_id"));
    for (let i = 0; i < files.length; i++) {
        submitData.append(`file-${i}`, files[i]);
    }
    $.ajax(`${url}/add-comment/${t.dataset.messageId}`, {
        method: 'POST',
        headers: {
            'Authorization': window.localStorage.getItem('authToken')
        },
        data: submitData,
        cache: false,
        contentType: false,
        processData: false,
        xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable) {
                    console.log('Uploaded ' + (e.loaded / e.total));
                }
            }
            return xhr;
        },
        success: function(response) {
            console.log(response);
            $(`#${messageId}-comments-body`).append(buildComment(response));
        },
        error: function(errorData, status, errorThrown) {
            console.log(status);
            console.log(errorThrown);
        }
    });
    $(`#comment-${t.dataset.messageId}`).val('');
    $(`${t.dataset.messageId}-comment-upload`).empty();
    feather.replace();
}

function addAndActivateMessages(messages, appendToElement, buildFunction) {
    for (let i = 0; i < messages.length; i++) {
        let parentElement = `[data-card-id="${messages[i].id}"]`
        appendToElement.append(buildFunction(messages[i]));
        // initDropdown()
        $(`[data-card-id="${messages[i].id}"] .dropdown-trigger`).click(function () {
            $(".dropdown-trigger").removeClass("is-active");
            $(this).addClass("is-active");
        });
        // initModals()
        $(`[data-card-id="${messages[i].id}"] .modal-trigger`).on("click", function () {
          var modalID = $(this).attr("data-modal");
          $("#" + modalID).toggleClass("is-active");
        });
        initShareModal(parentElement);
        initPostComments(parentElement);
        initLikeButton(parentElement);
    }
    feather.replace();
    getUserPopovers();
    getPagesPopovers();
}

function getMessages() {
    let url = __API_HOST__;
    let messages;
    $.ajax(
      {
        url: `${url}/get-messages`,
        cache: true,
        async: false,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            console.log(response)
            addAndActivateMessages(response, $('.profile-timeline'), buildPost);
        },
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
            console.log(jqxhr.responseText)
          }
        }
      }
   )
   return messages;
}

function getConnectionMessages() {
    let url = __API_HOST__;
    let connectionMessages
    let urlParams = new URLSearchParams(window.location.search)
    $.ajax(
      {
        url: `${url}/get-connection-messages/${urlParams.get("c_id")}`,
        cache: true,
        async: false,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            console.log(response)
            addAndActivateMessages(response, $('#post-data'), buildCard);
            if (response.length > 0) {
                $('#avatar-connection-name').html(response[0].profile.display_name);
                $('#friend-card-post-count').html(response.length);
            }
        },
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
            console.log(jqxhr.responseText)
          }
        }
      }
   )
   return connectionMessages
};

function buildComment(comment) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let commentDate = new Date(comment.created);
    let commentTime;
    if (commentDate.getHours() > 12) {
        commentTime = `${('0' + (commentDate.getHours() - 12)).slice(-2)}:${('0' + commentDate.getMinutes()).slice(-2)}pm`;
    } else {
        commentTime = `${('0' + commentDate.getHours()).slice(-2)}:${('0' + commentDate.getMinutes()).slice(-2)}am`;
    }
    let imageHtml = '';
    if (comment.files.length >  0) {
        imageHtml = buildImageHtml(comment, true);
    }
    let commentDropdownHtml = `
<div class="dropdown is-spaced is-right is-neutral dropdown-trigger">
    <div>
        <div class="button">
            <i data-feather="more-vertical"></i>
        </div>
    </div>
    <div class="dropdown-menu" role="menu">
        <div class="dropdown-content">
            <a class="dropdown-item">
                <div class="media">
                    <i data-feather="x"></i>
                    <div class="media-content">
                        <h3>Hide</h3>
                        <small>Hide this comment.</small>
                    </div>
                </div>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
                <div class="media">
                    <i data-feather="flag"></i>
                    <div class="media-content">
                        <h3>Report</h3>
                        <small>Report this comment.</small>
                    </div>
                </div>
            </a>
        </div>
    </div>
</div>`;
    let commentHtml = `
            <!-- Comment -->
            <div class="media is-comment">
                <!-- User image -->
                <div class="media-left">
                    <div class="image">
                        <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/dan.jpg" data-user-popover="1" alt="">
                    </div>
                </div>
                <!-- Content -->
                <div class="media-content">
                    <div class="comment-text">
                        <a href="#">${comment.profile.display_name}</a>
                        <span class="time">${commentTime}</span>
                        <p>${comment.text}</p>
                    </div>
                    <div class="comment-image">${imageHtml}</div>
                    <!-- Actions -->
                    <div class="controls">
                        <div class="like-count">
                            <i data-feather="thumbs-up"></i>
                            <span>4</span>
                        </div>
                        <div class="reply">
                            <a href="#">Reply</a>
                        </div>
                        <div class="edit">
                            <a href="#">Edit</a>
                        </div>
                    </div>

                </div>
                <!-- Right side dropdown -->
                <div class="media-right">
                    <!-- /partials/pages/feed/dropdowns/comment-dropdown.html -->
                    ${commentDropdownHtml}
                </div>
            </div>
            <!-- /Comment -->`
    return commentHtml;
}

function buildPost(message) {
    return `
<div class="profile-post">
    <!-- Timeline -->
    <div class="time is-hidden-mobile">
        <div class="img-container">
            <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/jenna.png" alt="">
        </div>
    </div>
    ${buildCard(message)}
</div>`;
}

function buildCard(message) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let messageDate = new Date(message.created);
    let messageTime;
    if (messageDate.getHours() > 12) {
        messageTime = `${('0' + (messageDate.getHours() - 12)).slice(-2)}:${('0' + messageDate.getMinutes()).slice(-2)}pm`;
    } else {
        messageTime = `${('0' + messageDate.getHours()).slice(-2)}:${('0' + messageDate.getMinutes()).slice(-2)}am`;
    }
    let imageHtml = '';
    if (message.files.length >  0) {
        imageHtml = buildImageHtml(message);
    }
    let commentDropdownHtml = `
<div class="dropdown is-spaced is-right is-neutral dropdown-trigger">
    <div>
        <div class="button">
            <i data-feather="more-vertical"></i>
        </div>
    </div>
    <div class="dropdown-menu" role="menu">
        <div class="dropdown-content">
            <a class="dropdown-item">
                <div class="media">
                    <i data-feather="x"></i>
                    <div class="media-content">
                        <h3>Hide</h3>
                        <small>Hide this comment.</small>
                    </div>
                </div>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item">
                <div class="media">
                    <i data-feather="flag"></i>
                    <div class="media-content">
                        <h3>Report</h3>
                        <small>Report this comment.</small>
                    </div>
                </div>
            </a>
        </div>
    </div>
</div>`;

    let commentsHtml = '';
    for (var i = 0; i < message.comments.length; i++) {
        commentsHtml += buildComment(message.comments[i]);
    }

    let cardHtml = `
<div class="card is-post" data-card-id="${message.id}">
    <!-- Main wrap -->
    <div class="content-wrap">
        <!-- Post header -->
        <div class="card-heading">
            <!-- User meta -->
            <div class="user-block">
                <div class="image">
                    <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/dan.jpg" data-user-popover="1" alt="">
                </div>
                <div class="user-info">
                    <a href="#">${message.profile.display_name}</a>
                    <span class="time">${monthNames[messageDate.getMonth()]} ${('0' + messageDate.getDate()).slice(-2)} ${messageDate.getFullYear()}, ${messageTime}</span>
                </div>
            </div>
            <!-- Right side dropdown -->
            <div class="dropdown is-spaced is-right is-neutral dropdown-trigger">
                <div>
                    <div class="button">
                        <i data-feather="more-vertical"></i>
                    </div>
                </div>
                <div class="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                        <a href="#" class="dropdown-item">
                            <div class="media">
                                <i data-feather="bookmark"></i>
                                <div class="media-content">
                                    <h3>Bookmark</h3>
                                    <small>Add this post to your bookmarks.</small>
                                </div>
                            </div>
                        </a>
                        <a class="dropdown-item">
                            <div class="media">
                                <i data-feather="bell"></i>
                                <div class="media-content">
                                    <h3>Notify me</h3>
                                    <small>Send me the updates.</small>
                                </div>
                            </div>
                        </a>
                        <hr class="dropdown-divider">
                        <a href="#" class="dropdown-item">
                            <div class="media">
                                <i data-feather="flag"></i>
                                <div class="media-content">
                                    <h3>Flag</h3>
                                    <small>In case of inappropriate content.</small>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <!-- /Post header -->

        <!-- Post body -->
        <div class="card-body">
            <!-- Post body text -->
            <div class="post-text">
                <p>${message.text}</p>
            </div>
            <!-- Featured image -->
            ${imageHtml}
        </div>
        <!-- /Post body -->

        <!-- Post footer -->
        <div class="card-footer">
            <!-- Followers avatars -->
            <div class="likers-group">
                <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/dan.jpg" data-user-popover="1" alt="">
                <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/david.jpg" data-user-popover="4" alt="">
                <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/edward.jpeg" data-user-popover="5" alt="">
                <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/milly.jpg" data-user-popover="7" alt="">
            </div>
            <!-- Followers text -->
            <div class="likers-text">
                <p>
                    <a href="#">Milly</a>,
                    <a href="#">David</a>
                </p>
                <p>and 23 more liked this</p>
            </div>
            <!-- Post statistics -->
            <div class="social-count">
                <div class="likes-count">
                    <i data-feather="heart"></i>
                    <span>27</span>
                </div>
                <div class="shares-count">
                    <i data-feather="link-2"></i>
                    <span>9</span>
                </div>
                <div class="comments-count">
                    <i data-feather="message-circle"></i>
                    <span>${message.comments.length}</span>
                </div>
            </div>
        </div>
        <!-- /Post footer -->
    </div>
    <!-- /Main wrap -->

    <div class="comments-wrap is-hidden">
        <!-- Header -->
        <div class="comments-heading">
            <h4>Comments
                <small>(${message.comments.length})</small></h4>
            <div class="close-comments">
                <i data-feather="x"></i>
            </div>
        </div>
        <!-- /Header -->

        <!-- Comments body -->
        <div class="comments-body has-slimscroll" id="${message.id}-comments-body">
          ${commentsHtml}
        </div>
        <!-- /Comments body -->

        <!-- Comments footer -->
        <div class="card-footer">
            <div class="media post-comment has-emojis">
                <!-- Comment Textarea -->
                <div class="media-content">
                    <div class="field">
                        <p class="control">
                            <textarea name="comment-${message.id}" id="comment-${message.id}" class="textarea comment-textarea" rows="5" placeholder="Write a comment..."></textarea>
                        </p>
                        <div id="${message.id}-comment-upload" class="feed-upload"></div>
                    </div>
                    <!-- Additional actions -->
                    <div class="actions">
                        <div class="image is-32x32">
                            <img class="is-rounded" src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/jenna.png" data-user-popover="0" alt="">
                        </div>
                        <div class="toolbar">
                            <div class="action is-auto">
                                <i data-feather="at-sign"></i>
                            </div>
                            <div class="action is-emoji">
                                <i data-feather="smile"></i>
                            </div>
                            <div class="action is-upload">
                                <i data-feather="camera"></i>
                                <input id="${message.id}-upload-input" type="file" accept=".png, .jpg, .jpeg" onchange="readURL(this)" data-target-id="#${message.id}-comment-upload">
                            </div>
                            <a class="button is-solid primary-button raised" data-message-id="${message.id}" onclick="postComment(this)">Post Comment</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Comments footer -->
    </div>
</div>`
    return cardHtml;
}

function buildActionButtonHtml() {
  return `
                <!-- Action buttons -->
                <div class="like-wrapper">
                    <a href="javascript:void(0);" class="like-button">
                        <i class="mdi mdi-heart not-liked bouncy"></i>
                        <i class="mdi mdi-heart is-liked bouncy"></i>
                        <span class="like-overlay"></span>
                    </a>
                </div>

                <div class="fab-wrapper is-share">
                    <a href="javascript:void(0);" class="small-fab share-fab modal-trigger" data-modal="share-modal">
                        <i data-feather="link-2"></i>
                    </a>
                </div>

                <div class="fab-wrapper is-comment">
                    <a href="javascript:void(0);" class="small-fab">
                        <i data-feather="message-circle"></i>
                    </a>
                </div>`;
}

function buildImageHtml(message, isComment=false) {
    let imgClass = 'triple-grid';
    if (message.files.length > 4) {
        imgClass = 'masonry-grid';
    }
    let actionButtonHtml = isComment ? '' : buildActionButtonHtml();
    return `
            <div class="post-image">
                <div class="${imgClass}">
                ${message.files.length > 4 ? `<div class="masonry-column-left">` : ''}
                <a ${message.files.length === 2 || message.files.length === 4 || isComment ? 'class="is-half"' : ''} data-fancybox="post-${message.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${message.files[0]}" data-demo-href="assets/img/demo/unsplash/1.jpg">
                    <img src="${message.files[0]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt="">
                </a>
                ${message.files.length > 1 ? `<a class="is-half" data-fancybox="post-${message.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${message.files[1]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${message.files[1]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt=""></a>` : ''}
                ${message.files.length > 2 ? `<a class="is-half" data-fancybox="post-${message.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${message.files[2]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${message.files[2]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt=""></a>` : ''}
                ${message.files.length > 4 ? '</div><div class="masonry-column-right">' : ''}
                ${message.files.length > 3 ? `<a class="is-half" data-fancybox="post-${message.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${message.files[3]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${message.files[3]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt=""></a>` : ''}
                ${message.files.length > 4 ? `<a ${message.files.length > 5 ? `class="is-more" ` : ''}" data-fancybox="post-${message.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${message.files[4]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${message.files[4]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt="">${message.files.length > 5 ? `<div class="img-count">+${message.files.length - 5}</div>` : ''  }</a></div>` : ''}
                ${actionButtonHtml}
                </div>
            </div>`
}

