// On Documet Ready. 
$(document).ready(function(){

    $.getJSON("./data/user.json", function(result){
      var course = result["course"];
      $.each(result["users"],function(i,field){

        var filename = course.toUpperCase()+"_"+field["name"].toLowerCase() + "_" + new Date(field["dob"]).getTime();
        
        loadStudentResult(filename);
                
      });

    });

});


function datetodmy(date){
  return date.getDate() + "/" + date.getMonth() + "/" + (1900 + date.getYear());
}


function loadStudentResult(filename){
  
  $.getJSON("./data/results/"+ filename+".json", function(result){
    var name = result["name"];
    var dob = new Date(result["dob"]);
    var course = result["course"];
    var questionno = result["questionno"];
    var attended = result["attended"];
    var correct = result["correct"];
    $("#results").append("<tr><td>" + name + "</td><td>" + datetodmy(dob) + "</td><td>" + course + "</td><td>" + questionno + "</td><td>"+ attended + "</td><td>" + correct+   "</td></tr>");
  });

}