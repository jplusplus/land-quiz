install:
	npm install; bower install

build:
	gulp

serve:
	gulp serve

deploy:
	rsync --recursive --delete --verbose dist/ "dh:~/www/koizo.org/dialekt/"

clean:
	rm -fr dist/

