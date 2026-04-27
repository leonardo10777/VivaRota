package com.VivaRota.VivaRota_API.DTO;

import java.util.List;

public class RotaOpcaoDTO {

    private List<double[]> coordenadas;
    private Double distanciaKm;
    private Integer duracaoMin;
    private Double pontuacaoPerigo;
    private String nivelSeguranca; // seguro, atencao, moderado, perigoso
    private String tipo;           // segura, rapida, equilibrada

    public RotaOpcaoDTO(List<double[]> coordenadas, Double distanciaKm,
                        Integer duracaoMin, Double pontuacaoPerigo,
                        String nivelSeguranca, String tipo) {
        this.coordenadas     = coordenadas;
        this.distanciaKm     = distanciaKm;
        this.duracaoMin      = duracaoMin;
        this.pontuacaoPerigo = pontuacaoPerigo;
        this.nivelSeguranca  = nivelSeguranca;
        this.tipo            = tipo;
    }

    public List<double[]> getCoordenadas()   { return coordenadas; }
    public Double getDistanciaKm()           { return distanciaKm; }
    public Integer getDuracaoMin()           { return duracaoMin; }
    public Double getPontuacaoPerigo()       { return pontuacaoPerigo; }
    public String getNivelSeguranca()        { return nivelSeguranca; }
    public String getTipo()                  { return tipo; }
}