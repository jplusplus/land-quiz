/*global $ */
/*global document */
/*global marked */

var questions = [];
var answerLog = {};
var currentQuestionId;
var feedbackLatLon;


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
  // Called to refresh the UI with the next question.

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
      answerLog[parseInt(currentQuestionId)] = $answer.parent()[0].id.replace('answer-', '');
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
  // Called to get the results from the answers object.

  // Show spinner for loading answers
  $('#question-card').load('partials/loading-answers.html');
  var posting = $.ajax({
    type: 'POST',
    url: 'http://dialektapi.jplusplus.se/oracle/predict/',
    crossDomain: true,
    data: JSON.stringify(answerLog),
    dataType: 'json',
    error: function (response, status, error) {
      console.log('Could not load result!');
    },
    success: function(response, status, jqXHR) {
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

        // set up share links
        var share_url = "land.se/dialektoraklet";
        var share_message = "The way I talk means I'm from " + response.area + "!"
        var twitter_url = "https://twitter.com/intent/tweet?url=" + escape(share_url) + "&text=" + escape(share_message);
        var facebook_url = "https://www.facebook.com/dialog/feed?app_id=1630419710512054&amp;link=" + escape(share_url) + "&name=Dialektoraklet&description=" + escape(share_message) + "&redirect_uri=" + escape(share_url) + "&picture=" + escape(response.image.src);

        // Feedback selections
        $('#feedback-yes').click( function () {
          // Send answer to API
          var apiResponse = $.ajax({
            type: 'POST',
            url: 'http://dialektapi.jplusplus.se/oracle/confirm/2/',
            crossDomain: true,
            data: JSON.stringify(answerLog),
            dataType: 'json',
            error: function (response, status, error) {
              console.log('Could not send answer to API.');
            },
            success: function(response, status, jqXHR) {
              console.log('Feedback sent!');
            }
            });
          $('#button-container').load('partials/result-yes.html', function() {
            $('#startover-button').click( function () { self.location.reload(); });
            $('.twitter-share-button').attr('href', twitter_url);
            $('.fb-share-button').attr('href', facebook_url);
          });
        });

        $('#feedback-no').click( function () {
          // Remove header and image
          $('#result-image').empty();
          $('#question-explanation').remove();
          $('#button-container').load('partials/result-no.html', function() {
            loadFeedbackMap();
            $('#feedback-confirm-button').click( function () { 
              // confirm there is a selection
              if ($('#feedback-confirm-button').hasClass('disabled')) { return; }
              console.log(feedbackLatLon);
              // Send answer to API
              var apiResponse = $.ajax({
                type: 'POST',
                url: 'http://dialektapi.jplusplus.se/oracle/correct/' + feedbackLatLon[0] + '/' + feedbackLatLon[1] + '/',
                crossDomain: true,
                data: JSON.stringify(answerLog),
                dataType: 'json',
                error: function (response, status, error) {
                  console.log('Could not send answer to API.');
                },
                success: function(response, status, jqXHR) {
                  console.log('Feedback sent!');
                  console.log(response);
                }
              });
            $('#button-container').load('partials/result-no-thanks.html', function() {
              $('#startover-button').click( function () { self.location.reload(); });
              $('.twitter-share-button').attr('href', twitter_url);
              $('.fb-share-button').attr('href', facebook_url);
            });         


            });
          });
        });
      });
    }
  });
}

function drawCircle(svg, x, y, size) {
  // remove all circles
  svg.selectAll("circle").remove();
  svg.append("circle")
      .attr('class', 'click-circle')
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", size);
}

function loadFeedbackMap() {
  var width = 400,
      height = 500;
  var projection = d3.geo.transverseMercator()
        .rotate([-20 + 30 / 60, -38 - 50 / 60]);
  var path = d3.geo.path().projection(projection);
  $('#feedback-map').empty();
  var svg = d3.select("#feedback-map").append("svg")
      .attr("width", width)
      .attr("height", height);

  d3.json("data/map.topojson", function(error, world) {
    if (error) throw error;
    var units = topojson.feature(world, world.objects.regions);
    // center and zoom to path bounds
    projection
        .scale(1)
        .translate([0, 0]);
    var b = path.bounds(units),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
        .scale(s)
        .translate(t);
    // a bit of cropping
    projection.translate([
        projection.translate()[0],
        projection.translate()[1] + 270
    ]);
    projection.scale(projection.scale() * 1.4);

    svg.insert("path")
        .datum(units)
        .attr("class", "land")
        .attr("d", path);
    d3.selectAll("path").on("mousedown.log", function() {
      var coords = d3.mouse(this);
      drawCircle(svg, coords[0], coords[1], 8);
      feedbackLatLon = projection.invert(coords);
      // activate send button
      $('#feedback-confirm-button').removeClass('disabled');
    });
  });
  d3.select(self.frameElement).style("height", height + "px");
}


$(document).ready(function() {    
  var jsonPath = 'http://dialektapi.jplusplus.se/oracle/questions2/';
  $.getJSON( jsonPath, function( data ) {
    // Go through all questions and store them in the array
    $.each(data.questions, function(index, value) {
      questions.push(value);
    });
    $('#questions-total').text = questions.length;
    $('#questions-current').text = "1";
    // Load the HTML where the questions will be placed
    $('#question-card').load('partials/question.html', function() {
      // when loading is done, get the first question
      updateQuestion(questions[0]);

      // set up buttons
      $('#results-button').click( function () {
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
      var share_url = "http://land.se/dialektoraklet";
      var share_message = null; //FIXME
      var share_picture = null; //FIXME
      var twitter_url = "https://twitter.com/intent/tweet?url=" + escape(share_url) + "&text=" + escape(share_message);
      var facebook_url = "https://www.facebook.com/dialog/feed?app_id=1630419710512054&amp;link=" + escape(share_url) + "&name=Dialektoraklet&description=" + escape(share_message) + "&redirect_uri=" + escape(share_url) + "&amp;picture=" + escape(share_picture);
      $('.twitter-share-button').attr('href', twitter_url);
      $('.fb-share-button').attr('href', facebook_url).attr('target', '_blank');
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
