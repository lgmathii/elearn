var currSlide = 1;
var currASlide = 0;
var currModule = 1;
var completedModule = 1;
var moduleNames = [];
var courseName = '';
var noOfSlides = [];
var maxSlide = 0;
var fontSize = 14;
var isAssessment = false;
var nilAssessment;
var assessmentArray = [1, 2, 3, 4, 5, 6, 7, 8];
var xmlDoc;

var userAnswers = [];
var lmsScoreString = '';
var quizWeight = 0;
var totalScore = 0;

$( document ).ready(function() {

    callResourceJson();
    callGlossaryJson();
    initiateFontSizeController();

    $("#single_1").fancybox({
        helpers: {
            title : {
                type : 'float'
            }
        }
    });

    $( "body" ).keyup(function( event ) {
      if (event.which == 39) goNext();
      if (event.which == 37) goBack();
    });

    $('#next-btn').mouseup(function() { goNext() });
    $('#prev-btn').mouseup(function() { goBack() });
    $(".xmlcontent").swiperight(function() { goNext() });
    $(".xmlcontent").swipeleft(function() { goBack() });

//      **********           MODAL CONTROLS        ************       //

    $("#myModalMenu .modal-body ul > li").click(function() {
      currModule = Number($(this).index())+1;
    });

    $('#myModalBookMark button').click(function() {
      completedModule = learnerlocation.split('_')[2];
      enableCompletedModules();
      if (Number($(this).attr("value")) == 1) {
        changeModule(learnerlocation.split('_')[0], learnerlocation.split('_')[1]);
      } else {
        changeModule(1, 1);
      }
      $('#myModalBookMark').modal('hide');
    });

    $(".help-exit ul > li").click(function() {
      if (Number($(this).index()) == 1) {        
        closeWindow();
      } else {
        //$('#myModalHelp').modal('show');
      }
    });
});

function closeWindow() {
  updateSessionTime();
  scorm.quit();
  var win = window.open("","_self");
  win.close();
  window.close();
}

function goNext() {
  
  if (isAssessment || $('.modal').hasClass('in')) return;

  if (currSlide == maxSlide ) {
    if (userAnswers[currModule] == undefined && !nilAssessment) {
      $('#myModalAssInst .modal-header h4').html("ASSESSMENT INSTRUCTION");
      $('#myModalAssInst .modal-body p').html("1. Each module assessment has 5 questions. And the Assessments can be taken twice. <ul><li>The scores pertaining to the assessments are important and is part of the overall Pass Criteria.</li></ul>2. Module Assessment has to be taken without any interruptions <ul><li>Planning to wind-up the learning for the day or take a break, kindly complete the assessments and quit the modules or close the module before taking the Assessments.</li><li>Closing the window during the Assessments, would pass a null score. And will show as '0' for the particular module.</li></ul>");
      $('#myModalAssInst').modal('show');
      $('.cancelbtn').css('opacity', '1');
      $('.cancelbtn').prop('disabled', false);
      return;
    } else {
      if (noOfSlides.length-1 != completedModule) {        
        if (currModule == completedModule) {
          completedModule++;
          enableCompletedModules();
        }
        currModule++;
      } else if (currModule < completedModule) {
        currModule++;
      } else if (noOfSlides.length-1 == completedModule) { 
          $('#myModalAssInst .cancelbtn').text('Repeat Course');
          $('#myModalAssInst .okbtn').text('Exit');
          $('#myModalAssInst .assmntRetake').text('Assessment Retake');
          $('#myModalAssInst .modal-body p').html("You have completed the course. If you wish to repeat the course, click <b> Repeat Course </b> else click <b>Exit</b> to quit the course.");          

          if (assessmentCount == 1) {
            $('#myModalAssInst .modal-body p').html("You have completed the course!!!</br>If you wish to repeat the course, click <b>Repeat Course</b></br>If you wish to retake the Assessment, click <b>Assessment Retake</b></br>To quit the course click <b>Exit</b></br>");
            $('#myModalAssInst .assmntRetake').removeClass('hide');
          } 
          
          $('#myModalAssInst').modal('show');
          if (nilAssessment) courseComplete();
          return;
      }
      changeModule(currModule, 1);
      return;
    }
  }
  currSlide++;
  showHtmlContent();
}

function goBack() {  

  if (currSlide == 1 || isAssessment || $('.modal').hasClass('in')) return;

  currSlide--;
  showHtmlContent(); 
}

function initiateFontSizeController() {
  $('#incfont').click(function(){
    if (fontSize >= 19) return;
    fontSize += 5;       
    applyCSS();
  }); 

  $('#decfont').click(function(){ 
    if (fontSize <= 9) return;  
    fontSize -= 5;
    applyCSS();
  });
}

function applyCSS() {
  $('body, .btn').css('font-size', fontSize);
  $('h2').css('font-size', fontSize+6);
  $('h3, h4').css('font-size', fontSize+2);
  $('body').css('line-height', fontSize+8+'px');

  $('.xmlcontent').children().each(function () {
      $(this).html(function (i, html) {
        var junkie = $(".xmlcontent").html().replace(/,/g,", ");
        $(".xmlcontent").html(junkie);
        junkie = $(".xmlcontent").html().replace(/=/g," = ");
        $(".xmlcontent").html(junkie);
        junkie = $(".xmlcontent").html().replace(/è/g,"e");
        $(".xmlcontent").html(junkie);
        junkie = $(".xmlcontent").html().replace(/�/g,"'");
        $(".xmlcontent").html(junkie);
      });
  });
}

