export function validateSession(successCallback, callback401) {
  let url = __API_HOST__;
  let redirect;
  $.ajax(
    {
      url: `${url}/validate-session`,
      cache: false,
      async: false,
      headers: {
        'Authorization': window.localStorage.getItem('authToken')
      },
      success: successCallback,
      statusCode: {
        401: callback401
      }
    }
  )
}

export function logIn(email, password, callback, errorCallback) {
  let url = __API_HOST__;
  $.ajax(
    {
      url: `${url}/login-api`,
      cache: false,
      method: 'POST',
      crossDomain: true,
      data: {
        'email': email,
        'password': password
      },
      success: function(response, status, xhr) {
        callback(response, status, xhr);
      },
      error: function(response, status, xhr) {
        errorCallback(response, status, xhr);
      }
    }
  );
}

export function signup(email, displayName, handle, password, callback, errorCallback) {
  let url = __API_HOST__;
  $.ajax(
    {
      url: `${url}/signup-api`,
      cache: false,
      method: 'POST',
      crossDomain: true,
      data: {
        'email': email,
        'name': displayName,
        'handle': handle,
        'password': password
      },
      success: function(response, status, xhr) {
        callback(response, status, xhr);
      },
      error: function(response, status, xhr) {
        errorCallback(response, status, xhr);
      }
    }
  );
}

export function getConnectionInfo(connectionCallback) {
    let connectionInfo;
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
            connectionCallback(response);
        },
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
          }
        }
      }
   )
   return connectionInfo;
};

function requestConnection(handle, host, callback) {
    let url = __API_HOST__;
    $.ajax({
        method: 'POST',
        url: `${url}/request-connection`,
        cache: false,
        async: false,
        data: {
            'handle': handle,
            'host': host
        },
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            callback(response);
        },
    });
}

export function confirmConnection(connectionId, callback) {
    let url = __API_HOST__;
    $.ajax({
        method: 'POST',
        url: `${url}/manage-connection`,
        cache: false,
        async: false,
        data: {
            'connection_id': connectionId,
            'action': 'connect'
        },
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            callback(response);
        },
    });
}

function declineConnection(connectionId, callback) {
    let url = __API_HOST__;
    $.ajax({
        method: 'POST',
        url: `${url}/manage-connection`,
        cache: false,
        async: false,
        data: {
            'connection_id': connectionId,
            'action': 'decline'
        },
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            callback(response);
        },
    });
}

function markConnectionRead(connectionId, callback) {
    let url = __API_HOST__;
    $.ajax({
        method: 'GET',
        url: `${url}/mark-connection-read/${connectionId}`,
        cache: false,
        async: true,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            callback(response);
        },
    });
}

function markNotificationRead(postId, callback) {
    let url = __API_HOST__;
    $.ajax({
        method: 'GET',
        url: `${url}/mark-post-reference-read/${postId}`,
        cache: false,
        async: true,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            callback(response);
        },
    });
}

export function markPostRead(postId, callback) {
    let url = __API_HOST__;
    $.ajax({
        method: 'GET',
        url: `${url}/mark-post-read/${postId}`,
        cache: false,
        async: false,
        headers: {
          'Authorization': window.localStorage.getItem('authToken')
        },
        success: function(response) {
            callback(response);
        },
    });
}

export function getPosts(successCallback) {
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
        success: successCallback,
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
          }
        }
      }
   )
   return posts;
}

export function getConnectionPosts(successCallback) {
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
        success: successCallback,
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
          }
        }
      }
   )
   return connectionPosts
};


export function createPost(submitData, successCallback) {
    let url = __API_HOST__;
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
        success: successCallback,
        error: function(errorData, status, errorThrown) {
            console.log(status);
            console.log(errorThrown);
        }
    });
}

export function postComment(postId, comment, connectionId, files, successCallback, errorCallback) {
    let url = __API_HOST__;
    let submitData = new FormData();
    submitData.append('comment', comment);
    submitData.append('connectionId', connectionId);
    for (let i = 0; i < files.length; i++) {
        submitData.append(`file-${i}`, files[i]);
    }
    $.ajax(`${url}/add-comment/${postId}`, {
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
        success: successCallback,
        error: errorCallback
    });
}

