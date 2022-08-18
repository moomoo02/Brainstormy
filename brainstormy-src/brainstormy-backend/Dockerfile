# pull official base image
FROM node:16

# set working directory
WORKDIR /usr/src/app

# add executable commands from node
# ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package*.json ./
# COPY package-lock.json ./
RUN npm install

# add app
COPY . .

# Open port 
EXPOSE 8080

# start app
CMD ["npm", "start"]