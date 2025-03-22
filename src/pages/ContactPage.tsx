import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { sendContactMessage } from '../services/api';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await sendContactMessage(formData);
      setSuccess(response.data.status);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      console.error('Erreur lors de l’envoi:', err.response?.data);
      setError(err.response?.data?.error || 'Erreur lors de l’envoi du message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-medium text-soft-brown mb-6 text-center">Contactez-nous</h1>
          <p className="text-soft-brown/70 text-center mb-8">
            Une question ? Une demande spéciale ? Envoyez-nous un message, nous vous répondrons dans les plus brefs délais !
          </p>

          <form onSubmit={handleSubmit} className="bg-light-beige p-6 rounded-lg shadow-md space-y-6">
            <div>
              <label className="block text-soft-brown font-medium mb-1">Nom</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-soft-brown font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block text-soft-brown font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green h-32"
                placeholder="Votre message..."
              />
            </div>
            {error && <p className="text-powder-pink text-center">{error}</p>}
            {success && <p className="text-soft-green text-center">{success}</p>}
            <ButtonPrimary
              type="submit"
              disabled={loading}
              className="w-full bg-soft-green hover:bg-soft-green/90"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </ButtonPrimary>
          </form>

          <div className="mt-8 text-center text-soft-brown/70">
            <p>Email : <a href="mailto:support@chezflora.com" className="hover:text-soft-green">support@chezflora.com</a></p>
            <p>Téléphone : +33 1 23 45 67 89</p>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default ContactPage;