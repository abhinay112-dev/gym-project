from flask import render_template, request, redirect, url_for, jsonify,session

from flask_login import login_user , logout_user,current_user,login_required
from models import User 
from app import client 
from datetime import date
import random

def register_routes(app,db,bcrypt):
    QUOTES = [
    {"quote": "The only bad workout is the one that didn't happen.", "author": "Unknown"},
    {"quote": "Push yourself, because no one else is going to do it for you.", "author": "Unknown"},
    {"quote": "Success usually comes to those who are too busy to be looking for it.", "author": "Henry David Thoreau"},
    {"quote": "All progress takes place outside the comfort zone.", "author": "Michael John Bobak"},
    {"quote": "No matter how slow you go, you are still lapping everybody on the couch.", "author": "Unknown"},
    {"quote": "The body achieves what the mind believes.", "author": "Unknown"},
    {"quote": "Don't limit your challenges — challenge your limits.", "author": "Jerry Dunn"},
    {"quote": "Strength does not come from the body. It comes from the will of the soul.", "author": "Gandhi"},
    {"quote": "Take care of your body. It's the only place you have to live.", "author": "Jim Rohn"},
    {"quote": "The pain you feel today will be the strength you feel tomorrow.", "author": "Arnold Schwarzenegger"},
    {"quote": "Your body can stand almost anything. It's your mind that you have to convince.", "author": "Unknown"},
    {"quote": "Energy and persistence conquer all things.", "author": "Benjamin Franklin"},
    {"quote": "If you want something you've never had, you must do something you've never done.", "author": "Thomas Jefferson"},
    {"quote": "The difference between try and triumph is just a little umph!", "author": "Marvin Phillips"},
    {"quote": "Well done is better than well said.", "author": "Benjamin Franklin"},
    {"quote": "The harder the battle, the sweeter the victory.", "author": "Les Brown"},
    {"quote": "A champion is someone who gets up when they can't.", "author": "Jack Dempsey"},
    {"quote": "Fall seven times, stand up eight.", "author": "Japanese Proverb"},
    {"quote": "It's not about having time. It's about making time.", "author": "Unknown"},
    {"quote": "Discipline is the bridge between goals and accomplishment.", "author": "Jim Rohn"},
   ]


    def get_daily_quote():
        """Return a deterministic quote based on today's date (same quote all day)."""
        today = date.today()
        index = (today.year * 365 + today.month * 31 + today.day) % len(QUOTES)
        return QUOTES[index]
    @app.route("/")
    @app.route("/home")
    def home():
        quote = get_daily_quote()
        return render_template(
            "home.html",
            quote={"text": quote["quote"], "author": quote["author"]},
            show_chatbot=False,   # chatbot disabled on home
        )


    # ─── Daily Quote API ───────────────────────────────────────────────
    @app.route("/api/daily-quote")
    def api_daily_quote():
        """
        GET /api/daily-quote          → today's fixed quote
        GET /api/daily-quote?refresh=1 → random different quote
        """
        refresh = request.args.get("refresh", "0") == "1"

        if refresh:
            # Pick a random quote different from today's
            daily = get_daily_quote()
            pool = [q for q in QUOTES if q["quote"] != daily["quote"]]
            chosen = random.choice(pool)
        else:
            chosen = get_daily_quote()

        return jsonify({"quote": chosen["quote"], "author": chosen["author"]})


    # ─── Pre-Workout Form ──────────────────────────────────────────────
    @app.route("/api/pre-modal", methods=["POST"])
    def api_pre_workout():
        """Save pre-workout check-in data."""
        data = request.get_json(silent=True) or {}

        # TODO: Save to your database here
        # Example fields: date, time, workout_type, energy_level, sleep_hours, meal, goal, notes
        print("[Pre-workout check-in]", data)

        return jsonify({"status": "ok", "message": "Pre-workout check-in saved."})


    # ─── Post-Workout Form ─────────────────────────────────────────────
    @app.route("/api/post-modal", methods=["POST"])
    def api_post_workout():
        """Save post-workout review data."""
        data = request.get_json(silent=True) or {}

        # TODO: Save to your database here
        # Example fields: duration, calories, rating, fatigue, completion, nutrition, highlights, notes
        print("[Post-workout review]", data)

        return jsonify({"status": "ok", "message": "Session logged successfully."})

    @app.route('/chatbot-api', methods=['POST'])
    def chatbot_api():
        data = request.json
        user_input = data.get("message", "")
        context = data.get("context", "").strip()
        if not context:
            return jsonify({"reply": "I couldn't read the page content. Please refresh and try again."})

        prompt = f"""
        You are a helpful gym assistant for GymBhai website.
        Answer ONLY using this page content:
        {context}

        If the answer is not in the content, say:
        "I can only answer questions about this page's content."

        Question: {user_input}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful gym assistant. Only answer based on the given page context."},
                {"role": "user", "content": prompt}
            ]
        )
        return jsonify({"reply": completion.choices[0].message.content})


    @app.route("/arms")
    def arms():
        return render_template("arms.html", show_chatbot=True)

    @app.route("/legs")
    def legs():
        return render_template("legs.html", show_chatbot=True)

    @app.route("/abs")
    def abs_page():
        return render_template("arms.html", show_chatbot=True)

    @app.route("/cardio")
    def cardio():
        return render_template("cardio.html", show_chatbot=True)
    @app.route('/form')
    def form():
        if request.method =='GET':
            return render_template('form.html')
        elif request.method =='POST':
            name = request.form.get('name')
            email = request.form.get('email')
            password = request.form.get('password')
            hashed_password=bcrypt.generate_password_hash(password)
            user=User(username= username,password=hashed_password,email=email)
            db.session.add(user)
            db.session.commit()
            return redirect(url_for('index'))
    
    @app.route('/signup',methods=['GET','POST'])
    def signup():
        if request.method =='GET':
            return render_template('signup.html')
        elif request.method =='POST':
            username = request.form.get('username')
            email = request.form.get('email')
            password = request.form.get('password')
            hashed_password=bcrypt.generate_password_hash(password)
            user=User(username=username,password=hashed_password,email=email)
            db.session.add(user)
            db.session.commit()
            return redirect(url_for('index'))
        

    @app.route('/login',methods=['GET','POST'])
    def login():
        if request.method =='GET':
            return render_template('login.html')
        elif request.method =='POST':
            username = request.form.get('username')
            password = request.form.get('password')
            user=User.query.filter(User.username==username).first()
            if bcrypt.check_password_hash(user.password,password):
                login_user(user)
                return redirect(url_for('index'))
            else:
                return 'Failed'

    @app.route('/logout')
    def logout():
       logout_user()
       return redirect(url_for('index'))

    @app.route('/secert')
    @login_required
    def secert():
        return  'seceret message ;>'