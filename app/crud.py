from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
from typing import List, Optional

def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()

def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).offset(skip).limit(limit).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    
    if transaction.is_split and transaction.split_with:
        if transaction.your_share:
           actual_share = transaction.your_share
        else:
           actual_share = transaction.amount / (len(transaction.split_with) + 1)
        
    else:
        actual_share = transaction.amount           
    db_transaction = models.Transaction(
        amount=transaction.amount,
        your_share=actual_share,
        description=transaction.description,
        category=transaction.category,
        type=transaction.type,
        is_split=transaction.is_split,
        account_id=transaction.account_id,
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
                person_share = transaction.amount / (len(transaction.split_with) + 1)
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



def create_account(db: Session, account: schemas.AccountCreate):
    db_account = models.Account(
        name=account.name,
        type=account.type,
        balance=account.balance
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def get_accounts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Account).offset(skip).limit(limit).all()
    
def get_people_balances(db: Session):
    splits = db.query(models.Split).all()
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

def get_summary(db:Session):
    transactions = db.query(models.Transaction).all()
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

