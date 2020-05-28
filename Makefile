CCOPTS = --language_out ECMASCRIPT6 #--jscomp_warning=reportUnknownTypes

min: dist/twinspark.min.js
adv: dist/twinspark.adv.js

dist/%.min.js: %.js
	@mkdir -p $(@D)
	closure-compiler $(CCOPTS) $*.js > $@

dist/%.adv.js: %.js
	@mkdir -p $(@D)
	closure-compiler -O ADVANCED $(CCOPTS) $*.js > $@

serve:
	darkhttpd . --port 3000
