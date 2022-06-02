function logIn(email, password, callback, errorCallback) {
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

function signup(email, displayName, handle, password, callback, errorCallback) {
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

function getConnectionInfo(connectionCallback) {
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
            console.log(response);
            connectionCallback(response);
        },
        statusCode: {
          401: function(jqxhr, textStatus, errorThrown) {
            window.location.href = '/login-boxed.html'
            console.log(jqxhr.responseText)
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

function confirmConnection(connectionId, callback) {
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

function markPostRead(postId, callback) {
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
