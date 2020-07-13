import os
import discord
from handlers.command_handler import CommandHandler
from commands.ping import Ping
from dotenv import load_dotenv

load_dotenv()

#Check to see if the token was given
if os.getenv("BOT_TOKEN"):
  #Create a new client
  client = discord.Client()

  #Create the command handler
  ch = CommandHandler(client)

  #Add ping command
  ch.addCommand(Ping())

  #Print bot info when bot is ready
  @client.event
  async def on_ready():
    try:
      print('Bot Tag: {0.user}'.format(client))
      print('Bot ID: {0.user.id}'.format(client))

    except Exception as e:
      print(e)

  #Message Listener
  @client.event
  async def on_message(message):
    #Check to see if the message author is the bot
    if message.author == client.user:
      pass
    #Check to see if the correct prefix was given
    elif message.content.startswith(os.getenv("PREFIX")):
      try:
        #Try to excecute the message
        await ch.handle(message)

      #No trigger found
      except TypeError as e:
        pass

      #Generic error
      except Exception as e:
        print(e)

  #Log the bot in
  client.run(os.getenv("BOT_TOKEN"))

else:
  print("Error: BOT_TOKEN must be provided in the environment variables.")