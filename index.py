#library
from flask import Flask, request, render_template
import mysql.connector as sql
import hashlib
from datetime import date
import random
from json import dumps
import os

#global variable
alert_int = (5,10,20,50,100,200,500,1000)
app = Flask("main")
database = sql.connect(host=os.environ.get("host"),user=os.environ.get("user"),password=os.environ.get("password"),database=os.environ.get("database"))

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
    connection.execute("SELECT AuthorName,Passwords FROM Author")
    all_pair = connection.fetchall()
    if check_pair in all_pair:
        return True
    else: 
        return False

def name_to_id(connection,name,stri=True):
    connection.execute("SELECT AuthorID FROM Author WHERE AuthorName=%s",[name])
    id = connection.fetchall()[0][0]
    if stri == True:
        return str(id)
    else:
        return id

def id_to_name(connection,id):
    connection.execute("SELECT AuthorName FROM Author WHERE AuthorID=%s",[id])
    name = connection.fetchall()[0][0]
    return name
    
def get_notification(connection,username,read=0):
    id = name_to_id(connection,username)
    connection.execute("SELECT * FROM Notification WHERE TargetID=%s AND Readed=%s",[id,read])
    notifications = connection.fetchall()
    return notifications

def change_password(conn,username, current_pw, new_pw):
    cur = conn.execute("'SELECT Passwords FROM Author WHERE AuthorName = %s",[username])
    c_password = cur.fetchone()[0]
    if hash(current_pw) == c_password:
        tupl = (hash(new_pw), username)
        conn.execute("UPDATE Author SET Passwords = %s WHERE AuthorName = %s", tupl)
        database.commit()
        print('Password updated')
    else:
        print('Wrong Password entered')

def add_notification(connection,content,targetID):
    connection.execute("INSERT INTO Notification (Content,TargetID,Readed) VALUES (%s,%s,0)",[content,targetID])
    database.commit()
    print("Notification sent")

def get_disbled(connection,user):
    res = []
    connection.execute("SELECT * FROM Finished WHERE UserID=%s",[user])
    data = connection.fetchall()
    for row in data:
        res.append(row[1])
    return res

def update_db():
    database.commit()

#testing page
# @app.route("/testing")
# def testing():
#     return "Hello World"

#pages
@app.route("/",methods=["GET","POST"])
@app.route("/index",methods=["GET","POST"])
@app.route("/home",methods=["GET","POST"])
def index():
    update_db()
    with database.cursor() as connection:
        return render_template("index.html") 

@app.route("/loading")
def loading():
    return render_template("loading.html")

@app.route("/view",methods=["GET"])
def view():
    update_db()
    with database.cursor() as connection:
        connection.execute("SELECT * FROM Survey WHERE SurveyID=%s",[request.args["survey_id"]])
        survey = connection.fetchall()[0]
        author_name = id_to_name(connection,survey[3])
        dates = survey[4]
        id = survey[0]
        return render_template("view.html",data=survey,author=author_name,survey_id=id,post_date=dates)

@app.route("/survey",methods=["GET","POST"])
def survey():
    update_db()
    if request.method == "POST":
        with database.cursor() as connection:
            data = request.form
            connection.execute("SELECT * FROM Survey WHERE AuthorID=%s",[name_to_id(connection,data["username"])])
            posted = connection.fetchall()
            return render_template("my_survey.html",surveys=posted)

@app.route("/notification",methods=["POST","GET"])
def notification():
    update_db()
    if request.method == "POST":
        data = request.form
        with database.cursor() as connection:
            unread = get_notification(connection,data["username"])
            read = get_notification(connection,data["username"],read=1)
            return render_template("notification.html",unseen=unread,seen=read)

@app.route("/profile",methods=["POST","GET"])
def profile():
    update_db()
    if request.method == "POST":
        with database.cursor() as connection:
            data = request.form
            username = data["username"]
            #get the user data
            connection.execute("SELECT Points,RegistrationDate,SurveyDone FROM Author WHERE AuthorName=%s",[username])
            data = connection.fetchall()[0]
            points = data[0]
            date = data[1]
            done = data[2]
            #get number of survey posted
            connection.execute("SELECT * FROM Survey WHERE AuthorID=%s",[name_to_id(connection,username)])
            posted = len(connection.fetchall())
            return render_template("profile.html",userid=username,point=points,survey_posted=posted,age=date,survey_done=done)

@app.route("/login")
def login():
    update_db()
    return render_template("login.html")

@app.route("/register")
def register():
    update_db()
    return render_template("register.html")

@app.route("/change",methods=["POST","GET"])
def change():
    update_db()
    if request.method == "POST":
        data = request.form
        username = data["username"]
        return render_template("change.html",name=username)
            

