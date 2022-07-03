/*! feed.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Feed page js file
========================================================================== */

function initScrollToSelectedPost() {
  $(window).on("load", function () {
      var scrollTimeout = setTimeout(function () {
        if (window.location.href.split('#').length > 1) {
          let msg_id = window.location.href.split('#')[1];
          let container = $('#activity-feed');
          let scrollTo = $(`[data-card-id="${msg_id}"]`);
          let position = scrollTo.offset().top - container.offset().top + container.scrollTop();
          $('html,body').stop().animate({ scrollTop: position }, 1000)
        }
        clearTimeout(scrollTimeout);
      }, 500);
  });
}

function createReadTimer(post) {
  if (post.dataset.cardRead !== "false") {
    return null;
  }
  return setTimeout(function() {
    markPostRead(post.dataset.cardId, function() {
        if ($(`div[data-notification-id="${post.dataset.cardId}"]`)) {
          $(`div[data-notification-id="${post.dataset.cardId}"] .media-right .added-icon`).removeClass('is-unread');
        }
        delete post.dataset.cardRead;
    });
  }, 3000);
}

function initMarkPostRead() {
  $(window).on("load", function () {
    // array of all posts
    let all = [];
    // array of indexes (actual integers) of items in 'all' that are currently visible
    let visible = [];
    // array of active read timers
    let readTimers = {};
    var markPostReadTimeout = setTimeout(function () {
      if ($('#post-data').length) {
        $('.is-post').each(function(index) {
          all.push(this);
          if (checkVisible(this)) {
            visible.push(index);
            readTimers[this.dataset.cardId] = createReadTimer(this)
          }
        });
      }
      clearTimeout(markPostReadTimeout);
    }, 1700);
    $(window).scroll(function (event) {
        let start = visible[0] > 0 ? visible[0]-1 : 0;
        let end = visible[visible.length - 1] + 2 < all.length ?
            visible[visible.length - 1] + 2 : all.length;
        for (let i = start; i < end; i++) {
          if (checkVisible(all[i]) && !visible.includes(i)) {
            let cardId = all[i].dataset.cardId;
            clearTimeout(readTimers[cardId]);
            readTimers[cardId] = createReadTimer(all[i])
            visible.push(i);
          } else if (!checkVisible(all[i]) && visible.includes(i)) {
            clearTimeout(readTimers[all[i].dataset.cardId]);
            visible.splice(visible.indexOf(i), 1)
          }
        }
        visible = visible.sort(function(a,b) { return a-b });
        //$('.is-post').each(function() {
            // viewport height, scroll top, post top
            // if (evalType === "visible") return ((y < (vpH + st)) && (y > (st - elementHeight)));
            // console.log($(window).height(), $(window).scrollTop(), $(this).offset().top, $(this).height(), checkVisible(this))
        //});
        // Do something
    });
  })
}

initScrollToSelectedPost();
initMarkPostRead();

$(document).ready(function () {

    "use strict";

    if ($('#post-data').length) {
        let postResponse = getConnectionPosts();
    } else if ($('.profile-timeline').length) {
        let posts = getPosts();
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

    getConnectionInfo(function(response) {
      initFriendRequestDropdown(response.connections);
      initPostDropdown(response.post_references);
    });

});

function postComment(t) {
    let url = __API_HOST__;
    let postId = t.dataset.postId;
    let submitData = new FormData();
    let urlParams = new URLSearchParams(window.location.search);
    let files = $(`#${postId}-upload-input`).first()[0].files;
    submitData.append('comment', $(`#comment-${postId}`).val());
    submitData.append('connectionId', urlParams.get("c_id"));
    for (let i = 0; i < files.length; i++) {
        submitData.append(`file-${i}`, files[i]);
    }
    $.ajax(`${url}/add-comment/${t.dataset.postId}`, {
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
            $(`#${postId}-comments-body`).append(buildComment(response));
        },
        error: function(errorData, status, errorThrown) {
          // TODO: actually handle this?
          console.log(status);
          console.log(errorThrown);
        }
    });
    $(`#comment-${t.dataset.postId}`).val('');
    $(`${t.dataset.postId}-comment-upload`).empty();
    feather.replace();
}

