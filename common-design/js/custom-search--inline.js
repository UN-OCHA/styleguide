(function($) {
  $(document).ready(function(){

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
