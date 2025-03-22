import React, { useState, useEffect } from 'react';
import { Flower2, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPublicParameters } from '../services/api';

const Footer: React.FC = () => {
  const [params, setParams] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await getPublicParameters();
        const paramData = response.data.reduce((acc: { [key: string]: string }, param: { cle: string; valeur: string }) => {
          acc[param.cle] = param.valeur;
          return acc;
        }, {});
        setParams(paramData);
      } catch (error) {
        console.error('Erreur lors de la récupération des paramètres publics:', error);
      }
    };
    fetchParams();
  }, []);

  return (
    <footer className="bg-light-beige">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Flower2 className="h-8 w-8 text-soft-green" />
              <span className="ml-2 text-xl font-serif font-medium text-soft-brown">{params['site_name'] || 'ChezFlora'}</span>
            </div>
            <p className="text-soft-brown/80 text-sm">{params['site_description'] || 'Votre destination pour tout ce qui touche aux fleurs et plantes.'}</p>
            <div className="flex space-x-4">
              <a href="#" className="text-soft-brown hover:text-powder-pink transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-soft-brown hover:text-powder-pink transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-soft-brown hover:text-powder-pink transition-colors duration-200">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-soft-brown font-medium mb-4">Produits</h3>
            <ul className="space-y-2">
              <li><Link to="/products/flowers" className="text-soft-brown/80 hover:text-powder-pink text-sm">Fleurs</Link></li>
              <li><Link to="/products/plants" className="text-soft-brown/80 hover:text-powder-pink text-sm">Plantes</Link></li>
              <li><Link to="/products/bouquets" className="text-soft-brown/80 hover:text-powder-pink text-sm">Bouquets</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-soft-brown font-medium mb-4">Informations</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-soft-brown/80 hover:text-powder-pink text-sm">À propos</Link></li>
              <li><Link to="/contact" className="text-soft-brown/80 hover:text-powder-pink text-sm">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-soft-brown font-medium mb-4">Service client</h3>
            <ul className="space-y-2">
              <li><Link to="/shipping" className="text-soft-brown/80 hover:text-powder-pink text-sm">Livraison</Link></li>
              <li><Link to="/returns" className="text-soft-brown/80 hover:text-powder-pink text-sm">Retours</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-soft-brown/20">
          <p className="text-center text-soft-brown/70 text-sm">
            © {new Date().getFullYear()} {params['site_name'] || 'ChezFlora'}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;