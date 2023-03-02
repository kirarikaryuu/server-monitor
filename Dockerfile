# 指定镜像
FROM node
# 在镜像容器中 创建 一个 目录 
RUN mkdir -p /home/server
# 把新建的目录指定为工作目录 
WORKDIR /home/server
# 复制本机内容到 容器内部的 工作目中 , " . " 是指 dockerfile 文件 相对的当前目录下的所有文件 , 当然你也可以 指定目录
COPY . /home/server
# 指定下载依赖淘宝镜像 , 学过前端都懂吧~
RUN npm config set registry https://registry.npm.taobao.org
# 习惯了使用cnpm ~~
RUN npm i cnpm -g
# 安装依赖 
RUN cnpm i
# 对本机暴露一个 3000端口 , 我的代码是写死了 启用3000 端口的 , 所以这里要使用3000
EXPOSE 3000
# 在镜像运行时候 , 执行安装依赖以及启动命令
CMD cnpm i&&  npm run dev
# docker run -itd --name server-monitor --network bridge --ip 172.17.0.2 tomcat
# docker network create --subnet=192.168.19.0/24 test
# docker run -itd --network=test --ip 192.168.19.233 --name test-ws server-monitor
# docker network create --subnet=192.168.210.0/24 --gateway=192.168.210.1 bridge2
# docker run -itd --name=test-ws  --net=bridge2 --ip=192.168.210.3 server-monitor
# docker network create --subnet=172.18.0.0/16 mynetwork
# docker run -itd --name ws-test --net mynetwork --ip 172.18.0.2 server-monitor