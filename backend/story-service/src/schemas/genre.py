from pydantic import BaseModel, ConfigDict, Field

class GenreBase(BaseModel):
  title: str = Field(min_length=2, max_length=50, description="Genre name")

class GenreCreate(GenreBase):
  pass

class GenreRead(GenreBase):
  id: int
  
  model_config = ConfigDict(from_attributes=True)