/*! compose.js | Friendkit | © Css Ninja. 2019-2021 */

/* ==========================================================================
Functions
========================================================================== */

"use strict";

//The following functions help trigger the autocompletes dropdowns

function openFriendsDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#feed-users-autocpl").focus();
    $("#feed-users-autocpl").attr('value', '');
    $("#feed-users-autocpl").triggerHandler(e);
};

function openActivitiesDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#activities-autocpl").focus();
    $("#activities-autocpl").attr('value', '');
    $("#activities-autocpl").triggerHandler(e);
};

function openMoodDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#mood-autocpl").focus();
    $("#mood-autocpl").attr('value', '');
    $("#mood-autocpl").triggerHandler(e);
};

function openDrinksDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#drinking-autocpl").focus();
    $("#drinking-autocpl").attr('value', '');
    $("#drinking-autocpl").triggerHandler(e);
};

function openEatsDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#eating-autocpl").focus();
    $("#eating-autocpl").attr('value', '');
    $("#eating-autocpl").triggerHandler(e);
};

function openReadsDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#reading-autocpl").focus();
    $("#reading-autocpl").attr('value', '');
    $("#reading-autocpl").triggerHandler(e);
};

function openWatchDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#watching-autocpl").focus();
    $("#watching-autocpl").attr('value', '');
    $("#watching-autocpl").triggerHandler(e);
};

function openTravelDrop() {
    var e = $.Event("keyup", { keyCode: 65, which: 65 });
    $("#travel-autocpl").focus();
    $("#travel-autocpl").attr('value', '');
    $("#travel-autocpl").triggerHandler(e);
};

function readURLOnload(e) {
    var deleteIcon = feather.icons.x.toSvg();
    var template = `
        <div class="upload-wrap" data-input-name="${e.target.inputName}">
            <img src="${e.target.result}" data-file-name="${e.target.fileName}" alt="">
            <span class="remove-file">
                ${deleteIcon}
            </span>
        </div>
    `;

    $(e.target.targetId).append(template);

    $('.remove-file').on('click', function(){
        let fileName = $(this).prev().data().fileName;
        let inputName = $(this).parent().data().inputName;
        let fileBuffer = Array.from($(`#${inputName}`)[0].files);
        // had to use a hack to remove a file from the immutable file list
        let removeIdx;
        for (var i = 0; i < fileBuffer.length; i++) {
            if (fileBuffer[i].name === fileName) {
                removeIdx = i;
            }
        }
        if (removeIdx !== undefined) {
            fileBuffer.splice(removeIdx, 1)
        }
        const dT = new ClipboardEvent('').clipboardData || // Firefox < 62 workaround exploiting https://bugzilla.mozilla.org/show_bug.cgi?id=1422655
            new DataTransfer(); // specs compliant (as of March 2018 only Chrome)
        for (var i = 0; i < fileBuffer.length; i++) {
          dT.items.add(fileBuffer[i]);
        }
        $(`#${inputName}`)[0].files = dT.files;
        $(this).closest('.upload-wrap').remove();
    });
}

function readURL(input) {
    if (input.files) {
        $(`.upload-wrap[data-input-name="${input.id}"]`).remove();
        for (let i = 0; i < input.files.length; i++) {
            var reader = new FileReader();
            reader.fileName = input.files[i].name;
            reader.inputName = input.id;
            reader.targetId = input.dataset.targetId;
            reader.onload = readURLOnload;
            reader.readAsDataURL(input.files[i]);
        }
    }
}

function albumsHelp() {
    $('#albums-help-modal .next-modal').one('click', function () {
        $(this).closest('.card-body').find('.content-block, .dot').toggleClass('is-active');
        $(this).text('got it').off();
        endAlbumHelp();
    })
}

function endAlbumHelp() {
    $('#albums-help-modal .next-modal').on('click', function () {
        var $this = $(this);
        var albumsModal = $this.attr('data-modal');
        $this.closest('.modal').removeClass('is-active');
        $('#' + albumsModal).addClass('is-active');
        setTimeout(function () {
            $this.closest('.card-body').find('.content-block, .dot').toggleClass('is-active');
            $this.text('Next').off();
            albumsHelp();
        }, 800);
    })
}

