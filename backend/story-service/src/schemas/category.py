from pydantic import BaseModel, ConfigDict, Field

# -- Category --
class CategoryBase(BaseModel):
  title: str = Field(min_length=2, max_length=50, description="Category name")

class CategoryCreate(CategoryBase):
  pass

class CategoryRead(CategoryBase):
  id: int
  
  model_config = ConfigDict(from_attributes=True)