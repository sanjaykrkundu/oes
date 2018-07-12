$(document).ready(function(){

__offertime=1;
_timer=setInterval(countTimer,1000);
	
	$(".offer").click(function(){
		$(".offer").hide();
		$(this).removeClass("offer").show();
	}); 

});


function showOffer(){
	$(".offer").show();
}

function countTimer(){
  __offertime-=1;
  if(__offertime<=0){
    clearInterval(_timer);
    showOffer();
  }
}