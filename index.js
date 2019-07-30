'use strict'
const Alexa = require('alexa-sdk')
var stringSimilarity = require('string-similarity')

// =========================================================================================================================================
// TODO: The items below this comment need your attention
// =========================================================================================================================================

// Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
// Make sure to enclose your value in quotes, like this:  const APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
const APP_ID = "amzn1.ask.skill.6c81c2f7-1f02-4109-a08d-54269ef1a99f"

// This function returns a descriptive sentence about your data.
function getSpeechDescription (item) {
  let sentence = item.Explanation
  return sentence
}

/*@Author: ameza*/
// This function returns a story fragment. The counter is the index value of question from the set of 10, to be asked.
function getFragment (counter, item) { //TO REFACTOR: No need counter here
  return item.Fragment + ' '
}

//This function returns the second question. The counter is the index value of question from the set of 10, to be asked.
function getSecondQuestion (item) {
  return item.SecondQuestion
}

// This function returns the one question. The counter is the index value of question from the set of 10, to be asked.
function getQuestion (counter, item) {
	//TO REFACTOR: we are not using counter to choose the message, buy we might
    //AUDIO FIX: ADD PAUSE BEFORE QUESTION AND BETWEEN OPTIONS
	let response = getSpeechQuestionIntro(counter) + ' '+ item.Question + ' ' + item.Options 
    return response
}

// This is the function that returns an answer to your user during the quiz. 
function getAnswer (item) {
  return ' The answer is ' + item.Answer + '. ' + item.Explanation + '. '
}

// This is a list of positive speechcons that this skill will use when a user gets a correct answer.  For a full list of supported
// speechcons, go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
const speechConsCorrect = ['All righty', 'Bingo', 'Cheers', 'Hurray', 'Righto', 'Well done', 'Yay']

// This is a list of negative speechcons that this skill will use when a user gets an incorrect answer.  For a full list of supported
// speechcons, go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
const speechConsWrong = ['Argh', 'Aw man', 'Eek', 'Oh boy', 'Oh dear', 'Oof', 'Ouch', 'Uh oh', 'Yikes']

//Questions intro
const speechConsQuestionIntro = ['Here a question for you', 'Now a question for you']

const SpeechToContinueStory = ['May I continue with the story?', 'Shall I continue the story?', 'Can we continue with the story?', 'Would you like to continue with the story?']

// This is the welcome message for when a user starts the skill without a specific intent.
const WELCOME_MESSAGE = 'Welcome to Nana Stories! Are you ready to hear a story and answer some questions?'

// This is the message a user will hear when they start a quiz.
const START_QUIZ_MESSAGE = " <p> I will tell you the story of the ugly duckling, pay attention and be prepared to answer questions about it. For instance, if I ask you what is the color of a car, you can say: <say-as interpret-as='interjection'> red </say-as><break strength='strong'/>. </p>"
							
// This is the message a user will hear when they try to cancel or stop the skill, or when they finish a quiz.
const EXIT_SKILL_MESSAGE = "Thank you for playing Nana Stories!  Let's play again soon!"

// This is the message a user will hear after they ask (and hear) about a specific data element.
const REPROMPT_SPEECH = 'Test your knowledge by asking me to Start a Quiz about a story.'

// This is the message a user will hear when they ask Alexa for help in your skill.
const HELP_MESSAGE = 'You can test your knowledge by asking me to Start a Quiz about a story.'
	//Sometimes I do not understand some words very well, so I may ask you to repeat your answer or use the buttons to do it. Are you ready?

// This is the response a user will receive when they ask about something we weren't expecting.  For example, say "pizza" to your
// skill when it starts.  This is the response you will receive.
function getBadAnswer (item) {
  return "I'm sorry. " + item + ' is not something I know very much about in this skill. ' + HELP_MESSAGE
}

// This is the message a user will receive after each question of a quiz.  It reminds them of their current score.
function getCurrentScore (score, counter) {
  return ' Your current score is ' + score + ' out of ' + counter + '. '
}

// This is the message a user will receive after they complete a quiz.  It tells them their final score.
function getFinalScore (score, counter) {
  return ' Your final score is ' + score + ' out of ' + counter + '. '
}

// =========================================================================================================================================
// Editing anything below this line might break your skill.
// =========================================================================================================================================

const states = {
  START: '_START',
  QUIZ: '_QUIZ',
  QUIZTIER2: '_QUIZTIER2'
}

