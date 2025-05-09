package com.chami.backend.config;

import com.chami.backend.models.ERole;
import com.chami.backend.models.Role;
import com.chami.backend.repositories.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        // Initialize roles if they don't exist
        Arrays.stream(ERole.values()).forEach(role -> {
            if (roleRepository.findByName(role).isEmpty()) {
                roleRepository.save(new Role(role));
                System.out.println("Created role: " + role);
            }
        });
    }
}
