package com.tech.spcours.paf_smart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.tech.spcours.paf_smart.model.Facility;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {
    
    Optional<Facility> findByCode(String code);
    
    List<Facility> findByBuilding(String building);
    
    List<Facility> findBySpaceType(String spaceType);
    
    List<Facility> findBySpaceTypeIn(List<String> spaceTypes);
    
    List<Facility> findByStatus(String status);
    
    boolean existsByCode(String code);
}
