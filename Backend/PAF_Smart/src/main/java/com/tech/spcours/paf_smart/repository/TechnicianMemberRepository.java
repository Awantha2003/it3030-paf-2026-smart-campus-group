package com.tech.spcours.paf_smart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tech.spcours.paf_smart.model.TechnicianMember;

public interface TechnicianMemberRepository extends MongoRepository<TechnicianMember, String> {

    Optional<TechnicianMember> findByEmailIgnoreCase(String email);

    List<TechnicianMember> findAllByOrderByCreatedAtDesc();
}
