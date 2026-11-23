# Décisions

Remplacez chaque passage entre `<…>` et supprimez les consignes en italique. Écrivez court : une décision bien justifiée en trois lignes vaut mieux qu'une page.

## 1. Les trois incidents

_Pour chaque incident, la règle de limitation qui l'aurait évité, et ce qu'elle aurait cassé ailleurs._

| Incident | Règle qui l'aurait évité | Ce qu'elle casse ailleurs |
| -------- | ------------------------ | ------------------------- |
| Lundi, le script qui guette les créneaux | donner un nombre maximum de requête | <…> |
| Mercredi, les six groupes sur le wifi du local | limiter le wifi local par groupr | un user peut changer de compte |
| Vendredi, le site de la salle partenaire | appliquer un quota pour les partenaires | les quotas pourraient  être complexe à gérer |

<Conclusion en deux ou trois phrases : ce que l'administration doit pouvoir régler, et pourquoi une seule règle fixe ne suffit pas.>

## 2. Défauts trouvés dans le code fourni

_Une ligne par défaut. N'y mettez pas les raccourcis voulus listés dans le README. Indiquez le commit de la correction, ou « non corrigé » si vous n'avez pas eu le temps._

| # | Où (fichier, route) | Le défaut | Pourquoi c'est un problème | Ce que vous changez | Commit |
| - | ------------------- | --------- | -------------------------- | ------------------- | ------ |
| D1 | src/http:errors.ts | absence authenfication renvoie 403 | le statut 403 ne correspond pas à l'absence d'authentification | nous changeons le statut 403 par 401 qui est bien plus adapté | modification du statut Unauthenticated & roomnotfound |
| D2 | src/http/error.ts | Une salle non  trouvée renvoie le statut 400 | parce que le statut 400 correspond à une mauvaise requête | nous changeons paar le statut 404 qui correspond à une page non trouvée | // |

## 3. L'API d'administration

_Le contrat complet est dans `admin-openapi.yaml`. Ici, seulement le résumé et les choix qui ne se voient pas dans le contrat._

| Méthode | Chemin | Qui (clé) | Réponses |
| ------- | ------ | --------- | -------- |
| GET | admin/rate-limit | Tresoriere | 200,401,403 |
| PUT    |     admin/rate-limit| benevole    |     |
| GET       | admin/rate-limit/history    | tresoriere    | 200,401,403    |

- Forme d'une règle : on peut regler la limite de la requête et le type d'authentification 
- Règle invalide : tout ce qui est inérieur à  1 est  refusée. Le statuut http renvoyé est 400
- Deux modifications au même moment : <ce qui se passe, et comment le client le sait>

## 4. Configuration `studio.toml`

- Ce que le lecteur accepte : des blocs [opening]&[slot] avec des valeurs pour les heures d'ouvertures et la durée
- Ce qui empêche le démarrage : soit une valeur manquante, soit une valeuur invalide
- Comment les valeurs arrivent jusqu'au domaine sans qu'il sache qu'elles viennent d'un fichier : 

## 5. ADR

_Au moins deux. Copiez le bloc pour chaque décision. Un ADR peut aussi justifier le refus d'une solution._

### ADR-001 : <titre court, sous forme de décision>

- **Statut** : acceptée
- **Contexte** : <le problème, la contrainte, ce qui rend le choix nécessaire>
- **Décision** : <ce que vous faites>
- **Alternatives écartées** : <au moins une, et pourquoi elle perd ici>
- **Conséquences** : <ce que ça rend facile, ce que ça rend difficile, ce qu'il faudra surveiller>

### ADR-002 : <titre>

- **Statut** : acceptée
- **Contexte** : <…>
- **Décision** : <…>
- **Alternatives écartées** : <…>
- **Conséquences** : <…>

_Pistes de sujets d'ADR, à ne pas toutes traiter : où vit la règle courante et comment un changement atteint les requêtes en cours, ce que deviennent les compteurs au moment d'un changement, le choix des ressources et des codes de l'API d'administration, le stockage des clés d'API._
