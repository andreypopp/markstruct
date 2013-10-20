all: ./build ./build/index.html ./build/assets ./build/assets/bundle.compressed.js

publish: clean all
	(cd ./build; git init; \
		git add .; \
		git commit -m 'init'; \
		git push -f git@github.com:andreypopp/markstruct.git master:gh-pages)

clean:
	rm -rf ./build

./build:
	mkdir -p build

./build/assets:
	mkdir -p build/assets
	../node_modules/.bin/react-app \
		--transform dgraph-stylus \
		-o ./build/assets \
		bundle ./index.jsx

./build/assets/bundle.compressed.js: ./build/assets/bundle.js
	uglifyjs $< > $@

./build/index.html:
	echo '' > $@
	echo '<html>' >> $@
	echo '	<head>' >> $@
	echo '		<link rel="stylesheet" href="assets/bundle.css" />' >> $@
	echo '		<script src="assets/bundle.compressed.js"></script>' >> $@
	echo '		<script>' >> $@
	echo '			global = self;' >> $@
	echo '			require("react-app/runtime/browser").injectAssets({"stylesheets":["assets/bundle.css"],"scripts":["assets/bundle.compressed.js"]});' >> $@
	echo '			require("./index.jsx").start();' >> $@
	echo '		</script>' >> $@
	echo '	</head>' >> $@
	echo '	<body>' >> $@
	echo '	</body>' >> $@
	echo '</html>' >> $@
