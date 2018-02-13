(function () {

'use strict';

// SimpleDatePicker.
var SimpleDatePicker = window.SimpleDatePicker = {};

// Bind a function to a context.
SimpleDatePicker.bind = function (fn, context) {
  var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
  return function () {
    return fn.apply(context, args || arguments);
  };
};


// Add an event to an element. Return the handler.
SimpleDatePicker.addEventListener = function (element, eventName, handler, context) {
  var names = eventName.split(/\s+/), i, l;

  if (!document.addEventListener) {
    var callback = handler;
    handler = function (event) {
      event.target = event.target || event.srcElement;
      callback.call(this, event);
    };
  }

  if (context) {
    handler = SimpleDatePicker.bind(handler, context);
  }

  for (i = 0, l = names.length; i < l; i++) {
    eventName = names[i];
    if (element.addEventListener) {
      element.addEventListener(eventName, handler, false);
    }
    else if (element.attachEvent) {
      element.attachEvent('on' + eventName, handler);
    }
    else {
      element['on' + eventName] = handler;
    }
  }

  return handler;
};

// Remove an event from an element.
SimpleDatePicker.removeEventListener = function (element, eventName, handler) {
  var names = eventName.split(/\s+/), i, l;

  for (i = 0, l = names.length; i < l; i++) {
    eventName = names[i];
    if (element.removeEventListener) {
      element.removeEventListener(eventName, handler, false);
    }
    else if (element.detachEvent) {
      element.detachEvent('on' + eventName, handler);
    }
    else {
      element['on' + eventName] = null;
    }
  }
};

// Get a css style of an element. (Possible unexpected results in IE8).
SimpleDatePicker.getStyle = function (element, property, pseudoElement) {
  if (window.getComputedStyle) {
    return window.getComputedStyle(element, pseudoElement)[property];
  }
  else if (document.defaultView && document.defaultView.getComputedStyle) {
    return document.defaultView.getComputedStyle(element, pseudoElement)[property];
  }
  else if (element.currentStyle) {
    return element.currentStyle[property];
  }
  else {
    return element.style[property];
  }
};

// Handle DOM element classes.
SimpleDatePicker.hasClass = function (element, className) {
  if (element && element.className.length > 0) {
    return element.className === className || (' ' + element.className + ' ').indexOf(' ' + className + ' ') !== -1;
  }
  return false;
};
SimpleDatePicker.addClass = function (element, className) {
  if (element && !SimpleDatePicker.hasClass(element, className)) {
    element.className += (element.className.length > 0 ? ' ' : '') + className;
  }
};
SimpleDatePicker.removeClass = function (element, className) {
  if (element && element.className.length > 0) {
    element.className = SimpleDatePicker.trim((' ' + element.className + ' ').replace(' ' + className + ' ', ''));
  }
};

// Create a DOM element and set attributes.
SimpleDatePicker.createElement = function (tagName, attributes, parent, content) {
  var element = document.createElement(tagName),
      attribute;
  if (attributes) {
    for (attribute in attributes) {
      if (attributes.hasOwnProperty(attribute)) {
        element.setAttribute(attribute, attributes[attribute]);
      }
    }
  }
  if (content) {
    element.innerHTML = content;
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
};

// Trim a string.
SimpleDatePicker.trim = function (string){
  var ws = /\s/, i = string.length, result = true;
  string = string.replace(/^\s\s*/, '');
  while (result) { result = ws.test(string.charAt(--i)); }
  return string.slice(0, i + 1);
};

// Merge properties of objects passed as arguments into target.
SimpleDatePicker.extend = function (target) {
  var sources = Array.prototype.slice.call(arguments, 1),
      i, l, property, source;
  for (i = 0, l = sources.length; i < l; i++) {
    source = sources[i] || {};
    for (property in source) {
      if (source.hasOwnProperty(property)) {
        target[property] = source[property];
      }
    }
  }
  return target;
};

/**
* Simple Class.
*/
SimpleDatePicker.Class = function () {};

// Extend a class.
SimpleDatePicker.Class.extend = function (properties) {
  properties = properties || {};

  // Extended class.
  var NewClass = function () {
    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }
  };

  // Instantiate the class without calling the constructor.
  var Instance = function () {};
  Instance.prototype = this.prototype;

  var prototype = new Instance();
  prototype.constructor = NewClass;

  NewClass.prototype = prototype;

  // Inherit the parent's static properties.
  for (var property in this) {
    if (this.hasOwnProperty(property) && property !== 'prototype') {
      NewClass[property] = this[property];
    }
  }

  // Merge static properties.
  if (properties.statics) {
    SimpleDatePicker.extend(NewClass, properties.statics);
    delete properties.statics;
  }

  // Merge includes.
  if (properties.includes) {
    SimpleDatePicker.extend.apply(null, [prototype].concat(properties.includes));
    delete properties.includes;
  }

  // Merge options.
  if (properties.options && prototype.options) {
    properties.options = SimpleDatePicker.extend({}, prototype.options, properties.options);
  }

  // Merge properties into the prototype.
  SimpleDatePicker.extend(prototype, properties);

  // Parent.
  NewClass._super = this.prototype;

  NewClass.prototype.setOptions = function (options) {
    this.options = SimpleDatePicker.extend({}, this.options, options);
  };

  return NewClass;
};

/**
 * Date manipulation class.
 */
SimpleDatePicker.Date = SimpleDatePicker.Class.extend({
  options: {
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    utc: true,
    formats: /(YYYY|YY|MMMM|MMM|MM|M|DDDD|DDD|DD|D|dddd|ddd|dd|d)/g
  },

  initialize: function (date, options) {
    this.setOptions(options);

    this.create(date);

    this.replace = SimpleDatePicker.bind(this.replace, this);
  },

  create: function (date) {
    this.dateObject = typeof date === 'undefined' || date === null ? new Date() : new Date(date);
  },

  utc: function (date) {
    if (typeof date !== 'undefined') {
      this.create(date);
    }
    this.options.utc = true;
    return this;
  },

  day: function (day) {
    if (typeof day === 'number') {
      this.add('date', day - this.get('day'));
      return this;
    }
    return this.get('day');
  },

  days: function (days) {
    return this.date(days);
  },

  millisecond: function (millisecond) {
    return this.milliseconds(millisecond);
  },

  milliseconds: function (milliseconds) {
    return this.set('milliseconds', milliseconds);
  },

  second: function (second) {
    return this.seconds(second);
  },

  seconds: function (seconds) {
    return this.set('seconds', seconds);
  },

  minute: function (minute) {
    return this.minutes(minute);
  },

  minutes: function (minutes) {
    return this.set('minutes', minutes);
  },

  hour: function (hour) {
    return this.hours(hour);
  },

  hours: function (hours) {
    return this.set('hours', hours);
  },

  date: function (date) {
    return this.set('date', date);
  },

  dates: function (dates) {
    return this.date(dates);
  },

  month: function (month) {
    return this.set('month', month);
  },

  months: function (months) {
    return this.month(months);
  },

  year: function (year) {
    return this.set('year', year);
  },

  years: function (years) {
    return this.year(years);
  },

  get: function (type) {
    return this.set(type);
  },

  set: function (type, value) {
    type = type === 'year' ? 'FullYear' : type;
    type = type.charAt(0).toUpperCase() + type.slice(1);
    if (typeof value === 'number') {
      this.dateObject['set' + (this.options.utc ? 'UTC' : '') + type](value);
      return this;
    }
    return this.dateObject['get' + (this.options.utc ? 'UTC' : '') + type]();
  },

  daysInMonth: function () {
    var date = new Date(this.year(), this.month() + 1, 0);
    return this.options.utc ? date.getUTCDate() : date.getDate();
  },

  add: function (type, value) {
    return this[type](this[type]() + value);
  },

  substract: function (type, value) {
    return this[type](this[type]() - value);
  },

  valueOf: function () {
    return this.dateObject.valueOf();
  },

  unix: function () {
    return Math.round(this.valueOf() / 1000);
  },

  format: function (format) {
    return format.replace(this.options.formats, this.replace);
  },

  replace: function (data) {
    var date, month, day;
    switch (data) {
      case 'YYYY':
        return this.year();

      case 'YY':
        return ('' + this.year()).slice(-2);

      case 'MMMM':
        return this.options.months[this.month()];

      case 'MMM':
        return ('' + this.options.months[this.month()]).substr(0, 3);

      case 'MM':
        month = this.month() + 1;
        return (month < 10 ? '0' : '') + month;

      case 'M':
        return this.month() + 1;

      case 'DDDD':
      case 'DDD':
        date = new Date(this.year(), 0, 1);
        date = '' + Math.ceil((this.dateObject - date) / 86400000);
        return (data === 'DDDD' ? '00'.substr(0, 2 - date.length) : '') + date;

      case 'DD':
        date = this.date();
        return (date < 10 ? '0' : '') + date;

      case 'D':
        return this.date();

      case 'dddd':
      case 'ddd':
      case 'dd':
        day = this.options.weekDays[this.get('day')];
        return (data === 'dddd' ? day : day.substr(0, data.length));

      case 'd':
        return this.get('day');
    }
  },

  clone: function () {
    return new SimpleDatePicker.Date(this.dateObject, this.options);
  }
});

SimpleDatePicker.date = function (date, options) {
  return new SimpleDatePicker.Date(date, options);
};

/**
 * DatePicker class.
 */
SimpleDatePicker.DatePicker = SimpleDatePicker.Class.extend({
  options: {
    // Selection mode of the calendar(s). Can be 'single', 'muliple' or 'range'.
    mode: 'single',
    // Number of calendars to display.
    calendars: 1,
    // Indicates if calendars are linked or not
    // (changing month/year affects all calendars).
    linked: true,
    // Default date.
    date: null,
    // Date creation function, moment.js like.
    dateFunction:  SimpleDatePicker.date,
    // First day of the week. 0 is Sunday, 1 is Monday etc.
    firstWeekDay: 0,
    // Whether to highlight today's day or not.
    highlightToday: true,
    // Classes used for theme the calendars.
    classes: {
      container: 'simpledatepicker-container',
      calendar: 'simpledatepicker-calendar',
      calendarFirst: 'simpledatepicker-calendar-first',
      calendarMIddle: 'simpledatepicker-calendar-middle',
      calendarLast: 'simpledatepicker-calendar-last',
      title: 'simpledatepicker-title',
      titleDate: 'simpledatepicker-title-date',
      titlePrevious: 'simpledatepicker-title-previous',
      titleNext: 'simpledatepicker-title-next',
      titleMonth : 'simpledatepicker-title-month',
      titleYear: 'simpledatepicker-title-year',
      header: 'simpledatepicker-header',
      days: 'simpledatepicker-days',
      time: 'simpledatepicker-time',
      dayIn: 'simpledatepicker-day-in',
      dayOut: 'simpledatepicker-day-out',
      firstWeekDay: 'simpledatepicker-first-week-day',
      selectedDay: 'simpledatepicker-selected-day',
      activeDay: 'simpledatepicker-active-day',
      today: 'simpledatepicker-today',
      multiple: 'simpledatepicker-multiple',
      linked: 'simpledatepicker-linked'
    },
    // Navigation.
    navigation: {
      previousYear: {
        content: 'Previous year',
        title: 'previous year'
      },
      previousMonth: {
        content: 'Previous month',
        title: 'previous month'
      },
      nextMonth: {
        content: 'Next month',
        title: 'next month'
      },
      nextYear: {
        content: 'Next year',
        title: 'next year'
      }
    },
    // Date formats.
    formats: {
      titleDate: 'MMMM, YYYY',
      headerDay: 'dd',
      day: 'D'
    },
    // Element to which attach the datepicker.
    element: null,
    // Container in which to insert the datepicker,
    // defaults to document.body if not defined.
    container: null,
    // Default visibility.
    visible: true,
    // Automatically update the calendar position before display.
    autoUpdatePosition: false
  },

  // Initialize the class object.
  initialize: function (options) {
    this.setOptions(options);

    // Bind methods.
    var bind = SimpleDatePicker.bind, property;
    for (property in this) {
      if (typeof this[property] === 'function') {
        this[property] = bind(this[property], this);
      }
    }

    // Event listeners.
    this.listeners = {};

    // Regexp used to extract the date from a day element.
    this.timeMatcher = new RegExp(this.options.classes.time + '-(\\d+)');

    this.selection = [];

    // Set up today.
    this.today = this.options.highlightToday === true ? this.createDate(null, true).valueOf() : null;

    this.create();
  },

  // Handle click on the calendar days and navigation elements.
  handleClick: function (event) {
    var target = event.target,
        hasClass = SimpleDatePicker.hasClass,
        options = this.options,
        classes = options.classes,
        classDayIn = classes.dayIn,
        classPrevious = classes.titlePrevious,
        classNext = classes.titleNext,
        classYear = classes.titleYear,
        calendar;

    if (hasClass(target, classDayIn)) {
      this.select(target);
    }
    else if (hasClass(target, classPrevious)) {
      calendar = options.linked ? null : this.retrieveCalendar(target);
      this.updateCalendars(hasClass(target, classYear) ? 'years' : 'months', -1, calendar);
    }
    else if (hasClass(target, classNext)) {
      calendar = options.linked ? null : this.retrieveCalendar(target);
      this.updateCalendars(hasClass(target, classYear) ? 'years' : 'months', 1, calendar);
    }
    return false;
  },

  // Handle keypress for navigating calendar
  handleKeyPress: function (e) {
    var classes = this.options.classes,
    classDayIn = classes.dayIn,
    classDays = classes.days,
    isArrowRight = e.key === 'ArrowRight' || e.keyCode === 39,
    isArrowLeft = e.key === 'ArrowLeft' || e.keyCode === 37,
    isArrowDown = e.key === 'ArrowDown' || e.keyCode === 40,
    isArrowUp = e.up === 'ArrowUp' || e.keyCode === 38,
    currentPosition,
    dateIsFocused,
    datesContainerIsFocused,
    activeDates,
    focusedEl,
    moveTo,
    newPosition;

    if (!isArrowRight && !isArrowLeft && !isArrowDown && !isArrowUp) {
      return;
    }
    e.preventDefault();

    focusedEl = document.activeElement;
    dateIsFocused = focusedEl.className.indexOf(classDayIn) !== -1;
    datesContainerIsFocused = focusedEl.className.indexOf(classDays) !== -1;
    currentPosition = parseInt(focusedEl.innerText, 10) - 1;
    activeDates = this.container.querySelectorAll('.' + classDayIn);

    // Dates container is focused.
    if (datesContainerIsFocused && (isArrowRight || isArrowDown)) {
      newPosition = 0;
    }
    // Date is focused.
    else if (dateIsFocused) {
      if (isArrowLeft) {
        newPosition = currentPosition - 1;
      }
      if (isArrowRight) {
        newPosition = currentPosition + 1;
      }
      if (isArrowDown) {
        newPosition = currentPosition + 7;
      }
      if (isArrowUp) {
        newPosition = currentPosition - 7;
      }
    }

    moveTo = activeDates[newPosition];
    if (moveTo && moveTo.className.indexOf(classDayIn) !== -1) {
      // Remove tabindex from previously focused dates.
      for (var i = 0; i < activeDates.length; i++) {
        activeDates[i].setAttribute('tabindex', '-1');
      }
      // Move to date.
      moveTo.setAttribute('tabindex', 0);
      moveTo.focus();
    }
  },

  // Retrieve a calendar from an element.
  retrieveCalendar: function (element) {
    var hasClass = SimpleDatePicker.hasClass,
        calendarElement = null,
        calendarClass = this.options.classes.calendar,
        calendars = this.calendars,
        calendar, i, l;

    while (element !== this.container) {
      if (hasClass(element, calendarClass)) {
        calendarElement = element;
        break;
      }
      element = element.parentNode;
    }

    if (calendarElement) {
      for (i = 0, l = calendars.length; i < l; i++) {
        calendar = calendars[i];
        if (calendar.calendar === calendarElement) {
          return calendar;
        }
      }
    }
    return null;
  },

  // Retrieve the date associated with a day element.
  retrieveDate: function (day, toDate) {
    var date = parseInt(this.timeMatcher.exec(day.className)[1], 10);
    return toDate === true ? this.createDate(date) : date;
  },

  // Retrieve a list of days matching the given date.
  retrieveDays: function (date) {
    if (this.container.getElementsByClassName) {
      return this.container.getElementsByClassName(this.options.classes.time + '-' + date);
    }
    else {
      var retrieveDate = this.retrieveDate,
          calendars = this.calendars, elements = [],
          days, day, i, l, j, m;
      for (j = 0, m = calendars.length; j < m; j++) {
        days = calendars[j].days;
        for (i = 0, l = days.length; i < l; i++) {
          day = days[i];
          if (retrieveDate(day) === date) {
            elements.push(day);
          }
        }
      }
      return elements;
    }
  },

  // Day selection callback.
  select: function (day) {
    var hasClass = SimpleDatePicker.hasClass,
        options = this.options,
        classSelectedDay = options.classes.selectedDay,
        selected = hasClass(day, classSelectedDay),
        selection = this.selection,
        selectionLength = selection.length,
        mode = options.mode,
        date = this.retrieveDate(day);

    switch (mode) {
      case 'single':
        if (selectionLength > 0) {
          this.unselectAll();
        }
        this.selectDay(date);
        break;

      case 'multiple':
        if (selected) {
          this.unselectDay(date);
        }
        else {
          this.selectDay(date);
        }
        break;

      case 'range':
        if (selectionLength === 1 && selection[0] !== date) {
          this.selectRange(selection[0], date);
        }
        else {
          if (selectionLength > 1) {
            this.unselectAll();
          }
          this.selectDay(date);
        }
        break;
    }

    this.fire('select', this.getSelection());
  },

  // Select a calendar day based on the given date.
  selectDay: function (date, select) {
    var addClass = SimpleDatePicker.addClass,
        removeClass = SimpleDatePicker.removeClass,
        selection = this.selection,
        classSelectedDay = this.options.classes.selectedDay,
        days = this.retrieveDays(date),
        day, i, l;

    // We select all the days of all the calendars with the same date.
    for (i = 0, l = days.length; i < l; i++) {
      day = days[i];
      if (select !== false) {
        addClass(day, classSelectedDay);
        day.setAttribute('aria-selected', 'true');
      }
      else {
        removeClass(day, classSelectedDay);
        day.removeAttribute('aria-selected');
      }
    }


    for (i = 0, l = selection.length; i < l; i++) {
      if (selection[i] === date) {
        return select !== false ? null : selection.splice(i, 1);
      }
    }
    selection.push(date);
  },

  // Unselect a day.
  unselectDay: function (date) {
    this.selectDay(date, false);
  },

  // Select a range of days.
  selectRange: function (dateStart, dateEnd) {
    var addClass = SimpleDatePicker.addClass,
        retrieveDate = this.retrieveDate,
        options = this.options,
        classes = options.classes,
        classSelectedDay = classes.selectedDay,
        classActiveDay = classes.activeDay,
        calendars = this.calendars,
        days, day, dateDay,
        temp, i, l, j, m;

    if (dateStart > dateEnd) {
      temp = dateStart;
      dateStart = dateEnd;
      dateEnd = temp;
    }

    for (j = 0, m = calendars.length; j < m; j++) {
      days = calendars[j].days;

      for (i = 0, l = days.length; i < l; i++) {
        day = days[i];
        dateDay = retrieveDate(day);
        if (dateDay > dateStart && dateDay < dateEnd) {
          addClass(day, classActiveDay);
        }
        else if (dateDay === dateStart || dateDay === dateEnd) {
          addClass(day, classSelectedDay);
        }
      }
    }
    this.selection = [dateStart, dateEnd];
  },

  // Unselect all selected days.
  unselectAll: function () {
    var removeClass = SimpleDatePicker.removeClass,
        classes = this.options.classes,
        classSelectedDay = classes.selectedDay,
        classActiveDay = classes.activeDay,
        calendars = this.calendars,
        days, day, i, l, j, m;

    for (j = 0, m = calendars.length; j < m; j++) {
      days = calendars[j].days;
      for (i = 0, l = days.length; i < l; i++) {
        day = days[i];
        removeClass(day, classSelectedDay);
        removeClass(day, classActiveDay);
      }
    }

    this.selection = [];
  },

  // Update a calendar based on the new date.
  updateCalendar: function (calendar, date) {
    calendar.date = date;
    calendar.titleDate.innerHTML = date.format(this.options.formats.titleDate);
    this.updateDays(date, calendar.days);
  },

  // Update calendars when previous/next month/year is pressed.
  updateCalendars: function (type, value, calendar) {
    var calendars = calendar ? [calendar] : this.calendars,
        i, l;
    for (i = 0, l = calendars.length; i < l; i++) {
      calendar = calendars[i];
      if (typeof type !== 'undefined') {
        calendar.date.add(type, value);
      }
      this.updateCalendar(calendar, calendar.date);
    }
  },

  // Mark day as selected if in selection.
  updateSelectedDay: function (day, date) {
    var addClass = SimpleDatePicker.addClass,
        selection = this.selection,
        selectionLength = selection.length,
        options = this.options, i;

    if (options.mode === 'range' && selectionLength > 1 && date > selection[0] && date < selection[1]) {
      addClass(day, options.classes.activeDay);
    }
    else {
      for (i = 0; i < selectionLength; i++) {
        if (selection[i] === date) {
          addClass(day, options.classes.selectedDay);
          break;
        }
      }
    }
  },

  // Update the class and date for a given day element.
  updateDay: function (element, month, date) {
    var options = this.options,
        firstWeekDay = options.firstWeekDay,
        formatDay = options.formats.day,
        classes = options.classes,
        classTime = classes.time,
        classDayIn = classes.dayIn,
        classDayOut = classes.dayOut,
        classFirstWeekDay = classes.firstWeekDay,
        classToday = classes.today,
        time = date.valueOf();

    element.className = (classTime + '-' + time + ' ') +
                        (date.day() === firstWeekDay ? classFirstWeekDay + ' ' : '') +
                        (date.month() === month ? classDayIn : classDayOut) +
                        (this.today === time ? ' ' + classToday : '');
    element.innerHTML = date.format(formatDay);
    if (date.month() !== month) {
      element.setAttribute('disabled', 'disabled');
    }

    this.updateSelectedDay(element, time);

    return element;
  },

  // Update the days of a calendar.
  updateDays: function (date, days) {
    var updateDay = this.updateDay,
        month = date.month(), i;

    date = date.clone().date(0).day(this.options.firstWeekDay);

    // Update the days.
    for (i = 0; i < 42; i++) {
      updateDay(days[i], month, date);
      date.add('days', 1);
    }
  },

  // Create the days of a calendar.
  createDays: function (date, container) {
    var createElement = SimpleDatePicker.createElement,
        updateDay = this.updateDay,
        month = date.month(),
        days = [], i = 42;

    date = date.clone().date(0).day(this.options.firstWeekDay);

    // Create the days.
    while (i--) {
      var label = date.dateObject.getDate() + ' ' + date.options.months[date.dateObject.getMonth()];
      days.push(updateDay(createElement('button', {'type': 'button', 'aria-label': label, 'tabindex': '-1'}, container), month, date));
      date.add('days', 1);
    }

    return days;
  },

  // Create a calendar;
  createCalendar: function (container, date, position) {
    var createElement = SimpleDatePicker.createElement,
        options = this.options,
        classes = options.classes,
        classPrevious = classes.titlePrevious,
        classNext = classes.titleNext,
        classYear = classes.titleYear,
        classMonth = classes.titleMonth,
        navigation = options.navigation,
        previousYear = navigation.previousYear,
        previousMonth = navigation.previousMonth,
        nextMonth = navigation.nextMonth,
        nextYear = navigation.nextYear,
        formats = options.formats,
        formatTitleDate = formats.titleDate,
        formatHeaderDay = formats.headerDay,
        calendar, title, titleDate, header, days,
        day = date.clone().day(options.firstWeekDay),
        i = 7;

    // Calendar.
    calendar = createElement('div', {'class': classes.calendar}, container);

    if (options.calendars > 1) {
      if (position === 0) {
        SimpleDatePicker.addClass(calendar, classes.calendarFirst);
      }
      else if (options.calendars - 1) {
        SimpleDatePicker.addClass(calendar, classes.calendarLast);
      }
      else {
        SimpleDatePicker.addClass(calendar, classes.calendarMiddle);
      }
    }

    // Month, Year header and navigation.
    title = createElement('div', {'class': classes.title}, calendar);
    createElement('button', {'class': 'simpledatepicker-control ' + classPrevious + ' ' + classYear, 'type': 'button'}, title, previousYear.content);
    createElement('button', {'class': 'simpledatepicker-control ' + classPrevious + ' ' + classMonth, 'type': 'button'}, title, previousMonth.content);
    titleDate = createElement('span', {'class': classes.titleDate}, title, date.format(formatTitleDate));
    createElement('button', {'class': 'simpledatepicker-control ' + classNext + ' ' + classMonth, 'type': 'button'}, title, nextMonth.content);
    createElement('button', {'class': 'simpledatepicker-control ' + classNext + ' ' + classYear, 'type': 'button'}, title, nextYear.content);

    // Days header.
    header = createElement('div', {'class': classes.header}, calendar);
    while (i--) {
      createElement('span', null, header, day.format(formatHeaderDay));
      day.add('days', 1);
    }

    // Calendar days.
    days = createElement('div', {'class': classes.days, 'tabindex': '0'}, calendar);
    days = this.createDays(date, days);

    return {
      calendar: calendar,
      titleDate: titleDate,
      days: days,
      date: date
    };
  },

  // Link calendars, changing month/year affects all calendars.
  linkCalendars: function() {
    SimpleDatePicker.addClass(this.container, this.options.classes.linked);
    return this;
  },

  // Unlink calendars, changing month/year affects only the current calendar.
  unlinkCalendars: function() {
    SimpleDatePicker.removeClass(this.container, this.options.classes.linked);
    return this;
  },

  // Create the calendars.
  create: function () {

    var createElement = SimpleDatePicker.createElement,
        options = this.options,
        container = createElement('div', {'class': options.classes.container}),
        date =  this.createDate(this.options.date, true).date(1),
        calendar, calendars = [],
        i, l;

    for (i = 0, l = options.calendars; i < l; i++) {
      calendar = this.createCalendar(container, date.clone(), i);
      calendars.push(calendar);
      date.add('months', 1);
    }

    if (options.calendars > 1) {
      SimpleDatePicker.addClass(container, options.classes.multiple);

      if (options.linked) {
        this.linkCalendars();
      }
    }

    this.container = container;
    this.calendars = calendars;

    this.updatePosition();

    if (!options.visible) {
      this.hide();
    }

    if (this.options.container) {
      this.options.container.appendChild(container);
    }
    else {
      document.body.appendChild(container);
    }

    SimpleDatePicker.addEventListener(container, 'click', this.handleClick);
    SimpleDatePicker.addEventListener(container, 'keydown', this.handleKeyPress);
  },

  // Create a date wrapper object.
  createDate: function (date, stripTime, utc) {
    date = this.options.dateFunction(date);
    if (utc !== false) {
      date.utc();
    }
    if (stripTime === true) {
      date.hours(0).minutes(0).seconds(0).milliseconds(0);
    }
    return date;
  },

  // Show the calendars.
  show: function () {
    if (this.container.style.display === 'none') {
      if (this.options.autoUpdatePosition === true) {
        this.updatePosition();
      }
      this.fire('show').fire('opened');
      this.container.style.display = '';
      // Focus first selectable date in the datepicker.
      var firstDate = this.container.querySelectorAll('.simpledatepicker-day-in')[0];
      if (firstDate) {
        firstDate.setAttribute('tabindex', '0');
        firstDate.focus();
      }
    }
    return this;
  },

  // Hide the calendars.
  hide: function () {
    if (this.container.style.display !== 'none') {
      this.fire('hide').fire('closed');
      this.container.style.display = 'none';
    }
    return this;
  },

  // Toggle visibility.
  toggle: function () {
    if (this.container.style.display === 'none') {
      this.show();
    }
    else {
      this.hide();
    }
    return this;
  },

  // Check if the date picker is visible.
  visible: function () {
    return this.container.style.display !== 'none';
  },
  // Update the position and size of the selector.
  updatePosition: function () {
    if (this.container && this.options.element && !this.options.container) {
      var container = this.container,
          documentElement = document.documentElement,
          body = document.body,
          bounds = this.options.element.getBoundingClientRect(),
          scrollTop = window.pageYOffset || documentElement.scrollTop || body.scrollTop,
          scrollLeft = window.pageXOffset || documentElement.scrollLeft || body.scrollLeft,
          clientTop = documentElement.clientTop || body.clientTop || 0,
          clientLeft = documentElement.clientLeft || body.clientLeft || 0,
          top = bounds.bottom + scrollTop - clientTop,
          left = bounds.left + scrollLeft - clientLeft;

      container.style.position = 'absolute';
      container.style.left = left + 'px';
      container.style.top = top + 'px';
    }
  },

  // Get the selected days.
  getSelection: function (raw) {
    var selection = this.selection,
        selectionLength = selection.length,
        createDate = this.createDate,
        i, l;

    if (selectionLength > 0) {
      selection = selection.slice(0).sort(function(a, b) { return a - b; });

      if (raw !== true) {
        for (i = 0, l = selection.length; i < l; i++) {
          selection[i] = createDate(selection[i]);
        }
      }
    }

    return selection;
  },

  // Set the selected days. Accepts integer or Date like objects.
  setSelection: function (dates) {
    var createDate = this.createDate,
        mode = this.options.mode,
        selection = [], date, i, l, j, m;

    if (!dates || dates.length === 0) {
      this.unselectAll();
    }
    else {
      for (i = 0, l = dates.length; i < l; i++) {
        date = dates[i];
        if (date) {
          date = createDate(date, true).valueOf();
          // Look for duplicates.
          for (j = 0, m = selection.length; j < m; j++) {
            if (selection[j] === date) {
              break;
            }
          }
          // Only add if not a duplicate.
          if (j === m) {
            selection.push(date);
          }
        }
      }
      selection.sort(function(a, b) { return a - b; });

      if (mode === 'range' && selection.length > 1) {
        selection = [selection[0], selection[1]];
      }
      else if (mode === 'single') {
        selection = [selection[0]];
      }

      this.selection = selection;
      this.updateCalendars();
    }

    this.fire('select', this.getSelection());
  },

  // Clear the selected items.
  clear: function () {
    this.selection = [];
    this.updateCalendars();
    return this;
  },
  // Add a listener to the datepicker events.
  on: function (eventName, handler) {
    var names = eventName.split(/\s+/), i, l;
    for (i = 0, l = names.length; i < l; i++) {
      eventName = names[i];
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(handler);
    }
    return this;
  },

  // Remove a listener.
  off: function (eventName, handler) {
    var names = eventName.split(/\s+/), listeners, i, j, l;
    for (i = 0, l = names.length; i < l; i++) {
      eventName = names[i];
      if (this.listeners[eventName]) {
        listeners = this.listeners[eventName];
        for (j = listeners.length - 1; j >= 0; j--) {
          if (listeners[j] === handler) {
            this.listeners[eventName].splice(j, 1);
          }
        }
      }
    }
    return this;
  },

  // Fire an event. Execute the listeners' callbacks.
  fire: function (eventName, data) {
    var listeners = this.listeners[eventName], i, l, event;
    if (listeners) {
      event = {
        type: eventName,
        target: this
      };
      if (data) {
        event.data = data;
      }

      for (i = 0, l = listeners.length; i < l; i++) {
        listeners[i](event);
      }
    }
    return this;
  }
});

// Shortcut for instantiating a SimpleDatePicker.
SimpleDatePicker.datepicker = function (options) {
  return new SimpleDatePicker.DatePicker(options);
};

})();
