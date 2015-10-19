/*global $ */
/*global document */
/*global marked */

/*
$(document).ready(function() {    
  var jsonPath = '/data/questions.json';
  $.getJSON( jsonPath, function( data ) {
    console.log(data);
    console.log(Object.keys(data).length);
    // go through all questions
    $.each( data, function( key, c ) {

      // create and fill the question div
      var title = $('<h3>').text(c.question);
      var explanation = $(marked(c.explanation));

      var questionContainer = 
        //$('<div>').attr('id', 'question-' + c.id)
        $('<div>')
        .attr('id', 'question')
        .addClass('row')
        .append(title, explanation).appendTo('#questions');

      // create and populate answer list

      var answers = $('<ul>');
      $.each(c.answers, function(index, v) {
        $('<a>')
          .text(v)
          .attr('class', 'select left-icon button split medium secondary no-pip')
          .wrapInner('li')
          .appendTo(answers);
      });
      var innerAnswerDiv = $('<div class="small 12-columns">')
        .append(answers);
      var answerContainer = $('<div id="answers" class="row">')
        .append(innerAnswerDiv)
        .appendTo('#questions');

    });
  });
});
*/

// init Foundation
// $(document).foundation();
