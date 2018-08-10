(function($) {
  $(document).ready(function(){

    // Apply focus to input when dropdown is shown.
    $('.cd-search--inline').on('shown.bs.dropdown', function () {
      $(this).find('#cd-search').focus();
    });

    $('.cd-search--inline').on('hidden.bs.dropdown', function () {
      $(this).find('#cd-search').blur();
    });

    // Add class on submit button when input has focus.
    $('.cd-search--inline .cd-search--inline__input').on('focus', function(e) {
      $(this).parent().find('.cd-search--inline__submit').addClass('js-has-focus');
    });

    $('.cd-search--inline .cd-search--inline__input').on('blur', function(e) {
      $(this).parent().find('.cd-search--inline__submit').removeClass('js-has-focus');
    });

    $('.cd-search--inline .cd-search--inline__input').on('focus', function(e){
      $(this).parent().addClass('js-has-focus');
    });

    $('.cd-search--inline .cd-search--inline__input').on('blur', function(e){
      $(this).parent().removeClass('js-has-focus');
    });

  });
})(jQuery);
