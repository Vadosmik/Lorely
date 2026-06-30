from pydantic import BaseModel, ConfigDict, Field

class CategoryBase(BaseModel):
  slug: str = Field(min_length=2, max_length=50, description="Category name")

  en: str
  ru: str
  pl: str
  by: str

class CategoryCreate(CategoryBase):
  pass

class CategoryRead(CategoryBase):
  id: int

  slug: str

  en: str
  ru: str
  pl: str
  by: str
  
  model_config = ConfigDict(from_attributes=True)

class CategoryAssign(BaseModel):
  story_id: int
  category_id: int