/**
 * Javascript required for the responsive theme.
 */
(function () {
  'use strict';

  /**
   * Setup global object to attach public methods to.
   */
  var rwResponsive = {};

  /**
   * Toggle content or dropdown menus.
   *
   * Dropdown menus:
   * Only one can be open at a time. An invisible backdrop is added so clicking outside the dropdown closes it.
   * Usage:
   * <button type="button" class="toggle-btn" id="my-id" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
   *  Button text
   * </button>
   * <div class="toggle-content" aria-labelledby="my-id">
   *  Dropdown content
   * </div>
   *
   * Toggle content:
   * Multiple content areas can be opened at once. The invisible backdrop is not activated.
   * Usage:
   * <button type="button" class="toggle-btn" id="my-id" data-toggle="content" aria-haspopup="true" aria-expanded="false">
   *  Button text
   * </button>
   * <div class="toggle-content" aria-labelledby="my-id">
   *  Dropdown content
   * </div>
   *
   * Showing / hiding the menus is controlled by CSS based on the aria attributes, see sass/components/_dropdowns.scss.
   */
  rwResponsive.toggle = (function () {
    var elements = {};
    var escapeListener;

    function findAncestor(el, type) {
      while (el.parentNode) {
        el = el.parentNode;
        if (el.type === type) {
          return el;
        }
      }
    }

    function addBackDrop() {
      elements.backdrop = document.createElement('div');
      elements.backdrop.className = 'dropdown-backdrop';
      elements.backdrop.addEventListener('click', function () {
        closeDropdown();
      });
      document.body.appendChild(elements.backdrop);
    }

    function toggleDropdown(e) {
      var btn = e.target.type === 'button' ? e.target : findAncestor(e.target, 'button');
      var current = btn.getAttribute('aria-expanded') === 'true';

      if (current) {
        closeDropdown(btn);
        return;
      }

      btn.setAttribute('aria-expanded', !current);
      btn.className += ' active';
      if (btn.getAttribute('data-toggle') === 'dropdown') {
        elements.backdrop.className += ' active';
        addEscapeListener(btn);
      }
    }

    function addEscapeListener(btn) {
      escapeListener = btn.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27) {
          closeDropdown();
        }
      });
    }

    function closeDropdown(btn) {
      var currentBtn = btn || document.querySelector('[data-toggle][aria-expanded="true"]');
      if (!currentBtn) {
        return;
      }
      currentBtn.setAttribute('aria-expanded', false);
      currentBtn.className = currentBtn.className.replace(' active', '');
      elements.backdrop.className = elements.backdrop.className.replace(' active', '');
      currentBtn.removeEventListener('keydown', escapeListener);
    }

    function init() {
      var dropdownBtns = document.querySelectorAll('[data-toggle]');
      if (!dropdownBtns.length) {
        return;
      }

      for (var i = 0; i < dropdownBtns.length; i++) {
        dropdownBtns[i].addEventListener('click', toggleDropdown);
      }

      addBackDrop();
    }
    return {
      init: init
    };
  })();

  /**
   * Read more content blocks - hides long content beyond a set height, click a 'Read more' button to reveal the full content.
   *
   * Usage:
   * <div data-toggle-read-more>The content</div>
   *
   * The height to restrict the content to should be set in your component, e.g.
   * .my-component .read-more-content.collapsed { max-height: 100px; }
   *
   * Generic styles are in sass/components/_read-more.scss.
   */
  rwResponsive.readMore = (function () {

    var settings = {
      collapsedClass: 'collapsed',
      collapsedLabel: 'Read more',
      controlClass: 'btn read-more-control',
      icon: '<span class="icon icon-arrow-toggle"></span>',
      expandedLabel: 'Hide description',
      sectionClass: 'read-more-content'
    };

    function toggleSection(control, section) {
      var expanded = control.getAttribute('aria-expanded') === 'true';
      control.setAttribute('aria-expanded', !expanded);

      if (expanded) {
        section.className += ' ' + settings.collapsedClass;
        control.innerText = settings.collapsedLabel;
        control.innerHTML += settings.icon;
        return;
      }

      section.className = section.className.replace(' ' + settings.collapsedClass, '');
      control.innerText = settings.expandedLabel;
      control.innerHTML += settings.icon;
    }

    function buildControl(section) {
      var control = document.createElement('button');
      control.setAttribute('type', 'button');
      control.setAttribute('aria-controls', section.getAttribute('id'));
      control.setAttribute('aria-expanded', false);
      control.className = settings.controlClass;
      control.innerText = settings.collapsedLabel;
      control.addEventListener('click', function () {
        toggleSection(control, section);
      });
      control.innerHTML += settings.icon;
      section.parentNode.insertBefore(control, section.nextSibling);
    }

    function init() {
      var expandableSections = document.querySelectorAll('[data-toggle-read-more]');
      if (!expandableSections.length) {
        return;
      }
      for (var i = 0; i < expandableSections.length; i++) {
        expandableSections[i].className += ' ' + settings.sectionClass + ' ' + settings.collapsedClass;
        buildControl(expandableSections[i]);
      }
    }

    return {
      init: init
    };

  })();


  /**
   * Initialise on content loaded.
   */
  document.addEventListener('DOMContentLoaded', function () {
    rwResponsive.toggle.init();
    rwResponsive.readMore.init();
  });

})();
