// On Documet Ready. 
$(document).ready(function(){

  var _name;
  var _dob;
  var _course;
  var _time;
  var _mintime;
  var _questionno;
  var _questions;
  var _answers;
  var _timer;
  var _currentQuestion;
  var _login=false;
  
  login();

});


function formatString(t){
  if(t<10) return "0"+t;
  return t;
}


// ---------------- LOGIN FUNCTION -----------------
function login(){

  $("#loginForm").submit(function( event ) {

    _login=false;

    var name = $('input[name=name]').val();
    var dob = new Date($('input[name=dob]').val());
    var dobgettime =dob.getTime()+(dob.getTimezoneOffset()*60000);


    $.getJSON("./data/user.json", function(result){
      $.each(result["users"],function(i,field){
        var userDob = new Date(field["dob"]);
        if(name.toLowerCase()==field["name"].toLowerCase() && userDob.getTime() == dobgettime){
          
          _name = name.toLowerCase();
          _dob = userDob;
          _login = true;
          loadUserData();

          return false;
        }
      });
      if(!_login){
        alert("Invalid Credentials.");
      }

    });

  //preventing auto submit form
  event.preventDefault();
});
}

// ---------------- LOADUSERDATA FUNCTION ----------------

function loadUserData(){

    //Prevent Reload.
  window.onbeforeunload = function(){return "You Will Loose All Your Data. Don't Reload This Page.";}
  
  $("#data").load("userdata.html",function(){
       
    $.getJSON("./data/question.json", function(result){
      _questionno=parseInt(result["questionno"]);
      _time=parseInt(result["time"]);
      _mintime=parseInt(result["mintime"])*60;
      _course=result["course"];
      _questions= result["questions"];

      _questions = shuffle(_questions);

      $("#name").text(_name);
      $("#dob").text(_dob.toDateString());
      $("#course").text(_course);
      $("#questionno").text(_questionno);
      $("#time").text(_time);
      

      $("#confirmName").click(function(){
        loadInstruction();
      });

    });
  });
}

// --------------- LOADINSTRUCTION FUNCTION --------------
function loadInstruction(){
  $("#data").load("instructions.html",function(){
    $("#checkboxAgreeTerms").change(function(){
            var btnStart = $("#btnStart");
            if(this.checked){
               btnStart.prop('disabled', false);
            }else{
               btnStart.prop('disabled', true);
            }
            
            // exam Start button handler
            btnStart.click(function(){
              startExam();
            });

          });
  });
}



// --------------- STARTEXAM FUNCTION --------------
function startExam(){
  $("#mainData").load("question.html",function(){
    __time= _time*60;
    _answers = new Array(_questionno);

    examSetup();

    _timer=setInterval(countTimer,1000);

  });
}


function examSetup(){
  $("#name").text(_name);
  $("#course").text(_course);

  for(var i = 1;i<=_questionno;i++)
    $("#questionNoBox").append('<div class="col-xs-2 "><button class="btn btn-default qid" id="q'+i+'">'+ i +' </button></div>');

  $(".qid").click(function(){
    newCurrentQuestion = parseInt($(this).text())-1;
    if($("#q"+(_currentQuestion+1)).hasClass("btn-default"))
      questionClicked("save",newCurrentQuestion);
    else
      questionClicked("same",newCurrentQuestion);
  });

 $('input[name="userAns"]').click(function(){
  var val = $('input[name="userAns"]:checked').val();
  _answers[_currentQuestion] = val;
 });


  _currentQuestion=0;
  loadQuestion(_currentQuestion);
  countTimer();

  $("#btnNext").click(function(){questionClicked("save",_currentQuestion+1);});
  $("#btnReview").click(function(){questionClicked("review",_currentQuestion+1);});
  $("#btnSubmit").click(function(){result();});
}


function questionClicked(mode,newCurrentQuestion){
  var val = $('input[name="userAns"]:checked').val();
  $("#q"+(_currentQuestion+1)).css("color", "#fff").css("font-weight","normal").css("background-color","");
  if(val){
    if(mode == "save")
      $("#q"+(_currentQuestion+1)).removeClass("btn-default").removeClass("btn-primary").removeClass("btn-danger").addClass("btn-success");
    else if(mode=="review")
      $("#q"+(_currentQuestion+1)).removeClass("btn-default").removeClass("btn-success").removeClass("btn-danger").addClass("btn-primary");
  }else{
    $("#q"+(_currentQuestion+1)).removeClass("btn-default").removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
  }
  if(newCurrentQuestion<_questionno){
    _currentQuestion=newCurrentQuestion;
    loadQuestion(newCurrentQuestion);
  }

}


function loadQuestion(i){
  $("#qno").text(i+1);
  $("#que").html(_questions[i]["question"]);
  $("#a1").html(_questions[i]["a1"]);
  $("#a2").html(_questions[i]["a2"]);
  $("#a3").html(_questions[i]["a3"]);
  $("#a4").html(_questions[i]["a4"]);
  $('input[name="userAns"]').prop('checked', false);
  if(_answers[i]){
    $("#"+_answers[i]).prev().prop('checked',true);
  }
  $("#q"+(i+1)).css("color", "green").css("font-weight","bold").css("background-color","rgba(0,255,0,0.1)");

}

function countTimer(){
  __time-=1;
  if(__time<=0){
    clearInterval(_timer);
    result();
  }
  if(__time<180)
    $('#time').css("color", "red");  
  if(__time<_mintime)
    $("#btnSubmit").prop("disabled",false);
  $('#time').text( formatString(Math.floor(__time/60)) + ":" + formatString(__time%60) );
}

function result(){
  var _attended = 0;
  var _correct = 0;

  var resultCounted = $.each(_answers,function(i,ans){
    if(_answers[i]){
      _attended++;
      if(_answers[i]==_questions[i]["ans"]){
        _correct++;
      }
    }

  });

  $.when().done(function() {

    var resultData = '{\n"name": "'+_name+'",\n"dob":"'+ _dob +'",\n"course":"'+_course+'",\n"questionno":"'+_questionno+'",\n"attended":"'+_attended+'",\n"correct":"'+_correct+'"\n}';
    saveResult(resultData, _course.toUpperCase()+"_"+_name.toLowerCase()+"_"+_dob.getTime());
    endExam();
  });
}

function saveResult(text,filename){
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename+".json");
}


function endExam(){
  clearInterval(_timer);   
  $("#container-data").load('end.html',function(){
    loadOffer();
  });

  window.onbeforeunload = function(){}  
}


function loadOffer(){
  $("#offer").removeClass("offer");
    
    $("#offer").click(function(){
      if($("#offer").hasClass("offer"))
        $("#offer").removeClass("offer");
      else
        $("#offer").addClass("offer");
    }); 
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
