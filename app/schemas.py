from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List, Union

class SplitBase(BaseModel):
    paid_by_me: bool = True
    split_with: str
    amount: float

class SplitPerson(BaseModel):
    name: str
    amount: float


class SplitCreate(SplitBase):
    pass

class Split(SplitBase):
    id: int
    amount_paid: float 
    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    category: str
    type: str # income or expense
    is_split: bool = False
    account_id: int 
    transaction_date: Optional[date] = None


class TransactionCreate(TransactionBase):
    split_with: Optional[list[Union[SplitPerson, str]]] = None
    paid_by_me: bool = True 
    your_share: Optional[float] = None
   

class Transaction(TransactionBase):
    id: int
    created_at: datetime
    splits: List[Split] = []

    class Config:
        from_attributes = True

class AccountBase(BaseModel):
    name: str
    type: str
    balance: float

class AccountCreate(AccountBase):
    pass

class Account(AccountBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True