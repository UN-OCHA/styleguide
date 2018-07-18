// @see https://www.drupal.org/docs/7/theming/working-with-javascript-and-jquery
(function($) {
  $(document).ready(function(){
    $('.cd-search__input').on('focus', function(e){
      $(this).parent().find('.cd-search__submit').toggleClass('js-has-focus');
    });

    $('.cd-search__input').on('blur', function(e){
      $(this).parent().find('.cd-search__submit').toggleClass('js-has-focus');
    });
  });
})(jQuery);
