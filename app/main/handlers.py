from app.main import bp
from app.models import db, Instruction, Data
import time
from playhouse.shortcuts import model_to_dict

from flask import render_template, request, make_response, session, escape, current_app, jsonify, g
import random



@bp.route('/data')
def data():

	ret = Data.select().order_by(Data.id.desc()).get()

	input = {'temperature' : ret.temperature, 'stirringRate' : ret.stirringRate, 'pH' : ret.ph}
	
	return jsonify(input)

@bp.route('/instruct')
def instruct():

	temperature = request.args.get('temperature')
	stirringSpeed = request.args.get('stirring')

	if(temperature and stirringSpeed):	

		instChar = f"{temperature},{stirringSpeed}\n"
		inst = Instruction(instruction=instChar)
		inst.save()

		if(inst.id):

			ret = { 'status':'success', 'id': inst.id, 'created_date': inst.created_date }
			return jsonify(ret)

		return jsonify({ 'ststus' :'error' })
	
	return 'None'

	

@bp.route('/', methods = ['GET'])
def main():
    
    

	
	input = "Temp : 23 Celcius Stirring rate: 2000RPM"
	response = make_response(render_template('index.html', data=input))
	
	response.set_cookie('User','Laotiemeimaobing', max_age=60)
	

	current_app.logger.info(f"{input} just accessed")

	return response
