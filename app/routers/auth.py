from fastapi import APIRouter, Depends
from app.db.schema.user import UserInCreate, UserInLogin, UserWithToken, UserOutput
from app.database import get_db
from sqlalchemy.orm import Session
from app.service.userService import UserService



authRouter = APIRouter()

# when a user logs in they are gonna send in information so thats why post is used here and login defines the rououte
@authRouter.post("/login",status_code = 200, response_model = UserWithToken)  # this states that the login details should in the form as defined in the respective schema file
def login(loginDetails: UserInLogin,session :  Session=Depends(get_db)):  # this states that the login details should in the form as defined in the respective schema file
    try:
        return UserService(session = session).login(login_details = loginDetails)
    except Exception as error:
        print(error)
        raise error
   

@authRouter.post("/signup", status_code = 201, response_model = UserOutput)  # this states that the signup details should in the form as defined in the respective schema file
def signup(signUpDetails: UserInCreate, session: Session = Depends(get_db)): # this states that the signup details should in the form as defined in the respective schema file 
    try:
        return UserService(session = session).signup(user_details = signUpDetails)
    except Exception as error:
        print(error)
        raise error

#router->Service->repository->database
#router<-Service<-repository<-database