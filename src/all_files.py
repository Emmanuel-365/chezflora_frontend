import os

def copier_contenu_avec_chemins(dossier_source, fichier_sortie):
    # Ouvre le fichier de sortie en mode écriture
    with open(fichier_sortie, 'w', encoding='utf-8') as sortie:
        # Parcourt récursivement tous les fichiers et sous-dossiers
        for racine, dossiers, fichiers in os.walk(dossier_source):
            for fichier in fichiers:
                # Construit le chemin complet du fichier
                chemin_complet = os.path.join(racine, fichier)
                # Calcule le chemin relatif par rapport au dossier source
                chemin_relatif = os.path.relpath(chemin_complet, dossier_source)
                
                # Écrit le chemin relatif dans le fichier de sortie
                sortie.write(f"--- {chemin_relatif} ---\n")
                
                try:
                    # Lit et écrit le contenu du fichier
                    with open(chemin_complet, 'r', encoding='utf-8') as f:
                        contenu = f.read()
                        sortie.write(contenu)
                        sortie.write("\n\n")  # Ajoute une séparation entre les contenus
                except Exception as e:
                    sortie.write(f"(Erreur lors de la lecture : {str(e)})\n\n")

# Exemple d'utilisation
dossier_source = "D:/Users/Emmanuel/Documents/concours/code/frontend/chezflora-frontend/src"  # Ton dossier source
fichier_sortie = "all_fronted_files"  # Nom du fichier de sortie
copier_contenu_avec_chemins(dossier_source, fichier_sortie)
print(f"Le contenu a été copié dans {fichier_sortie}")