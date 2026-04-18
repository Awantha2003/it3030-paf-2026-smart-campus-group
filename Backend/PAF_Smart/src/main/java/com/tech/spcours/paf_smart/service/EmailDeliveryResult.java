package com.tech.spcours.paf_smart.service;

public record EmailDeliveryResult(boolean sent, String message) {

    public static EmailDeliveryResult success() {
        return success("Email sent successfully");
    }

    public static EmailDeliveryResult success(String message) {
        return new EmailDeliveryResult(true, message);
    }

    public static EmailDeliveryResult failed(String message) {
        return new EmailDeliveryResult(false, message);
    }
}
