package com.VivaRota.VivaRota_API.DTO;

public class RotaResponseDTO {

    private RotaOpcaoDTO rotaSegura;
    private RotaOpcaoDTO rotaRapida;

    public RotaResponseDTO(RotaOpcaoDTO rotaSegura,
                           RotaOpcaoDTO rotaRapida) {
        this.rotaSegura = rotaSegura;
        this.rotaRapida = rotaRapida;
    }

    public RotaOpcaoDTO getRotaSegura()      { return rotaSegura; }
    public void setRotaSegura(RotaOpcaoDTO rotaSegura) { this.rotaSegura = rotaSegura; }

    public RotaOpcaoDTO getRotaRapida()      { return rotaRapida; }
    public void setRotaRapida(RotaOpcaoDTO rotaRapida) { this.rotaRapida = rotaRapida; }
}