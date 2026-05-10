import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { recuperarSessao } from "../services/auth";

export default function Index() {
  const [destino, setDestino] = useState<string | null>(null);

  useEffect(() => {
    recuperarSessao().then((sessao) => {
      if (sessao) {
        setDestino("/boasvindas");
      } else {
        setDestino("/boasvindas");
      }
    });
  }, []);

  if (!destino) return null;

  return <Redirect href={destino as any} />;
}
