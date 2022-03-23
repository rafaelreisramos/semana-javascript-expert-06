# Heroku deploy

## Install

- create a heroku.yml configuration file

```yml
build:
  docker:
    web: Dockerfile
  config:
    PORT: 3000

run:
  web: npm start
```

- install heroku cli
  - `npm i -g heroku`

## Login and App Creation

- login heroku
  - `heroku login`
- create heroku app
  - `heroku apps:create rafaelreisramos-spotify-radio`
- add heroku remote repository
  - `git remote add heroku https://git.heroku.com/rafaelreisramos-spotify-radio.git`
- check remote git repository
  - `git remote -v`
- deploy our app as a container
  - `heroku stack:set container`
- push git repository to heroku
  - `git push -u heroku main`

## Starting Our App

- start app
  - `heroku open`
- checking our logs
  - `heroku logs -t -a rafaelreisramos-spotify-radio`

## Removing our app from heroku

- remove our app
  - `heroku apps:delete`
