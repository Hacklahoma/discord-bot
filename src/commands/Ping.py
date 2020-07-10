#ping command

class Ping:
  def __init__(self): 
    #Command dictionary
    self.command = {
      'trigger': '!ping',
      'description': 'Ping the bot'
    }

  #Returns the triggers
  def getTriggers(self):
    return self.command['trigger']

  #Executes the command
  async def execute(self, message, client, args):
    try:
      await message.channel.send('pong')
      return
    except Exception as e:
      return e