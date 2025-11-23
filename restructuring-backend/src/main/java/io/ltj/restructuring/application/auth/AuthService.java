package io.ltj.restructuring.application.auth;

import io.ltj.restructuring.api.dto.auth.LoginRequestDto;
import io.ltj.restructuring.api.dto.auth.LoginResponseDto;
import io.ltj.restructuring.api.dto.auth.RegisterRequestDto;
import io.ltj.restructuring.api.dto.auth.RegisterResponseDto;

public interface AuthService {

    LoginResponseDto login(LoginRequestDto request);

    RegisterResponseDto register(RegisterRequestDto request);

}
