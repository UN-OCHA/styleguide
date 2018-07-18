// @see https://www.drupal.org/docs/7/theming/working-with-javascript-and-jquery
(function($) {
  $(document).ready(function(){
    $('.cd-dropdown button').on('click', function(e){
      $(this).parent().toggleClass('open');
      e.stopPropagation();
      e.preventDefault();
    });
  });
})(jQuery);
