#ping command
from __future__ import absolute_import
from abstracts.command import Command

class Ping(Command):
  def __init__(self): 
    super().__init__(
      'ping', 
      'ping the bot', 
      '!ping'
    )

  #Executes the command
  async def execute(self, message, client, args):
    try:
      await message.channel.send('pong!')
      return  
    except Exception as e:
      return e