/**
 * Javascript required for the responsive river.
 */
/* global SimpleAutocomplete */
(function () {
  'use strict';

  /**
   * Setup global object to attach public methods to.
   */
  var rwRiver = {};

  /**
   * Filters
   * Sets up:
   * - facet search with autocomplete,
   * - click handlers to open and close the facets and the filters sidebar on mobile
   * - markup to improve accessibility of hidden facet sections.
   */
  rwRiver.filters = (function () {

    var elements = {};
    var selectors = {
      activeFacet: 'data-facet-active',
      facet: 'data-facet',
      facetClose: 'data-facet-close',
      facetCount: 'data-facet-count',
      facetItem: 'data-facet-item',
      facetItems: 'data-facet-items',
      facetLabel: 'data-facet-label',
      facetOpen: 'data-facet-open',
      facetSearchContainer: 'data-facet-search',
      facetSection: 'data-facet-section',
      facetWidgetType: 'data-facet-widget'
    };

    function isDesktop() {
      return window.innerWidth >= 768;
    }

    function closeFacet(e) {
      var type = e.target.getAttribute(selectors.facetClose);
      var facet = document.querySelector('[' + selectors.facet + '="' + type + '"]');
      var facetSection = document.querySelector('[' + selectors.facetSection + '="' + type + '"]');
      closeFacetSection(facet, facetSection);
    }

    function closeFacetSection(facet, facetSection) {
      facetSection.className = facetSection.className.replace(' active', '');
      facet.className = facet.className.replace(' expanded', '');
      toggleHiddenSectionMarkup(facet);
      if (!isDesktop()) {
        facetSection.scrollIntoView();
        elements.filtersContainer.className = elements.filtersContainer.className.replace(' no-scroll', '');
      }
    }

    function openFacetSection(facet, facetSection) {
      var facetItems = facetSection.querySelector('[' + selectors.facetItems + ']');
      facetSection.className += ' active';
      facet.className += ' expanded';
      toggleHiddenSectionMarkup(facet);
      if (!isDesktop()) {
        facetSection.scrollIntoView();
        elements.filtersContainer.className += ' no-scroll';

        if (facetItems) {
          // Set height of facet items to contain scrolling.
          var height = window.innerHeight - facetItems.offsetTop - 20;
          facetItems.setAttribute('style', 'height:' + height + 'px');
        }
        return;
      }
      facetItems.removeAttribute('style');
    }

    function closeFilters() {
      elements.filtersContainer.className = elements.filtersContainer.className.replace(' active', '');
      elements.body.className = elements.body.className.replace(' filters-open', '');
      document.querySelector('#river').scrollIntoView();
    }

    function openFilters() {
      elements.filtersContainer.className += ' active';
      elements.body.className += ' filters-open';
    }

    function toggleFacet(e) {
      var type = e.target.getAttribute(selectors.facetOpen);
      var facetSection = document.querySelector('[' + selectors.facetSection + '="' + type + '"]');
      var facet = document.querySelector('[' + selectors.facet + '="' + type + '"]');
      var facetExpanded = facet.className.indexOf('expanded') !== -1;
      var itemsExpanded = facetSection.className.indexOf('active') !== -1;
      if ((isDesktop() && facetExpanded) || itemsExpanded) {
        closeFacetSection(facet, facetSection);
        return;
      }
      openFacetSection(facet, facetSection);
    }

    function handleButtons() {
      elements.filtersOpenButton.addEventListener('click', openFilters);
      elements.filtersCloseButton.addEventListener('click', closeFilters);

      for (var i = 0; i < elements.facetBtns.length; i++) {
        elements.facetBtns[i].addEventListener('click', toggleFacet);
      }

      for (var i = 0; i < elements.facetCloseBtns.length; i++) {
        elements.facetCloseBtns[i].addEventListener('click', closeFacet);
      }
    }

    // Build the facet search.
    function buildSearch(facet) {
      var facetSection = facet.querySelector('[' + selectors.facetSection + ']');
      var facetSearchContainer = facet.querySelector('[' + selectors.facetSearchContainer + ']');
      if (!facetSection || !facetSearchContainer) {
        return;
      }
      var type = facet.getAttribute(selectors.facet);
      var placeholder = 'Select or search';
      var input = document.createElement('input');
      var label = document.createElement('label');
      input.className = 'facet__autocomplete';
      input.setAttribute('type', 'text');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('placeholder', placeholder);
      input.setAttribute('id', type);
      label.setAttribute('for', type);
      label.innerText = placeholder;
      label.className = 'element-invisible';
      facetSearchContainer.className += ' facet__search simpleautocomplete-container';
      facetSearchContainer.appendChild(label);
      facetSearchContainer.appendChild(input);
    }

    function getItemValue(item, i) {
      // Exclude active items.
      if (item.className.indexOf('active') !== -1) {
        return;
      }
      var link = item.getElementsByTagName('a')[0];
      var value = item.querySelector('[' + selectors.facetLabel + ']').textContent;
      var count = item.querySelector('[' + selectors.facetCount + ']').textContent;
      value += ' - ' + count;

      return {
        value: value,
        link: link
      };
    }

    // Get values to use in the search autocomplete and init the plugin.
    function initAutocomplete(facet) {
      var items = facet.querySelectorAll('[' + selectors.facetItem + ']');
      var input = facet.querySelector('.facet__autocomplete');
      var source = [];
      var values = {};
      var value;

      for (var i = 0, l = items.length; i < l; i++) {
        value = getItemValue(items[i], i);

        if (typeof values[value.value] === 'undefined') {
          source.push(value);
          values[value.value] = true;
        }
      }

      SimpleAutocomplete.autocomplete(input, source, {
        select: function (suggestion) {
          window.location = suggestion.link;
        },
        autoUpdateSelector: true
      }).on('opened', function (event) {
        // Automatically select the first suggestion when the selector opens.
        event.target.selectSuggestion(1);
      });
    }

    function toggleHiddenSectionMarkup(facet) {
      var facetSection = facet.querySelector('[' + selectors.facetSection + ']');
      var facetExpanded = facet.className.indexOf('expanded') !== -1;
      var focusable = facetSection.querySelectorAll('a, input');
      var isHidden = facetSection.className.indexOf('active') === -1;

      // Do nothing on pre-expanded sections on desktop
      if (isHidden && isDesktop() && facetExpanded) {
        facetSection.setAttribute('aria-hidden', false);
        return;
      }

      // Toggle aria-hidden attribute.
      facetSection.setAttribute('aria-hidden', isHidden);

      // Add negative tabindex to prevent keyboard focus on focusable elements.
      for (var i = 0; i < focusable.length; i++) {
        if (isHidden) {
          focusable[i].setAttribute('tabindex', '-1');
        }
        else {
          focusable[i].removeAttribute('tabindex');
        }
      }

    }

    function setUpFacetSearch() {
      for (var i = 0; i < elements.facets.length; i++) {
        if (elements.facets[i].getAttribute(selectors.facetWidgetType) === 'autocomplete') {
          buildSearch(elements.facets[i]);
          initAutocomplete(elements.facets[i]);
        }
      }
    }

    function populateCurrentFilters(facet, activeFilters) {
      var activeFacets = facet.querySelectorAll('[' + selectors.activeFacet + ']');
      for (var i = 0; i < activeFacets.length; i++) {
        activeFilters.push(activeFacets[i].textContent);
      }
      return activeFilters;
    }

    function setUpCurrentFilters(activeFilters) {
      if (!elements.activeFiltersContainer || !activeFilters.length) {
        return;
      }
      elements.activeFiltersContainer.className += ' current-filters';
      elements.activeFiltersContainer.innerHTML += '<h3>Filters: </h3>';
      elements.activeFiltersContainer.innerHTML += activeFilters.join(', ');
    }

    function setUpMustReadLink() {
      if (!elements.mustReadLink) {
        return;
      }
      var href = elements.mustReadLink.getAttribute('href');
      var linkClass = 'must-read-toggle';
      if (elements.mustReadLink.className.indexOf('active') !== -1) {
        linkClass += ' active';
      }
      elements.mustReadContainer.innerHTML = '<a href="' + href + '" class="' + linkClass + '">Only show "Must Read"</a>';
      elements.mustReadContainer.className = 'filters__block mobile-only';
    }

    function init() {
      var activeFilters = [];
      elements.body = document.querySelector('body');
      elements.filtersContainer = document.querySelector('[data-filters-container]');
      elements.filtersOpenButton = document.querySelector('[data-open-filters]');
      elements.filtersCloseButton = document.querySelector('[data-close-filters]');
      elements.facetBtns = document.querySelectorAll('[' + selectors.facetOpen + ']');
      elements.facetCloseBtns = document.querySelectorAll('[' + selectors.facetClose + ']');
      elements.facets = document.querySelectorAll('[' + selectors.facet + ']');
      elements.activeFiltersContainer = document.querySelector('[data-active-filters-container]');
      elements.mustReadLink = document.querySelector('[data-must-read]');
      elements.mustReadContainer = document.querySelector('[data-filters-must-read]');

      if (!elements.filtersContainer) {
        return;
      }

      handleButtons();
      setUpFacetSearch();
      setUpMustReadLink();

      for (var i = 0; i < elements.facets.length; i++) {
        toggleHiddenSectionMarkup(elements.facets[i]);
        activeFilters = populateCurrentFilters(elements.facets[i], activeFilters);
      }
      setUpCurrentFilters(activeFilters);
    }

    return {
      init: init
    };

  })();

  /**
   * Initialise on content loaded.
   */
  document.addEventListener('DOMContentLoaded', function () {
    rwRiver.filters.init();
  });

})();
