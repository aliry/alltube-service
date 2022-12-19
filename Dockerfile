FROM node:16-alpine 

RUN apk update
RUN apk add
RUN apk add ffmpeg
RUN apk add python3

WORKDIR /app

COPY . .

# Install deps
RUN npm install

# Build dist
RUN npm run build

ENV NODE_ENV=production

# Expose port 3000
EXPOSE 3000
CMD ["npm", "start"]
