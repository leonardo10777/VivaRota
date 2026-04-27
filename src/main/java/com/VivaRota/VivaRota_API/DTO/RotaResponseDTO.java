package com.VivaRota.VivaRota_API.DTO;

import java.util.List;
import java.util.UUID;

public class RotaResponseDTO {

    private UUID id;
    private String tipoRota;
    private Integer alertasEvitados;
    private Double origemLat;
    private Double origemLng;
    private Double destinoLat;
    private Double destinoLng;
    private RotaOpcaoDTO rotaSegura;
    private RotaOpcaoDTO rotaRapida;
    private RotaOpcaoDTO rotaEquilibrada;

    // Waypoints que o Mapbox vai usar para desenhar a rota no front
    // Cada ponto é [longitude, latitude] seguindo padrão GeoJSON
    private List<double[]> waypoints;

    // Incidentes próximos à rota para exibir no mapa
    private List<IncidenteResponseDTO> incidentesNaRota;


    public RotaResponseDTO(RotaOpcaoDTO rotaSegura,
                           RotaOpcaoDTO rotaRapida,
                           RotaOpcaoDTO rotaEquilibrada) {
        this.rotaSegura      = rotaSegura;
        this.rotaRapida      = rotaRapida;
        this.rotaEquilibrada = rotaEquilibrada;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTipoRota() { return tipoRota; }
    public void setTipoRota(String tipoRota) { this.tipoRota = tipoRota; }

    public Integer getAlertasEvitados() { return alertasEvitados; }
    public void setAlertasEvitados(Integer alertasEvitados) { this.alertasEvitados = alertasEvitados; }

    public Double getOrigemLat() { return origemLat; }
    public void setOrigemLat(Double origemLat) { this.origemLat = origemLat; }

    public Double getOrigemLng() { return origemLng; }
    public void setOrigemLng(Double origemLng) { this.origemLng = origemLng; }

    public Double getDestinoLat() { return destinoLat; }
    public void setDestinoLat(Double destinoLat) { this.destinoLat = destinoLat; }

    public Double getDestinoLng() { return destinoLng; }
    public void setDestinoLng(Double destinoLng) { this.destinoLng = destinoLng; }

    public List<double[]> getWaypoints() { return waypoints; }
    public void setWaypoints(List<double[]> waypoints) { this.waypoints = waypoints; }

    public List<IncidenteResponseDTO> getIncidentesNaRota() { return incidentesNaRota; }
    public void setIncidentesNaRota(List<IncidenteResponseDTO> incidentesNaRota) { this.incidentesNaRota = incidentesNaRota; }

    public RotaOpcaoDTO getRotaSegura() {
        return rotaSegura;
    }

    public void setRotaSegura(RotaOpcaoDTO rotaSegura) {
        this.rotaSegura = rotaSegura;
    }

    public RotaOpcaoDTO getRotaRapida() {
        return rotaRapida;
    }

    public void setRotaRapida(RotaOpcaoDTO rotaRapida) {
        this.rotaRapida = rotaRapida;
    }

    public RotaOpcaoDTO getRotaEquilibrada() {
        return rotaEquilibrada;
    }

    public void setRotaEquilibrada(RotaOpcaoDTO rotaEquilibrada) {
        this.rotaEquilibrada = rotaEquilibrada;
    }
}