const handlers = {
  'LaunchRequest': function () {
	console.log('handlers :'+'LaunchRequest') //TEST
    this.handler.state = states.START
    this.emitWithState('Start')  //This goes to startHandlers.Start
  },
  'QuizIntent': function () {
	console.log('handlers :'+'QuizIntent') //TEST
    this.handler.state = states.QUIZ
    this.emitWithState('Quiz')    
  },
  'AMAZON.YesIntent': function () {
    this.handler.state = states.START
    this.emitWithState('AskQuestion')
  },
  'AMAZON.NoIntent': function () {          //DO NOT CHANGE THE STATE
    this.response.speak(EXIT_SKILL_MESSAGE)
    this.emit(':responseReady')
  },
  'AnswerIntent': function () {
    this.handler.state = states.START
    this.emitWithState('AnswerIntent')
  },
  'AskQuestion': function () {
    this.handler.state = states.START
    this.emitWithState('AskQuestion')
  },
  'AMAZON.HelpIntent': function () {        //DO NOT CHANGE THE STATE
    this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE)
    this.emit(':responseReady')
  },
  'Unhandled': function () {             
    this.handler.state = states.START
    this.emitWithState('Start')
  }
}

const startHandlers = Alexa.CreateStateHandler(states.START, {
  'Start': function () {
    this.response.speak(WELCOME_MESSAGE).listen(HELP_MESSAGE)
    this.emit(':responseReady')
  },
  'AnswerIntent': function () {
    var data = this.attributes['data']
    let item = getItem(this.event.request.intent.slots)

    if (item && item[Object.getOwnPropertyNames(data[0])[0]] !== undefined) {
      this.response.speak(getSpeechDescription(item)).listen(REPROMPT_SPEECH)
    } else {
      this.response.speak(getBadAnswer(item)).listen(getBadAnswer(item))
    }

    this.emit(':responseReady')
  },
  'QuizIntent': function () {
    this.handler.state = states.QUIZ
    this.emitWithState('Quiz')
  },
  'AskQuestion': function () {
    this.handler.state = states.QUIZ
    this.emitWithState('AskQuestion')
  },
  'AMAZON.YesIntent': function () {
    this.handler.state = states.QUIZ
    this.emitWithState('Quiz')
  },
  'AMAZON.NoIntent': function () {
    this.response.speak(EXIT_SKILL_MESSAGE)
    this.emit(':responseReady')
  },
  'AMAZON.PauseIntent': function () {
    this.response.speak(EXIT_SKILL_MESSAGE)
    this.emit(':responseReady')
  },
  'AMAZON.StopIntent': function () {
    this.response.speak(EXIT_SKILL_MESSAGE)
    this.emit(':responseReady')
  },
  "AMAZON.CancelIntent": function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'AMAZON.HelpIntent': function () {
    this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE)
    this.emit(':responseReady')
  },
  'Unhandled': function () {
    this.emitWithState('Start')
  }
})

