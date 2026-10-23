FROM nginx:alpine

# nginx.conf is generated at startup from the template: the official image
# replaces ${HOMELAB_HOST} with the value from the environment (.env).
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template
COPY conf.d /etc/nginx/conf.d
