# EC4, module API : Studio Riff, la console d'administration

Épreuve individuelle sur ordinateur, 4 h. On vous donne une API qui fonctionne. Vous lui ajoutez une API d'administration.

Vous pouvez consulter le projet développé pendant le cours et la documentation en ligne. Les assistants et agents IA sont interdits.

Les étudiants qui bénéficient d'un tiers temps composent dans la même durée sur un sujet allégé. Les allègements sont signalés dans les étapes par « Tiers temps », et le barème a une colonne pour eux.

## Le contexte

L'API de réservation de Studio Riff est en ligne depuis un mois. Elle tourne sur un seul petit serveur, et ça se voit.

Trois choses sont arrivées la semaine dernière.

Lundi, un membre a écrit un script pour guetter les créneaux libres du samedi. Son script appelait le planning plusieurs fois par seconde. L'API est devenue lente pour tout le monde pendant une heure.

Mercredi, le bénévole a bricolé une limite dans le code, puis il a redémarré le serveur. Le soir même, six groupes répétaient dans le local et réservaient depuis le wifi de l'association. Ils ont tous été bloqués ensemble. Il a fallu retirer la limite, redéployer, et appeler les groupes un par un.

Vendredi, l'association a signé avec une salle de concert partenaire. Son site va afficher nos disponibilités. On ne sait pas encore combien de visiteurs il aura.

Le bureau de l'association a tranché. Il ne veut plus de règle de limitation fixée dans le code. Il veut pouvoir **changer la manière dont l'API limite ses clients pendant qu'elle tourne**, sans redéploiement, sans redémarrage, depuis une API d'administration. Il ne sait pas encore quelle règle sera la bonne. Il sait seulement qu'elle changera, peut-être plusieurs fois dans la même soirée.

Deux personnes s'en occuperont. Le bénévole technique change les règles. La trésorière veut seulement voir ce qui est en place et ce qui a changé. Elle ne doit rien pouvoir modifier.

## Ce qu'on vous donne

Le dépôt `ec4-studio-riff-starter`, en TypeScript avec Hono, qui tourne sur Node.js. Il expose une seule fonctionnalité, la réservation de salles. Voici ses routes telles qu'elles sont aujourd'hui :

```text
GET  /rooms                                   → 200
GET  /rooms/:roomId/bookings                  → 200 | 400
GET  /rooms/:roomId/bookings/:from/:to        → 200 | 400
POST /rooms/:roomId/createBooking             → 200 | 400 | 403 | 409
GET  /openapi.json                            → la description OpenAPI de l'API publique
GET  /                                       → redirige vers /docs
GET  /docs                                    → l'interface Scalar
```

Le README explique comment le lancer et le tester, avec npm, pnpm, Bun ou Docker. Lisez le code avant d'écrire quoi que ce soit. Vous gardez ce langage et ce framework.

Le code fourni contient des raccourcis voulus et des défauts cachés. Le README liste les raccourcis : les en-têtes `X-Fake-*`, l'absence de base de données et d'authentification sur l'API publique, les identifiants séquentiels. Ils sont là pour que l'épreuve tienne en 4 h, ne les corrigez pas. Les défauts cachés, eux, ne sont signalés nulle part. Ce sont des défauts de conception d'API ou d'architecture, et les tests fournis décrivent le comportement actuel, défauts compris. Trouvez-les, décrivez-les dans la section prévue de `DECISIONS.md`, puis corrigez-les. C'est compté dans C14.

### Simuler plusieurs clients depuis votre machine

Pendant l'épreuve, toutes vos requêtes partent de la même machine. Pour faire comme si elles venaient de clients différents, le projet lit deux en-têtes :

| En-tête | Effet | Absent |
| ------- | ----- | ------ |
| `X-Fake-Client-Ip` | Remplace l'adresse IP du client | `127.0.0.1` |
| `X-Fake-User-Id` | Désigne le membre connecté, par exemple `member-2` | Client anonyme |

```sh
curl -H 'X-Fake-Client-Ip: 10.0.0.7' -H 'X-Fake-User-Id: member-2' \
  http://localhost:3000/rooms
```

