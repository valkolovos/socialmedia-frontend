/*! main.js | Friendkit | © Css Ninja. 2019-2020 */

/* ==========================================================================
Main js file
========================================================================== */

"use strict";

import { validateSession } from './api.js';
import * as global from './global.js';
import { initNavbarV2 } from './navigation/navbar-v2.js';
import { initResponsiveMenu } from './navigation/navbar-mobile.js';
import { getUserPopovers } from './components/popovers-users.js';
import { getPagesPopovers } from './components/popovers-pages.js';

//Set environment variable (Used for development)

/* 
    Possible values:
    1. development
    2. ''
*/

var env = '';

var bucketPath = __BUCKET_PATH__;
var loginPath = `${bucketPath}/login-boxed.html`;
var signupPath = `${bucketPath}/signup-v2.html`;

if (window.location.pathname !== loginPath && window.location.pathname !== signupPath) {
    validateSession(
      function(response) {
        window.localStorage.setItem('profile', JSON.stringify(response))
      },
      function(jqxhr, textStatus, errorThrown) {
        let bucketPath = __BUCKET_PATH__;
        console.log(`redirecting to ${bucketPath}/login-boxed.html`);
        $(window).attr('location',`${bucketPath}/login-boxed.html`);
      }
    )
}

//Pageloader
global.initPageloader();


$(document).ready(function(){

    if (env === 'development') {
		//Demo images
        global.changeDemoHrefs();

        //Demo hrefs
        global.changeDemoImages();
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
    global.toggleTheme();

    //Code highlight init
    $('.highlight-block code').each(function (i, block) {
        hljs.highlightBlock(block);
    });

    //Init navbar v2
    initNavbarV2();

    //Logout button
    global.initLogout();

    //Dashboard
    global.linkCheck();

    //Mobile menu toggle
    initResponsiveMenu();

    //Navbar dropdown
    global.initNavDropdowns();

    //Navbar Cart
    global.initNavbarCart();

    //Common Dropdown
    global.initDropdowns();

    //Tabs
    global.initTabs();

    //Modals
    global.initModals();

    //Attribute background images
    global.initBgImages();

    //Feather icons initialization
    feather.replace();

    //Emojis
    global.initEmojiPicker();

    global.initLightboxEmojis();

    //Video Embed
    global.initVideoEmbed();

    //Load More
    global.initLoadMore();

    //Init tooltips
    global.initTooltips();

    //Init Like Button
    global.initLikeButton();

    //Init Simple Popover
    global.initSimplePopover();

    //Share modal demo
    global.initShareModal();   

    //Users autocomplete
    global.initUsersAutocomplete();

    //Init Tipuedrop
    global.initSuggestionSearch();

    // popovers
    getUserPopovers();
    getPagesPopovers();
});



