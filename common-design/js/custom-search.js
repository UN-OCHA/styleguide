// @see https://www.drupal.org/docs/7/theming/working-with-javascript-and-jquery
(function($) {
  $(document).ready(function(){

    // Apply focus to input when dropdown is shown.
    $('.cd-search').on('shown.bs.dropdown', function () {
      $(this).find('#cd-search').focus();
    });

    $('.cd-search').on('hidden.bs.dropdown', function () {
      $(this).find('#cd-search').blur();
    });

    // Add class on submit button when input has focus.
    $('.cd-search .cd-search__input').on('focus', function(e) {
      $(this).parent().find('.cd-search__submit').addClass('js-has-focus');
    });

    $('.cd-search .cd-search__input').on('blur', function(e) {
      $(this).parent().find('.cd-search__submit').removeClass('js-has-focus');
    });

  });
})(jQuery);
