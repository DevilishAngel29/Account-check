from .base import BaseRepository
from app import models
from app.db.schema.user import UserInCreate

class UserRepository(BaseRepository):
    # this repository will contains method that we need to interact with the database for user related operations
    def create_user(self, user_data : UserInCreate):
        # create a new user instance using the data from the UserInCreate schema and model_dump() method to convert the schema data into a dictionary that can be used to create a new user instance
        new_user = models.User(**user_data.model_dump(exclude_none = True))

        # add the new user to the session and commit the transaction to save the user in the database
        self.session.add(instance = new_user)
        self.session.commit()
        self.session.refresh(instance = new_user)
        return new_user
    
    def user_exist_by_email(self, email: str)-> bool:
        # check if a user with the given email exists in the database
        user = self.session.query(models.User).filter_by(email = email).first()
        return bool(user)
    
    def get_user_by_email(self, email: str)-> models.User:
        # return  user with the given email exists in the database
        user = self.session.query(models.User).filter_by(email = email).first()
        return user
    
    def get_user_by_id(self, user_id: int)-> models.User:
        # check if a user with the given ID exists in the database
        user = self.session.query(models.User).filter_by(id = user_id).first()
        return user