const quizHandlers = Alexa.CreateStateHandler(states.QUIZ, {
  'Quiz': function () {
	  
    var data = require('./' + 'ud' + '.json')
    
    this.attributes['data'] = data
    this.attributes['response'] = ''
    this.attributes['counter'] = 0 //keeps track of the question number
    this.attributes['quizscore'] = 0
    this.emitWithState('AskQuestion')
  },
  'AskQuestion': function () {
    try {
      var data = this.attributes['data'] 
      let item = data[this.attributes['counter']] //item gets the question

      this.attributes['answered'] = false
      this.attributes['quizitem'] = item
      this.attributes['counter']++
      
      let question =  getFragment(this.attributes['counter'], item) + ' ' +getQuestion(this.attributes['counter'], item) 
      
      //Only for first question
      if (this.attributes['counter'] === 1) {
        question = START_QUIZ_MESSAGE + " <p>  Here we go! </p>" + question
      }    	  
      if (this.attributes['counter'] <= 6) { 
        this.emit(':ask', question, question)
      } else {
        response += getFinalScore(this.attributes['quizscore'], this.attributes['counter'])
        speechOutput = response + ' ' + EXIT_SKILL_MESSAGE

        this.response.speak(speechOutput)
        this.emit(':responseReady')
      }
    } catch (ex) {
       this.emit(':tell', EXIT_SKILL_MESSAGE)
    }
  },
  'AnswerIntent': function () {      //When the user says the answer it will be caught by the 'AnswerIntent' in the 'quizHandlers'
    let response = ''
    let speechOutput = ''
    let item = this.attributes['quizitem']
    
    try {
      let correct = compareSlotsTier1(this.event.request.intent.slots, item)  //comparison of user answer with correct answer
     
      if (correct) { //Tier 1
     	//this.emit(':ask',this.event.request.intent.slots.Answer.value.toString().toLowerCase() +' '+ item.Answer.toLowerCase()) //Test 	
        response = getSpeechCon(true)
        
        //this.emit(':ask', this.attributes['counter'].toString() ) //Test
        
        if (/*this.attributes['quizscore'] < this.attributes['counter'] && */ this.attributes['answered'] === false) {
          this.attributes['quizscore']++
          this.attributes['answered'] = true
        
          response += getAnswer(item) //Find the answer
         
          if (this.attributes['counter'] < 6) { //CHECK
              //response += getCurrentScore(this.attributes['quizscore'], this.attributes['counter']) //TO CHECK: do we need the scaor after each question?
              this.attributes['response'] = response
              this.emit(':ask', response + ' ' + getSpeechToContinueStory(0)) 
              
            } else {
              response += getFinalScore(this.attributes['quizscore'], this.attributes['counter'])
              speechOutput = response + ' ' + EXIT_SKILL_MESSAGE

              this.response.speak(speechOutput)
              this.emit(':responseReady')
            }
        }
      } else { 
    	    this.handler.state = states.QUIZTIER2
    	    this.emitWithState('AskSecondQuestion')
      }
    } catch(ex) {
      this.emit(':ask', 'Please say your answer as a sentance. For example say it like this: the answer is red')
    }
  },
  'AMAZON.RepeatIntent': function () {
    let question = getQuestion(this.attributes['counter'], this.attributes['quizproperty'], this.attributes['quizitem'])
    this.response.speak(question).listen(question)
    this.emit(':responseReady')  //-->goes to AMAZON.YesIntent
  },
  'AMAZON.StartOverIntent': function () {
    this.emitWithState('Quiz')
  },
  'AMAZON.YesIntent': function () {
    this.emitWithState('AskQuestion') //Only for Tier 1 questions
  },
  'AMAZON.NoIntent': function () {
    this.response.speak(EXIT_SKILL_MESSAGE)
    this.emit(':responseReady')
  },
  'AMAZON.StopIntent': function () {
    this.response.speak(EXIT_SKILL_MESSAGE)
    this.emit(':responseReady')
  },
  'AMAZON.PauseIntent': function () {
    this.response.speak(EXIT_SKILL_MESSAGE)
    this.emit(':responseReady')
  },
  "AMAZON.CancelIntent": function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'AMAZON.HelpIntent': function () {
    this.response.speak(HELP_MESSAGE).listen(HELP_MESSAGE)
    this.emit(':responseReady')
  },
  'Unhandled': function () {
    this.emitWithState('AnswerIntent')
  }
})

