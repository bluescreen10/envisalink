FROM ubuntu:14.04
RUN apt-get update
RUN apt-get -y dist-upgrade
RUN apt-get -y install curl tar git sudo
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get -y install nodejs
RUN useradd -u 1000 -d /home/envisalink -m -s /bin/bash envisalink
RUN echo "envisalink\tALL=(ALL)\tNOPASSWD: ALL\n" >> /etc/sudoers
RUN mkdir /apps
RUN chown envisalink /apps
WORKDIR /apps
USER envisalink
ENV HOME /home/envisalink
RUN git clone https://github.com/bluescreen10/envisalink.git
WORKDIR /apps/envisalink
ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/apps/envisalink/node_modules/.bin
