from flask import Flask, render_template, url_for, request, session, redirect
from pyDes import *
from Crypto.Cipher import AES
import numpy as np
import time
import sys
import random

database = {}

database['harsimrat'] = '1234567812345678'

verify = False

app = Flask(__name__)


Ktgs = 'This_is_a_tgskey'
Kv = 'This_is_a_serkey'
IDtgs = 'TGS'
IDv = 'Server'

# Generates key of length l
def generateKey():
	s = "abcdef1234567890"
	K = ""
	for i in range(0,16):
		K = K + s[random.randrange(len(s))]
	return K

# Encryption of messange for particular user
def Encrypt(key, msg):
	cipher_obj = AES.new(key, AES.MODE_CFB, 'This is an IV456')
	ciphertext = cipher_obj.encrypt(msg)
	return ciphertext

# Decryption of messange for particular user
def Decrypt(key, ciphertext):
	cipher_obj = AES.new(key, AES.MODE_CFB, 'This is an IV456')
	msg = cipher_obj.decrypt(ciphertext)
	return msg

def server(m):
	Ticket_v = m[0]
	authenticator = m[1]

	TS5 = time.time()
	new_m = [TS5 + 1]
	
	d = Ticket_v[0]
	Kc_v = Decrypt(Kv, Ticket_v[0])
	
	encrypt_m = [Encrypt(Kc_v, str(new_m[0]))]

	return encrypt_m

def AS(m):
	IDc = m[0]
	IDtgs = m[1]
	TS1 = m[2]
	
	Kc_tgs = generateKey()
	new_m = []
	TS2 = time.time()
	lifetime2 = '20'
	
	Ticket_tgs = [Kc_tgs, IDc, IDtgs, TS2, lifetime2]
	eTicket_tgs = []
	for data in Ticket_tgs:
		eTicket_tgs.append(Encrypt(Ktgs, str(data)))
	
	new_m.extend([Kc_tgs, IDtgs, TS2, lifetime2])
	encrypt_m = []
	for i in range(0, len(new_m)):
		encrypt_m.append(Encrypt(database[IDc], str(new_m[i])))
	encrypt_m.append(eTicket_tgs)

	return encrypt_m

def TGS(m):
	eTicket_tgs = m[1]
	Ticket_tgs = []
	for data in eTicket_tgs:
		Ticket_tgs.append(Decrypt(Ktgs, str(data)))

	IDc = Ticket_tgs[1]
	Kc_tgs = Ticket_tgs[0]

	Kc_v = generateKey()

	TS4 = time.time()
	lifetime4 = '20'
	Ticket_v = [Kc_v, IDc, IDv, TS4, lifetime4]

	eTicket_v = []
	for data in Ticket_v:
		eTicket_v.append(Encrypt(Kv, str(data)))

	new_m = [Kc_v, IDv, TS4, Ticket_v]

	encrypt_m = [Encrypt(Kc_tgs, str(Kc_v)), Encrypt(Kc_tgs, str(IDv)), Encrypt(Kc_tgs, str(TS4)), eTicket_v]

	return encrypt_m

def clients(num_clients, clientID):
	for i in range(0, num_clients):
		msg = []
		TS1 = time.time()
		msg.extend([clientID, IDtgs, TS1])

		# E(Kc, [Kc_tgs, IDtgs, TS2, lifetime2, Ticket_tgs])
		print "Messages between user and AS:"
		print "User -> AS"
		print(msg)

		encrypt_m = AS(msg)

		print "AS -> User"
		print "\t (encrypted)"
		print (encrypt_m)

		msg_from_AS = []
		for j in range(0, len(encrypt_m)):
			if j == len(encrypt_m)-1:
				Ticket_tgs = encrypt_m[j]
			else:
				msg_from_AS.append(Decrypt(database[clientID], encrypt_m[j]))
		print "\t (decrypted)"
		print (msg_from_AS)

		msg = []
		Kc_tgs = msg_from_AS[0]
		TS3 = time.time()
		authenticator = [Encrypt(Kc_tgs, str(clientID)), Encrypt(Kc_tgs, str(TS3))]
		msg.extend([IDv, Ticket_tgs, authenticator])
		print "User -> TGS"
		print(msg)
		print "TGS -> User"
		encrypt_m = TGS(msg)
		# E(Kc_tgs, [Kc_v, IDv, TS4, Ticket_v])

		print "\t (encrypted)"
		print (encrypt_m)

		msg_from_tgs = []
		for j in range(0, len(encrypt_m)-1):
			msg_from_tgs.append(Decrypt(Kc_tgs, str(encrypt_m[j])))

		Ticket_v = encrypt_m[3]
		msg_from_tgs.append(Ticket_v)

		print "\t (decrypted)"
		print (msg_from_tgs)

		Kc_v = msg_from_tgs[0]
		TS5 = time.time()
		authenticator = [Encrypt(Kc_v, str(clientID)), Encrypt(Kc_v, str(TS5))]

		msg = [Ticket_v, authenticator]
		encrypt_m = server(msg)
		print "User -> Server"
		print(msg)
		print "Server -> User"
		print "\t (encrypted)"
		print (encrypt_m)

		msg_from_server = [Decrypt(Kc_v, str(encrypt_m[0]))]

		print "\t (decrypted)"
		print (msg_from_tgs)
		print ('Connected to server')
		
		verify = True

@app.route('/')
def index():
	if verify:
		return 'You are logged in as ' + session['username']
	return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
	if request.form['username'] in database:
		if request.form['pass'] == database[request.form['username']]:
			# session['username'] = request.form['username']
			clients(1, request.form['username'])
			return redirect(url_for('index'))

		return 'Invalid username/password combination'
	return 'Invalid username/password combination'

# @app.route('/register', methods=['POST', 'GET'])
# def register():
# 	if request.method == 'POST':

# 		if request.form['username'] not in database:
# 			database[request.form['username']] = request.form['pass']
# 			# session['username'] = request.form['username']
# 			return redirect(url_for('index'))
		
# 		return 'That username already exists!'

# 	return render_template('register.html')

if __name__ == '__main__':
	app.secret_key = 'mysecret'
	app.run()