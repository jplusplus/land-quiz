function updateQuestion(e){currentQuestionId=parseInt(e.id),$("#question-current").text(Object.keys(answerLog).length+1),$("#question-title").text(e.question),$("#question-explanation").html(marked(e.explanation)),$("#answers").empty(),$.each(e.answers,function(e,t){var n=$("<li></li>").attr("id","answer-"+e);$("<a>",{"class":"select left-icon button split medium secondary no-pip"}).html("<span></span> "+t).appendTo(n),n.appendTo("#answers")}),$("#answers li").click(function(){$("#answers li").removeClass("selected"),$(this).toggleClass("selected")})}var questions=[],answerLog={},currentQuestionId;$(document).ready(function(){var e="data/questions.json";$.getJSON(e,function(e){$.each(e,function(e,t){questions.push(t)}),$("#questions-total").text=questions.length,$("#questions-current").text="1",updateQuestion(questions[0])}),$("#next-button").click(function(){if(0!=$("#answers li.selected").length){answerLog[currentQuestionId]=$("#answers li.selected")[0].id.replace("answer-",""),console.log(answerLog),questions.shift();var e=questions[0];if("undefined"!=typeof e)updateQuestion(e);else{var t=$.post("http://dialektapi.jplusplus.se/oracle/predict/",answerLog);t.done(function(e){console.log("Data Loaded: "),console.log(e)})}}})});