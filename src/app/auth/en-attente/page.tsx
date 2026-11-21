import Link from "next/link";
import { Stethoscope, Clock, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EnAttentePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">
              Santé<span className="text-emerald-600">Link</span>
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-amber-700">Compte en attente de validation</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Votre demande d&apos;inscription professionnelle a bien été enregistrée.
              Un administrateur de SantéLink va vérifier vos informations et activer votre compte.
            </p>
            <p className="text-gray-500 text-xs">
              Vous recevrez une notification dès que votre compte sera validé.
              Ce processus garantit la sécurité et l&apos;intégrité de la plateforme (RG-01/02).
            </p>
            <div className="pt-4">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
