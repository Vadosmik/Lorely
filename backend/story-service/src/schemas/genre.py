from pydantic import BaseModel, ConfigDict, Field

class GenreBase(BaseModel):
  slug: str = Field(min_length=2, max_length=50, description="Genre name")

  en: str
  ru: str
  pl: str
  by: str

class GenreCreate(GenreBase):
  pass

class GenreRead(GenreBase):
  id: int

  slug: str
  
  en: str
  ru: str
  pl: str
  by: str
  
  model_config = ConfigDict(from_attributes=True)

class GenreAssign(BaseModel):
  story_id: int
  genre_id: int