# simplefiledrop
A very simple web filedrop made using python's module flask and some JS.
Just pick the file and boom, done! You now have a link.
This filedrop runs a job every hour to check the uploads directory and if it's over the max limit then it will start deleting old files.

## Installation and running:
git clone https://github.com/Jan64X/simplefiledrop.git
cd simplefiledrop/src
pip3 install flask
python3 app.py &

## Customization
You can customize the options in the app.py file, stuff like max file size and max size for the upload directory before it starts deleting the oldest files.

## Demo
You can test the demo [here](https://filedrop.dotbin.dev/)
