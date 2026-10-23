package com.backend.demo.security;

import org.springframework.stereotype.Service;


@Service
public class ValidationService {

    public boolean isValidEmail(String email) {
        var emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email != null && email.matches(emailRegex);
    }


    public boolean isValidUsername(String username) {
        var usernameRegex = "^(?=.*[a-z])[a-z0-9._]{6,20}$";
        return username != null && username.matches(usernameRegex);
    }

    public boolean isValidSearchTerm(String query) {
        var usernameRegex = "^(?=.*[a-zA-Z])[a-zA-Z0-9._]{1,20}$";
        return query != null && query.matches(usernameRegex);
    }

    public boolean isValidName(String name) {
        var nameRegex = "^(?!.*['\";\\\\*]).{5,20}$";
        return name != null && name.matches(nameRegex);
    }

    public boolean isSpaceIdValid(String spaceId) {
        var spaceIdRegex = "^(?=.*[a-z])[a-z0-9_-]{8,20}$";
        return spaceId == null || !spaceId.matches(spaceIdRegex);
    }


    public boolean isCaptionValid(String caption) {
        var captionRegex = "^(?!.*['\";\\\\*]).{1,255}$";
        return caption.matches(captionRegex);
    }


}
