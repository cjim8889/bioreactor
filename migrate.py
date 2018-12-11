from peewee import *
import time, datetime
db = SqliteDatabase('./bio.db')

class Base(Model):
    created_date = DateTimeField(default=datetime.datetime.now)

    class Meta:
        database = db

class Data(Base):
    id = PrimaryKeyField(unique=True)
    temperature = FloatField()
    stirringRate = FloatField()
    ph = FloatField()


class Instruction(Base):
    id = PrimaryKeyField(unique=True)
    instruction = CharField()
    finished = BooleanField(default=False)
    finishedDate = DateTimeField(null=True)

db.connect()
db.create_tables([Data, Instruction])