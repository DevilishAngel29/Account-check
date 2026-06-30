from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import crud, models, schemas
from app.database import SessionLocal, engine, get_db
from app.routers.auth import authRouter
from app.util.protectRoute import get_current_user
from app.db.schema.user import UserOutput

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Money Manager API")

@app.get("/")
def read_root():
    return {"message": "Money Manager API is running"}

@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db),current_user: UserOutput = Depends(get_current_user)):
    return crud.create_transaction(db=db, transaction=transaction, user_id=current_user.id)


@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(
    skip: int = 0, 
    limit: int = 100, 
    month: int = None,
    year: int = None,
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    if not month:
        month = datetime.now().month
    if not year:
        year = datetime.now().year
    return crud.get_transactions(db, skip=skip, limit=limit, month=month, year=year , user_id=current_user.id)

@app.get("/transactions/{transaction_id}", response_model=schemas.Transaction)
def read_transaction(transaction_id: int, db: Session = Depends(get_db),current_user: UserOutput = Depends(get_current_user)):
    db_transaction = crud.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@app.get("/people/")
def get_people_balances(db: Session = Depends(get_db),current_user: UserOutput = Depends(get_current_user)):
    return crud.get_people_balances(db, user_id=current_user.id)

@app.get("/people/{name}")
def get_person_splits(name: str, db: Session = Depends(get_db),current_user: UserOutput = Depends(get_current_user)):
    return crud.get_person_splits(db, name=name, user_id=current_user.id)



@app.get("/summary")
def get_summary(
    month: int = None, 
    year: int = None, 
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    # default to current month/year if not provided
    if not month:
        month = datetime.now().month
    if not year:
        year = datetime.now().year
    return crud.get_summary(db, month=month, year=year, user_id=current_user.id)


@app.post("/splits/{split_id}/settle")
def settle_split(
    split_id: int,
    request: schemas.SettleRequest,  # ← body, not query param
    db: Session = Depends(get_db),
    current_user: UserOutput = Depends(get_current_user)
):
    result = crud.settle_split(db, split_id=split_id, amount=request.amount)
    if result is None:
        raise HTTPException(status_code=404, detail="Split not found")
    return result

# Include the authRouter in the main app

app.include_router(router = authRouter,tags=["auth"],prefix = "/auth") ##tags allows to create our own section nased on the tags we provide in the router file, also prefix adds the prefix to the route so that we can have a common prefix for all the routes in the router file like /auth/login etc


#new route to give access to authorised users only, this route will be used to test the authorization of the user and will return the user details if the user is authorized
@app.get("/protected")
def read_protected(user: UserOutput = Depends(get_current_user)):
    return {"data": user}