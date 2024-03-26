module.exports = {
	ChatbotReply: function (message) {
	  try {
		if (message === undefined || message === null) {
		  throw new Error('Message is missing');
		}
  
		// Bot's data
		this.Bot_Age = 28;
		this.Bot_Name = "Abdelrahman Radwan";
		this.Bot_University = "Ain Shams University";
		this.Bot_Country = "Egypt";
		// User data
		this.User_Age;
		this.User_Name;
		this.User_University;
  
		// Message processing... 
		message = message.toLowerCase();
  
		if (message.includes("hi") || message.includes("hello") || message.includes("welcome")) {
		  return "Hi!";
		} else if (message.includes("age") && message.includes("your")) {
		  return "I'm " + this.Bot_Age;
		} else if (message.includes("how") && message.includes("are") && message.includes("you")) {
		  return "I'm fine ^_^";
		} else if (message.includes("where") && message.includes("live") && message.includes("you")) {
		  return "I live in " + this.Bot_Country;
		}
  
		throw new Error('Unknown message format');
	  } catch (error) {
		console.error('Error in ChatbotReply:', error.message);
		return 'Bot encountered an error: ' + error.message;
	  }
	}
  };
  