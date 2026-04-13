package com.tech.spcours.paf_smart.module.user.repository;

import com.tech.spcours.paf_smart.module.user.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByQrToken(String qrToken);
}