from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/Chocolate_DB"
db = SQLAlchemy(app)

# https://stackabuse.com/using-sqlalchemy-with-flask-and-postgresql/ 
class dependency(db.Model):
    __tablename__ = 'dependency_num'
    id_num = db.Column(db.Integer, primary_key=True)
    company_location = db.Column(db.String())
    country_of_bean_origin = db.Column(db.String())
    sum_num = db.Column(db.Integer)

class donut(db.Model):
    __tablename__ = 'donut_top10'
    id_num = db.Column(db.Integer, primary_key=True)
    company_location = db.Column(db.String())
    cocoa_percent = db.Column(db.Integer())
    rating = db.Column(db.Float)

class scatterplot(db.Model):
    __tablename__ = 'scatterplot_chart'
    ID = db.Column(db.Integer, primary_key=True)
    company_location = db.Column(db.String())
    country_of_bean_origin = db.Column(db.String())
    rating = db.Column(db.Float())

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/dependency_chart', methods = ['GET'])
def retrieve():
    information = dependency.query.all()
    results = [
        {
            "origin": info.country_of_bean_origin,
            "destination": info.company_location,
            "count": info.sum_num

        } for info in information]
    return {"results": results} # ----> puts resutls in json in flask

@app.route('/donut_top10', methods = ['GET'])
def retrievedonut():
    information = donut.query.all()
    results = [
        {
            "ID": info.id_num,
            "company_location": info.company_location,
            "cocoa_percent": info.cocoa_percent,
            "rating" : info.rating
        } for info in information]
    return {"results": results} # ----> puts resutls in json in flask

@app.route('/scatterplot_chart', methods = ['GET'])
def retrieve_scatter():
    information = scatterplot.query.all()
    results = [
        {
            "ID": info.ID,
            "company_location": info.company_location,
            "country_of_bean_origin": info.country_of_bean_origin,
            "rating":info.rating
        } for info in information]
    return {"results": results} # ----> puts resutls in json in flask


    
if __name__ == '__main__':
    app.run(debug=True)