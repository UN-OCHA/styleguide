// @see https://www.drupal.org/docs/7/theming/working-with-javascript-and-jquery
(function($) {
  $(document).ready(function(){

    // search

    $('.cd-search .cd-search__input').on('focus', function(e){
      $(this).parent().find('.cd-search__submit').toggleClass('js-has-focus');
    });

    $('.cd-search .cd-search__input').on('blur', function(e){
      $(this).parent().find('.cd-search__submit').toggleClass('js-has-focus');
    });

    // search--inline

    $('.cd-search--inline .cd-search--inline__input').on('focus', function(e){
      $(this).parent().find('.cd-search--inline__submit').toggleClass('js-has-focus');
    });

    $('.cd-search--inline .cd-search--inline__input').on('blur', function(e){
      $(this).parent().find('.cd-search--inline__submit').toggleClass('js-has-focus');
    });

    $('.cd-search--inline .cd-search--inline__input').on('focus', function(e){
      $(this).parent().toggleClass('js-has-focus');
    });

    $('.cd-search--inline .cd-search--inline__input').on('blur', function(e){
      $(this).parent().toggleClass('js-has-focus');
    });

  });
})(jQuery);
