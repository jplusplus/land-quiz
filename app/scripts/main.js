/*global $ */
/*global document */
/*global marked */

var questions = [];
var answerLog = {};
var currentQuestionId;


// Disable Markdown paragraphs
// https://stackoverflow.com/questions/27663203/markdown-in-js-without-enclosing-p/29559116#comment47272088_29559116
var inlineRenderer = new marked.Renderer();
inlineRenderer.paragraph = function(text) {
    return text + '\n';
};
marked.setOptions({
  renderer: inlineRenderer,
});


function updateQuestion (q) {
  currentQuestionId = parseInt(q.id);
  // Update answer counter
  $('#question-current').text(Object.keys(answerLog).length + 1);
  // Fill the elements with the new content
  //$('#question-title').text(q.question);
  $('#question-explanation').html('<h3>' + marked(q.explanation) + '</h3>');

  // create and populate answer list
  $('#answers').empty();
  $.each(q.answers, function(index, v) {
    var $li = $('<li></li>').attr('id', 'answer-' + index);
    $('<a>', {
      class: 'select left-icon button split medium no-pip',
    })
    .html('<span></span> ' + v)
    .appendTo($li);
    $li.appendTo('#answers');
  });
  // set up answer click callbacks
  $('#answers li').click( function () {
    $('#answers li').removeClass('selected');
    $(this).toggleClass('selected');
  });

}


$(document).ready(function() {    
  var jsonPath = 'data/questions.json';
  $.getJSON( jsonPath, function( data ) {
    // Go through all questions and store them in the array
    $.each(data, function( key, c ) {
      questions.push(c);
    });
    $('#questions-total').text = questions.length;
    $('#questions-current').text = "1";
    updateQuestion(questions[0]);
  });
  $('#next-button').click( function () {
    if ($('#answers li.selected').length == 0) {
      // Make sure we have a selected answer before going on
      return
    }
    // Record the current answer 
    answerLog[currentQuestionId] = $('#answers li.selected')[0].id.replace('answer-', '');
    console.log(answerLog);
    // Remove the last question from the questions array and present the next one
    questions.shift();
    var q = questions[0];
    if (typeof q != 'undefined') {
      // next question
      updateQuestion(q);
    } else {
      // quiz finished
      var posting = $.post("http://dialektapi.jplusplus.se/oracle/predict/", answerLog);
      posting.done(function(data) {
          console.log("Data Loaded: ");
          console.log(data);
      });
    }
  });
});


// init Foundation
// $(document).foundation();
