import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getUserProfile, updateUserProfile, changePassword, deleteAccount } from '../services/api';
import { User, Shield, ChevronsUpDown, Camera, AlertCircle } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
}

const AccountPage: React.FC = () => {
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [notifications, setNotifications] = useState(true); // Paramètre fictif
  const [marketing, setMarketing] = useState(false); // Paramètre fictif

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const response = await getUserProfile();
        setUser(response.data);
        setUsername(response.data.username);
        setEmail(response.data.email);
        setAvatarUrl(''); // Remplacez par un champ avatar si disponible via API
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement du profil:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement du profil.');
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/auth');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      const response = await updateUserProfile({ username, email });
      setUser(response.data);
      alert('Profil mis à jour avec succès !');
    } catch (err: any) {
      alert('Erreur lors de la mise à jour : ' + (err.response?.data?.detail || 'Vérifiez votre connexion.'));
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Mot de passe modifié avec succès !');
    } catch (err: any) {
      alert('Erreur lors du changement de mot de passe : ' + (err.response?.data?.detail || 'Vérifiez vos entrées.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    setDeleteLoading(true);
    try {
      await deleteAccount();
      localStorage.removeItem('access_token');
      alert('Compte supprimé avec succès.');
      navigate('/');
    } catch (err: any) {
      alert('Erreur lors de la suppression : ' + (err.response?.data?.detail || 'Vérifiez votre connexion.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarUrl(result);
      setIsUploading(false);
      alert('Photo de profil mise à jour !');
    };
    reader.readAsDataURL(file);
  };

  const handleAccountSettings = () => {
    // Logique fictive pour sauvegarder les paramètres (à connecter à une API si disponible)
    alert('Paramètres du compte mis à jour : Notifications=' + notifications + ', Marketing=' + marketing);
  };

  if (loading) {
    return <div className="text-center py-16">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-16 text-powder-pink">
        {error} <Link to="/auth" className="underline">Connectez-vous</Link>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-6xl mx-auto py-10 flex flex-col lg:flex-row lg:space-x-12">
          {/* Sidebar */}
          <aside className="lg:w-1/4 mb-8 lg:mb-0">
            <div className="flex flex-col items-center space-y-4 pb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-light-beige flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl text-soft-brown">
                      {user?.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-8 w-8 flex items-center justify-center rounded-full bg-soft-green text-white cursor-pointer hover:bg-soft-green/90"
                >
                  {isUploading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-soft-brown">{user?.username}</h2>
                <p className="text-sm text-soft-brown/70">{user?.role}</p>
              </div>
            </div>
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center justify-start p-2 rounded-md text-soft-brown hover:bg-soft-green/20 transition-colors ${activeTab === 'profile' ? 'bg-soft-green text-white' : ''}`}
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center justify-start p-2 rounded-md text-soft-brown hover:bg-soft-green/20 transition-colors ${activeTab === 'account' ? 'bg-soft-green text-white' : ''}`}
              >
                <ChevronsUpDown className="h-4 w-4 mr-2" />
                Compte
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center justify-start p-2 rounded-md text-soft-brown hover:bg-soft-green/20 transition-colors ${activeTab === 'security' ? 'bg-soft-green text-white' : ''}`}
              >
                <Shield className="h-4 w-4 mr-2" />
                Sécurité
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 lg:max-w-2xl">
            {activeTab === 'profile' && (
              <div className="bg-light-beige p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-medium text-soft-brown mb-4">Profil</h2>
                <p className="text-soft-brown/70 mb-6">Gérez les informations de votre profil public.</p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-soft-brown font-medium mb-1">Nom d’utilisateur</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                    />
                  </div>
                  <div>
                    <label className="block text-soft-brown font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                    />
                  </div>
                  <ButtonPrimary
                    onClick={handleUpdateProfile}
                    disabled={updateLoading}
                    className="bg-soft-green hover:bg-soft-green/90"
                  >
                    {updateLoading ? 'Mise à jour...' : 'Mettre à jour'}
                  </ButtonPrimary>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="bg-light-beige p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-medium text-soft-brown mb-4">Paramètres du compte</h2>
                <p className="text-soft-brown/70 mb-6">Gérez vos préférences de compte.</p>
                <div className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border border-soft-brown/30 p-4">
                    <div className="space-y-0.5">
                      <p className="text-base text-soft-brown font-medium">Notifications par email</p>
                      <p className="text-sm text-soft-brown/70">Recevoir des notifications sur les activités du compte.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="h-5 w-5 text-soft-green border-soft-brown/30 rounded focus:ring-soft-green"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-soft-brown/30 p-4">
                    <div className="space-y-0.5">
                      <p className="text-base text-soft-brown font-medium">Emails marketing</p>
                      <p className="text-sm text-soft-brown/70">Recevoir des emails sur les nouveautés et promotions.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="h-5 w-5 text-soft-green border-soft-brown/30 rounded focus:ring-soft-green"
                    />
                  </div>
                  <ButtonPrimary
                    onClick={handleAccountSettings}
                    className="bg-soft-green hover:bg-soft-green/90"
                  >
                    Sauvegarder les préférences
                  </ButtonPrimary>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-light-beige p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-medium text-soft-brown mb-4">Sécurité</h2>
                <p className="text-soft-brown/70 mb-6">Gérez la sécurité de votre compte et votre mot de passe.</p>

                {/* Changement de mot de passe */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-soft-brown font-medium mb-1">Ancien mot de passe</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                    />
                  </div>
                  <div>
                    <label className="block text-soft-brown font-medium mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                    />
                  </div>
                  <div>
                    <label className="block text-soft-brown font-medium mb-1">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green bg-white text-soft-brown"
                    />
                  </div>
                  <ButtonPrimary
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="bg-soft-green hover:bg-soft-green/90"
                  >
                    {passwordLoading ? 'Changement...' : 'Changer le mot de passe'}
                  </ButtonPrimary>
                </div>

                {/* Séparateur */}
                <div className="my-6 border-t border-soft-brown/30"></div>

                {/* Suppression du compte */}
                <div>
                  <h3 className="text-lg font-medium text-soft-brown mb-2">Zone de danger</h3>
                  <p className="text-soft-brown/70 mb-4">
                    Supprimez définitivement votre compte et toutes vos données.
                  </p>
                  <div className="bg-powder-pink/10 border border-powder-pink p-4 rounded-md flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-powder-pink mt-1" />
                    <div>
                      <p className="text-sm font-medium text-powder-pink">Attention</p>
                      <p className="text-sm text-soft-brown/70">
                        Cette action est irréversible et supprimera toutes vos données de nos serveurs.
                      </p>
                    </div>
                  </div>
                  <ButtonPrimary
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="mt-4 bg-powder-pink hover:bg-powder-pink/90"
                  >
                    {deleteLoading ? 'Suppression...' : 'Supprimer mon compte'}
                  </ButtonPrimary>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default AccountPage;