package com.VivaRota.VivaRota_API.entities;

import java.util.List;

public class RotaOpcao {

    private List<double[]> coordenadas;
    private Double distanciaKm;
    private Integer duracaoMin;
    private Double perigo;
    private String wkt;

    public RotaOpcao(List<double[]> coordenadas, Double distanciaKm,
                     Integer duracaoMin, Double perigo, String wkt) {
        this.coordenadas = coordenadas;
        this.distanciaKm = distanciaKm;
        this.duracaoMin  = duracaoMin;
        this.perigo      = perigo;
        this.wkt         = wkt;
    }

    public List<double[]> getCoordenadas() { return coordenadas; }
    public Double getDistanciaKm()         { return distanciaKm; }
    public Integer getDuracaoMin()         { return duracaoMin; }
    public Double getPerigo()              { return perigo; }
    public String getWkt()                 { return wkt; }
}