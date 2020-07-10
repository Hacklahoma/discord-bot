import os
import discord
from handlers.CommandHandler import CommandHandler
from commands.Ping import Ping
from dotenv import load_dotenv

load_dotenv()

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
    print('Discord.py Version: {}'.format(discord.__version__))

  except Exception as e:
    print(e)

#Message Listener
@client.event
async def on_message(message):
  #Check to see if the message author is the bot
  if message.author == client.user:
    pass
  #Check to see if the correct prefix was given
  elif message.content.startswith('!'):
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