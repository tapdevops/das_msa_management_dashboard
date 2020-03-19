# Set NodeJS version
FROM oraclelinux:7-slim

# Install Required Plugin
RUN yum update -y && \
	yum install -y oracle-release-el7 && \
	yum install -y oracle-nodejs-release-el7 && \
	yum install -y nodejs && \
	yum install -y oracle-instantclient19.3-basic.x86_64 && \
	yum clean all && \
	node --version && \
	npm --version && \
	npm install oracledb && \
    npm install -g nodemon && \
	echo Installed

# User Setup
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app

# Install required packages
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Setup port
EXPOSE 4015

# Running command
CMD [ "nodemon", "server.js" ]