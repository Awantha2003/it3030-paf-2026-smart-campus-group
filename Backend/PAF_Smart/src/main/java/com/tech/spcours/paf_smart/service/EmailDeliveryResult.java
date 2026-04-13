package com.tech.spcours.paf_smart.service;

public record EmailDeliveryResult(boolean sent, String message) {

    public static EmailDeliveryResult success() {
        return new EmailDeliveryResult(true, "Credentials email sent successfully");
    }

    public static EmailDeliveryResult failed(String message) {
        return new EmailDeliveryResult(false, message);
    }
}
