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
    $('#question-card').animate({'opacity': 0}, 'fast', function () {
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
      $('#question-card').animate({'opacity': 1}, 'fast');
    });
  });

};

function getResults(answers) {
  // Show spinner for loading answers
  $('#question-card').load('partials/loading-answers.html');
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

      $('#question-card').load('partials/result.html', function() {
        $('#result-image img') 
          .attr('src', response.image.src)
          .attr('srcset', srcsets.join(","))
          .attr('alt', response.image.alt)
          .attr('title', response.image.title)

        $('#startover-button').click( function () {
          console.log("Start over!");
          self.location.reload();
        });
        // set share links
        var share_url = "land.se/dialektoraklet";
        var share_message = "The way I talk means I'm from " + response.area + "!"
        var twitter_url = "https://twitter.com/intent/tweet?url=" + escape(share_url) + "&text=" + escape(share_message);
        var facebook_url = "https://www.facebook.com/dialog/feed?app_id=1630419710512054&amp;link=" + escape(share_url) + "&name=Dialektoraklet&description=" + escape(share_message) + "&redirect_uri=" + escape(share_url) + "&picture=" + escape(response.image.src);
        $('.twitter-share-button').attr('href', twitter_url);
        $('.fb-share-button').attr('href', facebook_url);
      });



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
    $('#question-card').load('partials/question.html', function() {
      // when loading is done, get the first question
      updateQuestion(questions[0]);

      // set up buttons
      $('#results-button').click( function () {
        console.log(questions);
        answerLog = {}
        $.each( questions, function(key, c) {
          // give either 0 or 1 answer randomly
          answerLog[c.id] = Math.round(Math.random()).toString();
        });
        getResults(answerLog);
      });
      $('#startover-button').click( function () {
        self.location.reload();
      });

      // set share links
      var share_url = "land.se/dialektoraklet";
      var share_message = "Hey, check out this quiz!"
      var twitter_url = "https://twitter.com/intent/tweet?url=" + escape(share_url) + "&text=" + escape(share_message);
      var facebook_url = "https://www.facebook.com/dialog/feed?app_id=1630419710512054&amp;link=" + escape(share_url) + "&name=Dialektoraklet&description=" + escape(share_message) + "&redirect_uri=" + escape(share_url);
      $('.twitter-share-button').attr('href', twitter_url);
      $('.fb-share-button').attr('href', facebook_url);


    });


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
