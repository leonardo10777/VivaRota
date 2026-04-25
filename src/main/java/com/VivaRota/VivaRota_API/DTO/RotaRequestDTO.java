package com.VivaRota.VivaRota_API.DTO;

import jakarta.validation.constraints.NotNull;

public class RotaRequestDTO {

    @NotNull(message = "Latitude de origem é obrigatória.")
    private Double origemLat;

    @NotNull(message = "Longitude de origem é obrigatória.")
    private Double origemLng;

    @NotNull(message = "Latitude de destino é obrigatória.")
    private Double destinoLat;

    @NotNull(message = "Longitude de destino é obrigatória.")
    private Double destinoLng;

    public Double getOrigemLat() { return origemLat; }
    public void setOrigemLat(Double origemLat) { this.origemLat = origemLat; }

    public Double getOrigemLng() { return origemLng; }
    public void setOrigemLng(Double origemLng) { this.origemLng = origemLng; }

    public Double getDestinoLat() { return destinoLat; }
    public void setDestinoLat(Double destinoLat) { this.destinoLat = destinoLat; }

    public Double getDestinoLng() { return destinoLng; }
    public void setDestinoLng(Double destinoLng) { this.destinoLng = destinoLng; }
}