Ces en-têtes sont un raccourci d'épreuve, pas un défaut. En production, l'identité viendrait d'un jeton vérifié et l'IP d'un proxy de confiance. Ici, traitez-les comme s'ils étaient fiables. Votre limitation doit s'appuyer sur eux, et vos tests en ont besoin pour simuler plusieurs clients.

## Ce qu'on attend de l'API publique

Peu de choses sont imposées. Elles servent à corriger toutes les copies de la même façon.

- Une requête refusée par la limitation reçoit `429` et un en-tête `Retry-After` en secondes.
- Une requête acceptée se comporte comme avant votre travail, sauf pour les défauts que vous avez corrigés et décrits dans `DECISIONS.md`.
- Les routes `/`, `/openapi.json` et `/docs` de l'API publique ne sont jamais limitées.
- Quand l'administration change la règle, les requêtes suivantes suivent la nouvelle règle, sans redémarrage.

Tout le reste est à vous : comment on décide quels clients partagent un même quota, comment ce quota se reconstitue, ce que l'administration peut régler, et ce qu'il advient des compteurs au moment d'un changement.

## Travail demandé

1. **Comprendre le besoin.** Le dépôt contient un modèle de `DECISIONS.md`, remplissez-le au fil de l'épreuve. Relisez les trois incidents. Dans la première section, écrivez pour chacun la règle de limitation qui l'aurait évité, et ce qu'elle aurait cassé ailleurs. Il n'existe pas de règle unique qui règle les trois. C'est la raison pour laquelle le bureau veut pouvoir en changer.

2. **Concevoir l'API d'administration, contrat d'abord.** Avant d'écrire le code, écrivez sa description OpenAPI 3.1 dans `admin-openapi.yaml`. Elle doit permettre au moins de :
   - consulter la règle en place ;
   - la remplacer par une autre ;
   - consulter l'historique des changements : qui, quand, avant, après.

   Vous choisissez les ressources, les URL, les méthodes, les codes de statut et la forme des corps. Une règle invalide doit être refusée avec un message qu'un bénévole comprend. Pensez au cas où le bénévole et quelqu'un d'autre modifient la règle au même moment. Justifiez vos choix de ressources et de codes dans un ADR.

   _Tiers temps : pas d'historique. La modification simultanée est seulement décrite dans un ADR._

3. **Protéger l'administration par clé d'API.** Les deux personnes ont chacune leur clé. La trésorière peut tout lire et ne peut rien modifier. Les clés ne figurent pas dans le code, et une clé absente, inconnue ou insuffisante reçoit une réponse distincte. L'API d'administration ne doit pas être joignable par les mêmes chemins que l'API publique, et la limitation ne doit jamais bloquer l'administration elle-même. Sinon, le bénévole ne peut plus corriger une mauvaise règle.

   _Tiers temps : une seule clé, sans distinction de droits. Une clé absente et une clé inconnue reçoivent quand même des réponses distinctes._

4. **Sortir les horaires du code.** Les horaires changent l'été, et le bureau veut les modifier sans développeur. Aujourd'hui, l'ouverture, la fermeture et les durées minimale et maximale d'un créneau sont écrites en dur dans `src/domain/slot.ts`. Le fichier `studio.toml` contient déjà ces valeurs. Faites en sorte que l'API les lise au démarrage.

   Écrivez le lecteur vous-même, sans bibliothèque TOML. Il lit seulement ce dont `studio.toml` a besoin : des sections `[nom]`, des clés `nom = entier`, des commentaires `#` et des lignes vides. Une valeur absente ou mal écrite empêche le démarrage avec un message qui donne le numéro de ligne. Des valeurs incohérentes aussi, par exemple une ouverture après la fermeture ou une durée minimale plus grande que la maximale. Le domaine ne doit pas savoir que ces valeurs viennent d'un fichier.

5. **Implémenter.** Ajoutez la limitation et l'API d'administration au projet fourni, en respectant ses couches. Ajouter une nouvelle manière de limiter ne doit pas obliger à modifier le code qui reçoit les requêtes publiques. Dans un ADR, dites où vit la règle courante, comment un changement atteint les requêtes en cours, et ce que vous faites des compteurs existants au moment d'un changement.

