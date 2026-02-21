from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    your_share = Column(Float, nullable=True)  # actual amount you spent
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    type = Column(String(20), nullable = False)
    transaction_date = Column(Date, default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    splits = relationship("Split",back_populates = "transaction")

class Split(Base):
    __tablename__ = "splits"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    paid_by = Column(String(50), nullable=False)
    split_with = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    is_settled = Column(Boolean, default=False)  # 0 for unsettled, 1 for settled
    settled_at = Column(DateTime(timezone=True), nullable=True)

    transaction = relationship("Transaction",back_populates="splits")



























































