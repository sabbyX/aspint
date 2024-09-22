Mono Repo for Aspire

- api/ contains internal api, connects all listeners, bots, frontend, and stuff
- tls-listener/ crawlers for tls-contact 
- .mongo/ contains conf stuff for mongo database
- notifier/ telegram bot 
- app/ Next.js frontend

Building

docker compose up --build -d
