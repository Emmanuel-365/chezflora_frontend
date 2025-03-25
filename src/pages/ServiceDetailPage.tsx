"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageContainer from "../components/PageContainer";
import ButtonPrimary from "../components/ButtonPrimary";
import { ModalContainer } from "../components/ModalContainer";
import { getService, createDevis } from "../services/api";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface Service {
  id: string;
  nom: string;
  description: string;
  photos: Photo[];
  is_active: boolean;
  date_creation: string;
}

interface Photo {
  image: string;
}

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devisDescription, setDevisDescription] = useState("");
  const [prixDemande, setPrixDemande] = useState(""); // Renommé en prixDemande
  const [devisLoading, setDevisLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await getService(id!);
        setService(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Erreur lors du chargement du service:", err.response?.status, err.response?.data);
        setError("Erreur lors du chargement du service.");
        setLoading(false);
      }
    };

    if (id) fetchService();
  }, [id]);

  const handleRequestDevis = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/auth");
      return;
    }

    if (!devisDescription.trim()) {
      alert("Veuillez entrer une description pour votre demande de devis.");
      return;
    }

    setDevisLoading(true);
    try {
      console.log("Envoi de la requête devis:", { service: id, description: devisDescription, prix_demande: prixDemande });
      await createDevis({
        service: id!,
        description: devisDescription,
        prix_demande: prixDemande ? parseFloat(prixDemande) : null, // Utilisation de prix_demande
      });
      alert("Devis créé avec succès ! Rendez-vous sur 'Mes devis' pour le soumettre.");
      setDevisDescription("");
      setPrixDemande("");
      setIsModalOpen(false);
      // Optionnel : rediriger vers la page des devis
      // navigate("/devis");
    } catch (err: any) {
      console.error("Erreur lors de la demande de devis:", err.response?.status, err.response?.data);
      alert(
        "Erreur lors de la création du devis : " +
          (err.response?.data?.detail || JSON.stringify(err.response?.data) || "Vérifiez votre connexion.")
      );
    } finally {
      setDevisLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16">Chargement...</div>;
  }

  if (error || !service) {
    return <div className="text-center py-16 text-powder-pink">{error || "Service non trouvé"}</div>;
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <motion.div
            className="relative h-64 bg-soft-green overflow-hidden mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {service.photos[0] && (
              <img
                src={service.photos[0].image || "/images/service-placeholder.jpg"}
                alt={service.nom}
                className="w-full h-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-soft-green/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-5xl font-serif font-medium text-white text-center">{service.nom}</h1>
            </div>
          </motion.div>

          {/* Contenu */}
          <div className="bg-light-beige p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-medium text-soft-brown mb-4">Description</h2>
            <p className="text-soft-brown/90 mb-6">{service.description}</p>
            <div className="flex space-x-4">
              <ButtonPrimary
                onClick={() => setIsModalOpen(true)}
                className="bg-soft-green hover:bg-soft-green/90"
              >
                Demander un devis
              </ButtonPrimary>
              <Link to="/services" className="flex items-center text-soft-brown hover:text-soft-green">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour aux services
              </Link>
            </div>
          </div>

          {/* Modal pour le devis */}
          <ModalContainer isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h3 className="text-xl font-medium text-soft-brown mb-4">Demander un devis</h3>
            <p className="text-soft-brown/70 mb-4">Décrivez vos besoins pour ce service :</p>
            <textarea
              value={devisDescription}
              onChange={(e) => setDevisDescription(e.target.value)}
              placeholder="Entrez les détails de votre demande..."
              className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown h-32 resize-none"
            />
            <input
              type="number"
              value={prixDemande}
              onChange={(e) => setPrixDemande(e.target.value)}
              placeholder="Prix demandé (optionnel, en FCFA)"
              className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
              step="0.01"
              min="0"
            />
            <ButtonPrimary
              onClick={handleRequestDevis}
              disabled={devisLoading}
              className="w-full mt-4 bg-soft-green hover:bg-soft-green/90"
            >
              {devisLoading ? "Envoi..." : "Créer le devis"}
            </ButtonPrimary>
            <p className="text-soft-brown/70 text-sm mt-2">
              Votre demande sera enregistrée comme brouillon. Vous pourrez la soumettre depuis "Mes devis".
            </p>
          </ModalContainer>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default ServiceDetailPage;