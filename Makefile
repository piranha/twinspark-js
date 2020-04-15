CCOPTS = --language_out ECMASCRIPT_2019

min: twinspark.min.js
adv: twinspark.adv.js

%.min.js: %.js
	closure-compiler $(CCOPTS) $*.js > $@

%.adv.js: %.js
	closure-compiler -O ADVANCED $(CCOPTS) $*.js > $@