const quizHandlersTier2 = Alexa.CreateStateHandler(states.QUIZTIER2, { //item = 0 , counter =1
	  'AMAZON.NoIntent': function () {
		    let response = ''
			    let speechOutput = ''
			    let item = this.attributes['quizitem']
			    
			   // this.emit(':tell', 'current item is:' + item.BinaryAnswer  + 'current slot content is:'+ this.event.request.intent.slots.Answer.value.toString()) //TEST: both correct
			    
			    try {		 	    	
			   	//this.emit(':ask', 'It does catches No')//Test
			    	
			    var correct = stringSimilarity.compareTwoStrings(/*this.event.request.intent.slots.Answer.value.toLowerCase()*/ 'no', item.BinaryAnswer.toLowerCase())

			      if (correct) {
			        response = getSpeechCon(true)
			        if (this.attributes['quizscore'] < this.attributes['counter'] && this.attributes['answered'] === false) {
			          this.attributes['quizscore']++
			        }
			      } else {     		    	  
			        response = getSpeechCon(false)		        
			      }
			      
			      this.attributes['answered'] = true
			      response += getAnswer(item) //Find the answer

			      if (this.attributes['counter'] < 6) {
			        //response += getCurrentScore(this.attributes['quizscore'], this.attributes['counter']) //no need to say the score after every question

			        this.attributes['response'] = response
			        this.handler.state = states.QUIZ

			        this.emit(':ask', response + ' ' + getSpeechToContinueStory(0))		    
			        
			      } else {
			        response += getFinalScore(this.attributes['quizscore'], this.attributes['counter'])
			        speechOutput = response + ' ' + EXIT_SKILL_MESSAGE

			        this.response.speak(speechOutput)
			        this.emit(':responseReady')
			      }
			    } catch(ex) {
			      this.emit(':ask', 'Please answer Yes, or No')
			    }
	    },
	  'AMAZON.YesIntent': function () {
		    let response = ''
			    let speechOutput = ''
			    let item = this.attributes['quizitem']
			    
			   // this.emit(':tell', 'current item is:' + item.BinaryAnswer  + 'current slot content is:'+ this.event.request.intent.slots.Answer.value.toString()) //TEST: both correct
			    
			    try {		 	    	
			   	//this.emit(':ask', 'It does catches Yes')//Test
			    	
			    var correct = stringSimilarity.compareTwoStrings(/*this.event.request.intent.slots.Answer.value.toLowerCase()*/ 'yes', item.BinaryAnswer.toLowerCase())

			      if (correct) {
			        response = getSpeechCon(true)
			        if (this.attributes['quizscore'] < this.attributes['counter'] && this.attributes['answered'] === false) {
			          this.attributes['quizscore']++
			        }
			      } else {     		    	  
			        response = getSpeechCon(false)		        
			      }
			      
			      this.attributes['answered'] = true
			      response += getAnswer(item) //Find the answer

			      if (this.attributes['counter'] < 6) {
			        //response += getCurrentScore(this.attributes['quizscore'], this.attributes['counter']) //no need to say the score after every question

			        this.attributes['response'] = response
			        this.handler.state = states.QUIZ

			        this.emit(':ask', response + ' ' + getSpeechToContinueStory(0))		    
			        
			      } else {
			        response += getFinalScore(this.attributes['quizscore'], this.attributes['counter'])
			        speechOutput = response + ' ' + EXIT_SKILL_MESSAGE

			        this.response.speak(speechOutput)
			        this.emit(':responseReady')
			      }
			    } catch(ex) {
			      this.emit(':ask', 'Please answer Yes, or No')
			    }
	   },
	   'Unhandled': function () {
		    //this.emitWithState('AnswerIntent')  //OLD
		   this.emitWithState('AskSecondQuestion') //If user says something different from Yes/No the question  is repeated
	   },
	  /*'AnswerIntent': function () {    
		   //this.emit(':ask', 'Caught by AnswerIntent') //Test
		  
		    let response = ''
		    let speechOutput = ''
		    let item = this.attributes['quizitem']
		    
		   // this.emit(':tell', 'current item is:' + item.BinaryAnswer  + 'current slot content is:'+ this.event.request.intent.slots.Answer.value.toString()) //TEST: both correct
		    
		    try {		 	    	
		    //let correct = compareSlotsTier2(this.event.request.intent.slots, item)	//Never worked
		    
		    	//TO DO: Clean answer to extract 'Yes/No' and  only send that  to the comparison.
		    var correct = stringSimilarity.compareTwoStrings(this.event.request.intent.slots.Answer.value.toLowerCase(), item.BinaryAnswer.toLowerCase())

		      if (correct) {
		        response = getSpeechCon(true)
		        if (this.attributes['quizscore'] < this.attributes['counter'] && this.attributes['answered'] === false) {
		          this.attributes['quizscore']++
		        }
		      } else {     		    	  
		        response = getSpeechCon(false)		        
		      }
		      
		      this.attributes['answered'] = true
		      response += getAnswer(item) //Find the answer

		      if (this.attributes['counter'] < 6) {
		        //response += getCurrentScore(this.attributes['quizscore'], this.attributes['counter']) //no need to say the score after every question

		        this.attributes['response'] = response
		        this.handler.state = states.QUIZ

		        this.emit(':ask', response + ' ' + getSpeechToContinueStory(0))		    
		        
		      } else {
		        response += getFinalScore(this.attributes['quizscore'], this.attributes['counter'])
		        speechOutput = response + ' ' + EXIT_SKILL_MESSAGE

		        this.response.speak(speechOutput)
		        this.emit(':responseReady')
		      }
		    } catch(ex) {
		      this.emit(':ask', 'Please say your answer as a sentence. For instance, say: I select yes')
		    }
		  },*/
	  'AskSecondQuestion': function () {
		    try {		    	  		    	  
		    	  let item = this.attributes['quizitem']
		            	    
		      let question =  getSecondQuestion(item)
		      
		      if (this.attributes['counter'] <= 6) { 
		        this.emit(':ask', question, question)
		      } else {
		        response += getFinalScore(this.attributes['quizscore'], this.attributes['counter'])
		        speechOutput = response + ' ' + EXIT_SKILL_MESSAGE

		        this.response.speak(speechOutput)
		        this.emit(':responseReady')
		      }
		    } catch (ex) {
		       this.emit(':tell', EXIT_SKILL_MESSAGE)
		    }
		  },	
	   'AMAZON.StopIntent': function () {
		    this.response.speak(EXIT_SKILL_MESSAGE)
		    this.emit(':responseReady')
		  },
	   'AMAZON.PauseIntent': function () {
		    this.response.speak(EXIT_SKILL_MESSAGE)
		    this.emit(':responseReady')
		  },
	   "AMAZON.CancelIntent": function() {
		    this.response.speak(EXIT_SKILL_MESSAGE);
		    this.emit(":responseReady");
		  }
})

