FROM nginx:stable-alpine as production-stage
COPY ./data/ /usr/share/nginx/html/
ADD nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
