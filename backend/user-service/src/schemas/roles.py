from pydantic import BaseModel, ConfigDict, Field

class RoleBase(BaseModel):
  title: str = Field(min_length=2, max_length=50)

class RoleCreate(RoleBase):
  pass

class RoleRead(RoleBase):
  id: int

  model_config = ConfigDict(from_attributes=True)

class RoleAssign(BaseModel):
  user_id: int
  role_id: int
