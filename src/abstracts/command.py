from abc import ABC, abstractmethod

class Command(ABC):
  #Constructor
  def __init__(self, name, description, triggers):
    #Command dictionary
    self.name = name
    self.description = description
    self.triggers = triggers
    
    super().__init__()

  #Getters
  def getName(self):
    return self.name

  def getDescription(self):
    return self.description

  def getTriggers(self):
    return self.triggers
  
  @abstractmethod
  async def execute(self, message, client, args):
    pass