CCOPTS = --language_out ECMASCRIPT_2017 --jscomp_warning=reportUnknownTypes

min: dist/twinspark.min.js
adv: dist/twinspark.adv.js

dist/%.min.js: %.js
	@mkdir -p $(@D)
	closure-compiler $(CCOPTS) $*.js > $@

dist/%.adv.js: %.js
	@mkdir -p $(@D)
	closure-compiler -O ADVANCED $(CCOPTS) $*.js > $@
