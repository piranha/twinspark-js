CCOPTS := --language_out ECMASCRIPT6

min: dist/twinspark.min.js
adv: dist/twinspark.adv.js
type: CCOPTS := $(CCOPTS) --jscomp_warning=reportUnknownTypes
type: dist/twinspark.adv.js

dist/%.min.js: %.js
	@mkdir -p $(@D)
	google-closure-compiler $(CCOPTS) $^ > $@

dist/%.adv.js: %.js
	@mkdir -p $(@D)
	google-closure-compiler -O ADVANCED $(CCOPTS) $^ > $@

serve:
	darkhttpd . --port 3000 --addr 127.0.0.1

w:
	gostatic -w gostatic.config
