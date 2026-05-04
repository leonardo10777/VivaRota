package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.LoginRequestDTO;
import com.VivaRota.VivaRota_API.DTO.TokenResponseDTO;
import com.VivaRota.VivaRota_API.entities.Usuario;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import org.springframework.stereotype.Service;


@Slf4j

@Service
public class AuthService {


    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private TokenService tokenService;

    public TokenResponseDTO realizarLogin(LoginRequestDTO loginDTO) {
        log.info("🔐 [AUTH] Tentativa de login para: {}", loginDTO.getEmail());

        try {
            var usernamePassword = new UsernamePasswordAuthenticationToken(
                    loginDTO.getEmail(),
                    loginDTO.getSenha()
            );

            Authentication auth = this.authenticationManager.authenticate(usernamePassword);
            log.info("✅ [AUTH] Autenticação bem-sucedida para: {}", loginDTO.getEmail());

            Usuario usuarioAutenticado = (Usuario) auth.getPrincipal();
            String token = tokenService.gerarToken(usuarioAutenticado);
            log.info("🎟️ [AUTH] Token gerado para: {}", usuarioAutenticado.getEmail());

            TokenResponseDTO response = new TokenResponseDTO();
            response.setToken(token);
            response.setTipo("Bearer");
            response.setNomeUsuario(usuarioAutenticado.getNome());

            if (usuarioAutenticado.getId() != null) {
                response.setUsuarioId(usuarioAutenticado.getId().longValue());
            }

            log.info("✅ [AUTH] Login concluído para: {} | id: {}",
                    usuarioAutenticado.getEmail(), usuarioAutenticado.getId());

            return response;

        } catch (Exception e) {
            log.error("❌ [AUTH] Falha no login para: {} | erro: {}",
                    loginDTO.getEmail(), e.getMessage());
            throw e;
        }
    }
}
