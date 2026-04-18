package com.tech.spcours.paf_smart.repository;

import java.util.List;
import java.util.Collection;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tech.spcours.paf_smart.model.IssueReport;

public interface IssueReportRepository extends MongoRepository<IssueReport, String> {

    List<IssueReport> findByStudentIdOrderByCreatedAtDesc(String studentId);

    List<IssueReport> findByAssignedToOrderByCreatedAtDesc(String technicianId);

    List<IssueReport> findByAssignedToInOrderByCreatedAtDesc(Collection<String> technicianIds);
}
