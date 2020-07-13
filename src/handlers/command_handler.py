#Command Handler
from os.path import dirname, basename, isfile, join
import glob

class CommandHandler:

  #Constructor
  def __init__(self, client): 
    self.client = client

    #Store commands
    self.commands = []

    #Load Commands from directory
    #commandFiles = glob.glob(join(dirname(__file__), "*.py"))
    #print(commandFiles)

    #__all__ = [ basename(f)[:-3] for f in commandFiles if isfile(f) and not f.endswith('__init__.py')]



  #Add commands to the array
  def addCommand(self, command):
    self.commands.append(command)

  #Handle the commands
  async def handle(self, message):
    #loop through command array
    for command in self.commands:
      #Check to see if the message starts with a trigger
      if message.content.startswith(command.getTriggers()):
        args = message.content.split(' ')
        
        await command.execute(message, self.client, args)

        return