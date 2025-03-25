import os

def combine_admin_files_into_one():
    # Dossier de départ : le dossier courant où le script est exécuté
    base_dir = os.getcwd()

    # Nom du fichier de sortie
    output_file = os.path.join(base_dir, "all_files.tsx")

    # Liste pour stocker le contenu combiné
    combined_content = []

    # Parcourir récursivement tous les fichiers dans le dossier courant
    for root, dirs, files in os.walk(base_dir):
        # Ignorer le dossier node_modules
        if 'node_modules' in dirs:
            dirs.remove('node_modules')

        for file in files:
            # Vérifier si le fichier est un .tsx ou .ts
            if file.endswith('.tsx') or file.endswith('.ts'):
                # Chemin absolu du fichier
                file_path = os.path.join(root, file)
                # Chemin relatif par rapport au dossier courant
                relative_path = os.path.relpath(file_path, base_dir)

                # Lire le contenu existant du fichier
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Ajouter le chemin relatif comme commentaire, suivi du contenu
                combined_content.append(f"// Chemin relatif : {relative_path}\n\n{content}\n\n{'='*50}\n")

                print(f"Ajouté : {relative_path}")

    # Écrire tout le contenu combiné dans un seul fichier
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(combined_content))

    print(f"Tous les fichiers ont été combinés dans : {output_file}")

if __name__ == "__main__":
    combine_admin_files_into_one()
