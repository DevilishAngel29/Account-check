from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, ForeignKey, Boolean, Numeric
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)

    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transactions = relationship(
        "Transaction",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(Numeric(10, 2), nullable=False)
    your_share = Column(Numeric(10, 2))

    description = Column(Text)
    category = Column(String(50))

    type = Column(String(20), nullable=False)

    is_split = Column(Boolean, default=False)

    transaction_date = Column(
        Date,
        default=func.current_date()
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    owner = relationship("User", back_populates="transactions")
    splits = relationship("Split", back_populates="transaction")


class Split(Base):
    __tablename__ = "splits"

    id = Column(Integer, primary_key=True, index=True)

    transaction_id = Column(
        Integer,
        ForeignKey("transactions.id"),
        nullable=False
    )

    # Future-proof field
    # NULL = person is not a registered user
    # Has value = linked to a registered user
    split_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    paid_by_me = Column(Boolean, default=True)

    split_with = Column(String(50), nullable=False)

    amount = Column(Numeric(10, 2), nullable=False)

    amount_paid = Column(Numeric(10, 2), default=0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    transaction = relationship(
        "Transaction",
        back_populates="splits"
    )

    split_user = relationship(
        "User",
        foreign_keys=[split_user_id]
    )