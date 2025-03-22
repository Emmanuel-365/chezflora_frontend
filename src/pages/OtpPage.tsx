import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import AuthOtpForm from '../components/AuthOtpForm';
import { verifyOtp, resendOtp } from '../services/api';

const OtpPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const userId = localStorage.getItem('pendingUserId') || '';

//   useEffect(() => {
//     if (!userId) {
//       setError('Aucun utilisateur en attente de vérification. Veuillez vous inscrire à nouveau.');
//       setTimeout(() => navigate('/auth'), 3000);
//     }
//   }, [userId, navigate]);

  const handleOtpSubmit = async (data: { userId: string; otp: string }) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await verifyOtp({ user_id: data.userId, code: data.otp });
      localStorage.removeItem('pendingUserId');
      setSuccessMessage('Vérification réussie ! Redirection en cours...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      if (!err.response) {
        setError('Erreur réseau : impossible de contacter le serveur');
      } else {
        const apiError = err.response.data?.error || err.response.data?.detail;
        setError(apiError || 'Code OTP invalide');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    try {
      await resendOtp({ user_id: userId });
      setSuccessMessage('Un nouveau code OTP a été envoyé à votre adresse email.');
    } catch (err: any) {
      if (!err.response) {
        setError('Erreur réseau : impossible de contacter le serveur');
      } else {
        const apiError = err.response.data?.error || err.response.data?.detail;
        setError(apiError || 'Erreur lors du renvoi OTP');
      }
    }
  };

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-md mx-auto mt-10">
          <AuthOtpForm
            userId={userId}
            onSubmit={handleOtpSubmit}
            isLoading={isLoading}
            error={error}
            successMessage={successMessage} // Passer successMessage au formulaire
            resendOtp={handleResendOtp}
          />
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default OtpPage;