function compareSlotsTier1 (slots, item) {
  var value = item.Answer
  var option = item.AnswerOption
  var optionAnswer = 'option' + ' ' + item.AnswerOption

  var requestSlotvalue = slots.Answer.value

  var similarity1 = stringSimilarity.compareTwoStrings(requestSlotvalue.toString().toLowerCase(), value.toString().toLowerCase())

  if (requestSlotvalue.toString().toLowerCase() === option.toString().toLowerCase()) {
    var similarity2 = true
  }
  if (requestSlotvalue.toString().toLowerCase() === optionAnswer.toString().toLowerCase()) {
    var similarity3 = true
  }

  //Example with first item: Ten >=0.6 || 1 || option 1
  if (similarity1 >= 0.9 || similarity2 === true || similarity3 === true) {
    return true
  } else {
    return false
  }
}

function compareSlotsTier2(slots, item){
	this.emit(':tell', 'current item is:' + item.BinaryAnswer  + 'current slot content is:'+ slots.Answer.value.toString())  //There is a problem here, 
	
	var value = item.BinaryAnswer
	var option = item.AnswerOption
	var optionAnswer = 'option' + ' ' + item.AnswerOption

	var requestSlotvalue = slots.Answer.value
	
	this.emit(':tell', requestSlotvalue.toString().toLowerCase(), value.toString().toLowerCase())
	
	var similarity1 = stringSimilarity.compareTwoStrings(requestSlotvalue.toString().toLowerCase(), value.toString().toLowerCase())

	//TO DO: Use similarity2 to evaluate the button answer
	/*if (requestSlotvalue.toString().toLowerCase() === option.toString().toLowerCase()) {
	    var similarity2 = true
	}
	if (requestSlotvalue.toString().toLowerCase() === optionAnswer.toString().toLowerCase()) {
	    var similarity3 = true
	}*/

	//Example with first item: Ten >=0.6 || 1 || option 1
	if (similarity1 >= 0.6 /*|| similarity2 === true || similarity3 === true*/) {
	    return true
	} else {
	    return false
	}
}

function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getItem (slots) {

  var d = new Date()
  var n = d.getDay()
  var data = require('./' + n + '.json')

  let propertyArray = Object.getOwnPropertyNames(data[0])
  let value

  for (let slot in slots) {
    if (slots[slot].value !== undefined) {
      value = slots[slot].value
      for (let property in propertyArray) {
        let item = data.filter(x => x[propertyArray[property]].toString().toLowerCase() === slots[slot].value.toString().toLowerCase())
        if (item.length > 0) {
          return item[0]
        }
      }
    }
  }
  return value
}

function getSpeechCon (type) {
  if (type) return "<say-as interpret-as='interjection'>" + speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)] + "! </say-as><break strength='strong'/>"
  else return "<say-as interpret-as='interjection'>" + speechConsWrong[getRandom(0, speechConsWrong.length - 1)] + " </say-as><break strength='strong'/>"
}

function getSpeechQuestionIntro (type) {
	  return "<p>" + speechConsQuestionIntro[getRandom(0, speechConsQuestionIntro.length - 1)] + ". </p>"
}

function getSpeechToContinueStory(type){
	return SpeechToContinueStory[getRandom(0, SpeechToContinueStory.length - 1)]
}

exports.handler = (event, context) => {
  console.log(JSON.stringify(event, null, 2))
  const alexa = Alexa.handler(event, context)
  alexa.appId = APP_ID
  alexa.registerHandlers(handlers, startHandlers, quizHandlers, quizHandlersTier2)
  alexa.execute()
}
