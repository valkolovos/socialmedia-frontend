/*! main.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Main js file
========================================================================== */

"use strict";

//Set environment variable (Used for development)

/* 
    Possible values:
    1. development
    2. ''
*/

var env = '';

function checkLoggedIn() {
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
      success: function(response) {
        window.localStorage.setItem('profile', JSON.stringify(response))
      },
      statusCode: {
        401: function(jqxhr, textStatus, errorThrown) {
          let bucketPath = __BUCKET_PATH__;
          console.log(`redirecting to ${bucketPath}/login-boxed.html`);
          $(window).attr('location',`${bucketPath}/login-boxed.html`);
        }
      }
    }
  )
  return redirect;
}

var bucketPath = __BUCKET_PATH__;
var loginPath = `${bucketPath}/login-boxed.html`;
var signupPath = `${bucketPath}/signup-v2.html`;

if (window.location.pathname !== loginPath && window.location.pathname !== signupPath) {
    checkLoggedIn()
}

//Pageloader
initPageloader();


$(document).ready(function(){

    if (env === 'development') {
		//Demo images
        changeDemoHrefs();

        //Demo hrefs
        changeDemoImages();
    }

    //Lazy Load
    const el = document.querySelectorAll('[data-lazy-load]');
    const observer = lozad(el, {
        loaded: function(el) {
            // Custom implementation on a loaded element
            el.parentNode.classList.add('loaded');
        }
	});
	
    observer.observe();

    //Demo links
    $('.demo-link a').on('click', function(e){
        e.preventDefault();
        var theme = $(this).closest('.demo-link').attr('data-theme');
        window.localStorage.setItem('theme', theme);
        var href = $(this).attr('href');
        
        window.open(href);
    });
    
    //Toggle Dark mode
    toggleTheme(); 

    //Code highlight init
    $('.highlight-block code').each(function (i, block) {
        hljs.highlightBlock(block);
    });
    
    //Init navbar v1
    initNavbar();

    //Init navbar v2
    initNavbarV2();

    //Logout button
    initLogout();

    //Dashboard
    linkCheck();

    //Mobile menu toggle
    initResponsiveMenu();

    //Navbar dropdown
    initNavDropdowns();

    //Navbar Cart
    initNavbarCart();

    //Common Dropdown
    initDropdowns();

    //Tabs
    initTabs();

    //Modals
    initModals();

    //Attribute background images
    initBgImages();

    //Feather icons initialization
    feather.replace();

    //Emojis
    initEmojiPicker();

    initLightboxEmojis();

    //Video Embed
    initVideoEmbed();

    //Load More
    initLoadMore();

    //Init tooltips
    initTooltips();

    //Init Like Button
    initLikeButton();

    //Init Simple Popover
    initSimplePopover();

    //Share modal demo
    initShareModal();   

    //Users autocomplete
    initUsersAutocomplete();

    //Init Tipuedrop
    initSuggestionSearch();
});



