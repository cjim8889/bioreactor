import serial
import sqlite3
# from peewee import SqliteDatabase, PrimaryKeyField, DateTimeField, IntegerField, FloatField, BooleanField, CharField, Model
from peewee import *
import time, datetime
import logging
import asyncio


ser = serial.Serial()
ser.baudrate = 9600
ser.port = 'COM6'
ser.open()
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

async def readData(serial):
    data = serial.readline().decode().split("\r")[0].split(",")
    print(data)
    if(len(data) != 0):
        instance = Data(temperature=data[0], stirringRate=data[1], ph=data[2])
        instance.save()
        logger.info(f"Temperature: {data[0]} Stirring Rate {data[1]} pH {data[2]}")


db.connect()
db.create_tables([Data, Instruction])

logger = logging.getLogger('serialLog')
logger.setLevel(logging.INFO)

fh = logging.FileHandler('serial.log')
fh.setLevel(logging.INFO)

ch = logging.StreamHandler()
ch.setLevel(logging.INFO)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
ch.setFormatter(formatter)

logger.addHandler(fh)
logger.addHandler(ch)

while(ser.is_open):
    asyncio.run(readData(ser))
    for instruction in Instruction.select().where(Instruction.finished == False):
        ser.write(instruction.instruction.encode())
        instruction.finished = True
        instruction.finishedDate = datetime.datetime.now()
        instruction.save()
        logger.info(f"Instruction Sent {instruction.instruction} ID: {instruction.id}")
        


