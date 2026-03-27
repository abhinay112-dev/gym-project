from app import db
from flask_login import UserMixin

class User(db.Model,UserMixin):
    __tablename__='users'
    uid=db.Column(db.Integer,primary_key = True)
    username=db.Column(db.Text,nullable=False)
    name=db.Column(db.Text,nullable=False)
    password=db.Column(db.Text,nullable=False)
    email=db.Column(db.Text,nullable=False)

    def __repr__(self):
        return f'<User:{self.username}, Role: {self.role}>'
    def get_id(self):
        return self.uid
    
class persondetails(db.Model,UserMixin):
    __tablename__='persondetails'
    uid=db.Column(db.Integer,primary_key = True)
    weight=db.Column(db.Integer,nullable=False)
    height=db.Column(db.Integer,nullable=False)
    goal_weight=db.Column(db.Integer,nullable=False)
    age=db.Column(db.Integer,nullable=False)
    name=db.Column(db.Text,nullable=False)
    going_to_gym=db.Column(db.Text,nullable=False)
    level=db.Column(db.Text,nullable=False)

    def __repr__(self):
        return ''
    def get_id(self):
        return self.uid