@app.route("/fetch",methods=["POST"])
def points():
    update_db()
    if request.method == "POST":
        data = request.get_json()
        action = data["action"]
        if action == "add_point":
            with database.cursor() as connection:
                if check_login(connection,data["id"],data["password"]):
                    connection.execute("UPDATE Author SET Points = Author.Points+1 WHERE AuthorName = %s",[data["id"]])
                    connection.execute("UPDATE Author SET SurveyDone = SurveyDone+1 WHERE AuthorName = %s",[data["id"]])
                    database.commit()
                    print("point added")
                    return "200"
                else:
                    return "Not Logged in"
        if action == "login":
            with database.cursor() as connection:
                if check_login(connection,data["id"],hash(data["password"])):
                    return dumps({"log":True,"pw":hash(data["password"])})
                else:
                    return dumps({"log":False})
        if action == "check_login":
            with database.cursor() as connection:
                if check_login(connection,data["id"],data["password"]):
                    return dumps({"log":True})
                else:
                    return dumps({"log":False})
        if action == "check_unique":
            with database.cursor() as connection:
                namelist = []
                connection.execute("SELECT AuthorName FROM Author")
                for names in connection.fetchall():
                    namelist.append(names[0])
                if data["id"] in namelist:
                    return dumps({"unique":False})
                else:
                    return dumps({"unique":True})
        if action == "register":
            with database.cursor() as connection:
                connection.execute("SET NAMES 'utf8mb4';")
                connection.execute("INSERT INTO Author (AuthorName,Passwords,Points,RegistrationDate) VALUES (%s,%s,0,%s)",(data["id"],hash(data["pw"]),get_date()))
                database.commit()
                print("registered")
                return "200"
        if action == "add_responds":
            with database.cursor() as connection:
                connection.execute("UPDATE Survey SET Responders = Survey.Responders+1 WHERE SurveyID = %s",[data["id"]])
                database.commit()
                connection.execute("SELECT Responders FROM Survey WHERE SurveyID = %s",[data["id"]])
                num = int(connection.fetchall()[0][0])
                connection.execute("SELECT AuthorID FROM Survey WHERE SurveyID = %s",[data["id"]])
                target = int(connection.fetchall()[0][0])
                if num == 1:
                    add_notification(connection,"You got your first responder!",target)
                elif num in alert_int:
                    add_notification(connection,"You received "+str(num)+"th responses!",target)
                if check_login(connection,data["user"],data["password"]):
                    connection.execute("INSERT INTO Finished (UserID,SurveyID) VALUES (%s,%s)",[name_to_id(connection,data["user"],True),data["id"]])
                database.commit()
                return "200"
        if action == "get_points":
            with database.cursor() as connection:
                try:
                    connection.execute("SELECT Points FROM Author WHERE AuthorName = %s",[data["id"]])
                    point = connection.fetchall()[0][0]
                    return dumps({"point":point})
                except Exception as e:
                    print(e)
                    return dumps({"point":" "})
        if action == "hash":
            return dumps({"hashed":hash(data["pw"])})
        if action == "seen":
            with database.cursor() as connection:
                notification_id = data["id"]
                connection.execute("UPDATE Notification SET Readed=1 WHERE ID=%s",[notification_id])
                database.commit()
                print("notification viewed")
                return "200"
        if action == "change":
            with database.cursor() as connection:
                change_password(connection,data["username"],data["opassword"],data["npassword"])
                return "200"
        if action == "create_survey":
            try:
                with database.cursor() as connection:
                    connection.execute("SET NAMES 'utf8mb4';")
                    connection.execute("INSERT INTO Survey (SurveyLink,SurveyName,AuthorID,Dates,Info) VALUES (%s,%s,%s,%s,%s)",(data["src"],data["title"],name_to_id(connection,data["author"]),get_date(),data["desc"]))
                    connection.execute("SELECT MAX(SurveyID) FROM Survey")
                    max_id = connection.fetchall()[0][0]
                    connection.execute("INSERT INTO Finished (UserID,SurveyID) VALUES (%s,%s)",(name_to_id(connection,data["author"]),max_id))
                    connection.execute("UPDATE Author SET Points=Author.Points-5 WHERE AuthorName=%s",[data["author"]])
                    add_notification(connection,"Your survey has been uploaded",name_to_id(connection,data["author"]))
                    database.commit()
                    return dumps({"reply":"Successful","state":"true"})
            except Exception as e:
                print(e)
                return dumps({"reply":str(e),"state":"false"})
        if action == "get_recomm":
            with database.cursor() as connection:
                if check_login(connection,data["Sid"],data["Spw"]):
                    disable = get_disbled(connection,name_to_id(connection,data["Sid"]))
                    connection.execute("SELECT * FROM Survey")
                    surveys = connection.fetchall()
                    res = []
                    for survey in surveys:
                        if survey[0] not in disable:
                            res.append(survey)
                    random.shuffle(res)
                    return dumps({"recomm":res})
                else:
                    connection.execute("SELECT * FROM Survey")
                    surveys = connection.fetchall()
                    random.shuffle(surveys)
                    return dumps({"recomm":surveys})


#code
if __name__ == "__main__":
    app.run(host="0.0.0.0",port=8888,debug=True)
