// Récupérer les références DOM
const form = document.getElementById('data-form');
const template = document.getElementById('document-template');

// Fonction pour formater la date au format JJ/MM/AAAA
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Événement de soumission du formulaire
form.addEventListener('submit', function(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    // 1. Collecter les données du formulaire
    const data = {
        nom_client: document.getElementById('nom_client').value,
        prenom_client: document.getElementById('prenom_client').value,
        adresse_client: document.getElementById('adresse_client').value,
        marque: document.getElementById('marque').value,
        modele: document.getElementById('modele').value,
        vin: document.getElementById('vin').value,
        immatriculation: document.getElementById('immatriculation').value,
        nom_concession: document.getElementById('nom_concession').value,
        adresse_concession: document.getElementById('adresse_concession').value,
        ville_concession: document.getElementById('ville_concession').value,
        date_signature: document.getElementById('date_signature').value // Laisser la date brute pour le moment
    };
    
    // Formater la date pour l'affichage
    const formattedDate = formatDate(data.date_signature);

    // 2. Insérer les données dans le template HTML
    document.getElementById('out_nom_client').textContent = data.nom_client;
    document.getElementById('out_prenom_client').textContent = data.prenom_client;
    document.getElementById('out_adresse_client').textContent = data.adresse_client;
    
    document.getElementById('out_date_signature').textContent = formattedDate;
    document.getElementById('out_date_signature_2').textContent = formattedDate;

    document.getElementById('out_marque').textContent = data.marque;
    document.getElementById('out_modele_vehicule').textContent = data.modele;
    document.getElementById('out_modele_concession').textContent = data.modele;
    document.getElementById('out_vin').textContent = data.vin;
    document.getElementById('out_vin_concession').textContent = data.vin;
    document.getElementById('out_immatriculation').textContent = data.immatriculation;
    
    document.getElementById('out_nom_concession').textContent = data.nom_concession;
    document.getElementById('out_adresse_concession').textContent = data.adresse_concession;
    document.getElementById('out_ville_concession').textContent = data.ville_concession;

    // 3. Générer le PDF
    // Rendre le template visible juste avant la capture
    template.style.display = 'block';

    // Utiliser html2canvas pour capturer le template en image
    html2canvas(template, { scale: 2 }).then(canvas => {
        // Obtenir les dimensions pour le PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        
        // Dimensions A4 en mm
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Dimensions de l'image
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 40; // Marge de 20mm de chaque côté
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 20; // Position de départ Y (marge supérieure)
        
        // Ajouter la première page
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Gérer le cas où le contenu dépasse une seule page (très important pour un document long)
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 20; // 20 pour la marge supérieure de la nouvelle page
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        // Sauvegarder le PDF
        const filename = `Décharge_Responsabilité_${data.nom_client}_${formattedDate.replace(/\//g, '-')}.pdf`;
        pdf.save(filename);

        // Masquer le template après la génération
        template.style.display = 'none';
    }).catch(error => {
        console.error('Erreur lors de la génération du PDF:', error);
        alert("Une erreur est survenue lors de la génération du PDF.");
        template.style.display = 'none';
    });
});