6. **Prouver que ça marche.** Écrivez des tests automatisés, lancés par `npm test` :
   - des tests unitaires de chaque manière de limiter, avec une horloge fixe et sans attente réelle ;
   - des tests HTTP de l'API d'administration : clés, droits, règle invalide, historique ;
   - au moins un test qui rejoue un des trois incidents avec les en-têtes `X-Fake-*`, change la règle par l'API d'administration au milieu du test, et vérifie que le comportement change ;
   - des tests unitaires de votre lecteur TOML, valeurs invalides comprises.

   Dans `REPORT.md`, collez la sortie des tests et expliquez un résultat qui vous a surpris, ou un cas limite que vos tests ont révélé.

   _Tiers temps : ni le test qui rejoue un incident, ni les tests du lecteur TOML._

7. **Documenter pour l'équipe suivante.** Servez `admin-openapi.yaml` dans une interface de documentation, à côté de celle de l'API publique. Ajoutez la réponse `429` et l'en-tête `Retry-After` à la description de l'API publique. Un exemple de requête et de réponse par opération suffit.

Complétez enfin `README.md` : comment configurer les clés, lancer l'API et ses tests, et un exemple `curl` qui change la règle.

## Livrables

Un dépôt Git avec des commits réguliers. Il contient :

- le code et les tests ;
- `admin-openapi.yaml` ;
- le lecteur de `studio.toml` et ses tests ;
- `DECISIONS.md`, rempli à partir du modèle fourni, avec au moins deux ADR et la liste des défauts trouvés ;
- `REPORT.md` ;
- `README.md` à jour, et un `.env.example` sans vraie clé.

## Barème sur 20

La colonne « Tiers temps » donne le barème du sujet allégé. Un tiret signale un critère qui n'est pas demandé.

| Compétence | Critère | Points | Tiers temps |
| ---------- | ------- | -----: | ----------: |
| C14 Conception | Les trois incidents sont analysés, chaque règle proposée a sa contrepartie | 2 | 2,5 |
| | Les ressources, méthodes et codes de l'API d'administration sont cohérents et justifiés | 2 | 2,5 |
| | Une règle invalide est refusée, la modification simultanée est traitée | 1,5 | 1,5 |
| | La règle change sans redémarrage, et l'API publique accepte comme avant | 1 | 2 |
| | Une nouvelle manière de limiter s'ajoute sans toucher au code des routes publiques, les couches sont respectées, les défauts du code fourni sont repérés | 1,5 | 2,5 |
| | Les valeurs de `studio.toml` sont lues et vérifiées au démarrage, le domaine ignore d'où elles viennent | 1,5 | 1 |
| C15 Sécurité | Les clés sont hors du code, une clé absente, inconnue ou insuffisante reçoit une réponse distincte | 1,5 | 2 |
| | Les droits de la trésorière et du bénévole sont appliqués côté serveur | 1,5 | — |
| | La limitation ne bloque ni l'administration ni la documentation, l'administration n'est pas exposée sous les chemins publics | 1 | 1 |
| C16 Tests | Les manières de limiter ont des tests unitaires avec une horloge fixe | 1,5 | 2 |
| | L'API d'administration a des tests HTTP, cas d'erreur compris | 1,5 | 1,5 |
| | Un incident est rejoué avec un changement de règle en cours de test | 1 | — |
| | Le lecteur TOML a des tests unitaires, valeurs invalides comprises | 1 | — |
| | `REPORT.md` analyse un résultat, pas seulement une sortie copiée | 0,5 | 0,5 |
| C17 Documentation | `admin-openapi.yaml` est valide, servi, et correspond à ce que l'API fait | 0,5 | 0,5 |
| | La description publique documente `429` et `Retry-After` | 0,5 | 0,5 |
| **Total** | | **20** | **20** |

Chaque critère est évalué sur ce que demande la version du sujet que vous traitez. Seul ce qui est vérifiable est noté : un test qui passe, une requête qui répond, un commit. Une décision sans justification dans `DECISIONS.md` ne rapporte rien, même si le code fonctionne.