function showHtmlContent() {

    $('.xmlcontent').css('display', 'none');
    $('#loading-indicator').css('display', 'block');
    $('#prev-btn, #next-btn').css('display','block');
    if (currSlide == 1) $('#prev-btn').css('display','none');

    $( ".xmlcontent" ).load( "Modules/Module_"+currModule+"/Page-"+currSlide+".html", function (response, status) {
        if (status == "success") {
          $('.xmlcontent').fadeIn(600);
          $('#loading-indicator').css('display', 'none');
          applyCSS();
        };
    });

	$('.page-number').html("<h4>Page "+addZero(currSlide)+" of "+addZero(maxSlide)+"</h4>");
    if (isComplete || completedModule == noOfSlides.length - 1 && currSlide == maxSlide) {
      isComplete = true;
      set("cmi.location", String(currModule + "_" + currSlide + "_" + completedModule + "_COMPLETED" + "_" +assessmentCount));
    } else {
      set("cmi.location", String(currModule + "_" + currSlide + "_" + completedModule + "_INCOMPLETE" + "_" +assessmentCount));
    }
}

function enableCompletedModules() {
  for (var i = 1; i <= completedModule; i++) {
    $('#myModalMenu .modal-body ul li:nth-child('+i+') a').removeClass( "disabled" );
    $('#myModalMenu .modal-body ul li:nth-child('+i+')').click(function() {  
      changeModule(Number($(this).index())+1, 1);
      $('#myModalMenu').modal('hide');
    });
  };  
  $('.top-number').html("<h4>"+courseName+" &emsp;&#8594;&emsp;"+moduleNames[currModule-1]+"</h4>");
}

function changeModule(mod, cnt) {
  isAssessment = false;
  currASlide = 0;
  $("#prev-btn").css('display', 'block');
  currModule = mod;
  maxSlide = noOfSlides[currModule];
  currSlide = cnt;
  $('.top-number').html("<h4>"+courseName+" &emsp;&#8594;&emsp;"+moduleNames[currModule-1]+"</h4>");
  showHtmlContent();
}

function addZero(num) {
	if (num < 10) {
		return "0"+num;	
	} else {
		return num;
	}
}

//     **********         JSON HANDLER        ************     //


function callResourceJson() {
  $.ajax({
    url: 'ajax/resources.json',
    beforeSend: function(xhr){
      if (xhr.overrideMimeType)
      {
        xhr.overrideMimeType("application/json");
      }
    },
    dataType: 'json',
    data: data,
    success: callbackResourse
  });
}

function callbackResourse(data) {
  $.each( data.content.resources, function( key, val ) {
    $('#myModalRes .modal-body ul').append('<li>'+val.link+'</li>');
  });

  $.each( data.content.coursemenu, function( key, val ) {    
      $('#myModalMenu .modal-body ul').append('<li><a class="btn btn-default disabled" href="#">'+val.moduleTitle+'</a></li>');
      moduleNames.push(val.moduleTitle);
  });

  noOfSlides = String(data.content.courseinfo[0].moduleCounts).split(',');
  courseName = data.content.courseinfo[1].courseTitle;
  nilAssessment = data.content.courseinfo[2].noAssessment;
  noOfSlides.unshift('');

  maxSlide = noOfSlides[currModule];
  quizWeight = (100/((noOfSlides.length-1)*5));

  enableCompletedModules();

  init();
}

function callGlossaryJson() {
  $.ajax({
    url: 'ajax/glossary.json',
    beforeSend: function(xhr){
      if (xhr.overrideMimeType)
      {
        xhr.overrideMimeType("application/json");
      }
    },
    dataType: 'json',
    data: data,
    success: callbackGlossary
  });
}

function callbackGlossary(data) {
  $.each( data.content.glossary, function( key, val ) {
    $('#myModalGlos .modal-body').append('<div class="row"><div class="col-xs-12 col-sm-4"><h3>'+val.title+'</h3></div>'+'<div class="col-xs-12 col-sm-8"><h4>'+val.description+'</h4></div></div>');
  });
}

function data() { }


//        **********       SCORM VERSION 2004      ************          //


function initCourse() {

    if (learnerlocation != 'null' && learnerlocation != '') {
      $('#myModalBookMark').modal('show');
    } else {
      completedModule = 1;
      changeModule(1, 1);
    }
}


//      *********************         PROTOCOLS        ********************     //


Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

Array.prototype.shuffle = function() {
    var input = this;
     
    for (var i = input.length-1; i >=0; i--) {
     
        var randomIndex = Math.floor(Math.random()*(i+1)); 
        var itemAtIndex = input[randomIndex]; 
         
        input[randomIndex] = input[i]; 
        input[i] = itemAtIndex;
    }
    return input;
}
