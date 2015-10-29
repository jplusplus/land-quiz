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
  $('#question-explanation').html('<h3>' + marked(q.explanation) + '</h3>');

  // create and populate answer list
  $('#answers').empty();
  $.each(q.answers, function(index, v) {
    var $li = $('<li></li>').attr('id', 'answer-' + index);
    $('<a>', {
      class: 'select secondary button medium',
    })
    .html(v)
      .appendTo($li);
    $li.appendTo('#answers');
  });

  // Set up the answer button callback
  $('#answers li a').click( function () {
    var $answer = $(this);
    $('.question-card').animate({'opacity': 0}, 'fast', function () {
      // Record the current answer 
      answerLog[currentQuestionId] = $answer.parent()[0].id.replace('answer-', '');
      console.log(answerLog);
      // Remove the last question from the questions array and present the next one
      questions.shift();
      var q = questions[0];
      if (typeof q != 'undefined') {
        // next question
        updateQuestion(q);
      } else {
        // quiz finished
        getResults(answerLog);
      }
      // Fade elements back in
      $('.question-card').animate({'opacity': 1}, 'fast');
    });
  });
};

function getResults(answers) {
  // Show spinner for loading answers
  $('.question-card').load('partials/loading-answers.html');
  var posting = $.ajax({
    type: 'POST',
    url: 'http://dialektapi.jplusplus.se/oracle/predict/',
    crossDomain: true,
    data: JSON.stringify(answerLog),
    dataType: 'json',
    error: function (response, status, error) {
      alert('POST failed.');
    },
    success: function(response, status, jqXHR) {
      console.log(response);
      var srcsets = [];
      var variants = ["1x", "2x", "2.5x", "3x"];
      variants.forEach( function(variant) {
          srcsets.push(response.image[variant] + " " + variant);
      });
      $('.question-card').empty().append(
          $('<img>') 
            .attr('src', response.image.src)
            .attr('srcset', srcsets.join(","))
            .attr('alt', response.image.alt)
            .attr('title', response.image.title)
      );
      $('.question-card img').wrap('<p/>');
    }
  });
}


$(document).ready(function() {    
  var jsonPath = 'http://dialektapi.jplusplus.se/oracle/questions/';
  $.getJSON( jsonPath, function( data ) {
    // Go through all questions and store them in the array
    $.each(data.questions, function( key, c ) {
      c.id = key;
      questions.push(c);
    });
    $('#questions-total').text = questions.length;
    $('#questions-current').text = "1";
    // Load the HTML where the questions will be placed
    $('.question-card').load('partials/question.html', function() {
      // when loading is done, get the first question
      // Fade out elements
        updateQuestion(questions[0]);
    });
  });


  $('#results-button').click( function () {
    $.each( questions, function(key, c) {
      // give either 0 or 1 answer randomly
      answerLog[c.id] = Math.round(Math.random()).toString();
    });
    getResults(answerLog);
    
  });
});


// init Foundation
// $(document).foundation();

// Fallback SVG / PNG
  if(!Modernizr.svg) {
    $('img[src*="svg"]').attr('src', function () {
        return $(this).attr('src').replace('.svg', '.png');
    });
  }
