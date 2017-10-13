/*jQuery(document).ready(function(){
  if ($('.form').find('input, textarea').val() ==='')
  {
    console.log(1234);
    $('.form').find('input, textarea').prev('label').removeClass('active highlight');
  }
  else
  {
    console.log(5678);
    $('.form').find('input, textarea').prev('label').addClass('active highlight');
  };
  $('.form').find('input, textarea').on('keyup blur focus', function (e) {
  console.log("LOGIN _ PASSED!");
  var $this = $(this),
      label = $this.prev('label');

    if (e.type === 'keyup') {
      if ($this.val() === '') {
          label.removeClass('active highlight');
        } else {
          label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
      if( $this.val() === '' ) {
        label.removeClass('active highlight');
      } else {
        label.removeClass('highlight');
      }
    } else if (e.type === 'focus') {

      if( $this.val() === '' ) {
        label.removeClass('highlight');
      }
      else if( $this.val() !== '' ) {
        label.addClass('highlight');
      }
    }

});

$('.tab a').on('click', function (e) {

  e.preventDefault();

  $(this).parent().addClass('active');
  $(this).parent().siblings().removeClass('active');

  target = $(this).attr('href');

  $('.tab-content > div').not(target).hide();

  $(target).fadeIn(600);

});


$('#button-refresh-data').on('click', function() {
    var $this = $(this);
    $this.addClass('button-refesh-data-onloading');
  $this.button('loading');
    setTimeout(function() {
       $this.button('reset');
       $this.removeClass('button-refesh-data-onloading');
   }, 8000);
});
});
*/