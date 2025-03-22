import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonPrimary from '../components/ButtonPrimary';
import { getArticle, createCommentaire, getUserProfile } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, Send } from 'lucide-react';

interface Commentaire {
  id: string;
  client: string;
  texte: string;
  date: string;
  reponses: Commentaire[];
}

interface Article {
  id: string;
  titre: string;
  contenu: string;
  cover: string | null;
  auteur: string;
  date_publication: string;
  commentaires?: Commentaire[]; // Optionnel pour éviter l'erreur si absent
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const articleResponse = await getArticle(id!);
        console.log('Article chargé:', articleResponse.data);
        setArticle(articleResponse.data);

        const token = localStorage.getItem('access_token');
        if (token) {
          await getUserProfile();
          setIsAuthenticated(true);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Erreur lors du chargement:', err.response?.status, err.response?.data);
        setError('Erreur lors du chargement de l’article.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (!commentText.trim()) {
      alert('Veuillez entrer un commentaire.');
      return;
    }

    try {
      await createCommentaire({ article: id!, texte: commentText });
      const updatedArticle = await getArticle(id!);
      console.log('Article mis à jour après commentaire:', updatedArticle.data);
      setArticle(updatedArticle.data);
      setCommentText('');
    } catch (err: any) {
      console.error('Erreur lors de l’ajout du commentaire:', err.response?.data);
      alert('Erreur lors de l’ajout du commentaire.');
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    const reply = replyText[parentId]?.trim();
    if (!reply) {
      alert('Veuillez entrer une réponse.');
      return;
    }

    try {
      await createCommentaire({ article: id!, texte: reply, parent: parentId });
      const updatedArticle = await getArticle(id!);
      console.log('Article mis à jour après réponse:', updatedArticle.data);
      setArticle(updatedArticle.data);
      setReplyText((prev) => ({ ...prev, [parentId]: '' }));
    } catch (err: any) {
      console.error('Erreur lors de l’ajout de la réponse:', err.response?.data);
      alert('Erreur lors de l’ajout de la réponse.');
    }
  };

  const renderComments = (commentaires: Commentaire[], level = 0) => (
    <div className={`space-y-4 ${level > 0 ? 'ml-8' : ''}`}>
      {commentaires.map((comment) => (
        <div key={comment.id} className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-soft-brown/90">{comment.texte}</p>
          <p className="text-soft-brown/70 text-sm mt-2">
            Par {comment.client} - {new Date(comment.date).toLocaleString('fr-FR')}
          </p>
          {isAuthenticated && (
            <div className="mt-2">
              <textarea
                value={replyText[comment.id] || ''}
                onChange={(e) => setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                placeholder="Répondre..."
                className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green"
              />
              <ButtonPrimary
                onClick={() => handleReplySubmit(comment.id)}
                className="mt-2 bg-soft-green hover:bg-soft-green/90"
              >
                <Send className="h-4 w-4 mr-2" /> Répondre
              </ButtonPrimary>
            </div>
          )}
          {comment.reponses.length > 0 && renderComments(comment.reponses, level + 1)}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return <div className="text-center py-16">Chargement...</div>;
  }

  if (error || !article) {
    return <div className="text-center py-16 text-powder-pink">{error || 'Article non trouvé'}</div>;
  }

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-serif font-medium text-soft-brown mb-4">{article.titre}</h1>
            <p className="text-soft-brown/70 text-sm mb-4 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(article.date_publication).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
              <span className="ml-2">par {article.auteur || 'Anonyme'}</span>
            </p>
            {article.cover && (
              <img src={article.cover} alt={article.titre} className="w-full h-64 object-cover rounded-lg mb-6" />
            )}
            <p className="text-soft-brown/90 leading-relaxed mb-8">{article.contenu}</p>

            <h2 className="text-2xl font-medium text-soft-brown mb-4">Commentaires</h2>
            {isAuthenticated ? (
              <div className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full p-2 border border-soft-brown/30 rounded-md focus:outline-none focus:ring-2 focus:ring-soft-green h-24"
                />
                <ButtonPrimary
                  onClick={handleCommentSubmit}
                  className="mt-2 bg-soft-green hover:bg-soft-green/90"
                >
                  <Send className="h-4 w-4 mr-2" /> Publier
                </ButtonPrimary>
              </div>
            ) : (
              <p className="text-soft-brown/70 mb-6">
                <Link to="/auth" className="text-soft-green underline">Connectez-vous</Link> pour commenter.
              </p>
            )}
            {article.commentaires && article.commentaires.length > 0 ? (
              renderComments(article.commentaires)
            ) : (
              <p className="text-soft-brown/70">Aucun commentaire pour le moment.</p>
            )}
          </motion.div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default ArticleDetailPage;