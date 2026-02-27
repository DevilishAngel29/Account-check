from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import crud, models, schemas
from app.database import SessionLocal, engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Money Manager API")

@app.get("/")
def read_root():
    return {"message": "Money Manager API is running"}

@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db=db, transaction=transaction)


@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(
    skip: int = 0, 
    limit: int = 100, 
    month: int = None,
    year: int = None,
    db: Session = Depends(get_db)
):
    if not month:
        month = datetime.now().month
    if not year:
        year = datetime.now().year
    return crud.get_transactions(db, skip=skip, limit=limit, month=month, year=year)

@app.get("/transactions/{transaction_id}", response_model=schemas.Transaction)
def read_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = crud.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@app.get("/people/")
def get_people_balances(db: Session = Depends(get_db)):
    return crud.get_people_balances(db)

@app.get("/people/{name}")
def get_person_splits(name: str, db: Session = Depends(get_db)):
    return crud.get_person_splits(db, name=name)



@app.get("/summary")
def get_summary(
    month: int = None, 
    year: int = None, 
    db: Session = Depends(get_db)
):
    # default to current month/year if not provided
    if not month:
        month = datetime.now().month
    if not year:
        year = datetime.now().year
    return crud.get_summary(db, month=month, year=year)
