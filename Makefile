run:
	lessc css/main.less css/main.css
	browserify --debug js/main.js -o build/bundle.js
	python simple_server.py