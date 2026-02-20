from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class SplitBase(BaseModel):
    paid_by: str
    split_with: str
    amount: float

class SplitCreate(SplitBase):
    pass

class Split(SplitBase):
    id:int
    is_settled: int
    settled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    category: str
    type: str # expense\split\loan
    transaction_date: Optional[date] = None


class TransactionCreate(TransactionBase):
    split_with: Optional[list[str]] = None
    paid_by: Optional[str] = None


class Transaction(TransactionBase):
    id: int
    created_at: datetime
    splits: List[Split] = []

    class Config:
        from_attributes = True