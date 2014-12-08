FROM ubuntu:14.04
RUN apt-get update
RUN apt-get -y dist-upgrade
RUN apt-get -y install curl tar
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get -y install nodejs