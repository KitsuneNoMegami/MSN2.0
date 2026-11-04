# MSN 2.0

Projet universitaire de messagerie entre utilisateurs, reposant sur une base de données Supabase. Il devait être réalisé en web vanilla (HTML, CSS, JavaScript).

## Table des matières

1. [Description du projet](#description-du-projet)
2. [Architecture](#architecture)
3. [Fonctionnalités](#fonctionnalités)
4. [Base de données](#base-de-données)
5. [Pistes d'amélioration](#pistes-damélioration)

## Description du projet

Nous sommes partis sur un format rétro, façon MSN : facile à reproduire et assez complet pour le projet. Le sujet demandait d'ajouter une fonctionnalité imaginée par les étudiants. Nous avons choisi un sticker déplaçable, présent sur toutes les pages du site.

## Architecture

La page principale (`index`) se trouve à la racine du dépôt. Les autres fichiers sont rangés dans des dossiers dédiés.

Le site compte trois pages : inscription, connexion et `index`, qui est la page de messagerie.

- **CSS** : les trois pages partagent [`base.css`](css/base.css). [`connexion.css`](css/connexion.css) ne concerne que l'inscription et la connexion, tandis que `index` utilise plusieurs feuilles spécifiques, la page étant découpée en blocs distincts.
- **JavaScript** : même organisation, sauf que l'inscription et la connexion ont chacune leur propre fichier.

## Fonctionnalités

- Inscription avec règles de mot de passe classiques (8 caractères minimum, une majuscule, une minuscule, un chiffre, un caractère spécial)
- Connexion et déconnexion
- Page de chat protégée : si l'utilisateur n'est pas connecté, elle reste cachée et il est redirigé vers la page de connexion
- Création de channels, et suppression de ses propres channels uniquement
- Envoi et affichage des messages par channel, sans rechargement de la page
- Logo déplaçable (souris, doigt, stylet)

## Base de données

Les utilisateurs sont gérés par la table `Authentication`, déjà fournie à la création d'un projet Supabase.

Nous avons créé deux tables : une pour les channels, l'autre pour les messages.

**channels** : `id`, `name` (unique), `created_at`, `created_by` (référence à Authentication)

**messages** : `id`, `channel_id` (référence à channels), `user_id` (référence à Authentication), `username`, `content`, `created_at`

## Pistes d'amélioration

- Utiliser un pseudo distinct de l'email pour l'affichage des messages
