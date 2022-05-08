#library
from flask import Flask, request, render_template
import sqlite3
from sqlite3 import Error
import hashlib
from datetime import date
import random
from json import dumps

#functions for data handling
def get_date():
    return date.today()

def hash(inp):
    h =  hashlib.md5(inp.encode())
    return h.hexdigest()

def check_googleform_link(link):
    if link[:17] == 'https://forms.gle':
        return True
    elif link[:34] == "https://docs.google.com/forms/d/e/":
        return True
    else:
        return False
    
def check_login(connection,username, password):
    check_pair = (username,password)
    all_pair = connection.execute("SELECT AuthorName,Password FROM Author").fetchall()
    if check_pair in all_pair:
        return True
    else: 
        return False

def name_to_id(connection,name,stri=True):
    id = connection.execute("SELECT AuthorID FROM Author WHERE AuthorName=?",(name,)).fetchall()[0][0]
    if stri == True:
        return str(id)
    else:
        return id

def get_notification(connection,username,read=0):
    id = name_to_id(connection,username)
    notifications = connection.execute("SELECT * FROM Notification WHERE TargetID=? AND Read=?",(id,read)).fetchall()
    return notifications

def change_password(conn,username, current_pw, new_pw):
    sql = '''UPDATE Author SET Password = ? WHERE AuthorName = ?'''
    sql2 = '''SELECT Password FROM Author WHERE AuthorName = ?'''
    tupl2 = (username, )
    cur = conn.execute(sql2, tupl2)
    c_password = cur.fetchone()[0]
    if hash(current_pw) == c_password:
        tupl = (hash(new_pw), username)
        conn.execute(sql, tupl)
        conn.commit()
        print('Password updated')
    else:
        print('Wrong Password entered')

#global variable
app = Flask("main")
db = "database/SERVER.db"

#pages
@app.route("/",methods=["GET","POST"])
@app.route("/home",methods=["GET","POST"])
def index():
    with sqlite3.connect(db) as connection:
        survey = connection.execute("SELECT * FROM Survey").fetchall()
        random.shuffle(survey)
    return render_template("index.html",surveys=survey) 

@app.route("/loading")
def loading():
    return render_template("loading.html")

@app.route("/view",methods=["GET"])
def view():
    with sqlite3.connect(db) as connection:
        survey = connection.execute("SELECT * FROM Survey WHERE SurveyID=?",(request.args["survey_id"],)).fetchall()
        author_name = connection.execute("SELECT AuthorName FROM Author WHERE AuthorID=?",(survey[0][3],)).fetchall()[0][0]
        id = survey[0][0]
        return render_template("view.html",data=survey[0],author=author_name,survey_id=id)

@app.route("/survey")
def survey():
    return "survey"

@app.route("/notification",methods=["POST","GET"])
def notification():
    if request.method == "POST":
        data = request.form
        with sqlite3.connect(db) as connection:
            unread = get_notification(connection,data["username"])
            read = get_notification(connection,data["username"],read=1)
            return render_template("notification.html",unseen=unread,seen=read)

@app.route("/profile",methods=["POST","GET"])
def profile():
    if request.method == "POST":
        with sqlite3.connect(db) as connection: 
            data = request.form
            username = data["username"]
            points = connection.execute("SELECT Point FROM Author WHERE AuthorName = ?",(username,)).fetchall()[0][0]
            date = connection.execute("SELECT RegistrationDate FROM Author WHERE AuthorName = ?",(username,)).fetchall()[0][0]
            posted = len(connection.execute("SELECT * FROM Survey WHERE AuthorID=?",(name_to_id(connection,username),)).fetchall())
            done = connection.execute("SELECT SurveyDone FROM Author WHERE AuthorName = ?",(username,)).fetchall()[0][0]
            return render_template("profile.html",userid=username,point=points,survey_posted=posted,age=date,survey_done=done)

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/change",methods=["POST","GET"])
def change():
    if request.method == "POST":
        data = request.form
        username = data["username"]
        return render_template("change.html",name=username)
            

@app.route("/fetch",methods=["POST"])
def points():
    if request.method == "POST":
        data = request.get_json()
        action = data["action"]
        if action == "add_point":
            with sqlite3.connect(db) as connection:
                if check_login(connection,data["id"],data["password"]):
                    connection.execute("UPDATE Author SET Point = Author.Point+1 WHERE AuthorName = ?",(data["id"],))
                    connection.execute("UPDATE Author SET SurveyDone = SurveyDone+1 WHERE AuthorName = ?",(data["id"],))
                    connection.commit()
                    print("point added")
                    return "200"
                else:
                    return "Not Logged in"
        if action == "login":
            with sqlite3.connect(db) as connection:
                if check_login(connection,data["id"],hash(data["password"])):
                    return dumps({"log":True,"pw":hash(data["password"])})
                else:
                    return dumps({"log":False})
        if action == "check_login":
            with sqlite3.connect(db) as connection:
                if check_login(connection,data["id"],data["password"]):
                    return dumps({"log":True})
                else:
                    return dumps({"log":False})
        if action == "check_unique":
            with sqlite3.connect(db) as connection:
                namelist = []
                for names in connection.execute("SELECT AuthorName FROM Author").fetchall():
                    namelist.append(names[0])
                if data["id"] in namelist:
                    return dumps({"unique":False})
                else:
                    return dumps({"unique":True})
        if action == "register":
            with sqlite3.connect(db) as connection:
                connection.execute("INSERT INTO Author (AuthorName,Password,Point,RegistrationDate) VALUES (?,?,0,?)",(data["id"],hash(data["pw"]),get_date()))
                connection.commit()
                print("registered")
                return "200"
        if action == "add_responds":
            with sqlite3.connect(db) as connection:
                try:
                    connection.execute("UPDATE Survey SET Responders = Survey.Responders+1 WHERE SurveyID = ?",(data["id"],))
                    print("response added")
                except Error as e:
                    print(e)
            return "200"
        if action == "get_points":
            with sqlite3.connect(db) as connection:
                try:
                    point = connection.execute("SELECT Point FROM Author WHERE AuthorName = ?",(data["id"],)).fetchall()[0][0]
                    return dumps({"point":point})
                except Error as e:
                    print(e)
                    return dumps({"point":" "})
        if action == "hash":
            return dumps({"hashed":hash(data["pw"])})
        if action == "seen":
            with sqlite3.connect(db) as connection:
                notification_id = data["id"]
                connection.execute("UPDATE Notification SET Read=1 WHERE ID=?",(notification_id,))
                connection.commit()
                print("notification viewed")
                return "200"
        if action == "change":
            with sqlite3.connect(db) as connection:
                change_password(connection,data["username"],data["opassword"],data["npassword"])
                return "200"

#code
app.run(host="0.0.0.0",port=5000,debug=True)