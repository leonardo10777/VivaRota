package com.VivaRota.VivaRota_API.controller;

import com.VivaRota.VivaRota_API.DTO.LocalizacaoDTO;
import com.VivaRota.VivaRota_API.DTO.UsuarioCadastroDTO;
import com.VivaRota.VivaRota_API.DTO.UsuarioResponseDTO;
import com.VivaRota.VivaRota_API.DTO.UsuarioUpdateDTO;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = (Usuario) usuarioService.loadUserByUsername(userDetails.getUsername());
        return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(new UsuarioResponseDTO(usuarioService.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> findAll() {
        var lista = usuarioService.findAll().stream().map(UsuarioResponseDTO::new).toList();
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioResponseDTO> cadastrarJson(
            @RequestBody @Valid UsuarioCadastroDTO dto) {

        Usuario novo = usuarioService.cadastrarUsuario(dto, null);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(novo.getId()).toUri();
        return ResponseEntity.created(uri).body(new UsuarioResponseDTO(novo));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioResponseDTO> cadastrar(
            @RequestPart("usuario") @Valid UsuarioCadastroDTO dto,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem) {

        Usuario novo = usuarioService.cadastrarUsuario(dto, imagem);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(novo.getId()).toUri();
        return ResponseEntity.created(uri).body(new UsuarioResponseDTO(novo));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioResponseDTO> atualizar(
            @PathVariable Integer id,
            @RequestPart("usuario") @Valid UsuarioUpdateDTO dto,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem) {

        Usuario alterado = usuarioService.atualizar(id, dto, imagem);
        return ResponseEntity.ok(new UsuarioResponseDTO(alterado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/localizacao")
    public ResponseEntity<Void> atualizarLocalizacao(
            @RequestBody LocalizacaoDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        usuarioService.atualizarLocalizacao(userDetails.getUsername(), dto);
        return ResponseEntity.noContent().build();
    }
}