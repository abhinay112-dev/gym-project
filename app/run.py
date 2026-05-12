from app import create_app, db
from flask_migrate import upgrade

flask_app = create_app()

with flask_app.app_context():
    upgrade()

if __name__ == '__main__':
    flask_app.run(host='0.0.0.0', debug=True)