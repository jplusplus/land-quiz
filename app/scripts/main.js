/*global $ */
/*global document */
/*global marked */

$(document).ready(function() {    
  var jsonPath = '/data/questions.json';
  $.getJSON( jsonPath, function( data ) {
    console.log(data.length);
    // go through all questions
    $.each( data, function( key, c ) {
      var title = $('<h2>').text(c.question);
      var explanation = $(marked(c.explanation));
      // create and populate answer list
      var answers = $('<ul class="answers">');
      $.each(c.answers, function(index, v) {
        $('<li class="answer">').text(v).wrapInner('button')
          .appendTo(answers);
      });
      // create and fill each question div
      $('<div>').attr('id', 'question-' + c.id)
        .addClass('hero-unit').addClass('question')
        .append(title, explanation, answers).appendTo('#questions');
    });
  });
});

// init Foundation
// $(document).foundation();
