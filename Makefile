.PHONY: build-dev
build-dev:
	npm run build:dev --prefix ./ui
	cp ./ui/dist/resources/Cluster-API/ui/extensions.js /tmp/extensions/capi

.PHONY: publish
publish:
	cd ../argo-ui; yalc publish && yalc add argo-ui
