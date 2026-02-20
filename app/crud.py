from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
from typing import List, Optional

def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()

def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    
    if transaction.type == "split" and transaction.split_with:
       actual_share = transaction.amount / (len(transaction.split_with) + 1)
    else:
       actual_share = transaction.amount
    db_transaction = models.Transaction(
        amount=transaction.amount,
        your_share=actual_share,
        description=transaction.description,
        category=transaction.category,
        type=transaction.type,
        transaction_date=transaction.transaction_date
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # If it's a split or loan, create split records
    if transaction.type in ["split", "loan"] and transaction.split_with and transaction.paid_by:
        share = transaction.amount / (len(transaction.split_with) + 1)
        for person in transaction.split_with:
            split = models.Split(
                transaction_id=db_transaction.id,
                paid_by=transaction.paid_by,
                split_with=person,
                amount=share
            )
            db.add(split)
        db.commit()
        db.refresh(db_transaction)

    return db_transaction

def settle_split(db: Session, split_id: int):
    split = db.query(models.Split).filter(models.Split.id == split_id).first()
    if not split:
        return None
    split.is_settled = True
    split.settled_at = datetime.now()
    db.commit()
    db.refresh(split)
    return split

def get_summary(db: Session):
    transactions = db.query(models.Transaction).all()
    
    total_spent = 0
    owed_to_me = 0
    i_owe = 0
    by_category = {}

    for t in transactions:
        if t.type == "expense":
            total_spent += t.amount
            by_category[t.category] = by_category.get(t.category, 0) + t.amount
        
        for split in t.splits:
            if not split.is_settled:
                if t.type == "split":
                    owed_to_me += split.amount
                elif t.type == "loan":
                    i_owe += split.amount

    return {
        "total_spent": total_spent,
        "owed_to_me": owed_to_me,
        "i_owe": i_owe,
        "spending_by_category": by_category
    }