/**
 * Javascript required for the responsive theme
 */
'use strict';

/**
 * Setup global object to attach public methods to
 */
var rwResponsive = {};

/**
 * Dropdown menus
 *
 * Usage:
 * <button type="button" class="dropdown-btn" id="my-id" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
 *  Button text
 * </button>
 * <div class="dropdown-menu" aria-labelledby="my-id">
 *  Dropdown content
 * </div>
 *
 * Showing / hiding the menus is controlled by CSS based on the aria attributes, see sass/components/_dropdowns.scss
 */

rwResponsive.dropdowns = (function () {
  var elements = {};

  function findAncestor (el, type) {
    while ((el = el.parentNode) && el.type === type);
    return el;
  }

  function addBackDrop () {
    elements.backdrop = document.createElement('div');
    elements.backdrop.className = 'dropdown-backdrop';
    elements.backdrop.addEventListener('click', closeDropdown);
    document.body.appendChild(elements.backdrop);
  }

  function toggleDropdown (e) {
    var btn = e.target.type === 'button' ? e.target : findAncestor(e.target);
    var current = btn.getAttribute('aria-expanded') === 'true';
    elements.backdrop.setAttribute('data-active', !current);
    btn.setAttribute('aria-expanded', !current);
  }

  function closeDropdown () {
    var currentBtn = document.querySelector('[data-toggle][aria-expanded="true"]');
    currentBtn.setAttribute('aria-expanded', false);
    elements.backdrop.setAttribute('data-active', false);
  }

  function init () {
    var dropdownBtns = document.querySelectorAll('[data-toggle]');
    if (!dropdownBtns.length) {
      return;
    }

    for (var i = 0; i < dropdownBtns.length; i++) {
      dropdownBtns[i].addEventListener('click', toggleDropdown);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
        closeDropdown();
      }
    });

    addBackDrop();
  }

  return {
    init: init
  };
})();

/**
 * Initialise on content loaded
 */
document.addEventListener('DOMContentLoaded', function() {

  rwResponsive.dropdowns.init();
});
