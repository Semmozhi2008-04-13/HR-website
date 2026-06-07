from . import app

if __name__ == "__main__":
    # Run the Flask app created in app/__init__.py
    app.run(host="127.0.0.1", port=8000, debug=True)
