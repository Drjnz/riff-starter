# Studio Riff, projet de départ EC4

API de réservation des salles de répétition, en TypeScript avec Hono et Valibot. Elle tourne sur Node.js 20.19 ou plus récent. Il n'y a pas de base de données. Les données vivent en mémoire et repartent de `src/adapters/seed.ts` à chaque démarrage. Toutes les heures sont en UTC.

Le sujet de l'épreuve, avec le barème et les allègements du tiers temps, est dans [`SUJET.md`](SUJET.md). Ce fichier explique comment lancer le projet.

## Lancer le projet

Choisissez le gestionnaire de paquets que vous avez déjà. Les scripts sont les mêmes partout.

Avec npm, livré avec Node :

```sh
npm install
npm run dev          # ouvrez http://localhost:3000 dans le navigateur
npm test
npm run typecheck
```

Avec pnpm :

```sh
pnpm install
pnpm dev
pnpm test
```

Avec Bun, qui sait aussi lancer les scripts :

```sh
bun install
bun run dev
bun run test
```

Sans rien installer d'autre que Docker :

```sh
docker run --rm -it -v "$PWD":/app -w /app -p 3000:3000 node:26 \
  sh -c 'npm install && npm run dev'
```

`PORT` change le port d'écoute, 3000 par défaut. `npm start` lance le serveur sans le mode watch.

Les tests utilisent Vitest. `npm run test:watch` les relance à chaque modification.

## Endpoints

| Méthode | Chemin | Réponses |
| ------- | ------ | -------- |
| GET | `/rooms` | 200 |
| GET | `/rooms/:roomId/bookings` | 200, 400 |
| GET | `/rooms/:roomId/bookings/:from/:to` | 200, 400 |
| POST | `/rooms/:roomId/createBooking` | 200, 400, 403, 409 |
| GET | `/openapi.json` | description OpenAPI 3.1 générée depuis les routes |
| GET | `/` | redirige vers `/docs` |
| GET | `/docs` | interface Scalar, pour essayer l'API depuis le navigateur |

Une réservation dure de 1 h à 4 h. Elle commence à une heure pleine, entre l'ouverture à 10 h et la fermeture à 23 h, et dans le futur. Deux réservations d'une même salle ne se chevauchent pas. Un créneau peut commencer à l'heure exacte où le précédent finit.

Pour l'instant, ces horaires et ces durées sont écrits en dur dans `src/domain/slot.ts`. Le fichier `studio.toml` contient les mêmes valeurs, mais aucun code ne le lit encore.

Toutes les erreurs ont la forme `{ "error": { "code": "...", "message": "..." } }`.

## Simuler plusieurs clients

Il n'y a pas d'authentification sur l'API publique. Deux en-têtes permettent à votre machine de se faire passer pour plusieurs clients et plusieurs membres.

| En-tête | Effet | Absent |
| ------- | ----- | ------ |
| `X-Fake-Client-Ip` | L'IP du client | `127.0.0.1` |
| `X-Fake-User-Id` | Le membre connecté, `member-1`, `member-2` ou `member-3` | Client anonyme, qui ne peut pas réserver |

La réservation est faite au nom du membre de l'en-tête. Le corps contient seulement `start` et `end`.

C'est une simulation locale. En production, l'identité viendrait d'un jeton vérifié et l'IP d'un proxy de confiance.

```sh
curl localhost:3000/rooms

curl localhost:3000/rooms/room-1/bookings/2026-11-01T00:00:00Z/2026-12-01T00:00:00Z

curl -i -X POST localhost:3000/rooms/room-1/createBooking \
  -H 'Content-Type: application/json' \
  -H 'X-Fake-User-Id: member-2' \
  -H 'X-Fake-Client-Ip: 203.0.113.7' \
  -d '{"start":"2026-12-05T18:00:00Z","end":"2026-12-05T20:00:00Z"}'
```

Sans terminal, ouvrez http://localhost:3000. Vous arrivez sur Scalar, dans `/docs`. Chaque route y a un bouton pour envoyer une requête, et les deux en-têtes `X-Fake-*` se remplissent dans le formulaire de la requête. Quand vous ajoutez une route documentée, elle y apparaît sans rien configurer.

## Raccourcis voulus, défauts cachés

Pour que l'épreuve tienne en 4 h, ce projet prend des raccourcis **volontaires**. Ce ne sont pas des erreurs à corriger, ne perdez pas de temps dessus :

- les en-têtes `X-Fake-Client-Ip` et `X-Fake-User-Id` remplacent une vraie authentification et un vrai proxy. Gardez-les, vos tests en ont besoin pour simuler plusieurs clients ;
- l'API publique n'a pas d'authentification ;
- les données sont en mémoire, sans base de données ni Docker Compose, et repartent de zéro à chaque démarrage ;
- les identifiants sont séquentiels (`booking-4`, `booking-5`…) ;
- il n'y a qu'une seule fonctionnalité, la réservation de salles.

En dehors de cette liste, le code contient aussi des **défauts cachés**, de conception d'API ou d'architecture. Ils ne sont signalés nulle part, ni dans ce fichier, ni dans les commentaires, ni dans les tests, qui décrivent le comportement actuel, défauts compris. À vous de les trouver.

Pour chaque défaut trouvé, remplissez une ligne de la section prévue dans `DECISIONS.md` : où il est, pourquoi c'est un problème, ce que vous changez. Corrigez-le ensuite dans un commit à part, en mettant à jour les tests et la description OpenAPI. Si vous manquez de temps, un défaut bien décrit mais pas corrigé rapporte quand même une partie des points. Un raccourci de la liste ci-dessus « corrigé » n'en rapporte aucun.

## Organisation

```
src/
  domain/      Slot, Booking, Room, erreurs métier, ports (interfaces des dépôts, Clock)
  use-cases/   ListRooms, ListRoomBookings, BookRoom, une classe avec une méthode execute
  adapters/    dépôts en mémoire, données de départ, horloges
  http/        routes, middleware d'identité simulée, schémas Valibot, erreurs vers HTTP, OpenAPI
  build-app.ts racine de composition, tout est branché à la main
  main.ts      démarre le serveur Node
test/          tests unitaires (Slot, BookRoom) et tests HTTP (app.request)
studio.toml    horaires d'ouverture et durées de créneau
SUJET.md       le sujet de l'épreuve et son barème
DECISIONS.md   modèle à remplir : incidents, défauts trouvés, API d'administration, ADR
```

Le domaine lève des exceptions (`InvalidSlot`, `SlotTaken`, `RoomNotFound`, `UnknownMember`). Un seul `app.onError`, dans `src/http/errors.ts`, les traduit en statut HTTP. L'heure courante passe par l'interface `Clock`. Les tests utilisent `FixedClock`.

La racine de composition est `src/build-app.ts`. C'est là qu'on crée les objets et qu'on les passe aux cas d'usage et aux routes. Les middlewares HTTP vivent dans `src/http/`. L'appelant courant est disponible dans chaque handler avec `c.get('caller')`.
