package com.tech.spcours.paf_smart.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.tech.spcours.paf_smart.model.Equipment;

@Repository
public interface EquipmentRepository extends MongoRepository<Equipment, String> {
    
    List<Equipment> findByFacilityId(String facilityId);
    
    List<Equipment> findByStatus(String status);
    
    List<Equipment> findByApprovalRequiredTrue();
}
