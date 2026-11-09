import { useLocation, Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <img
          src="https://media.base44.com/images/public/user_69fca651120099459e840753/01436fc46_WhatsAppImage2026-05-05at183524.jpeg"
          alt="Scarlet Travellers"
          className="w-20 h-20 rounded-xl mx-auto opacity-30"
        />
        <h1 className="text-6xl font-cinzel font-bold text-primary/30">404</h1>
        <p className="text-muted-foreground">
          A página <span className="font-medium text-foreground">"{pageName}"</span> não foi encontrada.
        </p>
        <Link to="/">
          <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </Link>
      </div>
    </div>
  );
}