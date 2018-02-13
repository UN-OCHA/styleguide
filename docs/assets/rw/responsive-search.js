/**
 * Javascript required for the responsive river search.
 */
/* global SimpleAutocomplete SimpleDatePicker */

(function () {

  'use strict';

  window.onload = function () {
    var addEventListener = SimpleAutocomplete.addEventListener;
    var removeEventListener = SimpleAutocomplete.removeEventListener;
    var hasClass = SimpleAutocomplete.hasClass;
    var searchForm = document.querySelector('[data-river-search-form]');
    var filtersElement = searchForm.querySelector('[data-river-search-filters]');
    var filterNew = filtersElement.querySelector('[data-river-search-filters-new]');
    var filterNewOperator = filterNew.querySelector('[data-river-search-filter-operator]');
    var filterNewCategory = filterNew.querySelector('[data-river-search-filter-category]');
    var filterNewAutocomplete = filterNew.querySelector('[data-river-search-filter-autocomplete]');
    var filterNewList = filterNew.querySelector('[data-river-search-filter-list]');
    var searchInput = searchForm.querySelector('[data-river-search-input]');
    var advancedSearch = searchForm.querySelector('input[name=advanced-search]');

    /**
     * GENERIC HELPERS.
     */

    // Prevent default behavior for event.
    function preventDefault(event) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      else {
        event.returnValue = false;
      }
    }

    // Escape HTML special characters.
    function escapeHtml(text) {
      var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };

      return text.replace(/[&<>"']/g, function (m) {
        return map[m];
      });
    }

    // Get elements by class name (only 1 class name).
    function getElementsByClassName(className, parent) {
      parent = parent || document.body;
      if (parent.getElementsByClassName) {
        return parent.getElementsByClassName(className);
      }
      else if (parent.querySelectorAll) {
        return parent.querySelectorAll('.' + className);
      }
      else {
        var elements = parent.getElementsByTagName('*');
        var results = [];
        for (var i = 0, l = elements.length; i < l; i++) {
          var element = elements[i];
          if (hasClass(element, className)) {
            results.push(element);
          }
        }
        return results;
      }
    }

    /**
     * FILTERS AND OPERATORS HELPERS.
     */

    function getLastOperator() {
      var operators = getElementsByClassName('operator', filtersElement);
      return operators.length ? operators[operators.length - 1] : null;
    }

    // Get the operator before a filter.
    function getFilterOperator(filter) {
      if (hasClass(filter, 'filter')) {
        var sibling = filter.previousSibling;
        while (sibling !== filterNew) {
          if (hasClass(sibling, 'operator-wrapper')) {
            return sibling;
          }
          sibling = sibling.previousSibling;
        }
      }
      return null;
    }

    // Get the filter element.
    function getFilter(element) {
      while (element !== filtersElement) {
        if (hasClass(element, 'filter')) {
          return element;
        }
        element = element.parentNode;
      }
      return null;
    }

    // Create a new filter element.
    function createFilter(category, value, label) {
      if (value && label && typeof categories[category] !== 'undefined') {
        var filter = document.createElement('span');
        var operator = document.createElement('button');
        var operatorWrapper = document.createElement('span');
        operatorWrapper.className = 'operator-wrapper';

        filter.setAttribute('data-category', category);
        filter.setAttribute('data-value', value);
        filter.className = 'filter';
        filter.innerHTML = '<button type="button" class="delete"><span class="element-invisible">Delete</span></button>' +
                           '<span class="category">' + escapeHtml(categories[category].name) + '</span>' +
                           '<span class="label">' + escapeHtml(label || value) + '</span>';

        operator.className = 'operator ' + filterNewOperator.value.replace(' ', '-').toLowerCase();
        operator.innerHTML = filterNewOperator.value;
        operator.setAttribute('type', 'button');
        operatorWrapper.appendChild(operator);

        filtersElement.insertBefore(operatorWrapper, filterNew);
        filtersElement.insertBefore(filter, filterNew);

        updateOperatorSelector();
        updateAdvancedSearch();
      }
    }

    // Remove an element from the filters.
    function removeElement(element) {
      if (hasClass(element, 'operator')) {
        element = element.nextSibling;
      }
      if (hasClass(element, 'filter')) {
        var operator = getFilterOperator(element);
        if (operator) {
          operator.parentNode.removeChild(operator);
        }
      }
      element.parentNode.removeChild(element);
      updateOperators();
      updateOperatorSelector();
      updateAdvancedSearch();
    }

    // Get the type of the current selected filter.
    function getFilterCategory() {
      var element = filterNewCategory.options[filterNewCategory.selectedIndex];
      return element.getAttribute('data-type') === 'date' ? 'datepicker' : 'autocomplete';
    }

    // Indicates if the values should be automatically displayed
    // for the selected filter category.
    function autoexpandCategory() {
      var element = filterNewCategory.options[filterNewCategory.selectedIndex];
      return element.getAttribute('data-autoexpand') === '1';
    }

    // Make sure the operators are valid.
    function updateOperators() {
      var elements = getElementsByClassName('operator', filtersElement);
      var previous = '';

      for (var i = 0, l = elements.length; i < l; i++) {
        var element = elements[i];
        var operator = element.innerHTML;

        if (i === 0 && operator !== 'with' && operator !== 'without') {
          element.innerHTML = operator.indexOf('without') > 0 ? 'without' : 'with';
        }
        else if (operator === 'and' && previous === 'or') {
          element.innerHTML = 'and with';
        }
        else if (operator === 'or' && previous === 'and') {
          element.innerHTML = 'or with';
        }
        if (operator !== element.innerHTML) {
          element.className = 'operator ' + element.innerHTML.replace(' ', '-').toLowerCase();
        }
        previous = operator;
      }
    }

    // Parse the filter
    function parseFilters(element) {
      var element = element || filtersElement.children[0];
      var result = '';
      while (element) {
        if (hasClass(element, 'operator-wrapper')) {
          switch (element.innerText.toLowerCase()) {
            case 'and':
              result += '_';
              break;
            case 'or':
              result += '.';
              break;
            case 'or with':
              result += ').(';
              break;
            case 'or without':
              result += ').!(';
              break;
            case 'and with':
              result += ')_(';
              break;
            case 'and without':
              result += ')_!(';
              break;
            case 'with':
              result += '(';
              break;
            case 'without':
              result += '!(';
              break;
          }
        }
        else if (hasClass(element, 'filter')) {
          result += element.getAttribute('data-category') + element.getAttribute('data-value');
        }
        else if (hasClass(element, 'filter-new')) {
          break;
        }
        element = element.nextSibling;
      }
      return result ? result + ')' : '';
    }

    // Update the advanced search parameter.
    function updateAdvancedSearch() {
      if (!advancedSearch) {
        advancedSearch = document.createElement('input');
        advancedSearch.name = 'advanced-search';
        advancedSearch.type = 'hidden';
        searchForm.appendChild(advancedSearch);
      }
      advancedSearch.value = parseFilters();
    }

    // Update the selectable operators based on the previous operator.
    function updateOperatorSelector() {
      var operator = getLastOperator();
      var options = ['with', 'without'];
      if (operator) {
        options = ['and', 'or', 'and with', 'and without', 'or with', 'or without'];
        if (operator.innerHTML === 'or') {
          options.splice(0, 1);
        }
        else if (operator.innerHTML === 'and') {
          options.splice(1, 1);
        }
      }

      while (filterNewOperator.hasChildNodes()) {
        filterNewOperator.removeChild(filterNewOperator.lastChild);
      }

      for (var i = 0, l = options.length; i < l; i++) {
        var option = document.createElement('option');
        option.value = options[i];
        option.innerHTML = options[i];
        filterNewOperator.appendChild(option);
      }
    }

    // Categories shortcuts.
    var options = filterNewCategory.options;
    var categories = {};
    for (var i = 0, l = options.length; i < l; i++) {
      categories[options[i].value] = {
        type: options[i].getAttribute('data-type'),
        name: options[i].innerHTML
      };
    }

    // Update the operator selector to take into account existing filters.
    updateOperatorSelector();


    /**
     * FILTERS DRAG and DROP HANDLING.
     */

    // Filters drag drop handler.
    var DragDrop = SimpleAutocomplete.Class.extend({
      element: null,
      bounds: null,
      target: null,
      posX: null,
      posY: null,
      startX: null,
      startY: null,
      opacity: null,
      elements: null,

      initialize: function () {
        this.mousemove = SimpleAutocomplete.bind(this.mousemove, this);
        this.mouseup = SimpleAutocomplete.bind(this.mouseup, this);
      },

      clone: function (target) {
        if (!this.element) {
          var clone = target.cloneNode(true);

          clone.className += ' clone';
          clone.style.position = 'absolute';
          clone.style.opacity = 0.6;
          clone.style.cursor = 'move';
          clone.style.left = target.offsetLeft + 'px';
          clone.style.top = target.offsetTop + 'px';
          clone.children[0].style.display = 'none';
          clone.children[1].style.display = 'none';

          target.parentNode.appendChild(clone);
          target.style.opacity = 0.3;

          this.element = clone;
        }

        return this.element;
      },

      start: function (target, event) {
        this.release();

        this.target = target;

        this.opacity = target.style.opacity;

        this.posX = target.offsetLeft;
        this.posY = target.offsetTop;

        this.startX = event.clientX;
        this.startY = event.clientY;

        addEventListener(document, 'mousemove', this.mousemove);
        addEventListener(document, 'mouseup', this.mouseup);
      },

      release: function () {
        removeEventListener(document, 'mousemove', this.mousemove);
        removeEventListener(document, 'mouseup', this.mouseup);
        if (this.target) {
          this.target.style.opacity = this.opacity;
        }
        if (this.element) {
          this.element.parentNode.removeChild(this.element);
        }
        this.target = null;
        this.element = null;
        this.elements = null;
      },

      update: function (clientX, clientY) {
        if (!this.target) {
          return;
        }

        var target = this.target;
        var parent = target.parentNode;
        var element = this.clone(target);
        var style = element.style;
        var newX = this.posX + clientX - this.startX;
        var newY = this.posY + clientY - this.startY;
        var right = newX > parseInt(style.left, 10);
        var hoveredElement = null;
        var children = filtersElement.children;
        var sibling;

        // Get the hovered element.
        for (var i = 1, l = children.length; i < l - 1; i++) {
          var child = children[i];

          if (child.tagName && child !== element && child !== target) {
            var bounds = child.getBoundingClientRect();

            if ((clientX > bounds.left && clientX < bounds.right) && (clientY > bounds.top && clientY < bounds.bottom)) {
              hoveredElement = child;
              break;
            }
          }
        }

        // Swap elements.
        if (hoveredElement !== this.hoveredElement) {
          if (hasClass(target, 'group-start')) {
            if (right) {
              if (hasClass(hoveredElement, 'operator')) {
                parent.insertBefore(target, hoveredElement.nextSibling);
              }
              else if (hoveredElement === filterNew) {
                parent.insertBefore(target, filterNew);
              }
            }
            else {
              if (hasClass(hoveredElement, 'filter')) {
                parent.insertBefore(target, hoveredElement);
              }
            }
          }
          else if (hasClass(target, 'group-end')) {
            if (right) {
              if (hasClass(hoveredElement, 'filter')) {
                parent.insertBefore(target, hoveredElement.nextSibling);
              }
              else if (hoveredElement === filterNew) {
                parent.insertBefore(target, filterNew);
              }
            }
            else {
              if (hasClass(hoveredElement, 'operator')) {
                parent.insertBefore(target, hoveredElement);
              }
            }
          }
          else if (hasClass(target, 'filter')) {
            if (hasClass(hoveredElement, 'filter') || hasClass(hoveredElement, 'group-end')) {
              sibling = target.nextSibling;
              parent.insertBefore(target, hoveredElement.nextSibling);
              parent.insertBefore(hoveredElement, sibling);
            }
          }
        }
        this.hoveredElement = hoveredElement;

        style.left = newX + 'px';
        style.top = newY + 'px';
      },

      mousemove: function (event) {
        if (event.clientX !== this.startX || event.clientY !== this.startY) {
          this.update(event.clientX, event.clientY);
          preventDefault(event);
          return false;
        }
      },

      mouseup: function (event) {
        this.release();
        if (event.clientX !== this.startX || event.clientY !== this.startY) {
          updateAdvancedSearch();
          preventDefault(event);
          return false;
        }
      }
    });


    /**
     * DATEPICKER HANDLING.
     */

    function createDatePickerWidget(container) {
      var createElement = SimpleDatePicker.createElement;
      var widget = SimpleDatePicker.datepicker({container: container});
      var element = createElement('div', {'class': 'datepicker-selector'});
      var input = createElement('input', {'type': 'text', 'placeholder': 'YYYY/MM/DD'}, element);

      addEventListener(input, 'keyup', function (event) {
        var time = /(\d{4})\/(\d{2})\/(\d{2})/.exec(event.target.value);
        if (time) {
          widget.setSelection([time[1] + '/' + time[2] + '/' + time[3] + ' UTC']);
        }
      });

      widget.options.input = input;
      widget.container.insertBefore(element, widget.container.children[0]);
      widget.on('select', function (event) {
        if (event.data && event.data.length) {
          widget.updateCalendar(widget.calendars[0], event.data[0].clone());
          input.value = event.data[0].format('YYYY/MM/DD');
        }
        else {
          widget.clear();
          input.value = '';
        }
      });
      return widget;
    }

    // Create the datepicker handler.
    var datepicker = {element: filterNewAutocomplete, widgets: []};
    datepicker.container = document.createElement('div');
    datepicker.container.className = 'datepicker';
    datepicker.element.parentNode.insertBefore(datepicker.container, datepicker.element.nextSibling);

    // Create the "From" and "To" datepicker widgets
    for (var i = 0; i < 2; i++) {
      datepicker.widgets[i] = createDatePickerWidget(datepicker.container);
    }

    // Create the datepicker "Select" button
    datepicker.select = document.createElement('button');
    datepicker.select.innerHTML = 'Select';
    datepicker.select.className = 'datepicker-select';
    datepicker.select.setAttribute('type', 'button');
    datepicker.container.appendChild(datepicker.select);

    // Create open datepicker button
    datepicker.openButton = document.createElement('button');
    datepicker.openButton.innerText = 'click and select a single date or a range of dates';
    datepicker.openButton.setAttribute('type', 'button');
    datepicker.openButton.className = 'datepicker-open';
    datepicker.openButton.style.display = 'none';
    datepicker.element.parentNode.insertBefore(datepicker.openButton, datepicker.element.nextSibling);

    // Create the filter when clicking on the "Select" button.
    addEventListener(datepicker.select, 'click', function (event) {
      var widgets = datepicker.widgets;
      var dates = [];
      var value = [];
      var label = '';

      for (var i = 0; i < 2; i++) {
        var selection = widgets[i].getSelection();
        dates.push(selection.length ? selection[0] : null);
        value.push(selection.length ? selection[0].format('YYYYMMDD') : '');
      }

      if (dates[0] !== null && dates[1] !== null) {
        // Permute the dates if the To date is before the From date.
        if (value[0] > value[1]) {
          value = [value[1], value[0]];
          dates = [dates[1], dates[0]];
        }

        dates[0] = dates[0].format('YYYY/MM/DD');
        dates[1] = dates[1].format('YYYY/MM/DD');
        label = dates[0] === dates[1] ? 'on ' + dates[0] : dates.join(' to ');
      }
      else if (dates[0] !== null) {
        label = 'after ' + dates[0].add('date', -1).format('YYYY/MM/DD');
      }
      else if (dates[1] !== null) {
        label = 'before ' + dates[1].add('date', 1).format('YYYY/MM/DD');
      }
      createFilter(filterNewCategory.value, value.join('-'), label);

      datepicker.hide();
      filterNewAutocomplete.focus();
    });

    // Handle datepicker visibility.
    datepicker.show = function () {
      var widgets = this.widgets;
      for (var i = 0; i < 2; i++) {
        widgets[i].clear().options.input.value = '';
      }
      this.container.style.display = 'block';
    };

    datepicker.hide = function () {
      this.container.style.display = 'none';
    };

    datepicker.toggle = function () {
      if (this.container.style.display !== 'block') {
        this.show();
      }
      else {
        this.hide();
      }
    };

    // Disable/enable autocomplete and datepicker based on the selected category.
    addEventListener(filterNewCategory, 'change', function (event) {
      autocomplete.clear();
      datepicker.hide();

      if (getFilterCategory() === 'datepicker') {
        datepicker.openButton.style.display = '';
        autocomplete.disable();
        filterNewAutocomplete.style.display = 'none';
        filterNewList.style.display = 'none';
      }
      else {
        filterNewAutocomplete.style.display = '';
        filterNewAutocomplete.placeholder = 'type and select a term then press enter';
        autocomplete.enable();
        filterNewList.style.display = '';
        datepicker.openButton.style.display = 'none';
      }
    });
    // Toggle the datepicker when clicking on the autocomplete input.
    addEventListener(filterNewAutocomplete, 'click', function (event) {
      autocompleteDisplayList(true);
    });

    addEventListener(datepicker.openButton, 'click', function (event) {
      datepicker.toggle();
      // Focus first selectable date in the datepicker.
      var firstDate = datepicker.container.querySelectorAll('.simpledatepicker-day-in')[0];
      if (firstDate) {
        firstDate.setAttribute('tabindex', '0');
        firstDate.focus();
      }
    });


    /**
     * AUTOCOMPLETE HANDLING.
     */

    function autocompleteDisplayList(checkCategory) {
      if (!autocomplete.selectorIsOpen() && (!checkCategory || autoexpandCategory())) {
        autocomplete.clear();
        // Increase the limit to make sure we can display all the terms.
        autocomplete.options.limit = 10000;
        // Calling prepare will load the data if not aleary loaded.
        if (autocomplete.options.prepare('') !== null) {
          autocomplete.display();
        }
      }
    }

    var autocompleteURL = '/profiles/reliefweb/modules/features/reliefweb_rivers/autocomplete.php?vocabulary=%VOCABULARY';

    var FilterAutocomplete = SimpleAutocomplete.Autocomplete.extend({
      getCache: function (cacheKey) {
        var query = this.getQuery();
        if (this.isCached(cacheKey)) {
          if (query !== '') {
            return this.match(query, this.cache[cacheKey]);
          }
          else {
            return this.cache[cacheKey];
          }
        }
        return null;
      }
    });

    var autocomplete = new FilterAutocomplete(filterNewAutocomplete, {}, {
      limit: 10,
      delay: 10,

      cacheKey: function (query) {
        return filterNewCategory.value;
      },

      // Prepare the Source.
      prepare: function (query, source) {
        var category = filterNewCategory.value;
        var type = categories[category].type;
        var cacheKey = this.options.cacheKey(query);
        var context = this;

        if (!this.isCached(cacheKey)) {
          // Load the data.
          if (type !== 'date') {
            SimpleAutocomplete.get(autocompleteURL.replace('%VOCABULARY', type), function (success, data) {
              if (success) {
                data = JSON.parse(data);
                for (var i = 0, l = data.length; i < l; i++) {
                  data[i].category = category;
                }
                context.handleData(query, data, cacheKey);
              }
            });
          }
        }
        return this.getCache(cacheKey);
      },

      // Filter input, create groups and change operator.
      input: function (query) {
        var firstChar = query.charAt(0);
        var element = this.element;

        if (firstChar === ':') {
          var position = query.indexOf(':', 1);
          if (position !== -1) {
            var category = query.substr(1, position - 1).toUpperCase();
            if (typeof categories[category] !== 'undefined') {
              filterNewCategory.value = category;
              element.value = '';
              autocompleteDisplayList(true);
            }
          }
          query = '';
        }
        else if (firstChar === ' ') {
          var length = filterNewOperator.options.length;
          var index = filterNewOperator.selectedIndex;
          filterNewOperator.selectedIndex = ++index % length;

          query = element.value = query.substr(1);
        }
        return query;
      }
    })
    // Reset the limit.
    .on('closed', function (event) {
      event.target.options.limit = 10;
    })
    // Create a filter when a suggestion is selected.
    .on('selected', function (event) {
      var target = event.target;
      var element = target.element;
      var suggestion = event.data;

      createFilter(suggestion.category, suggestion.id, suggestion.name);

      target.clear();
      element.focus();
    });

    // Prevent selector closing.
    addEventListener(filterNewList, 'mousedown', function (event) {
      autocomplete.preventBlur = true;
      preventDefault(event);
    });
    addEventListener(filterNewList, 'mouseout', function (event) {
      autocomplete.preventBlur = false;
      autocomplete.focus();
      preventDefault(event);
    });
    // Display the full list of terms when click on "all" button.
    addEventListener(filterNewList, 'click', function (event) {
      if (autocomplete.selectorIsOpen()) {
        autocomplete.clear();
      }
      else {
        autocompleteDisplayList(false);
      }
      preventDefault(event);
    });

    // Remove a filter or group start/end when backspace is pressed.
    addEventListener(filterNewAutocomplete, 'keydown', function (event) {
      var key = event.which ? event.which : event.keyCode;

      if (key === 8 && this.value === '') {
        removeElement(this.parentNode.previousSibling);
      }
    });

    // Operator selector.
    var operatorTarget = null;
    var operatorList = document.createElement('ul');
    operatorList.className = 'filter-operator-list';
    document.body.appendChild(operatorList);

    // Close the selector when clicking elsewhere than an operator.
    addEventListener(document.body, 'click', function (event) {
      if (!hasClass(event.target, 'operator')) {
        operatorList.style.display = 'none';
      }
    });
    // Update the operator when clicking on an element of the selector.
    addEventListener(operatorList, 'click', function (event) {
      var target = event.target;
      if (operatorTarget && target.tagName === 'BUTTON') {
        var operator = target.innerHTML;
        operatorList.style.display = 'none';
        operatorTarget.innerHTML = operator;
        operatorTarget.className = 'operator ' + operator.replace(' ', '-').toLowerCase();
        updateOperators();
        updateOperatorSelector();
        updateAdvancedSearch();
      }
    });

    // Remove a filter when clicking on the cross
    // and show operator selection when clicking on an operator.
    addEventListener(filtersElement, 'click', function (event) {
      var target = event.target;
      if (hasClass(target, 'delete')) {
        removeElement(target.parentNode);
        return false;
      }
      else if (hasClass(target, 'operator')) {
        if (operatorList.style.display !== 'block') {
          var operator = target.innerHTML;
          var operators = ['and', 'or', 'and with', 'and without', 'or with', 'or without'];

          if (operator === 'with') {
            operators = ['without'];
          }
          else if (operator === 'without') {
            operators = ['with'];
          }
          else {
            for (var i = 0, l = operators.length; i < l; i++) {
              if (operators[i] === operator) {
                operators.splice(i, 1);
                break;
              }
            }
          }

          operatorList.innerHTML = '<li><button type="button" class="btn">' + operators.join('</button></li><li><button type="button" class="btn">') + '</button></li>';
          target.parentNode.insertBefore(operatorList, target.nextSibling);
          operatorList.style.display = 'block';

          operatorTarget = target;
        }
        else {
          operatorList.style.display = 'none';
        }
      }
    });
    // Remove a group end/start when double-clicked.
    addEventListener(filtersElement, 'dblclick', function (event) {
      var target = event.target;
      if ((target = getFilter(target)) !== null) {
        removeElement(target);
        return false;
      }
    });

    // Handle dragging and dropping filters.
    var dragDrop = new DragDrop();
    addEventListener(filtersElement, 'mousedown', function (event) {
      var target = event.target;
      if (!hasClass(target, 'delete') && (hasClass(target, 'group') || (target = getFilter(target)) !== null)) {
        dragDrop.start(target, event);
        preventDefault(event);
        return false;
      }
    });

    // Handle submit to keep proper formatting of the URL parameters.
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var params = [];
      var hiddenInputs = searchForm.querySelectorAll('input[type=hidden]');
      for (var i = 0; i < hiddenInputs.length; i++) {
        params.push(hiddenInputs[i].name + (typeof hiddenInputs[i].value !== 'undefined' && hiddenInputs[i].value.length ? '=' + hiddenInputs[i].value : ''));
      }
      var search = searchInput.value.replace(/(^\s+|\s+$)/g, '');
      if (search.length > 0) {
        params.push('search=' + encodeURIComponent(search).replace(/%20/g, '+'));
      }
      window.location = event.target.action.replace(/^([^#?]+)(\?[^#]*)?(#[^#]*)?$/, '$1' + (params.length ? '?' + params.join('&') : '') + '$3');
    });
  };
})();
