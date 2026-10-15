FROM 192.168.1.144:9000/lib/nginx:latest
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

WORKDIR /app/funds
ADD dist/  /app/funds
COPY nginx/default.conf /etc/nginx/nginx.conf
EXPOSE 80
ENTRYPOINT nginx -g "daemon off;"