function videosHelp() {
    $('#videos-help-modal .next-modal').one('click', function () {
        $(this).closest('.card-body').find('.content-block, .dot').toggleClass('is-active');
        $(this).text('got it').off();
        endVideoHelp();
    })
}

function endVideoHelp() {
    $('#videos-help-modal .next-modal').on('click', function () {
        var $this = $(this);
        var videosModal = $(this).attr('data-modal');
        $this.closest('.modal').removeClass('is-active');
        if (window.matchMedia("(orientation: portrait)").matches) {
            $('#no-stream-modal').addClass('is-active');
        } else {
            $('#' + videosModal).addClass('is-active');
        }
        setTimeout(function () {
            $this.closest('.card-body').find('.content-block, .dot').toggleClass('is-active');
            $this.text('Next').off();
            videosHelp();
        }, 800);
    })
}

/* ==========================================================================
Compose card events
========================================================================== */

if ($('#compose-card').length) {

    //Open publish mode
    $('#publish').on('click', function () {
        $('.app-overlay').addClass('is-active');
        $('.is-new-content').addClass('is-highlighted');
    });

    //Open publish mode from new story-button
    $('#add-story-button').on('click', function () {
        $('.app-overlay').addClass('is-active');
        $('.is-new-content').addClass('is-highlighted');
        $('.target-channels .channel').each(function () {
            if ($(this).find('input[type="checkbox"]').prop('checked')) {
                $(this).find('input[type="checkbox"]').prop('checked', false);
            } else {
                $(this).find('input[type="checkbox"]').prop('checked', true);
            }
        })
    });

    //Enable and disable publish button based on the textarea value length (1)
    $('#publish').on('input', function () {
        var valueLength = $(this).val().length;

        if (valueLength >= 1) {
            $('#publish-button').removeClass('is-disabled');
        } else {
            $('#publish-button').addClass('is-disabled');
        }
    });

    $('#publish-button').on('click', function() {
        let url = __API_HOST__;
        let submitData = new FormData();
        submitData.append('post', $('#publish').val());
        let files = []
        $.each($('#feed-upload-input-1,#feed-upload-input-2'), function(i, uploadInput) {
            for (let i = 0; i < uploadInput.files.length; i++) {
                files.push(uploadInput.files[i]);
            }
        });
        for (let i = 0; i < files.length; i++) {
            submitData.append(`file-${i}`, files[i]);
        }
        $.ajax(`${url}/create-post`, {
						/* Set header for the XMLHttpRequest to get data from the web server
						associated with userIdToken */
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
            },
						error: function(errorData, status, errorThrown) {
							  console.log(status);
							  console.log(errorThrown);
						}
        });
    });

    //Close compose box
    $('.close-publish').on('click', function () {
        $('.app-overlay').removeClass('is-active');
        $('.is-new-content').removeClass('is-highlighted');
        $('#compose-search, #extended-options, .is-suboption').addClass('is-hidden');
        $('#basic-options, #open-compose-search').removeClass('is-hidden');
    });

    //Expand compose box
    $('#show-compose-friends').on('click', function () {
        $(this).addClass('is-hidden');
        $('.friends-list').removeClass('is-hidden');
        $('.hidden-options').addClass('is-opened');
    });

    //Open extended options
    $('#open-extended-options').on('click', function () {
        $('.app-overlay').addClass('is-active');
        $('.is-new-content').addClass('is-highlighted');
        $('.compose-options').toggleClass('is-hidden');
    });

    //Open compose box search
    $('#open-compose-search').on('click', function () {
        $('#compose-search, #open-compose-search').toggleClass('is-hidden');
    });

    //Enable checkbox checking and unchecking by clicking on the row
    $('.channel, .friend-block').on('click', function (e) {
        if (e.target !== this) {
            return false;
        } else {
            if ($(this).find('input[type="checkbox"]').prop('checked')) {
                $(this).find('input[type="checkbox"]').prop('checked', false);
            } else {
                $(this).find('input[type="checkbox"]').prop('checked', true);
            }
        }

    });

    //Suboptions
    $('#open-tag-suboption').on('click', function () {
        $('.is-suboption').addClass('is-hidden');
        $('#tag-suboption').removeClass('is-hidden');
        //Open autocomplete dropdown
        openFriendsDrop();
    });

    //Show activities
    $('#show-activities, #extended-show-activities').on('click', function () {
        $('.app-overlay').addClass('is-active');
        $('.is-new-content').addClass('is-highlighted');
        //$('.compose-options').toggleClass('is-hidden');
        $('.is-suboption').addClass('is-hidden');
        $('#activities-suboption').removeClass('is-hidden');
        //Open autocomplete dropdown
        openActivitiesDrop();
    });

    //
    $('.input-block, .close-icon.is-subactivity').on('click', function () {
        $('#activities-autocpl-wrapper').toggleClass('is-hidden');
        $('.is-activity').addClass('is-hidden');
        $('.easy-autocomplete-container li').removeClass('selected');
        $('.mood-display').html('');
        //Open autocomplete dropdown
        openActivitiesDrop();
    });

    //Show location input
    $('#open-location-suboption').on('click', function () {
        $('.is-suboption').addClass('is-hidden');
        $('#location-suboption').removeClass('is-hidden');
    });

    //Show URL input
    $('#open-link-suboption').on('click', function () {
        $('.is-suboption').addClass('is-hidden');
        $('#link-suboption').removeClass('is-hidden');
    });

    //Show GIF input
    $('#open-gif-suboption').on('click', function () {
        $('.is-suboption').addClass('is-hidden');
        $('#gif-suboption').removeClass('is-hidden');
    });

    //Close autocomplete sections when clicking on the X
    $('.is-autocomplete .close-icon.is-main').on('click', function () {
        $(this).closest('.is-suboption').addClass('is-hidden');
    });

    //Init comments
    initPostComments();

    //Handle adding member in a new group (modal)
    $('#new-group-list .friend-block').on('click', function () {
        var selectedRef = $(this).closest('.friend-block').attr('data-ref');
        var selectedAvatar = $(this).closest('.friend-block').find('img').attr('src');
        var selectedFriend = $(this).closest('.friend-block').find('.friend-name').text();
        var checkIcon = feather.icons.check.toSvg();

        var html = '';

        if ($(this).find('input').prop('checked')) {

            if ($('#' + selectedRef).length) {
                return false;
            } else {

                html = `
                    <div id="${selectedRef}" class="selected-friend-block">
                        <div class="image-wrapper">
                            <img class="friend-avatar" src="${selectedAvatar}" alt="">
                            <div class="checked-badge">
                                ${checkIcon}
                            </div>
                        </div>
                        <div class="friend-name">${selectedFriend}</div>
                    </div>
                `
                $('#selected-list').append(html);

                var selectedCount = $('#selected-list .selected-friend-block').length;
                $('#selected-friends-count').html(selectedCount);
            }


        } else {
            console.log('it has been unchecked!');
            $('#' + selectedRef).remove();

            var selectedCount = $('#selected-list .selected-friend-block').length;
            $('#selected-friends-count').html(selectedCount);
        }
    });

    //Help modal before albums management
    albumsHelp()

    //Toggle tag friends input in album modal
    $('#tagged-in-album button').on('click', function () {
        $(this).addClass('is-hidden');
        $(this).closest('.tagged-in-album').find('.field, p').toggleClass('is-hidden');
    })

    //Toggle datepicker input in album modal
    $('#album-date button').on('click', function () {
        $(this).addClass('is-hidden');
        $(this).closest('.album-date').find('p').addClass('is-hidden');
        $(this).closest('.album-date').find('.control').removeClass('is-hidden');
    })

    //Init datepicker inside album modal
    $('#album-datepicker').datepicker({
        format: 'mm-dd-yyyy',
        container: 'body',
        autoHide: true,
        offset: 0
    });

    //Help modal before live video
    videosHelp()

}
