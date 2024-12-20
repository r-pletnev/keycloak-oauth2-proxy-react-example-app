
.PHONY: export_realm
export_realm:
	docker exec -it keycloak sh -c \
		"cp -rn /opt/keycloak/data/h2 /tmp ; \
		mkdir -p /tmp/kc_data ; \
		/opt/keycloak/bin/kc.sh export --realm oauth2-proxy --dir /tmp/kc_data \
		--db dev-file \
		--db-url 'jdbc:h2:file:/tmp/h2/keycloakdb;NON_KEYWORDS=VALUE'"

.PHONY: copy_realm
copy_realm:
	docker cp keycloak:/tmp/kc_data/oauth2-proxy-realm.json keycloak/
	docker cp keycloak:/tmp/kc_data/oauth2-proxy-users-0.json keycloak/

.PHONY: dump
dump:
	-$(MAKE) export_realm
	$(MAKE) copy_realm

