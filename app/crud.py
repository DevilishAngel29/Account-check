from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
from typing import List, Optional

def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()

def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100, month: int = None, year: int = None):
    query = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id  
    )
    
    if month and year:
        from sqlalchemy import extract
        query = query.filter(
            extract('month', models.Transaction.transaction_date) == month,
            extract('year', models.Transaction.transaction_date) == year
        )
    
    return query.order_by(
        models.Transaction.created_at.desc()
    ).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate, user_id: int):
    
    if transaction.is_split and transaction.split_with:
        if transaction.your_share:
           actual_share = transaction.your_share
        else:
           actual_share = round(transaction.amount / (len(transaction.split_with) + 1),2)
        
    else:
        actual_share = transaction.amount           
    db_transaction = models.Transaction(
        user_id=user_id,
        amount=transaction.amount,
        your_share=actual_share,
        description=transaction.description,
        category=transaction.category,
        type=transaction.type,
        is_split=transaction.is_split,
        transaction_date=transaction.transaction_date
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    if transaction.is_split and transaction.split_with:
        for person in transaction.split_with:
            if isinstance(person, schemas.SplitPerson):
                person_share = person.amount   # ← dot notation, not dict
                person_name = person.name
            else:
                person_share = round(transaction.amount / (len(transaction.split_with) + 1),2)
                person_name = person    

            split = models.Split(
                transaction_id=db_transaction.id,
                paid_by_me=True,
                split_with=person_name,
                amount=person_share,
                amount_paid=0
            )
            db.add(split)
        db.commit()
        db.refresh(db_transaction)


    return db_transaction




    
def get_people_balances(db: Session, user_id: int):
    splits = db.query(models.Split).join(models.Transaction).filter(
        models.Transaction.user_id == user_id
    ).all()
    balances = {}  
    
    for split in splits:
        name = split.split_with
        remaining = split.amount - split.amount_paid
        # if paid_by_me → they owe us → positive
        if split.paid_by_me:
            balances[name] = balances.get(name,0)+remaining
        else:
                balances[name] = balances.get(name,0)-remaining
        # if not paid_by_me → we owe them → negative
    
    # convert dict to list and return
    return [
    {
        "name": name, 
        "balance": abs(balance),        # always positive number
        "they_owe_me": balance > 0      # true = they owe you, false = you owe them
    } 
    for name, balance in balances.items()
]

def get_summary(db: Session, user_id: int, month: int = None, year: int = None):
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id  
    )
    
    if month and year:
        from sqlalchemy import extract
        transactions = transactions.filter(
            extract('month', models.Transaction.transaction_date) == month,
            extract('year', models.Transaction.transaction_date) == year
        )
    
    transactions = transactions.all()

    total_spent = 0
    total_income = 0
    owed_to_me = 0
    i_owe = 0
    by_category = {}

    for t in transactions:
        if t.type ==   "expense":
            total_spent += t.amount
            by_category[t.category] = by_category.get(t.category, 0) + t.your_share
        elif t.type == "income":
            total_income += t.amount

            
        
        if t.is_split:
            for split in t.splits:
                remaining = split.amount - split.amount_paid
                if split.paid_by_me:
                    owed_to_me += remaining
                else:
                    i_owe += remaining
        

    
    return {
        "total_spent": total_spent,
        "total_income": total_income,
        "owed_to_me": owed_to_me,
        "i_owe": i_owe,
        "spending_by_category": by_category
    }

def get_person_splits(db: Session, name: str, user_id: int):
    splits = db.query(models.Split).join(models.Transaction).filter(
        models.Split.split_with == name,
        models.Transaction.user_id == user_id  
    ).all()
    
    result = []
    for split in splits:
        transaction = db.query(models.Transaction).filter(
            models.Transaction.id == split.transaction_id
        ).first()
        
        result.append({
            "id": split.id,
            "amount": split.amount,
            "amount_paid": split.amount_paid,
            "paid_by_me": split.paid_by_me,
            "remaining": split.amount - split.amount_paid,
            "description": transaction.description,
            "category": transaction.category,
            "date": str(transaction.transaction_date),
        })
    
    return result

def settle_split(db: Session, split_id: int, amount: float):
    # 1. find the split
    split = db.query(models.Split).filter(models.Split.id == split_id).first()
    
    if not split:
        return None
    
    # 2. add the payment
    split.amount_paid += amount
    
    # 3. check if overpaid
    if split.amount_paid > split.amount:
        # calculate how much extra was paid
        overpaid = split.amount_paid - split.amount
        
        # flip the split — now I owe them
        split.paid_by_me = not split.paid_by_me
        split.amount = overpaid     # new amount is the overpaid amount
        split.amount_paid = 0  # reset paid to 0
    
    # 4. save
    db.commit()
    db.refresh(split)
    return split
