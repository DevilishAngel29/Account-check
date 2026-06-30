from bcrypt import hashpw, gensalt , checkpw

class HashHelper(object):

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) :
        
        if(checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))):
            return True
        else:
            return False
        

    @staticmethod
    def get_password_hash(plain_password : str):
        return hashpw(
            plain_password.encode('utf-8'),
            gensalt()# generating an extra string to be added to data before hashing to make it more secure
        ).decode('utf-8')