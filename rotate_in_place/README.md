# Rotate in place

La rotation en place est le fait de prendre un tableau à deux dimensions en entrée et de lui appliquer une rotation de 
90° (dans le cas de notre exercice) des données qu'il contient.

Valeur initiale : 

| 1   | 2   | 3   | 4   |
|-----|-----|-----|-----|
| 5   | 6   | 7   | 8   |
| 9   | 10  | 11  | 12  |
| 13  | 14  | 15  | 16  |

Valeur attendue :

| 13  | 9   | 5   | 1   |
|-----|-----|-----|-----|
| 14  | 10  | 6   | 2   |
| 15  | 11  | 7   | 3   |
| 16  | 12  | 8   | 4   |

Le but ici n'est pas de développer la fonction, mais de la corriger.

## Fichiers

- _data_: Contient le jeu de données
- _rotate_in_place_: Contient la fonction à corriger
- _test_: Exécutable permettant de vérifier que le résultat est OK

## Lancer les tests

```bash
php -f test.php
```

