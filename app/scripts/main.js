/*global $ */
/*global document */
/*global marked */

var questions = [];
var answerLog = {};
var currentQuestionId;

function updateQuestion (q) {
  currentQuestionId = q.id;
  // Update answer counter
  $('#question-current').text(Object.keys(answerLog).length + 1);
  // Fill the elements with the new content
  $('#question-title').text(q.title);
  $('#question-explanation').html(marked(q.explanation));

  // create and populate answer list
  $('#answers').empty();
  $.each(q.answers, function(index, v) {
    $('<a>', {
      id: 'answer-' + index,
      class: 'select left-icon button split medium secondary no-pip',
    })
    .html('<span></span> ' + v)
    .wrapInner('<li>')
    .appendTo('#answers');
  });
}

$(document).ready(function() {    
  var jsonPath = '/data/questions.json';
  $.getJSON( jsonPath, function( data ) {
    // go through all questions and store them in the array
    $.each( data, function( key, c ) {
      var q = {};
      q.id = c.id;
      q.title = c.question;
      q.explanation = c.explanation;
      q.answers = c.answers;
      questions.push(q);
    });
    $('#questions-total').text = questions.length;
    $('#questions-current').text = "1";
    updateQuestion(questions[0]);
  });
});

$('#next-button').click( function () {
  // TODO: Make sure we have a selected answer before going on
  // Record the current answer 
  answerLog[currentQuestionId] = "0";
  console.log(answerLog);

  // Remove last question from the questions array and present the next one
  questions.shift();
  var q = questions[0];
  if (typeof q != 'undefined') {
    updateQuestion(q);
  } else {
    console.log("Game over!");
  }

});

// init Foundation
// $(document).foundation();
