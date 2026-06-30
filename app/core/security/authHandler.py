import jwt 
from decouple import config
import time

JWT_SECRET = config("JWT_SECRET")
JWT_ALGORITHM = config("JWT_ALGORITHM")

class AuthHandler(object):

    @staticmethod
    def sign_JWT(user_id: int)->str:
        payload = {
            "user_id": user_id,
            "expires" : time.time() + 900 # token will expire in 315 seconds (15 minutes)
        }

        token = jwt.encode(payload, JWT_SECRET, algorithm = JWT_ALGORITHM)
        return token

    @staticmethod
    def decode_JWT(token: str)-> dict:
        try:
            decoded_token = jwt.decode(token, JWT_SECRET, algorithms = [JWT_ALGORITHM])
            return decoded_token if decoded_token["expires"] >= time.time() else None
        except:
            print("Invalid token")
            return None