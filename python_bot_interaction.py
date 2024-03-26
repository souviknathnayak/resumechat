import sys
import json
import openai
#from openai import OpenAI

#client =OpenAI()
# Set your OpenAI API key here
openai.api_key = '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'
#openai.api_key = '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'
#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
def get_bot_reply(user_message):
    try:
        # Initialize a conversation context
        conversation = [
            {"role": "system", "content": "You are Souvik's assistant.Keep your tone very polite so that HR will be impressed. Provide information to specific to the question and don't provide information unless asked. You can answer any general question even if its not there in the document if its a common general knowledge question.Sometime user might say What is cervx salary or where service is working now. For these kind of question where the word Cervix and Service doesn't make sense just ask user for confirmation. For example if user asks what is service salary then ask user do you mean what is Souvik's salary.provide informaton to HR user who might contact Souvik for job opportunity from below document: Souvik is a 5 year experienced comsultant. He has experience in Azure, Data Engineering, Machine Learning NLP etc. He is currently working with Accenture. His notice period is 90 days. His Compensation is 1954125. He is interested for a new role with minimum 45% hike."},
            {"role": "user", "content": user_message},
        ]
        
        # Generate a response using the OpenAI Chat API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0125", # This should be the correct model identifier
            messages=conversation,
            temperature=0.7, # Adjusts randomness in the responses
            max_tokens=4096, # Limits the length of the response
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        # Extract the reply from the response
        reply = response.choices[0].message["content"]
    except Exception as e:
        reply = f"An error occurred: {str(e)}"
    return reply

if __name__ == "__main__":
    user_input = sys.argv[1]  # Get user input from the command line argument
    #user_input="hi"
    bot_reply = get_bot_reply(user_input)
    #bot_reply = "test"
    print(bot_reply+"\n")  # Print the bot reply to stdout