function addAndActivatePosts(posts, appendToElement, buildFunction) {
    for (let i = 0; i < posts.length; i++) {
        let parentElement = `[data-card-id="${posts[i].id}"]`
        appendToElement.append(buildFunction(posts[i]));
        // initDropdown()
        $(`[data-card-id="${posts[i].id}"] .dropdown-trigger`).click(function () {
            $(".dropdown-trigger").removeClass("is-active");
            $(this).addClass("is-active");
        });
        // initModals()
        $(`[data-card-id="${posts[i].id}"] .modal-trigger`).on("click", function () {
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

function getPosts() {
    let url = __API_HOST__;
    let posts;
    $.ajax(
      {
        url: `${url}/get-posts`,
        cache: true,
        async: false,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            addAndActivatePosts(response, $('.profile-timeline'), buildPost);
        },
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
          }
        }
      }
   )
   return posts;
}

function getConnectionPosts() {
    let url = __API_HOST__;
    let connectionPosts
    let urlParams = new URLSearchParams(window.location.search)
    $.ajax(
      {
        url: `${url}/get-connection-posts/${urlParams.get("c_id")}`,
        cache: true,
        async: false,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            addAndActivatePosts(response, $('#post-data'), buildCard);
            if (response.length > 0) {
                $('#avatar-connection-name').html(response[0].profile.display_name);
                $('#friend-card-post-count').html(response.length);
            }
            initTooltips('.user-info .has-tooltip');

        },
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
          }
        }
      }
   )
   return connectionPosts
};

function buildComment(comment) {
    let commentTime = createTime(comment.created);
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
                        <span class="time has-tooltip" data-title="${commentTime.actual}">${commentTime.message}</span>
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

function buildPost(post) {
    return `
<div class="profile-post">
    <!-- Timeline -->
    <div class="time is-hidden-mobile">
        <div class="img-container">
            <img src="https://via.placeholder.com/300" data-demo-src="assets/img/avatars/jenna.png" alt="">
        </div>
    </div>
    ${buildCard(post)}
</div>`;
}

function buildCard(post) {
    let postTime = createTime(post.created);
    let imageHtml = '';
    if (post.files.length >  0) {
        imageHtml = buildImageHtml(post);
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
    for (var i = 0; i < post.comments.length; i++) {
        commentsHtml += buildComment(post.comments[i]);
    }

    let cardHtml = `
<div class="card is-post" data-card-id="${post.id}" ${post.read === false ? 'data-card-read="false"' : ''}><a href="#${post.id}"></a>
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
                    <a href="#">${post.profile.display_name}</a>
                    <span class="time has-tooltip" data-title="${postTime.actual}">${postTime.message}</span>
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
                <p>${post.text}</p>
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
                    <span>${post.comments.length}</span>
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
                <small>(${post.comments.length})</small></h4>
            <div class="close-comments">
                <i data-feather="x"></i>
            </div>
        </div>
        <!-- /Header -->

        <!-- Comments body -->
        <div class="comments-body has-slimscroll" id="${post.id}-comments-body">
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
                            <textarea name="comment-${post.id}" id="comment-${post.id}" class="textarea comment-textarea" rows="5" placeholder="Write a comment..."></textarea>
                        </p>
                        <div id="${post.id}-comment-upload" class="feed-upload"></div>
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
                                <input id="${post.id}-upload-input" type="file" accept=".png, .jpg, .jpeg" onchange="readURL(this)" data-target-id="#${post.id}-comment-upload">
                            </div>
                            <a class="button is-solid primary-button raised" data-post-id="${post.id}" onclick="postComment(this)">Post Comment</a>
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

function buildImageHtml(post, isComment=false) {
    let imgClass = 'triple-grid';
    if (post.files.length > 4) {
        imgClass = 'masonry-grid';
    }
    let actionButtonHtml = isComment ? '' : buildActionButtonHtml();
    return `
            <div class="post-image">
                <div class="${imgClass}">
                ${post.files.length > 4 ? `<div class="masonry-column-left">` : ''}
                <a ${post.files.length === 2 || post.files.length === 4 || isComment ? 'class="is-half"' : ''} data-fancybox="post-${post.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${post.files[0]}" data-demo-href="assets/img/demo/unsplash/1.jpg">
                    <img src="${post.files[0]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt="">
                </a>
                ${post.files.length > 1 ? `<a class="is-half" data-fancybox="post-${post.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${post.files[1]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${post.files[1]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt=""></a>` : ''}
                ${post.files.length > 2 ? `<a class="is-half" data-fancybox="post-${post.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${post.files[2]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${post.files[2]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt=""></a>` : ''}
                ${post.files.length > 4 ? '</div><div class="masonry-column-right">' : ''}
                ${post.files.length > 3 ? `<a class="is-half" data-fancybox="post-${post.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${post.files[3]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${post.files[3]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt=""></a>` : ''}
                ${post.files.length > 4 ? `<a ${post.files.length > 5 ? `class="is-more" ` : ''}" data-fancybox="post-${post.id}" data-lightbox-type="comments" data-thumb="assets/img/demo/unsplash/1.jpg" href="${post.files[4]}" data-demo-href="assets/img/demo/unsplash/1.jpg"><img src="${post.files[4]}" data-demo-src="assets/img/demo/unsplash/1.jpg" alt="">${post.files.length > 5 ? `<div class="img-count">+${post.files.length - 5}</div>` : ''  }</a></div>` : ''}
                ${actionButtonHtml}
                </div>
            </div>`
}

