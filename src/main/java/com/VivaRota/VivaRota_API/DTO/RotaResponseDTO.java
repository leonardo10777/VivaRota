package com.VivaRota.VivaRota_API.DTO;

public class RotaResponseDTO {

    private RotaOpcaoDTO rotaSegura;
    private RotaOpcaoDTO rotaRapida;
    private RotaOpcaoDTO rotaEquilibrada;

    public RotaResponseDTO(RotaOpcaoDTO rotaSegura,
                           RotaOpcaoDTO rotaRapida,
                           RotaOpcaoDTO rotaEquilibrada) {
        this.rotaSegura      = rotaSegura;
        this.rotaRapida      = rotaRapida;
        this.rotaEquilibrada = rotaEquilibrada;
    }

    public RotaOpcaoDTO getRotaSegura()      { return rotaSegura; }
    public void setRotaSegura(RotaOpcaoDTO rotaSegura) { this.rotaSegura = rotaSegura; }

    public RotaOpcaoDTO getRotaRapida()      { return rotaRapida; }
    public void setRotaRapida(RotaOpcaoDTO rotaRapida) { this.rotaRapida = rotaRapida; }

    public RotaOpcaoDTO getRotaEquilibrada() { return rotaEquilibrada; }
    public void setRotaEquilibrada(RotaOpcaoDTO rotaEquilibrada) { this.rotaEquilibrada = rotaEquilibrada; }
}